import React, { useReducer, useMemo, useCallback, useEffect } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import './AccountManagementPage.css';

import AdminLayout from '../components/AdminLayout';
import AccountPageHeader from './components/AccountPageHeader';
import AccountTabSwitcher from './components/AccountTabSwitcher';
import AccountKpiCards from './components/AccountKpiCards';
import AccountFilterBar from './components/AccountFilterBar';
import CustomerTable from './components/CustomerTable';
import EmployeeTable from './components/EmployeeTable';
import AccountPagination from './components/AccountPagination';
import CustomerDetailSlideOver from './components/CustomerDetailSlideOver';
import AccountFormSlideOver from './components/AccountFormSlideOver';
import LockUnlockModal from './components/LockUnlockModal';

import {
  mockCustomers,
  mockEmployees,
  computeCustomerKpis,
  computeEmployeeKpis,
  getCustomerStatus,
  getMemberTier,
  CURRENT_EMPLOYEE_ID,
} from './mockAccountData';

/* ═══════════════════════════════════════════════════════════
   REDUCER
   ═══════════════════════════════════════════════════════════ */
const INITIAL_FILTERS = {
  search: '',
  status: '',
  tier: '',
  time: '',
  role: '',
  sort: '',
};

const initialState = {
  // Tab
  activeTab: 'customers', // 'customers' | 'employees'

  // Data
  customers: [...mockCustomers],
  employees: [...mockEmployees],

  // Filters
  filters: { ...INITIAL_FILTERS },

  // Pagination
  currentPage: 1,
  rowsPerPage: 10,

  // Selection
  selectedIds: new Set(),

  // Slide-overs
  detailCustomer: null,      // customer object for detail slide-over
  detailInitialTab: 'info',  // 'info' | 'orders' | 'addresses'
  formMode: null,             // 'add' | 'edit' | null
  formAccount: null,          // account object for edit

  // Modal
  modalType: null,            // 'lock' | 'unlock' | 'delete' | null
  modalAccount: null,

  // Toast
  toasts: [],
};

let toastIdCounter = 0;

function accountReducer(state, action) {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.payload,
        filters: { ...INITIAL_FILTERS },
        currentPage: 1,
        selectedIds: new Set(),
      };

    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.key]: action.value },
        currentPage: 1,
        selectedIds: new Set(),
      };

    case 'CLEAR_FILTERS':
      return { ...state, filters: { ...INITIAL_FILTERS }, currentPage: 1, selectedIds: new Set() };

    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SET_ROWS_PER_PAGE':
      return { ...state, rowsPerPage: action.payload, currentPage: 1 };

    case 'TOGGLE_SELECTION': {
      const next = new Set(state.selectedIds);
      next.has(action.id) ? next.delete(action.id) : next.add(action.id);
      return { ...state, selectedIds: next };
    }

    case 'SET_SELECTED':
      return { ...state, selectedIds: new Set(action.payload) };

    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: new Set() };

    case 'OPEN_DETAIL_SLIDEOVER':
      return { ...state, detailCustomer: action.customer, detailInitialTab: action.tab || 'info', formMode: null };

    case 'OPEN_FORM_SLIDEOVER':
      return { ...state, formMode: action.mode, formAccount: action.account || null, detailCustomer: null };

    case 'CLOSE_SLIDEOVER':
      return { ...state, detailCustomer: null, formMode: null, formAccount: null };

    case 'OPEN_MODAL':
      return { ...state, modalType: action.modalType, modalAccount: action.account };

    case 'CLOSE_MODAL':
      return { ...state, modalType: null, modalAccount: null };

    case 'SET_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { id: ++toastIdCounter, message: action.message, type: action.toastType || 'success' }],
      };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    case 'UPDATE_CUSTOMER_STATUS':
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.customerId === action.customerId ? { ...c, status: action.status } : c
        ),
      };

    case 'UPDATE_EMPLOYEE_STATUS':
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.employeeId === action.employeeId ? { ...e, status: action.status } : e
        ),
      };

    case 'UPDATE_EMPLOYEE_ROLE':
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.employeeId === action.employeeId ? { ...e, roleName: action.roleName } : e
        ),
      };

    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter((e) => e.employeeId !== action.employeeId),
      };

    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [action.customer, ...state.customers],
      };

    case 'EDIT_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.customerId === action.customer.customerId ? { ...c, ...action.customer } : c
        ),
      };

    case 'ADD_EMPLOYEE':
      return {
        ...state,
        employees: [action.employee, ...state.employees],
      };

    case 'EDIT_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.employeeId === action.employee.employeeId ? { ...e, ...action.employee } : e
        ),
      };

    default:
      return state;
  }
}

