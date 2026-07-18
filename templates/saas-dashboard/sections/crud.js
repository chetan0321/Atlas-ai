/**
 * saas-dashboard / sections / crud.js
 *
 * Exports: createCrudRouteHandler
 *
 * TEMPLATE RULES (for AI customization):
 * - Change tableName and allowed fields to match your entity
 * - Add custom validation per field in validateRow()
 * - Keep the exported function signature identical
 * - Do NOT remove ownership checks (userId guard)
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient }      from '@/lib/supabase/server'
import { NextResponse }      from 'next/server'

/**
 * Creates a generic CRUD route handler for a Supabase table.
 *
 * @param {object} opts
 * @param {string} opts.tableName       - Supabase table name
 * @param {string[]} opts.allowedFields - Fields allowed in create/update
 * @param {string} [opts.ownerField]    - Field name for user ownership (default: 'user_id')
 * @param {function} [opts.validate]    - Optional row validator: (row) => errorString | null
 * @returns {object} { GET, POST, PUT, DELETE }
 */
export function createCrudRouteHandler({ tableName, allowedFields, ownerField = 'user_id', validate }) {
  const admin = createAdminClient()

  async function getUser(request) {
    const supabase = await createClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  function pickAllowed(body) {
    return Object.fromEntries(
      Object.entries(body).filter(([k]) => allowedFields.includes(k))
    )
  }

  return {
    // ── GET /api/{entity} — List all rows owned by user
    GET: async (request) => {
      try {
        const user = await getUser(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const limit  = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')
        const search = searchParams.get('q') || ''
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortDir = searchParams.get('sortDir') === 'asc' ? true : false

        let query = admin.from(tableName)
          .select('*', { count: 'exact' })
          .eq(ownerField, user.id)
          .range(offset, offset + limit - 1)
          .order(sortBy, { ascending: sortDir })

        if (search) {
          // Search across allowed text fields
          const textFields = allowedFields.filter(f => !f.endsWith('_at') && !f.endsWith('_id'))
          if (textFields.length > 0) {
            query = query.or(textFields.map(f => `${f}.ilike.%${search}%`).join(','))
          }
        }

        const { data, error, count } = await query
        if (error) throw new Error(error.message)

        return NextResponse.json({ data, count, limit, offset })
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
      }
    },

    // ── POST /api/{entity} — Create a new row
    POST: async (request) => {
      try {
        const user = await getUser(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const row  = { ...pickAllowed(body), [ownerField]: user.id }

        if (validate) {
          const err = validate(row)
          if (err) return NextResponse.json({ error: err }, { status: 400 })
        }

        const { data, error } = await admin.from(tableName).insert(row).select().single()
        if (error) throw new Error(error.message)

        return NextResponse.json({ data }, { status: 201 })
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
      }
    },

    // ── PUT /api/{entity}/[id] — Update a row (ownership verified)
    PUT: async (request, { params }) => {
      try {
        const user = await getUser(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const id   = params?.id
        const body = await request.json()
        const row  = pickAllowed(body)

        if (validate) {
          const err = validate(row)
          if (err) return NextResponse.json({ error: err }, { status: 400 })
        }

        const { data, error } = await admin.from(tableName)
          .update(row)
          .eq('id', id)
          .eq(ownerField, user.id)  // ownership guard
          .select().single()

        if (error) throw new Error(error.message)
        if (!data) return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })

        return NextResponse.json({ data })
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
      }
    },

    // ── DELETE /api/{entity}/[id] — Delete a row (ownership verified)
    DELETE: async (request, { params }) => {
      try {
        const user = await getUser(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const id = params?.id
        const { error, count } = await admin.from(tableName)
          .delete({ count: 'exact' })
          .eq('id', id)
          .eq(ownerField, user.id)  // ownership guard

        if (error) throw new Error(error.message)
        if (count === 0) return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })

        return NextResponse.json({ success: true })
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
      }
    },
  }
}
