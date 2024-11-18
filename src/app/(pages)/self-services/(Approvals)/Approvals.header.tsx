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
import { DropDownIcon, ActionIcon, FiltersIcon } from "@/lib/svg/icons";
import CustomButton from "@/components/ui/CustomButton";
import Input from "@/components/ui/Input";
import { sidebar_primary } from "@/lib/routes/routes-data";
import VerificationModelPopup from "./ModelPopups/Verification.modelpopup";
import PendingModelPopup from "./ModelPopups/Pending.modelpopup";

interface SubItem {
    key: string;
    label: string;
}

function ApprovalsHeader(
    { setTab,
        tab,
        currentTab
    }: { setTab: (tab: string) => void, tab: string, currentTab: string }) {

    const [items, setItems] = useState<SubItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<SubItem | null>(null);

    const [openVerificationTab, setOpenVerificationTab] = useState(false);
    const [openPendingTab, setOpenPendingTab] = useState(false);


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
            setSelectedItem(newItems[1]);
        }
    }, []);

    useEffect(() => {
        setTab(selectedItem?.label ?? "Approvals");
    }, [tab, setTab, selectedItem, setSelectedItem])


    const getBreadcrumb = () => {
        const handleClick = (tabName: string) => {
            setTab(tabName);
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

        return baseBreadcrumb;
    };


    useEffect(() => {
        console.log("Header verification tab", openVerificationTab)
    })


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
                                setTab(selectedItem?.label ?? "Approvals");
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

                <div className="content-header-actions flex gap-3 items-center text-xs font-bold">
                    <SearchBar placeholderText={'Search here...'} />
                    <CustomButton
                        variant="primary"
                        borderRadius="lg"
                        width="auto"
                        height="35px"
                        onClick={currentTab === 'Verification' ? () => setOpenVerificationTab(true) : () => setOpenPendingTab(true)}
                        btnText='Filters'
                        btnIcon={FiltersIcon()}
                    />
                    <CustomButton
                        variant="danger"
                        borderRadius="lg"
                        width="auto"
                        height="35px"
                        onClick={() => alert("delete")}
                        btnText='Take action'
                        btnIcon={ActionIcon()}
                    />
                </div>
            </div>

            {
                openVerificationTab && (
                    <VerificationModelPopup setOpenVerificationTab={setOpenVerificationTab} openVerificationTab={openVerificationTab} />
                )
            }

            {
                openPendingTab && (
                    <PendingModelPopup setOpenVerificationTab={setOpenPendingTab} openVerificationTab={openPendingTab} />
                )
            }


        </React.Fragment>
    );
};

export default ApprovalsHeader;