/* ═══════════════════════════════════════════════════════════
   FILTERING LOGIC
   ═══════════════════════════════════════════════════════════ */
function filterCustomers(customers, filters) {
  let list = [...customers];

  // search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }

  // status
  if (filters.status) {
    list = list.filter((c) => {
      const s = getCustomerStatus(c);
      if (filters.status === 'Hoạt động') return s === 'active';
      if (filters.status === 'Bị khóa') return s === 'locked';
      if (filters.status === 'Chưa xác thực') return s === 'unverified';
      return true;
    });
  }

  // tier
  if (filters.tier) {
    list = list.filter((c) => getMemberTier(c.totalSpending) === filters.tier);
  }

  // time
  if (filters.time) {
    const now = new Date();
    const msMap = {
      'Hôm nay': 86400000,
      '7 ngày qua': 7 * 86400000,
      '30 ngày qua': 30 * 86400000,
      '3 tháng qua': 90 * 86400000,
      'Năm nay': null,
    };
    const ms = msMap[filters.time];
    if (ms != null) {
      list = list.filter((c) => now - new Date(c.createdAt) <= ms);
    } else if (filters.time === 'Năm nay') {
      list = list.filter((c) => new Date(c.createdAt).getFullYear() === now.getFullYear());
    }
  }

  // sort
  if (filters.sort) {
    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      'name-asc': (a, b) => a.fullName.localeCompare(b.fullName, 'vi'),
      'spending-desc': (a, b) => b.totalSpending - a.totalSpending,
      'orders-desc': (a, b) => b.totalOrders - a.totalOrders,
    };
    if (sorters[filters.sort]) list.sort(sorters[filters.sort]);
  }

  return list;
}

