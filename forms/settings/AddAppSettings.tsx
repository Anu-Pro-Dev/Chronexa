
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
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Switch from "@/components/ui/switch";

const encryptionValues: Record<string, string> = {
  "1": "TLS",
  "2": "SSL",
  "3": "None",
};

const encryptionLabelToId = Object.fromEntries(
  Object.entries(encryptionValues).map(([id, label]) => [label, id])
);

const formSchema = z.object({
		id: z
			.string()
			.min(1, {
			message: "Required",
			})
			.max(8),
    name: z
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
		from_email: z
			.string()
			.min(6, {
				message: "Required",
			})
			.max(25),
		encryption: z.string().min(1, { message: "Required" }),
		active: z.boolean(),
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
    
	const {language, translations } = useLanguage();
    
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
			id: "",
      name: "",
      host: "",
      port: "",
			encryption: "",
			from_email: "",
			active: false,
    },
  });

	useEffect(() => {
		form.reset(form.getValues());
	}, [language]);

	useEffect(() => {
		if (!selectedRowData) {
			form.reset();
		} else {
			const encryptionId = encryptionLabelToId[selectedRowData.encryption] || ""; // Convert label to ID
			form.reset({
				id: selectedRowData.emailID,
				name: selectedRowData.name,
				host: selectedRowData.host,
				port: selectedRowData.port,
				from_email: selectedRowData.fromEmail,
				encryption: encryptionId,
				active: selectedRowData?.isActive || false,
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
		if (selectedRowData) {
			toast.success("Email Settings updated successfully");
			onSave(selectedRowData.id, values);
		} else {
			toast.success("Email Settings added successfully");
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
            <div className="grid grid-cols-2 gap-16 gap-y-4">
							<FormField
									control={form.control}
									name="id"
									render={({ field }) => (
											<FormItem>
											<FormLabel>
													ID <Required />
											</FormLabel>
											<FormControl>
													<Input placeholder="Enter Unique identifier for database reference" type="text" {...field} />
											</FormControl>
											<FormMessage />
											</FormItem>
									)}
							/>
							<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
											<FormItem>
											<FormLabel>
													Name <Required />
											</FormLabel>
											<FormControl>
													<Input placeholder="Enter SMTP configuration name" type="text" {...field} />
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
									name="from_email"
									render={({ field }) => (
									<FormItem>
											<FormLabel>
											From Email <Required/>
											</FormLabel>
											<FormControl>
											<Input
													placeholder="Enter from email address"
													type="text"
													{...field}
											/>
											</FormControl>
											<FormMessage />
									</FormItem>
									)}
							/>
							<FormField
								key={form.watch("encryption")}
								control={form.control}
								name="encryption"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Encryption <Required /></FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value} // This must match an ID like "5"
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Choose encryption" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(encryptionValues).map(([value, label]) => (
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
								name="active"
								render={({ field }) => (
									<FormItem className="flex items-center space-x-4">
										<FormLabel className="mb-0">Active SMTP</FormLabel>
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
										{translations?.buttons?.cancel}
									</Button>
									<Button type="submit" size={"lg"} className="w-full">
										{selectedRowData ? translations?.buttons?.Update || "Update" : translations?.buttons?.save || "Save"} 
									</Button>
							</div>
            </div>
        </div>
      </form>
    </Form>
  );
}
