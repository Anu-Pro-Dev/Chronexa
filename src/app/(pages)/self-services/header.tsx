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

function Header({ setTab, tab }: { setTab: (tab: string) => void, tab: string }) {
    const [items, setItems] = useState<SubItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<SubItem | null>(null);
    const [showActions, setShowActions] = useState(true);
    const [headerTab, setHeaderTab] = useState<any | null>(null);
    const { onOpen, isOpen, onOpenChange } = useDisclosure();

    const handleWorkflowsAddClick = () => {
      setHeaderTab(selectedItem?.label);
      setTab(headerTab + "#add");
      setShowActions(false);
    };
  
    useEffect(() => {
      if (tab === "Workflows")
        setShowActions(true);

    }, [tab]),

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
            if (newItems.length > 0) {
                setSelectedItem(newItems[0]);
            }
        }, []);

    useEffect(() => {
        if (selectedItem) {
            setHeaderTab(selectedItem.label);
            setTab(headerTab);
        }
        if (headerTab === null) {
            setShowActions(true);
        }
    }, [selectedItem, setTab, setHeaderTab, headerTab]);


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

        if (tab?.includes("#add")) {
            return (
                <>
                    {baseBreadcrumb} {" / "}
                    <span className="text-secondary">Add</span>
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
                {/* <div className="content-header-actions flex gap-3 items-center text-xs font-bold">
                    <SearchBar placeholderText={'Search here...'} />
                    {selectedItem?.label === "Approvals" ?
                        <div>
                            <CustomButton 
                                variant="primary" 
                                borderRadius="lg" 
                                width = "auto" 
                                height="35px"
                                onClick={() => alert("filter")}
                                btnText='filters'
                                btnIcon={FiltersIcon()}
                            />
                            <CustomButton 
                                variant="danger" 
                                borderRadius="lg" 
                                width = "auto" 
                                height="35px"
                                onClick={() => alert("delete")}
                                btnText='Take action'
                                btnIcon={ActionIcon()}
                            />
                        </div>
                        : ''
                    }
                    <CustomButton 
                        variant="success" 
                        borderRadius="lg" 
                        width = "auto" 
                        height="35px"
                        onClick={() => alert("add")}
                        btnText={selectedItem?.label !== "Approvals" ? 'add' : 'Approve'}
                        btnIcon={selectedItem?.label !== "Approvals" ? AddIcon() : ActionIcon()}
                    />
                    <CustomButton 
                        variant="danger" 
                        borderRadius="lg" 
                        width = "auto" 
                        height="35px"
                        onClick={() => alert("delete")}
                        btnText={selectedItem?.label !== "Approvals" ? 'Delete' : 'Take action'}
                        btnIcon={selectedItem?.label !== "Approvals" ? DeleteIcon() : ActionIcon()}
                    />
                </div> */}
                {(showActions && selectedItem?.label !== "Workflows#add") &&
                    (<div className="content-header-actions flex gap-3 items-center text-xs font-bold">
                        <SearchBar placeholderText={'Search here...'} />
                        <CustomButton
                            variant="success"
                            borderRadius="lg"
                            width="auto"
                            height="35px"
                            onClick={selectedItem?.label !== "Workflows" ? onOpen : handleWorkflowsAddClick}
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
            <Modal
                backdrop="blur"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                hideCloseButton={true}
                classNames={{
                    backdrop: "bg-white/75 backdrop-opacity-50",
                    base: "bg-foreground text-text-primary shadow-popup rounded-[20px] p-5",
                    header: "text-center p-0",
                    body: "p-0",
                    footer: "flex justify-center gap-2 p-0 py-5 mt-3",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h1 className="text-xl font-bold text-text-primary capitalize">{selectedItem?.label}</h1>
                                <h4 className="text-sm font-semibold text-text-secondary pb-5">{selectedItem?.label} of the employee</h4>
                            </ModalHeader>
                            <ModalBody>
                                <div>
                                    <Input inputType={'text'} inputLabel={'Description(English)'} placeholderText={'Enter description in english'} inputAttr={true} className={''} labelClassName={''} inputClassName={''} />
                                    <Input inputType={'text'} inputLabel={'Description [العربية]'} placeholderText={'Enter description in arabic'} inputAttr={true} className={''} labelClassName={''} inputClassName={''} />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <CustomButton
                                    variant="outline"
                                    borderRadius="full"
                                    width="100%"
                                    height="40px"
                                    onClick={onClose}
                                    btnText='Cancel'
                                />
                                <CustomButton
                                    variant="primary"
                                    borderRadius="full"
                                    width="100%"
                                    height="40px"
                                    onClick={() => alert("Added successfully")}
                                    btnText='Save'
                                />
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
};

export default Header;