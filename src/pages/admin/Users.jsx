import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import IC from "../../components/IC";
import Icon from "../../components/Icon";
import Select from "../../components/Select";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import Pagination from "../../components/Pagination";
import AvatarDemo from "./../../components/Avatar";
import Checkbox from "./../../components/Checkbox";
import Field from "../../components/Field";
import Button from "../../components/Button";
import GlobalModal from "../../components/GlobalModal";

const headerData = [
  { title: "" },
  { title: "ID" },
  { title: "User" },
  { title: "Role" },
  { title: "Status" },
  { title: "Registered" },
  { title: "Actions" },
];

function Users() {
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
// eslint-disable-next-line no-empty-pattern
  const [] = useState("all");
  const [deleteUserId, setDeleteUserId] = useState(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState([
    {
      id: 1,
      user: "Test Admin",
      email: "admin@test.com",
      role: "admin",
      status: "active",
      registered: "2024-01-15",
    },
    {
      id: 2,
      user: "Elyas Admin",
      email: "elyas@gmail.com",
      role: "admin",
      status: "active",
      registered: "2024-01-10",
    },
    {
      id: 3,
      user: "John Teacher",
      email: "teacher@school.com",
      role: "teacher",
      status: "active",
      registered: "2024-01-12",
    },
    {
      id: 4,
      user: "Sam Student",
      email: "student@school.edu",
      role: "student",
      status: "pending",
      registered: "2024-01-20",
    },
    {
      id: 5,
      user: "Pat Staff",
      email: "staff@school.edu",
      role: "staff",
      status: "suspended",
      registered: "2024-01-18",
    },
    {
      id: 6,
      user: "Dana Dean",
      email: "dean@school.edu",
      role: "dean",
      status: "rejected",
      registered: "2024-01-05",
    },
    {
      id: 7,
      user: "Riley User",
      email: "user@test.com",
      role: "user",
      status: "active",
      registered: "2024-01-22",
    },
    {
      id: 8,
      user: "Mohammad Student",
      email: "mohammad@gmail.com",
      role: "student",
      status: "pending",
      registered: "2024-01-25",
    },
    {
      id: 9,
      user: "Alice Admin",
      email: "alice@admin.com",
      role: "admin",
      status: "active",
      registered: "2024-02-01",
    },
    {
      id: 10,
      user: "Bob Teacher",
      email: "bob@teacher.com",
      role: "teacher",
      status: "suspended",
      registered: "2024-02-10",
    },
  ]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col  bg-shell dark:bg-dark-shell">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary">
            Users Management
          </h1>
          <p className="text-muted dark:text-dark-muted">
            Manage {users.length} registered users, their status and roles
          </p>
        </div>
      </div>

      <div className=" rounded-md my-2  overflow-hidden border border-default dark:border-dark-default ">
        <div className="flex flex-col px-3 sm:flex-row py-2 my-2 border-b border-default dark:border-dark-default gap-3">
          <div className="relative">
            <Icon
              d={IC.search}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 "
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 bg-transparent py-1.5 focus:border-default dark:focus:border-dark-default  rounded-md border border-default dark:border-dark-default    transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className=" w-70">
            <Select
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "rejected", label: "Rejected" },
                { value: "suspended", label: "Suspended" },
              ]}
            />
          </div>
        </div>
        <div className="px-3 py-3">
          <Table>
            <TableHeader headerData={headerData}></TableHeader>
            <TableBody>
              {users?.map((user, index) => (
                <TableRow key={index}>
                  <TableColumn className={"w-6"}>
                    <Checkbox />
                  </TableColumn>
                  <TableColumn className={'underline hover:text-muted'}>#{user.id}</TableColumn>
                  <TableColumn>
                    <div className="grid grid-cols-2 grid-rows-2 gap-1 w-30">
                      <div className="row-span-2">
                        <AvatarDemo />
                      </div>
                      <div>{user.email}</div>
                      <div className="col-start-2 text-[10px]">{user.user}</div>
                    </div>
                  </TableColumn>
                  <TableColumn>{user.role}</TableColumn>
                  <TableColumn>{user.status}</TableColumn>
                  <TableColumn>{user.registered}</TableColumn>
                  <TableColumn>
                    <DropdownMenuRoot>
                      <DropdownTrigger showArrow={false}>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
                            fill="currentColor"
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </DropdownTrigger>
                      {/* <AccountTrigger /> */}

                      <DropdownContent>
                        <DropdownLabel>Account</DropdownLabel>

                        <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z"
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          }
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          <span>Profile</span>
                        </DropdownItem>
                       

                        <DropdownSeparator />

                        <DropdownLabel>Actions</DropdownLabel>
                         <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z"
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          }
                          onClick={() => setEditUser(user)}
                        >
                          Edit
                        </DropdownItem>

                     
                        <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.50005 1.04999C7.74858 1.04999 7.95005 1.25146 7.95005 1.49999V8.41359L10.1819 6.18179C10.3576 6.00605 10.6425 6.00605 10.8182 6.18179C10.994 6.35753 10.994 6.64245 10.8182 6.81819L7.81825 9.81819C7.64251 9.99392 7.35759 9.99392 7.18185 9.81819L4.18185 6.81819C4.00611 6.64245 4.00611 6.35753 4.18185 6.18179C4.35759 6.00605 4.64251 6.00605 4.81825 6.18179L7.05005 8.41359V1.49999C7.05005 1.25146 7.25152 1.04999 7.50005 1.04999ZM2.5 10C2.77614 10 3 10.2239 3 10.5V12C3 12.5539 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2239 12.2239 10 12.5 10C12.7761 10 13 10.2239 13 10.5V12C13 13.1041 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2239 2.22386 10 2.5 10Z"
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          }
                          variant="danger"
