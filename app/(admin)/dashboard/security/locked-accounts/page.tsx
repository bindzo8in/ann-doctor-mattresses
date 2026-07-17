import { Metadata } from "next";
import { getLockedAccounts } from "@/lib/actions/security";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UnlockButton } from "./components/unlock-button";

export const metadata: Metadata = {
  title: "Locked Accounts | Security Dashboard",
};

export default async function LockedAccountsPage() {
  const accounts = await getLockedAccounts();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Locked Accounts</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Currently Locked Users</CardTitle>
          <CardDescription>
            Users who have exceeded the maximum number of failed login attempts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Failed Attempts</TableHead>
                <TableHead>Locked Until</TableHead>
                <TableHead>Last Attempt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No locked accounts at the moment.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">{account.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{account.banned ? "Locked" : "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      {account.banExpires && format(new Date(account.banExpires), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      {account.banned ? "Locked by admin" : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <UnlockButton userId={account.id} userName={account.name} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
