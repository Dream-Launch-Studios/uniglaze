// app/users/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Role } from "@prisma/client";
import { OnboardingButton } from "@/components/custom/dashboard/onboarding-button";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import {
  getUsers,
  deleteUser,
  updateUserMetadata,
} from "@/server/auth/actions/user.actions";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { Session } from "@/server/auth";

const userSchema = z.object({
  name: z.string().min(2, "Required"),
  password: z.string().min(8, "Minimum 8 characters"),
  email: z.email("Invalid email"),
  customRole: z.enum(Role),
});

type UserFormValues = z.infer<typeof userSchema>;

type User = {
  id: string;
} & UserFormValues;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const router = useRouter();
  const { data: session, isPending } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };

  // Check authentication and customRole
  useEffect(() => {
    if (isPending) return;

    if (session && !session?.user) {
      router.push("/login");
      return;
    }

    if (session?.user?.customRole === Role.PROJECT_MANAGER) {
      router.push("/dashboard");
      return;
    }
  }, [session, router, isPending]);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getUsers();
      setUsers(
        users.data.map((user) => ({
          ...user,
          password: "",
        })),
      );
    };
    void fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    // setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      const res = await deleteUser(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
      window.location.reload();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleUpdate = async (id: string, values: UserFormValues) => {
    try {
      const { data, error } = await authClient.admin.setUserPassword({
        newPassword: values.password, // required
        userId: id, // required
      });
      if (error) toast.error(error.message ?? "Password update failed");
      else toast.success("Password updated successfully");
      const res = await updateUserMetadata(id, values);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
      window.location.reload();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <Sidebar />

      <main className="pt-16 pb-20 md:ml-60 md:pb-8">
        <div className="w-full p-6">
          <div className="flex w-full flex-wrap items-center justify-between">
            <Breadcrumb className="mb-0" />
            <OnboardingButton />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Update</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <UserFormRow
                  key={user.id}
                  user={user}
                  onDelete={() => handleDelete(user.id)}
                  onUpdate={(values) => handleUpdate(user.id, values)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

function UserFormRow({
  user,
  onDelete,
  onUpdate,
}: {
  user: User;
  onDelete: () => void;
  onUpdate: (values: UserFormValues) => void;
}) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      password: user.password,
      email: user.email,
      customRole: user.customRole,
    },
    mode: "onSubmit",
  });

  // The form is NOT wrapping the <tr> or <td>, but is inside each <td>
  return (
    <TableRow className="">
      <TableCell className="min-w-[250px]">
        <Form {...form}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Name</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </TableCell>
      <TableCell className="min-w-[250px]">
        <Form {...form}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="sr-only">Password</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </TableCell>
      <TableCell className="min-w-[250px]">
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </TableCell>
      <TableCell className="min-w-[250px]">
        <Form {...form}>
          <FormField
            control={form.control}
            name="customRole"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="sr-only">Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Role.PROJECT_MANAGER}>
                      {Role.PROJECT_MANAGER}
                    </SelectItem>
                    <SelectItem value={Role.HEAD_OF_PLANNING}>
                      {Role.HEAD_OF_PLANNING}
                    </SelectItem>
                    <SelectItem value={Role.MANAGING_DIRECTOR}>
                      {Role.MANAGING_DIRECTOR}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </TableCell>
      <TableCell className="min-w-[250px]">
        {/* The only <form> in the row, for update */}
        <form onSubmit={form.handleSubmit(onUpdate)} className="flex">
          <Button type="submit" className="w-full">
            Update
          </Button>
        </form>
      </TableCell>
      <TableCell className="min-w-[250px]">
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          className="w-full"
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
