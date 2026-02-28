import React, { useReducer, useCallback, useEffect, useRef } from 'react';
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

import { adminCustomerAPI, adminEmployeeAPI, adminRoleAPI } from './accountApi';
import { CURRENT_EMPLOYEE_ID } from './mockAccountData';

/* ═══════════════════════════════════════════════════════════
   HELPERS – Normalize API response data
   Backend returns status as Boolean (true/false).
   Frontend components expect status as Number (1/0).
   ═══════════════════════════════════════════════════════════ */
function normalizeCustomer(c) {
  return {
    ...c,
    status: c.status === true ? 1 : c.status === false ? 0 : c.status,
    gender: c.gender === 'MALE' ? 'Nam' : c.gender === 'FEMALE' ? 'Nữ' : c.gender === 'OTHER' ? 'Khác' : c.gender,
    totalOrders: c.totalOrders ?? 0,
    totalSpending: c.totalSpending ?? 0,
    memberTier: c.memberTier ?? null,
    avatar: null,
  };
}

function mapGenderToApi(gender) {
  if (!gender) return null;
  if (gender === 'Nam') return 'MALE';
  if (gender === 'Nữ') return 'FEMALE';
  if (gender === 'Khác') return 'OTHER';
  return gender;
}

function normalizeEmployee(e) {
  return {
    ...e,
    status: e.status === true ? 1 : e.status === false ? 0 : e.status,
    avatar: null,
  };
}

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
  activeTab: 'customers',

  // Server data
  customers: [],
  employees: [],
  totalCustomers: 0,
  totalEmployees: 0,
  totalCustomerPages: 1,
  totalEmployeePages: 1,

  // KPI (fetched from server)
  customerKpis: { total: 0, active: 0, locked: 0, unverified: 0, newThisMonth: 0, activePercent: '0' },
  employeeKpis: { total: 0, admins: 0, managers: 0, staff: 0 },

  // Roles (for dropdown)
  roles: [],

  // Loading
  loading: false,
  error: null,

  // Filters
  filters: { ...INITIAL_FILTERS },

  // Pagination
  currentPage: 1,
  rowsPerPage: 10,

  // Selection
  selectedIds: new Set(),

  // Slide-overs
  detailCustomer: null,
  detailInitialTab: 'info',
  formMode: null,
  formAccount: null,

  // Modal
  modalType: null,
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

    // ── Server data actions ──────────────────────────────
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_CUSTOMERS_SUCCESS':
      return {
        ...state,
        loading: false,
        customers: action.customers,
        totalCustomers: action.totalElements,
        totalCustomerPages: action.totalPages,
      };

    case 'FETCH_EMPLOYEES_SUCCESS':
      return {
        ...state,
        loading: false,
        employees: action.employees,
        totalEmployees: action.totalElements,
        totalEmployeePages: action.totalPages,
      };

    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };

    case 'SET_CUSTOMER_KPIS':
      return { ...state, customerKpis: action.payload };

    case 'SET_EMPLOYEE_KPIS':
      return { ...state, employeeKpis: action.payload };

    case 'SET_ROLES':
      return { ...state, roles: action.payload };

    default:
      return state;
  }
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const AccountManagementPage = () => {
  const [state, dispatch] = useReducer(accountReducer, initialState);
  const searchDebounceRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    dispatch({ type: 'SET_TOAST', message, toastType: type });
  }, []);

  const isCustomerTab = state.activeTab === 'customers';

  /* ── Fetch list data from server ────────────────────────── */
  const fetchCustomers = useCallback(async (filters, page, rowsPerPage) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const searchRequest = {
        pageNum: page - 1,
        pageSize: rowsPerPage,
        search: filters.search || undefined,
        status: filters.status || undefined,
        tier: filters.tier || undefined,
        time: filters.time || undefined,
        sort: filters.sort || undefined,
      };
      const res = await adminCustomerAPI.list(searchRequest);
      const pageData = res?.data ?? res;
      const items = (pageData?.content ?? []).map(normalizeCustomer);
      dispatch({
        type: 'FETCH_CUSTOMERS_SUCCESS',
        customers: items,
        totalElements: pageData?.totalElements ?? items.length,
        totalPages: pageData?.totalPages ?? 1,
      });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: err.message ?? 'Lỗi tải dữ liệu' });
    }
  }, []);

  const fetchEmployees = useCallback(async (filters, page, rowsPerPage) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const searchRequest = {
        pageNum: page - 1,
        pageSize: rowsPerPage,
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
      };
      const res = await adminEmployeeAPI.list(searchRequest);
      const pageData = res?.data ?? res;
      const items = (pageData?.content ?? []).map(normalizeEmployee);
      dispatch({
        type: 'FETCH_EMPLOYEES_SUCCESS',
        employees: items,
        totalElements: pageData?.totalElements ?? items.length,
        totalPages: pageData?.totalPages ?? 1,
      });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: err.message ?? 'Lỗi tải dữ liệu' });
    }
  }, []);

  const fetchKpis = useCallback(async () => {
    try {
      const [custKpiRes, empKpiRes] = await Promise.all([
        adminCustomerAPI.getKpis(),
        adminEmployeeAPI.getKpis(),
      ]);
      const ck = custKpiRes?.data ?? custKpiRes;
      const ek = empKpiRes?.data ?? empKpiRes;
      dispatch({
        type: 'SET_CUSTOMER_KPIS',
        payload: {
          total: ck.totalCustomers ?? 0,
          active: ck.activeCustomers ?? 0,
          locked: ck.lockedCustomers ?? 0,
          unverified: ck.unverifiedCustomers ?? 0,
          newThisMonth: ck.newCustomersThisMonth ?? 0,
          activePercent: ck.totalCustomers > 0
            ? ((ck.activeCustomers / ck.totalCustomers) * 100).toFixed(1)
            : '0',
        },
      });
      dispatch({
        type: 'SET_EMPLOYEE_KPIS',
        payload: {
          total: ek.totalEmployees ?? 0,
          admins: ek.adminCount ?? 0,
          managers: ek.managerCount ?? 0,
          staff: ek.staffCount ?? 0,
        },
      });
    } catch (_) { /* KPI load failure is non-blocking */ }
  }, []);

  /* ── Reload current list (called after mutating operations) ── */
  const reloadCurrentList = useCallback(() => {
    if (state.activeTab === 'customers') {
      fetchCustomers(state.filters, state.currentPage, state.rowsPerPage);
    } else {
      fetchEmployees(state.filters, state.currentPage, state.rowsPerPage);
    }
    fetchKpis();
  }, [state.activeTab, state.filters, state.currentPage, state.rowsPerPage, fetchCustomers, fetchEmployees, fetchKpis]);

  /* ── Initial load + refetch on tab/filter/page change ────── */
  useEffect(() => {
    // Load roles once
    adminRoleAPI.list().then((res) => {
      const roles = res?.data ?? (Array.isArray(res) ? res : []);
      dispatch({ type: 'SET_ROLES', payload: roles });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  // Debounce search, immediate for other filters
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    const doFetch = () => {
      if (state.activeTab === 'customers') {
        fetchCustomers(state.filters, state.currentPage, state.rowsPerPage);
      } else {
        fetchEmployees(state.filters, state.currentPage, state.rowsPerPage);
      }
    };

    if (state.filters.search) {
      searchDebounceRef.current = setTimeout(doFetch, 400);
    } else {
      doFetch();
    }

    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [state.activeTab, state.filters, state.currentPage, state.rowsPerPage, fetchCustomers, fetchEmployees]);

  // Read tab from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'employees' || tab === 'customers') {
      dispatch({ type: 'SET_TAB', payload: tab });
    }
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

  // ── Computed ───────────────────────────────────────────
  const pageItems = isCustomerTab ? state.customers : state.employees;
  const totalFiltered = isCustomerTab ? state.totalCustomers : state.totalEmployees;

  // ── Tab change ─────────────────────────────────────────
  const handleTabChange = useCallback((tab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  }, []);

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
    if (customer) dispatch({ type: 'OPEN_MODAL', modalType: 'lock', account: customer });
  }, []);

  const handleUnlockCustomer = useCallback((customer) => {
    if (customer) dispatch({ type: 'OPEN_MODAL', modalType: 'unlock', account: customer });
  }, []);

  const handleResetPasswordCustomer = useCallback(async (customer) => {
    try {
      await adminCustomerAPI.resetPassword(customer.customerId);
      showToast(`Đã đặt lại mật khẩu cho ${customer.fullName}`, 'success');
    } catch (err) {
      showToast(err.message || 'Lỗi đặt lại mật khẩu', 'error');
    }
  }, [showToast]);

  // ── Employee actions ───────────────────────────────────
  const handleEditEmployee = useCallback((employee) => {
    dispatch({ type: 'OPEN_FORM_SLIDEOVER', mode: 'edit', account: employee });
  }, []);

  const handleLockEmployee = useCallback((employee) => {
    if (employee) dispatch({ type: 'OPEN_MODAL', modalType: 'lock', account: employee });
  }, []);

  const handleUnlockEmployee = useCallback((employee) => {
    if (employee) dispatch({ type: 'OPEN_MODAL', modalType: 'unlock', account: employee });
  }, []);

  const handleDeleteEmployee = useCallback((employee) => {
    if (employee.employeeId === CURRENT_EMPLOYEE_ID) {
      showToast('Không thể xóa tài khoản của chính bạn!', 'error');
      return;
    }
    dispatch({ type: 'OPEN_MODAL', modalType: 'delete', account: employee });
  }, [showToast]);

  const handleResetPasswordEmployee = useCallback(async (employee) => {
    try {
      await adminEmployeeAPI.resetPassword(employee.employeeId);
      showToast(`Đã đặt lại mật khẩu cho ${employee.fullName}`, 'success');
    } catch (err) {
      showToast(err.message || 'Lỗi đặt lại mật khẩu', 'error');
    }
  }, [showToast]);

  const handleChangeRole = useCallback(async (employee, newRoleName) => {
    try {
      // Find roleId from roles list
      const role = state.roles.find((r) => r.roleName === newRoleName);
      if (!role) {
        showToast('Vai trò không tìm thấy', 'error');
        return;
      }
      await adminEmployeeAPI.changeRole(employee.employeeId, role.roleId);
      showToast(`Đã cập nhật vai trò của ${employee.fullName} thành ${newRoleName}`, 'success');
      reloadCurrentList();
    } catch (err) {
      showToast(err.message || 'Lỗi cập nhật vai trò', 'error');
    }
  }, [state.roles, showToast, reloadCurrentList]);

  // ── Modal confirm (lock / unlock / delete) ─────────────
  const handleModalConfirm = useCallback(async ({ reason }) => {
    const { modalType, modalAccount } = state;
    if (!modalAccount) return;

    const isCustomerAccount = !!modalAccount.customerId;

    try {
      if (modalType === 'lock') {
        if (isCustomerAccount) {
          await adminCustomerAPI.lock(modalAccount.customerId, reason);
        } else {
          await adminEmployeeAPI.lock(modalAccount.employeeId, reason);
        }
        showToast(`Đã khóa tài khoản ${modalAccount.fullName}`, 'warning');
      } else if (modalType === 'unlock') {
        if (isCustomerAccount) {
          await adminCustomerAPI.unlock(modalAccount.customerId);
        } else {
          await adminEmployeeAPI.unlock(modalAccount.employeeId);
        }
        showToast(`Đã mở khóa tài khoản ${modalAccount.fullName}`, 'success');
      } else if (modalType === 'delete') {
        await adminEmployeeAPI.delete(modalAccount.employeeId);
        showToast(`Đã xóa nhân viên ${modalAccount.fullName}`, 'warning');
      }
      dispatch({ type: 'CLOSE_MODAL' });
      reloadCurrentList();
    } catch (err) {
      showToast(err.message || 'Thao tác thất bại', 'error');
      dispatch({ type: 'CLOSE_MODAL' });
    }
  }, [state.modalType, state.modalAccount, showToast, reloadCurrentList]);

  // ── Form save (create / update) ────────────────────────
  const handleFormSave = useCallback(async (formData) => {
    const isEdit = state.formMode === 'edit';

    try {
      if (isCustomerTab) {
        if (isEdit) {
          await adminCustomerAPI.update(state.formAccount.customerId, {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone || null,
            gender: mapGenderToApi(formData.gender),
            dateOfBirth: formData.dateOfBirth || null,
            status: formData.status === 1 ? true : formData.status === 0 ? false : null,
          });
          showToast('Đã cập nhật thông tin', 'success');
        } else {
          await adminCustomerAPI.create({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || null,
            gender: mapGenderToApi(formData.gender),
            dateOfBirth: formData.dateOfBirth || null,
            status: true,
          });
          showToast('Đã thêm tài khoản thành công', 'success');
        }
      } else {
        // Employee
        const role = state.roles.find((r) => r.roleName === formData.roleName);
        const roleId = role ? role.roleId : null;

        if (isEdit) {
          await adminEmployeeAPI.update(state.formAccount.employeeId, {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone || null,
            roleId,
            position: formData.position || null,
            department: formData.department || null,
            status: formData.status === 1 ? true : formData.status === 0 ? false : null,
          });
          showToast('Đã cập nhật thông tin', 'success');
        } else {
          await adminEmployeeAPI.create({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || null,
            roleId,
            position: formData.position || null,
            department: formData.department || null,
            status: true,
          });
          showToast('Đã thêm tài khoản thành công', 'success');
        }
      }
      dispatch({ type: 'CLOSE_SLIDEOVER' });
      reloadCurrentList();
    } catch (err) {
      showToast(err.message || 'Thao tác thất bại', 'error');
    }
  }, [state.formMode, state.formAccount, state.roles, isCustomerTab, showToast, reloadCurrentList]);

  /* ── Render ────────────────────────────────────────────── */
  const totalPages = isCustomerTab ? state.totalCustomerPages : state.totalEmployeePages;

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
        customerCount={state.customerKpis.total}
        employeeCount={state.employeeKpis.total}
        onTabChange={handleTabChange}
      />

      {/* KPI cards */}
      <AccountKpiCards
        activeTab={state.activeTab}
        customerKpis={state.customerKpis}
        employeeKpis={state.employeeKpis}
      />

      {/* Filter bar */}
      <AccountFilterBar
        activeTab={state.activeTab}
        filters={state.filters}
        totalCount={isCustomerTab ? state.customerKpis.total : state.employeeKpis.total}
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
