import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  // Bug 5 : Different loading states for employees and transactions --fixed
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )
  const showViewMoreButton = useMemo(() => {
    return paginatedTransactions !== null && paginatedTransactions?.nextPage !== null
  }, [paginatedTransactions])

  const loadAllTransactions = useCallback(async () => {
    setIsLoadingEmployees(true)
    setIsLoadingTransactions(true)

    await employeeUtils.fetchAll()
    setIsLoadingEmployees(false)
    await paginatedTransactionsUtils.fetchAll()
    setIsLoadingTransactions(false)
  }, [employeeUtils, paginatedTransactionsUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoadingEmployees}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            // Bug 3 : The transactions are not being loaded when the selected employee is null --fixed
            if (newValue === null || newValue === EMPTY_EMPLOYEE) {
              loadAllTransactions()
            }
            if (newValue !== null && newValue !== EMPTY_EMPLOYEE) {
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {/* Bug 6 : Visiblity of view more button as per given logic -- fixed */}
          {showViewMoreButton && transactions !== null && (
            <button
              className="RampButton"
              disabled={isLoadingTransactions || paginatedTransactions?.nextPage === null}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
