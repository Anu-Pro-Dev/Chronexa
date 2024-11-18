"use client";

import React, { useState, useEffect } from "react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
} from "@nextui-org/react";
import SearchBar from "@/widgets/SearchBar.widget";
import { FiltersIcon, AddIcon, DeleteIcon, DropDownIcon } from "@/lib/svg/icons";
import CustomButton from "@/components/ui/CustomButton";
import { sidebar_primary } from "@/lib/routes/routes-data";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@nextui-org/react";
import { cn } from "@/lib/utils";

interface SubItem {
    key: string;
    label: string;
}

const organization_dropdown_items = [
    "Choose organization",
    "D1",
    "D2",
    "D3",
    "D4",
    "D5",
];

function HeaderWeeklySchedule({ setTab, tab, setHeaderCall, headerCall }: { setTab: (tab: string) => void, tab: string, setHeaderCall: (headerCall: any) => void, headerCall: any }) {
    const [items, setItems] = useState<SubItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<SubItem | null | any>(tab);
    const [selectOrganization, setSelectOrganization] = useState<string>(organization_dropdown_items[0]);
    const [showActions, setShowActions] = useState(true);
    const { onOpen, isOpen, onOpenChange } = useDisclosure();

    const handleWeeklyScheduleAddClick = () => {
        setHeaderCall('#add')
        setShowActions(false);
    };

    useEffect(() => {
        if (tab === "Weekly Schedule")
            setShowActions(true);
    }, [tab]),

        useEffect(() => {
            const newItems: SubItem[] = [];
            sidebar_primary.forEach(item => {
                if (item.name === "Scheduling") {
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
        if (headerCall === null) {
            setShowActions(true);
        }

    }, [headerCall, setTab]);

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
                                console.log("selected: ",selected)
                                setSelectedItem(selected ?? items[0]);
                                setTab(selected?.label ?? items[0].label);
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
                        Scheduling / {selectedItem?.label} {tab === "Weekly Schedule#add" ? "/ Add" : ""}
                    </p>
                </div>
                {(showActions && selectedItem?.label !== "Weekly Schedule#add") &&
                    (<div className="content-header-actions flex gap-3 items-center text-xs font-bold">
                        <SearchBar placeholderText={'Search here...'} />
                        <CustomButton
                            variant="primary"
                            borderRadius="lg"
                            width="auto"
                            height="35px"
                            onClick={onOpen}
                            btnText='Filters'
                            btnIcon={FiltersIcon()}
                        />
                        <CustomButton
                            variant="success"
                            borderRadius="lg"
                            width="auto"
                            height="35px"
                            onClick={handleWeeklyScheduleAddClick}
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
                                <h1 className="text-xl font-bold text-primary capitalize">Filters</h1>
                                <h4 className="text-sm font-semibold text-text-secondary pb-5">Select the filter for further process</h4>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex w-full gap-5">
                                    <div className="w-full">
                                        <div className={cn("py-2 flex flex-col text-left")}>
                                            <label className={cn('font-bold font-base pb-1 text-text-primary')}>
                                                Oraganization
                                                <span className="text-danger ml-1">*</span>
                                            </label>
                                            <Dropdown
                                                placement="bottom-start"
                                                className=""
                                            >
                                                <DropdownTrigger>
                                                    <Button
                                                        disableRipple
                                                        isLoading={false}
                                                        className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                                    >
                                                        <div className='flex items-center'>
                                                            <div className='w-full bg-foreground py-2.5 flex items-center gap-3 px-4 rounded-full border border-border-grey'>
                                                                <p className='font-normal text-sm text-text-primary'>
                                                                    {selectOrganization}
                                                                </p>
                                                                <div className='float-right w-full flex justify-end'>
                                                                    <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownMenu
                                                    aria-label="Dynamic Actions"
                                                    items={organization_dropdown_items.map(item => ({ key: item, label: item }))}
                                                    onAction={(key) => {
                                                        const selected = organization_dropdown_items.find((item) => item === key);
                                                        if (selected) {
                                                            setSelectOrganization(selected);
                                                        }
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
                                        </div>
                                        <div className={cn("py-2 flex flex-col text-left")}>
                                            <label className={cn('font-bold font-base pb-1 text-text-primary')}>
                                                Employee
                                                <span className="text-danger ml-1">*</span>
                                            </label>
                                            <Dropdown
                                                placement="bottom-start"
                                                className=""
                                            >
                                                <DropdownTrigger>
                                                    <Button
                                                        disableRipple
                                                        isLoading={false}
                                                        className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                                    >
                                                        <div className='flex items-center'>
                                                            <div className='w-full bg-foreground py-2.5 flex items-center gap-3 px-4 rounded-full border border-border-grey'>
                                                                <p className='font-normal text-sm text-text-primary'>
                                                                    {selectOrganization}
                                                                </p>
                                                                <div className='float-right w-full flex justify-end'>
                                                                    <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownMenu
                                                    aria-label="Dynamic Actions"
                                                    items={organization_dropdown_items.map(item => ({ key: item, label: item }))}
                                                    onAction={(key) => {
                                                        const selected = organization_dropdown_items.find((item) => item === key);
                                                        if (selected) {
                                                            setSelectOrganization(selected);
                                                        }
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
                                        </div>
                                        <div className={cn("py-2 flex flex-col text-left")}>
                                            <label className={cn('font-bold font-base pb-1 text-text-primary')}>
                                                Group
                                                <span className="text-danger ml-1">*</span>
                                            </label>
                                            <Dropdown
                                                placement="bottom-start"
                                                className=""
                                            >
                                                <DropdownTrigger>
                                                    <Button
                                                        disableRipple
                                                        isLoading={false}
                                                        className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                                    >
                                                        <div className='flex items-center'>
                                                            <div className='w-full bg-foreground py-2.5 flex items-center gap-3 px-4 rounded-full border border-border-grey'>
                                                                <p className='font-normal text-sm text-text-primary'>
                                                                    {selectOrganization}
                                                                </p>
                                                                <div className='float-right w-full flex justify-end'>
                                                                    <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownMenu
                                                    aria-label="Dynamic Actions"
                                                    items={organization_dropdown_items.map(item => ({ key: item, label: item }))}
                                                    onAction={(key) => {
                                                        const selected = organization_dropdown_items.find((item) => item === key);
                                                        if (selected) {
                                                            setSelectOrganization(selected);
                                                        }
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
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="justify-end">
                                <CustomButton
                                    variant="outline"
                                    borderRadius="full"
                                    width="100%"
                                    height="40px"
                                    onClick={onClose}
                                    btnText='Clear Filter'
                                />
                                <CustomButton
                                    variant="primary"
                                    borderRadius="full"
                                    width="100%"
                                    height="40px"
                                    onClick={onClose}
                                    btnText='Apply'
                                />
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
};

export default HeaderWeeklySchedule;