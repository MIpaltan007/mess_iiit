'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Edit, Trash2, Search, ArrowLeft, Utensils } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Admin' | 'Staff';
  joinDate: string;
  currentPlan?: string;
}

const initialUsers: User[] = [
  { id: '1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Student', joinDate: '2023-01-15', currentPlan: 'Full Feast' },
  { id: '2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Student', joinDate: '2023-02-10', currentPlan: 'Daily Delights' },
  { id: '3', name: 'Charlie Admin', email: 'charlie@example.com', role: 'Admin', joinDate: '2023-01-01' },
  { id: '4', name: 'Diana Staff', email: 'diana@example.com', role: 'Staff', joinDate: '2023-03-01' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

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

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage student, staff, and administrator accounts.</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users by name or email..."
                className="pl-8 w-full md:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'Admin' ? 'bg-red-100 text-red-700' : user.role === 'Staff' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>{user.currentPlan || 'N/A'}</TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No users found matching your search.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
