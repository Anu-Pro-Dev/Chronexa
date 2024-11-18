'use client';
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { DropDownIcon } from '@/lib/svg/icons';

// Common dropdown items
const organization_dropdown_items = [
    "Choose organization",
    "D1",
    "D2",
    "D3",
    "D4",
    "D5",
];

const sex_dropdown = [
    "Choose sex",
    "Male",
    "Female",
];

// Reusable Dropdown Component
const CustomDropdown = ({ label, items, selected, setSelected }: { label: string, items: string[], selected: string, setSelected: (value: string) => void }) => (
    <div className='py-2 flex text-left flex-row gap-3 items-center'>
        <div className='font-semibold text-[15px] text-text-primary'>
            {label}<span className="text-danger ml-1">*</span>
        </div>
        <Dropdown placement="bottom-start">
            <DropdownTrigger>
                <Button
                    disableRipple
                    className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                >
                    <div className='flex items-center'>
                        <div className='w-[200px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                            <p className='font-normal text-sm text-text-primary'>
                                {selected}
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
                items={items.map(item => ({ key: item, label: item }))}
                onAction={(key) => {
                    const selectedItem = items.find((item) => item === key);
                    if (selectedItem) {
                        setSelected(selectedItem);
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
);

function BusinessTab({ onValidityChange }: { onValidityChange: (isValid: boolean) => void }) {
    const [selectOrganization, setSelectOrganization] = useState<string>(organization_dropdown_items[0]);
    const [selectSex, setSelectSex] = useState<string>(sex_dropdown[0]);
    const [isValid, setIsValid] = useState<boolean>(false);

    useEffect(() => {
        const isFormValid = selectOrganization !== organization_dropdown_items[0] && selectSex !== sex_dropdown[0];

        // Only call onValidityChange if the validity state has changed
        if (isFormValid !== isValid) {
            setIsValid(isFormValid);
            onValidityChange(isFormValid);
        }
    }, [selectOrganization, selectSex, isValid, onValidityChange]);

    return (
        <div>
            {/* Manager Flag */}
            <div className='p-3 flex flex-row gap-3 items-center w-auto mx-6 mb-3'>
                <Checkbox
                    className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex justify-center items-center p-[0.45rem]'
                />
                <div className='font-semibold text-sm text-text-primary'>
                    Manager flag
                </div>
            </div>

            <div className='flex justify-evenly gap-20'>
                {/* Left Column */}
                <div className='flex flex-col items-end'>
                    <CustomDropdown
                        label="Employee type"
                        items={organization_dropdown_items}
                        selected={selectOrganization}
                        setSelected={setSelectOrganization}
                    />
                    <CustomDropdown
                        label="Designation"
                        items={organization_dropdown_items}
                        selected={selectOrganization}
                        setSelected={setSelectOrganization}
                    />
                    <CustomDropdown
                        label="Region"
                        items={organization_dropdown_items}
                        selected={selectOrganization}
                        setSelected={setSelectOrganization}
                    />
                    <CustomDropdown
                        label="Buildings"
                        items={organization_dropdown_items}
                        selected={selectOrganization}
                        setSelected={setSelectOrganization}
                    />
                </div>

                {/* Right Column */}
                <div className='flex flex-col items-end'>
                    <CustomDropdown
                        label="Manager"
                        items={sex_dropdown}
                        selected={selectSex}
                        setSelected={setSelectSex}
                    />
                    <CustomDropdown
                        label="Grade"
                        items={sex_dropdown}
                        selected={selectSex}
                        setSelected={setSelectSex}
                    />
                    <CustomDropdown
                        label="Schedule type"
                        items={sex_dropdown}
                        selected={selectSex}
                        setSelected={setSelectSex}
                    />
                    <CustomDropdown
                        label="Nationality"
                        items={sex_dropdown}
                        selected={selectSex}
                        setSelected={setSelectSex}
                    />
                </div>
            </div>
        </div>
    );
}

export default BusinessTab;