onClick={() => setDeleteUserId(user.id)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenuRoot>
                  </TableColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <Pagination />
        </div>
        {editUser && (
          <EditUserForm 
            user={editUser} 
            setEditUser={setEditUser} 
            users={users} 
            setUsers={setUsers} 
          />
        )}
        {deleteUserId && (
          <DeleteConfirmModal
            userId={deleteUserId}
            user={users.find(u => u.id === deleteUserId)}
            setDeleteUserId={setDeleteUserId}
            users={users}
            setUsers={setUsers}
          />
        )}
      </div>
    </div>
  );
}

function DeleteConfirmModal({ userId, user, setDeleteUserId, users, setUsers }) {
  const confirmDelete = () => {
    setUsers(users.filter(u => u.id !== userId));
    setDeleteUserId(null);
  };

  const cancelDelete = () => {
    setDeleteUserId(null);
  };

  return (
    <GlobalModal open={true} setOpen={cancelDelete}>
      <div className="w-[450px] max-h-[70vh] bg-shell dark:bg-dark-card p-6 rounded-xl shadow-2xl border border-default dark:border-dark-default flex flex-col z-[1000]">
        <div className="flex items-start gap-3 mb-6 pb-4 border-b border-default dark:border-dark-default">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400">
            <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 1.125C7.74858 1.125 7.95 1.32647 7.95 1.575V7.3125L10.1819 5.08071C10.3576 4.90497 10.6425 4.90497 10.8182 5.08071C10.994 5.25645 10.994 5.54137 10.8182 5.71711L7.81825 8.71711C7.64251 8.89284 7.35759 8.89284 7.18185 8.71711L4.18185 5.71711C4.00611 5.54137 4.00611 5.25645 4.18185 5.08071C4.35759 4.90497 4.64251 4.90497 4.81825 5.08071L7.05 7.3125V1.575C7.05 1.32647 7.25152 1.125 7.5 1.125ZM2.625 9.75C2.90114 9.75 3.125 9.97411 3.125 10.25V12C3.125 12.5523 3.57268 13 4.00365 13H11.0012C11.5529 13 12 12.5528 12 12V10.25C12 9.97411 12.2239 9.75 12.5 9.75C12.7761 9.75 13 9.97411 13 10.25V12C13 13.1041 12.1062 14 11.0012 14H4.00365C2.89749 14 2 13.103 2 12V10.25C2 9.97411 2.22386 9.75 2.625 9.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Delete User
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{user?.user}</span>?
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-4">
              Email: <span className="font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">{user?.email}</span>
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs font-medium">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-4 mt-auto border-t border-default dark:border-dark-default">
      
          <Button 
            onClick={confirmDelete} 
            variant="destructive" 
            className="flex-1 text-sm h-10 font-medium"
          >
            Delete User
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}

function EditUserForm({ user, setEditUser, users, setUsers }) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      user: user.user,
      email: user.email,
      role: user.role,
      status: user.status,
      registered: user.registered,
    },
  });

  useEffect(() => {
    setValue("user", user.user);
    setValue("email", user.email);
    setValue("role", user.role);
    setValue("status", user.status);
    setValue("registered", user.registered);
  }, [user, setValue]);

  const onSubmit = (data) => {
    setUsers(users.map(u => u.id === user.id ? { ...u, ...data } : u));
    setEditUser(null);
  };

  return (
    <GlobalModal open={true} setOpen={() => setEditUser(null)}>
      <div className="w-[550px] max-h-[90vh] h-auto bg-shell dark:bg-dark-card p-6 rounded-lg shadow-xl flex flex-col z-[1000]">
        <div className="flex items-center justify-between mb-6 pb-2">
          <h2 className="text-lg font-bold text-primary dark:text-dark-primary">
            Edit User Settings
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1 overflow-y-auto pr-1 -mr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field
              label="Full Name"
              {...register("user", { required: "Name is required" })}
              error={null}
              required
            />
            <Field
              label="Email"
              type="email"
              {...register("email", { required: "Email is required" })}
              error={null}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
<div>
              <label className="text-[11px] font-semibold text-primary dark:text-dark-primary mb-1 block">
                Role
              </label>
              <Select
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "teacher", label: "Teacher" },
                  { value: "student", label: "Student" },
                  { value: "staff", label: "Staff" },
                  { value: "dean", label: "Dean" },
                  { value: "user", label: "User" },
                ]}
                {...register("role")}
              />
            </div>
<div>
              <label className="text-[11px] font-semibold text-primary dark:text-dark-primary mb-1 block">
                Status
              </label>
              <Select
                options={[
                  { value: "active", label: "Active" },
                  { value: "pending", label: "Pending" },
                  { value: "suspended", label: "Suspended" },
                  { value: "rejected", label: "Rejected" },
                ]}
                {...register("status")}
              />
            </div>
          </div>
          <Field
            label="Registered Date"
            type="date"
            {...register("registered")}
            className="md:col-span-2"
          />
          <div className="flex gap-3 pt-4 mt-2 md:col-span-2">
            <Button type="submit" className="flex-1 text-sm h-9">
              Update
            </Button>
          
          </div>
        </form>
      </div>
    </GlobalModal>
  );
}

export default Users;

