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
import { DropDownIcon, AddIcon, DeleteIcon } from "@/lib/svg/icons";
import CustomButton from "@/components/ui/CustomButton";
import Input from "@/components/ui/Input";
import { sidebar_primary } from "@/lib/routes/routes-data";

interface SubItem {
    key: string;
    label: string;
}

function WorkflowsHeader(
    { setTab,
        tab,
        setOpenModelName,
        showActions,
        setShowActions,
        CloseAnOtherViewPage
    }: { setTab: (tab: string) => void, tab: string, setOpenModelName: (name: string) => void, showActions: boolean, setShowActions: (show: boolean) => void, CloseAnOtherViewPage: () => void }) {
    const [items, setItems] = useState<SubItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<SubItem | null>(null);

    const handleWorkflowsAddClick = () => {
        setShowActions(false);
        setOpenModelName("Workflows+Add");
    };

    useEffect(() => {
        if (tab === "Workflows") {
            setShowActions(true);
        }

    }, [tab])

    useEffect(() => {
        const newItems: SubItem[] = [];
        sidebar_primary.forEach(item => {
            if (item.name === "Self Services") {
                item.subItems.forEach(subItem => {
                    newItems.push({ key: subItem, label: subItem });
                });
            }
        });
        setItems(newItems);
        console.log(newItems)
        if (newItems.length > 0) {
            setSelectedItem(newItems[0]);
        }
    }, []);

    useEffect(()=>{
        setTab(selectedItem?.label ?? "Workflows");
    },[tab, setTab, selectedItem, setSelectedItem])


    const getBreadcrumb = () => {
        const handleClick = (tabName: string) => {
            CloseAnOtherViewPage()
        };

        const baseBreadcrumb = (
            <>
                {selectedItem ? (
                    <>
                        <a
                            href="#"
                            onClick={() => setSelectedItem(items[0])}
                            className="text-secondary no-underline cursor-pointer"
                        >
                            Self Services
                        </a>
                        {" / "}
                        <a
                            href="#"
                            onClick={() => handleClick(selectedItem.label)}
                            className="text-secondary  cursor-pointer"
                        >
                            {selectedItem.label}
                        </a>
                    </>
                ) : (
                    <></>
                )}
            </>
        );

        if (!showActions) {
            return (
                <>
                    {baseBreadcrumb} {" / "}
                    <span className="text-secondary cursor-pointer">Add</span>
                </>
            );
        }

        return baseBreadcrumb;
    };


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
                                setTab(selectedItem?.label ?? "Workflows");
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
                    <div className="text-secondary font-medium text-sm">
                        {getBreadcrumb()}
                    </div>
                </div>

                {(showActions) &&
                    (<div className="content-header-actions flex gap-3 items-center text-xs font-bold">
                        <SearchBar placeholderText={'Search here...'} />
                        <CustomButton
                            variant="success"
                            borderRadius="lg"
                            width="auto"
                            height="35px"
                            onClick={handleWorkflowsAddClick}
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
                    )
                }
            </div>

        </React.Fragment>
    );
};

export default WorkflowsHeader;