import { getAdmins } from "@/lib/actions/users";
import { getBranches } from "@/actions/branches";
import { CreateAdminForm } from "./components/create-admin-form";
import { ChangePasswordForm } from "./components/change-password-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "User Management | Admin",
};

export default async function UsersPage() {
  const admins = await getAdmins();
  const branches = await getBranches();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Manage super admins and branch administrators.</p>
        </div>
        <CreateAdminForm branches={branches} />
      </div>

      <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Email</TableHead>
              <TableHead className="font-semibold text-slate-700">Role</TableHead>
              <TableHead className="font-semibold text-slate-700">Branch</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              admins.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-bold text-slate-900">{user.name}</TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell>
                    {user.role === "SUPER_ADMIN" ? (
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Super Admin</Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Branch Admin</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {user.branch?.name || "Global"}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role === "BRANCH_ADMIN" && (
                      <ChangePasswordForm userId={user.id} userName={user.name} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