function filterEmployees(employees, filters) {
  let list = [...employees];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (e) => e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    );
  }

  if (filters.role) {
    list = list.filter((e) => e.roleName === filters.role);
  }

  if (filters.status) {
    list = list.filter((e) => {
      if (filters.status === 'Hoạt động') return e.status === 1;
      if (filters.status === 'Bị khóa') return e.status === 0;
      return true;
    });
  }

  return list;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const AccountManagementPage = () => {
  const [state, dispatch] = useReducer(accountReducer, initialState);

  // Read tab from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'employees' || tab === 'customers') {
      dispatch({ type: 'SET_TAB', payload: tab });
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = useCallback((tab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  }, []);

  // Toast auto-remove
  useEffect(() => {
    if (state.toasts.length > 0) {
      const lastToast = state.toasts[state.toasts.length - 1];
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id: lastToast.id });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.toasts]);

  const showToast = useCallback((message, type = 'success') => {
    dispatch({ type: 'SET_TOAST', message, toastType: type });
  }, []);

  // ── Computed data ──────────────────────────────────────
  const customerKpis = useMemo(() => computeCustomerKpis(state.customers), [state.customers]);
  const employeeKpis = useMemo(() => computeEmployeeKpis(state.employees), [state.employees]);

  const filteredCustomers = useMemo(() => filterCustomers(state.customers, state.filters), [state.customers, state.filters]);
  const filteredEmployees = useMemo(() => filterEmployees(state.employees, state.filters), [state.employees, state.filters]);

  const isCustomerTab = state.activeTab === 'customers';
  const currentList = isCustomerTab ? filteredCustomers : filteredEmployees;
  const totalFiltered = currentList.length;

  // Pagination
  const startIdx = (state.currentPage - 1) * state.rowsPerPage;
  const pageItems = currentList.slice(startIdx, startIdx + state.rowsPerPage);

  // ── Handler callbacks ──────────────────────────────────
  const handleFilterChange = useCallback((key, value) => {
    dispatch({ type: 'SET_FILTER', key, value });
  }, []);

  const handleClearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const handleAdd = useCallback(() => {
    dispatch({ type: 'OPEN_FORM_SLIDEOVER', mode: 'add', account: null });
  }, []);

  const handleExportExcel = useCallback(() => {
    showToast('Đang xuất Excel...', 'info');
  }, [showToast]);

  // ── Customer actions ───────────────────────────────────
  const handleViewDetail = useCallback((customer) => {
    dispatch({ type: 'OPEN_DETAIL_SLIDEOVER', customer, tab: 'info' });
  }, []);

  const handleViewOrders = useCallback((customer) => {
    dispatch({ type: 'OPEN_DETAIL_SLIDEOVER', customer, tab: 'orders' });
  }, []);

  const handleEditCustomer = useCallback((customer) => {
    dispatch({ type: 'OPEN_FORM_SLIDEOVER', mode: 'edit', account: customer });
  }, []);

  const handleLockCustomer = useCallback((customer) => {
    if (customer) {
      dispatch({ type: 'OPEN_MODAL', modalType: 'lock', account: customer });
    }
  }, []);

  const handleUnlockCustomer = useCallback((customer) => {
    if (customer) {
      dispatch({ type: 'OPEN_MODAL', modalType: 'unlock', account: customer });
    }
  }, []);

  const handleResetPasswordCustomer = useCallback((customer) => {
    showToast(`Đã gửi email đặt lại mật khẩu cho ${customer.fullName}`, 'success');
  }, [showToast]);

  // ── Employee actions ───────────────────────────────────
  const handleEditEmployee = useCallback((employee) => {
    dispatch({ type: 'OPEN_FORM_SLIDEOVER', mode: 'edit', account: employee });
  }, []);

  const handleLockEmployee = useCallback((employee) => {
    if (employee) {
      dispatch({ type: 'OPEN_MODAL', modalType: 'lock', account: employee });
    }
  }, []);

  const handleUnlockEmployee = useCallback((employee) => {
    if (employee) {
      dispatch({ type: 'OPEN_MODAL', modalType: 'unlock', account: employee });
    }
  }, []);

  const handleDeleteEmployee = useCallback((employee) => {
    if (employee.employeeId === CURRENT_EMPLOYEE_ID) {
      showToast('Không thể xóa tài khoản của chính bạn!', 'error');
      return;
    }
    dispatch({ type: 'OPEN_MODAL', modalType: 'delete', account: employee });
  }, [showToast]);

  const handleResetPasswordEmployee = useCallback((employee) => {
    showToast(`Đã gửi email đặt lại mật khẩu cho ${employee.fullName}`, 'success');
  }, [showToast]);

  const handleChangeRole = useCallback((employee, newRole) => {
    dispatch({ type: 'UPDATE_EMPLOYEE_ROLE', employeeId: employee.employeeId, roleName: newRole });
    showToast(`Đã cập nhật vai trò của ${employee.fullName} thành ${newRole}`, 'success');
  }, [showToast]);

  // ── Modal confirm ──────────────────────────────────────
  const handleModalConfirm = useCallback(({ reason }) => {
    const { modalType, modalAccount } = state;
    if (!modalAccount) return;

    const isCustomerAccount = !!modalAccount.customerId;

    if (modalType === 'lock') {
      if (isCustomerAccount) {
        dispatch({ type: 'UPDATE_CUSTOMER_STATUS', customerId: modalAccount.customerId, status: 0 });
      } else {
        dispatch({ type: 'UPDATE_EMPLOYEE_STATUS', employeeId: modalAccount.employeeId, status: 0 });
      }
      showToast(`Đã khóa tài khoản ${modalAccount.fullName}`, 'warning');
    } else if (modalType === 'unlock') {
      if (isCustomerAccount) {
        dispatch({ type: 'UPDATE_CUSTOMER_STATUS', customerId: modalAccount.customerId, status: 1 });
      } else {
        dispatch({ type: 'UPDATE_EMPLOYEE_STATUS', employeeId: modalAccount.employeeId, status: 1 });
      }
      showToast(`Đã mở khóa tài khoản ${modalAccount.fullName}`, 'success');
    } else if (modalType === 'delete') {
      dispatch({ type: 'DELETE_EMPLOYEE', employeeId: modalAccount.employeeId });
      showToast(`Đã xóa nhân viên ${modalAccount.fullName}`, 'warning');
    }

    dispatch({ type: 'CLOSE_MODAL' });
  }, [state.modalType, state.modalAccount, showToast]);

  // ── Form save ──────────────────────────────────────────
  const handleFormSave = useCallback((formData) => {
    const isEdit = state.formMode === 'edit';

    if (isCustomerTab) {
      if (isEdit) {
        dispatch({ type: 'EDIT_CUSTOMER', customer: { ...state.formAccount, ...formData } });
        showToast('Đã cập nhật thông tin', 'success');
      } else {
        const newCustomer = {
          ...formData,
          customerId: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          verifiedAt: null,
          totalOrders: 0,
          totalSpending: 0,
          avatar: null,
        };
        dispatch({ type: 'ADD_CUSTOMER', customer: newCustomer });
        showToast('Đã thêm tài khoản thành công', 'success');
      }
    } else {
      if (isEdit) {
        dispatch({ type: 'EDIT_EMPLOYEE', employee: { ...state.formAccount, ...formData } });
        showToast('Đã cập nhật thông tin', 'success');
      } else {
        const newEmployee = {
          ...formData,
          employeeId: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          roleId: formData.roleName === 'ADMIN' ? 1 : formData.roleName === 'MANAGER' ? 2 : 3,
          avatar: null,
        };
        dispatch({ type: 'ADD_EMPLOYEE', employee: newEmployee });
        showToast('Đã thêm tài khoản thành công', 'success');
      }
    }

    dispatch({ type: 'CLOSE_SLIDEOVER' });
  }, [state.formMode, state.formAccount, isCustomerTab, showToast]);

  /* ── Render ────────────────────────────────────────────── */
  return (
    <AdminLayout
      activeSection="user-management"
      title="Quản lý Tài khoản"
      subtitle="Quản lý khách hàng và nhân viên hệ thống"
    >
      {/* Page header */}
      <AccountPageHeader
        activeTab={state.activeTab}
        onAdd={handleAdd}
        onExportExcel={handleExportExcel}
      />

      {/* Tab switcher */}
      <AccountTabSwitcher
        activeTab={state.activeTab}
        customerCount={state.customers.length}
        employeeCount={state.employees.length}
        onTabChange={handleTabChange}
      />

      {/* KPI cards */}
      <AccountKpiCards
        activeTab={state.activeTab}
        customerKpis={customerKpis}
        employeeKpis={employeeKpis}
      />

      {/* Filter bar */}
      <AccountFilterBar
        activeTab={state.activeTab}
        filters={state.filters}
        totalCount={isCustomerTab ? state.customers.length : state.employees.length}
        filteredCount={totalFiltered}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      {isCustomerTab ? (
        <CustomerTable
          customers={pageItems}
          selectedIds={state.selectedIds}
          onToggleSelect={(id) => dispatch({ type: 'TOGGLE_SELECTION', id })}
          onSelectAll={(ids) => dispatch({ type: 'SET_SELECTED', payload: ids })}
          onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
          onViewDetail={handleViewDetail}
          onEdit={handleEditCustomer}
          onViewOrders={handleViewOrders}
          onResetPassword={handleResetPasswordCustomer}
          onLock={handleLockCustomer}
          onUnlock={handleUnlockCustomer}
        />
      ) : (
        <EmployeeTable
          employees={pageItems}
          selectedIds={state.selectedIds}
          onToggleSelect={(id) => dispatch({ type: 'TOGGLE_SELECTION', id })}
          onSelectAll={(ids) => dispatch({ type: 'SET_SELECTED', payload: ids })}
          onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
          onEdit={handleEditEmployee}
          onResetPassword={handleResetPasswordEmployee}
          onLock={handleLockEmployee}
          onUnlock={handleUnlockEmployee}
          onDelete={handleDeleteEmployee}
          onChangeRole={handleChangeRole}
        />
      )}

      {/* Pagination */}
      <AccountPagination
        currentPage={state.currentPage}
        totalItems={totalFiltered}
        rowsPerPage={state.rowsPerPage}
        onPageChange={(p) => dispatch({ type: 'SET_PAGE', payload: p })}
        onRowsPerPageChange={(n) => dispatch({ type: 'SET_ROWS_PER_PAGE', payload: n })}
        label={isCustomerTab ? 'khách hàng' : 'nhân viên'}
      />

      {/* Customer detail slide-over */}
      {state.detailCustomer && (
        <CustomerDetailSlideOver
          customer={state.detailCustomer}
          initialTab={state.detailInitialTab}
          onClose={() => dispatch({ type: 'CLOSE_SLIDEOVER' })}
          onEdit={handleEditCustomer}
          onLock={handleLockCustomer}
          onUnlock={handleUnlockCustomer}
          onToast={showToast}
        />
      )}

      {/* Add / Edit form slide-over */}
      {state.formMode && (
        <AccountFormSlideOver
          mode={state.formMode}
          activeTab={state.activeTab}
          account={state.formAccount}
          onClose={() => dispatch({ type: 'CLOSE_SLIDEOVER' })}
          onSave={handleFormSave}
        />
      )}

      {/* Lock / Unlock / Delete modal */}
      {state.modalType && (
        <LockUnlockModal
          type={state.modalType}
          account={state.modalAccount}
          onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
          onConfirm={handleModalConfirm}
        />
      )}

      {/* Toasts */}
      {state.toasts.length > 0 && (
        <div className="am-toast-container">
          {state.toasts.map((t) => (
            <div key={t.id} className={`am-toast ${t.type}`}>
              {t.type === 'success' && <Check size={16} />}
              {t.type === 'error' && <X size={16} />}
              {t.type === 'warning' && <AlertTriangle size={16} />}
              {t.type === 'info' && <AlertTriangle size={16} />}
              {t.message}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AccountManagementPage;
