
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Edit, Trash2, Search, ArrowLeft, Utensils, AlertCircle, UserX, DollarSign } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllUsers, type User } from "@/services/userService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // TODO: Implement edit/delete user functionality and add user form.

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className="w-64 bg-card text-card-foreground p-4 space-y-6 shadow-lg">
        <div className="flex items-center gap-2 text-primary">
          <Utensils className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <ArrowLeft className="h-5 w-5" /> Dashboard
            </a>
          </Link>
           <Link href="/admin/user-management" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <Users className="h-5 w-5" /> User Management
            </a>
          </Link>
          {/* Add other admin links here */}
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-primary">User Management</h2>
          {/* <Button> <PlusCircle className="mr-2 h-5 w-5" /> Add New User </Button> */}
        </header>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Overview of users based on their order history.</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users by name or email..."
                className="pl-8 w-full md:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-2">
                    {/* <Skeleton className="h-10 w-10 rounded-full" /> */}
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24" /> {/* Adjusted skeleton width */}
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Total Spent (₹)</TableHead>
                    <TableHead>First Order Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-right">₹{user.totalMealCost.toFixed(2)}</TableCell>
                      <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-1 whitespace-nowrap">
                        <Button variant="ghost" size="icon" aria-label="Edit user" disabled> {/* Edit disabled for now */}
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Delete user" disabled> {/* Delete disabled for now */}
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  {users.length > 0 ? 'No users found matching your search.' : 'No users with order history found.'}
                </h3>
                {users.length === 0 && !isLoading && !error && (
                    <p className="mt-1 text-sm text-muted-foreground">There are currently no users with order history in the system.</p>
                )}
                 {users.length === 0 && error && (
                    <p className="mt-1 text-sm text-muted-foreground">Could not load user data due to an error.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

