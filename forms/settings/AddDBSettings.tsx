
"use client";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Switch from "@/components/ui/switch";

const dbTypeValues: Record<string, string> = {
  "1": "PostgreSQL",
  "2": "MySQL",
  "3": "SQLite",
  "4": "MongoDB",
  "5": "Microsoft SQL Server",
  "6": "CockroachDB",
};

const dbLabelToId = Object.fromEntries(
  Object.entries(dbTypeValues).map(([id, label]) => [label, id])
);

const formSchema = z.object({
    database: z.string().min(1, { message: "Required" }),
    database_name: z
        .string()
        .min(1, {
        message: "Required",
        })
        .max(100),
    host: z
        .string()
        .min(1, {
        message: "Required",
        })
        .max(100),
    port: z
        .string()
        .min(1, {
        message: "Required",
        })
        .max(100),
    user: z
        .string()
        .min(6, {
        message: "Required",
        })
        .max(25),
    password: z
        .string()
        .min(8, {
        message: "Required",
        })
        .max(20),
	connected: z.boolean(),
});

export default function AddDBSettings({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
    
	const {language } = useLanguage();
    
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
		database: "",
		database_name: "",
		host: "",
		port: "",
		user: "", 
		password: "",
		connected: false,
    },
  });

	useEffect(() => {
		form.reset(form.getValues());
	}, [language]);

	useEffect(() => {
		if (!selectedRowData) {
			form.reset();
		} else {
			const dbId = dbLabelToId[selectedRowData.databaseType] || ""; // Convert label to ID
    		console.log("Mapped DB ID:", dbId);
			form.reset({
				database: dbId,
				database_name: selectedRowData.databaseName,
				host: selectedRowData.host,
				port: selectedRowData.port,
				user: selectedRowData.user,
				password: selectedRowData.password,
				connected: selectedRowData?.isConnected || false,
			});
		}
	}, [selectedRowData, form]);

	const handleSave = () => {
		const formData = form.getValues();
		if (selectedRowData) {
			onSave(selectedRowData.id, formData);
		} else {
			onSave(null, formData);
		}
		on_open_change(false);
	};

  const router = useRouter();
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
			if (selectedRowData) {
				console.log("DB Settings updated successfully");
				onSave(selectedRowData.id, values);
			} else {
				console.log("DB Settings added successfully");
				onSave(null, values);
			}


			on_open_change(false);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-16 gap-y-4 pl-5">
							<FormField
								key={form.watch("database")}
								control={form.control}
								name="database"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Database <Required /></FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value} // This must match an ID like "5"
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Choose Database" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(dbTypeValues).map(([value, label]) => (
													<SelectItem key={value} value={value}>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
									control={form.control}
									name="database_name"
									render={({ field }) => (
											<FormItem>
											<FormLabel>
													Database Name <Required />
											</FormLabel>
											<FormControl>
													<Input placeholder="Enter your Database name" type="text" {...field} />
											</FormControl>
											<FormMessage />
											</FormItem>
									)}
							/>
							<FormField
									control={form.control}
									name="host"
									render={({ field }) => (
									<FormItem>
											<FormLabel>
											Host <Required />
											</FormLabel>
											<FormControl>
											<Input
													placeholder="Enter the IP or domain name"
													type="text"
													{...field}
											/>
											</FormControl>
											<FormMessage />
									</FormItem>
									)}
							/>
							<FormField
									control={form.control}
									name="port"
									render={({ field }) => (
									<FormItem>
											<FormLabel>
											Port <Required />
											</FormLabel>
											<FormControl>
											<Input
													placeholder="Enter your port number"
													type="text"
													{...field}
											/>
											</FormControl>
											<FormMessage />
									</FormItem>
									)}
							/>
							<FormField
									control={form.control}
									name="user"
									render={({ field }) => (
									<FormItem>
											<FormLabel>
											User
											</FormLabel>
											<FormControl>
											<Input
													placeholder="Enter your database user"
													type="text"
													{...field}
											/>
											</FormControl>
											<FormMessage />
									</FormItem>
									)}
							/>
							<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
											<FormItem>
											<FormLabel>
													Password
											</FormLabel>
											<FormControl>
													<Input
													placeholder="Enter your database user password"
													type="password"
													{...field}
													/>
											</FormControl>
											<FormMessage />
											</FormItem>
									)}
							/>
							<FormField
								control={form.control}
								name="connected"
								render={({ field }) => (
									<FormItem className="flex items-center space-x-4">
										<FormLabel className="mb-0">Connect DB</FormLabel>
										<FormControl>
											<Switch
												checked={!!field.value}
												onChange={(val: boolean) => field.onChange(val)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
            </div>
            <div className="flex justify-end gap-2 items-center py-5">
							<div className="flex gap-4 px-5">
									<Button
									variant={"outline"}
									type="button"
									size={"lg"}
									className="w-full"
									onClick={() => {
											on_open_change(false);
									}}
									>
											Cancel
									</Button>
									<Button type="submit" size={"lg"} className="w-full">
											{selectedRowData ? "Update" : "Save"}
									</Button>
							</div>
            </div>
        </div>
      </form>
    </Form>
  );
}
