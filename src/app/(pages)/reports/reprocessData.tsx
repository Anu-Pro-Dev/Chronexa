/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import { Button, DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { ActionIcon, ReporcessIcon, DropDownIcon } from "@/lib/svg/icons"
import { Checkbox } from '@/components/ui/Checkbox';
import CustomButton from "@/components/ui/CustomButton";
import {
    Modal, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalFooter, 
    useDisclosure
} from "@nextui-org/react";

const organization_dropdown_items = [
    "Choose organization",
    "D1",
    "D2",
    "D3",
    "D4",
    "D5",
];

function ReprocessData() {

    const [selectOrganization, setSelectOrganization] = useState<string>(organization_dropdown_items[0]);
    const {onOpen, isOpen, onOpenChange} = useDisclosure();

    const stylesDateInput = {
        inputWrapper: [
            "bg-foreground rounded-full border border-border-grey h-[40px] shadow-none px-4 min-w-[250px] text-[15px]",
        ],
        label: [
            "text-text-primary font-semibold text-[15px]",
        ],
    };

    return (
        <div>
            <header className='mb-6'>
                <h1 className='text-primary font-bold text-xl'>Reprocess Data</h1>
                <p className='text-text-secondary font-regular text-sm'>Select the Filter you want to view</p>
            </header>
            <div className='flex gap-20'>
                <div className='flex flex-row items-start gap-3 justify-between w-full'>
                    <Input inputType={'text'} inputLabel={'Code'} placeholderText={'Enter the code'} inputAttr={true} className={''} labelClassName={'font-semibold text-[15px]'} inputClassName={'w-[250px]'}/>
                    <div className='py-2 flex text-left flex-col gap-2 items-start'>
                        <div className='font-semibold text-[15px] text-text-primary'>
                            Category<span className="text-danger ml-1">*</span>
                        </div>
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
                                        <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
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
                    <div className='py-2 flex text-left flex-col gap-2 items-start'>
                        <div className='font-semibold text-[15px] text-text-primary'>
                            Levels<span className="text-danger ml-1">*</span>
                        </div>
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
                                        <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
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
            <div className="py-2.5 flex gap-3 items-center text-sm w-full justify-start">
                <Checkbox
                className="modal-checkbox outline-none border-[2px] w-4 h-4 border-border-grey font-semibold text-sm text-text-primary"
                />Manager flag
            </div>
            <div className="content-footer-actions flex gap-3 items-center text-xs font-bold justify-end my-5">
                <CustomButton 
                    variant="danger" 
                    borderRadius="lg" 
                    width = "auto" 
                    height="35px"
                    onClick={onOpen}
                    btnText='Take action'
                    btnIcon={ActionIcon()}
                    className='text-sm'
                />
            </div>
            <Modal 
                backdrop="blur" 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                hideCloseButton={true}
                classNames={{
                backdrop: "bg-white/75 backdrop-opacity-50",
                base: "bg-foreground text-text-primary shadow-popup rounded-[20px] p-5",
                header: "text-center p-0 pt-4",
                body: "p-0",
                footer: "flex justify-center gap-2 p-0 py-5 mt-3",
                }}
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex flex-col gap-1 items-center">
                        <div className='w-20 h-20 rounded-full bg-backdrop flex justify-center items-center'>{ReporcessIcon()}</div>
                        <h1 className="text-xl font-bold text-text-primary capitalize">Reprocess data</h1>
                        <h4 className="text-sm font-semibold text-text-secondary">This will reporcess the attendance data, Do you want to conitnue?</h4>
                    </ModalHeader>
                    <ModalFooter>
                        <CustomButton 
                            variant="outline" 
                            borderRadius="full" 
                            width = "100%" 
                            height="40px"
                            onClick={onClose}
                            btnText='Cancel'
                        />
                        <CustomButton 
                            variant="primary" 
                            borderRadius="full" 
                            width = "100%" 
                            height="40px"
                            onClick={() => alert("Added successfully")}
                            btnText='Save'
                        />
                    </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
        </div>
    )
} 

export default ReprocessData