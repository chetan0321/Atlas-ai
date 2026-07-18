/**
 * calculator-scientific — Baseline Tests
 *
 * Run: npx jest templates/calculator-scientific/__tests__/baseline/
 * DO NOT modify — ground truth tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calculator, CalcDisplay, CalcKeypad, CalcMemory } from '../../sections/calculator.jsx'
import { CalculationHistory, HistoryItem, FormulaLibrary } from '../../sections/history.jsx'

// ─── CalcDisplay ──────────────────────────────────────────────────────────────
describe('CalcDisplay', () => {
  it('renders expression and result', () => {
    render(<CalcDisplay expression="2+2" result="= 4" angleMode="DEG" onAngleModeToggle={() => {}} />)
    expect(screen.getByText('2+2')).toBeInTheDocument()
    expect(screen.getByText('= 4')).toBeInTheDocument()
  })

  it('shows angle mode DEG by default', () => {
    render(<CalcDisplay expression="" result="" angleMode="DEG" onAngleModeToggle={() => {}} />)
    expect(screen.getByText('DEG')).toBeInTheDocument()
  })

  it('calls onAngleModeToggle when toggled', async () => {
    const toggle = jest.fn()
    const user = userEvent.setup()
    render(<CalcDisplay expression="" result="" angleMode="DEG" onAngleModeToggle={toggle} />)
    await user.click(screen.getByRole('button', { name: 'DEG' }))
    expect(toggle).toHaveBeenCalledTimes(1)
  })

  it('shows error state in red for Error result', () => {
    render(<CalcDisplay expression="1/0" result="Error" angleMode="DEG" onAngleModeToggle={() => {}} />)
    const resultEl = screen.getByText('Error')
    expect(resultEl).toHaveStyle({ color: '#f87171' })
  })
})

// ─── CalcKeypad ───────────────────────────────────────────────────────────────
describe('CalcKeypad', () => {
  it('renders all number keys', () => {
    render(<CalcKeypad onKey={() => {}} pressedKey={null} />)
    for (const n of ['0','1','2','3','4','5','6','7','8','9']) {
      expect(screen.getByText(n)).toBeInTheDocument()
    }
  })

  it('renders operator keys', () => {
    render(<CalcKeypad onKey={() => {}} pressedKey={null} />)
    expect(screen.getByText('+')).toBeInTheDocument()
    expect(screen.getByText('−')).toBeInTheDocument()
    expect(screen.getByText('×')).toBeInTheDocument()
    expect(screen.getByText('÷')).toBeInTheDocument()
  })

  it('renders scientific function keys', () => {
    render(<CalcKeypad onKey={() => {}} pressedKey={null} />)
    expect(screen.getByText('sin(')).toBeInTheDocument()
    expect(screen.getByText('cos(')).toBeInTheDocument()
    expect(screen.getByText('tan(')).toBeInTheDocument()
  })

  it('calls onKey with correct value on click', async () => {
    const onKey = jest.fn()
    const user = userEvent.setup()
    render(<CalcKeypad onKey={onKey} pressedKey={null} />)
    await user.click(screen.getByText('5'))
    expect(onKey).toHaveBeenCalledWith('5')
  })

  it('calls onKey with AC on clear', async () => {
    const onKey = jest.fn()
    const user = userEvent.setup()
    render(<CalcKeypad onKey={onKey} pressedKey={null} />)
    await user.click(screen.getByText('AC'))
    expect(onKey).toHaveBeenCalledWith('AC')
  })

  it('calls onKey with = on equals', async () => {
    const onKey = jest.fn()
    const user = userEvent.setup()
    render(<CalcKeypad onKey={onKey} pressedKey={null} />)
    await user.click(screen.getByText('='))
    expect(onKey).toHaveBeenCalledWith('=')
  })
})

// ─── CalcMemory ───────────────────────────────────────────────────────────────
describe('CalcMemory', () => {
  it('renders MS MR MC buttons', () => {
    render(<CalcMemory memory={null} onStore={() => {}} onRecall={() => {}} onClear={() => {}} />)
    expect(screen.getByText('MS')).toBeInTheDocument()
    expect(screen.getByText('MR')).toBeInTheDocument()
    expect(screen.getByText('MC')).toBeInTheDocument()
  })

  it('shows stored memory value', () => {
    render(<CalcMemory memory="42" onStore={() => {}} onRecall={() => {}} onClear={() => {}} />)
    expect(screen.getByText(/M: 42/)).toBeInTheDocument()
  })

  it('calls onStore when MS clicked', async () => {
    const onStore = jest.fn()
    const user = userEvent.setup()
    render(<CalcMemory memory={null} onStore={onStore} onRecall={() => {}} onClear={() => {}} />)
    await user.click(screen.getByText('MS'))
    expect(onStore).toHaveBeenCalledTimes(1)
  })

  it('calls onClear when MC clicked', async () => {
    const onClear = jest.fn()
    const user = userEvent.setup()
    render(<CalcMemory memory="10" onStore={() => {}} onRecall={() => {}} onClear={onClear} />)
    await user.click(screen.getByText('MC'))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})

// ─── Calculator (integration) ─────────────────────────────────────────────────
describe('Calculator', () => {
  it('renders without crashing', () => {
    render(<Calculator />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders custom title', () => {
    render(<Calculator title="My Calculator" />)
    expect(screen.getByText(/My Calculator/)).toBeInTheDocument()
  })

  it('builds expression by clicking number keys', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    await user.click(screen.getByText('4'))
    await user.click(screen.getByText('+'))
    await user.click(screen.getByText('5'))
    expect(screen.getByText('4+5')).toBeInTheDocument()
  })

  it('evaluates expression on = click and shows result', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    await user.click(screen.getByText('3'))
    await user.click(screen.getByText('×'))
    await user.click(screen.getByText('7'))
    await user.click(screen.getByText('='))
    await waitFor(() => expect(screen.getByText('21')).toBeInTheDocument())
  })

  it('clears on AC', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    await user.click(screen.getByText('9'))
    await user.click(screen.getByText('AC'))
    expect(screen.queryByText('9')).not.toBeInTheDocument()
  })

  it('handles keyboard input Enter key', () => {
    render(<Calculator />)
    fireEvent.keyDown(window, { key: 'Enter' })
    // No crash — passes
  })
})

// ─── CalculationHistory ───────────────────────────────────────────────────────
describe('CalculationHistory', () => {
  it('shows empty state when no history', () => {
    render(<CalculationHistory history={[]} />)
    expect(screen.getByText(/No calculations yet/i)).toBeInTheDocument()
  })

  it('renders history entries', () => {
    const history = [
      { expression: '2+2', result: '4', timestamp: Date.now() },
      { expression: '3*3', result: '9', timestamp: Date.now() },
    ]
    render(<CalculationHistory history={history} />)
    expect(screen.getByText('= 4')).toBeInTheDocument()
    expect(screen.getByText('= 9')).toBeInTheDocument()
  })

  it('calls onClearAll when clear button clicked', async () => {
    const onClearAll = jest.fn()
    const user = userEvent.setup()
    const history = [{ expression: '1+1', result: '2', timestamp: Date.now() }]
    render(<CalculationHistory history={history} onClearAll={onClearAll} />)
    await user.click(screen.getByText('Clear all'))
    expect(onClearAll).toHaveBeenCalledTimes(1)
  })
})

// ─── FormulaLibrary ───────────────────────────────────────────────────────────
describe('FormulaLibrary', () => {
  it('renders formula categories', () => {
    render(<FormulaLibrary />)
    expect(screen.getByText('Geometry')).toBeInTheDocument()
    expect(screen.getByText('Physics')).toBeInTheDocument()
    expect(screen.getByText('Finance')).toBeInTheDocument()
  })

  it('expands category on click', async () => {
    const user = userEvent.setup()
    render(<FormulaLibrary />)
    expect(screen.queryByText('Circle Area')).not.toBeInTheDocument()
    await user.click(screen.getByText('Geometry'))
    expect(screen.getByText('Circle Area')).toBeInTheDocument()
  })

  it('collapses on second click', async () => {
    const user = userEvent.setup()
    render(<FormulaLibrary />)
    await user.click(screen.getByText('Geometry'))
    expect(screen.getByText('Circle Area')).toBeInTheDocument()
    await user.click(screen.getByText('Geometry'))
    expect(screen.queryByText('Circle Area')).not.toBeInTheDocument()
  })

  it('calls onInsert with formula on item click', async () => {
    const onInsert = jest.fn()
    const user = userEvent.setup()
    render(<FormulaLibrary onInsert={onInsert} />)
    await user.click(screen.getByText('Geometry'))
    await user.click(screen.getByText('Circle Area'))
    expect(onInsert).toHaveBeenCalledWith('π*r^2')
  })
})
