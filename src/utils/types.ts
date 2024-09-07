export type Transaction = {
  id: string
  amount: number
  employee: Employee
  merchant: string
  date: string
  approved: boolean
}

export type Employee = {
  id: string
  firstName: string
  lastName: string
}

export type PaginatedResponse<TData> = {
  data: TData
  nextPage: number | null
}

export type PaginatedRequestParams = {
  page: number | null
}

export type RequestByEmployeeParams = {
  employeeId: string
}
// Bug 7: Inconsistent naming of the parameter in the setTransactionApproval function -- fixed
export type SetTransactionApprovalParams = {
  transactionId: string
  newValue: boolean
}
