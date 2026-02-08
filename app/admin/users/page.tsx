import { getUsers } from '@/app/actions/users'
import { UserDialog } from '@/components/users/user-dialog'

// Client component for delete button to avoid heavy interaction logic here if possible, 
// but for simplicity we can use a small client component or just a form action.
// Let's use a simple form action for delete.

import { DeleteUserButton } from './delete-user-button'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const { users, error } = await getUsers()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">Users</h3>
                    <p className="text-muted-foreground">
                        Manage cashier and admin accounts.
                    </p>
                </div>
                <UserDialog />
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
                    Error loading users: {error}
                </div>
            )}

            <div className="border rounded-lg">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Created At</th>
                            <th className="px-4 py-3 font-medium">Last Sign In</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users?.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users?.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {user.last_sign_in_at
                                            ? new Date(user.last_sign_in_at).toLocaleString()
                                            : 'Never'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <DeleteUserButton userId={user.id} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
