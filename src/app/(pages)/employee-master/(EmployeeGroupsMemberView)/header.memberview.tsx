"use client";

import React, { useState, useEffect } from "react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@nextui-org/react";
import SearchBar from "@/widgets/SearchBar.widget";
import { AddIcon, CancelIcon, DeleteIcon, DropDownIcon } from "@/lib/svg/icons";
import CustomButton from "@/components/ui/CustomButton";
import { sidebar_primary } from "@/lib/routes/routes-data";
import { DataTable } from "@/widgets/DataTable.widget";
import { employee_master_groups_member_columns, employee_master_groups_member_data } from "@/data/em.data";
import { TableColumns } from "@/widgets/TableColumns.widget";
import { EmployeeMasterGroupsMembersDataType } from "@/lib/types/types";

interface SubItem {
    key: string;
    label: string;
}

function HeaderMemberView({ setTab, tab }: { setTab: (newTab: string) => void; tab: string }) {
    const [items, setItems] = useState<SubItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<SubItem | null>(null);
    const [showActions, setShowActions] = useState(true);
    const [headerTab, setHeaderTab] = useState<any | null>(null);
    const { onOpen, isOpen, onOpenChange } = useDisclosure();

    const data = employee_master_groups_member_data;

    const col = TableColumns<EmployeeMasterGroupsMembersDataType>(employee_master_groups_member_columns, {} as EmployeeMasterGroupsMembersDataType);


    const handleMemberViewAddClick = () => {
        setHeaderTab("Employee Groups");
        setTab("Employee Groups" + "/MemberView" + "#add");
        setShowActions(false);
        onOpenChange();
      };

    useEffect(() => {
        if (tab === "Employees Groups")
            setShowActions(true);
    }, [tab]),

        useEffect(() => {
            const newItems: SubItem[] = [];
            sidebar_primary.forEach(item => {
                if (item.name === "Employee Master") {
                    item.subItems.forEach(subItem => {
                        newItems.push({ key: subItem, label: subItem });
                    });
                }
            });
            setItems(newItems);
            if (newItems.length > 0) {
                setSelectedItem(newItems[1]);
            }
        }, []);

    useEffect(() => {
        if (selectedItem && selectedItem.label !== "Employee Groups") {
            setHeaderTab(selectedItem.label);
            setTab(headerTab);
        }

    }, [selectedItem, setTab, setHeaderTab, headerTab]);

    return (
        <React.Fragment>
            <div className="flex justify-between content-header p-6">
                <div className="content-header-dropdown text-text-primary">
                    <Dropdown
                        placement="bottom-start"
                        className="p-0"
                    >
                        <DropdownTrigger>
                            <Button
                                disableRipple
                                isLoading={false}
                                variant="light"
                                className="text-2xl font-bold w-fit p-0 gap-1 text-text-primary"
                            >
                                <div>
                                    {selectedItem ? (
                                        <div className="flex items-center gap-2">
                                            {selectedItem?.label}
                                            <span className="text-text-primary w-8">{DropDownIcon()}</span>
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}
                                </div>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Dynamic Actions"
                            items={items}
                            onAction={(key) => {
                                const selected = items.find((item) => item.key === key);
                                setSelectedItem(selected ?? items[0]);
                            }}
                            className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                        >
                            {(item) => (
                                <DropdownItem
                                    className={`p-2 text-text-primary hover:text-primary hover:bg-backdrop`}
                                    key={item.key}
                                >
                                    {item.label}
                                </DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
                    <p className="text-secondary font-medium text-sm">
                        Employee Master / {selectedItem?.label} / Member View {tab === "Employee Groups/MemberView#add" ? '/ add' : ''}

                    </p>
                </div>
                {(showActions && selectedItem?.label !== "Employees#add") &&
                    (<div className="content-header-actions flex gap-3 items-center text-xs font-bold">
                        <SearchBar placeholderText={'Search here...'} />
                        <CustomButton
                            variant="success"
                            borderRadius="lg"
                            width="auto"
                            height="35px"
                            onClick={onOpen}
                            btnText='Add'
                            btnIcon={AddIcon()}
                        />
                        <CustomButton
                            variant="danger"
                            borderRadius="lg"
                            width="auto"
                            height="35px"
                            onClick={() => alert("delete")}
                            btnText='Delete'
                            btnIcon={DeleteIcon()}
                        />
                    </div>
                    )}
            </div>
            <Modal
                backdrop="blur"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                hideCloseButton={true}
                classNames={{
                    backdrop: "bg-white/75 backdrop-opacity-50",
                    base: "bg-foreground text-text-primary shadow-popup rounded-[20px] p-5 max-w-[900px] w-full h-auto",
                    header: "text-start p-0",
                    body: "p-0",
                    footer: "flex justify-center gap-2 p-0 py-5 mt-3",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h1 className="text-xl font-bold text-text-primary capitalize">Holiday</h1>
                                <h4 className="text-sm font-semibold text-text-secondary pb-5">Select the holiday for further process</h4>
                            </ModalHeader>
                            <ModalBody>
                                <header>
                                    <div className="content-header-actions flex gap-3 items-center text-xs font-bold">
                                        <SearchBar placeholderText={'Search here...'} />
                                        <CustomButton
                                            variant="success"
                                            borderRadius="lg"
                                            width="auto"
                                            height="35px"
                                            onClick={handleMemberViewAddClick}
                                            btnText='Add'
                                            btnIcon={AddIcon()}
                                        />
                                        <CustomButton
                                            variant="cancel"
                                            borderRadius="lg"
                                            width="auto"
                                            height="35px"
                                            onClick={() => alert("cancel")}
                                            btnText='Cancel'
                                            btnIcon={CancelIcon()}
                                        />
                                    </div>
                                </header>
                                <div className="my-6">
                                    <DataTable
                                        columns={col}
                                        data={data} tab={""}
                                        searchValue={""} customClasses={""} />
                                </div>

                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
};

export default HeaderMemberView;