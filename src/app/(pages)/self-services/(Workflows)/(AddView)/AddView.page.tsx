'use client';
import React, { useState } from 'react';
import { Button, DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import Input from '@/components/ui/Input';
import { GenerateIcon, DropDownIcon } from "@/lib/svg/icons";
import CustomButton from "@/components/ui/CustomButton";

const category_dropdown_items = ["Choose category", "D1", "D2", "D3", "D4", "D5"];
const levels_dropdown_items = ["Choose levels", "1", "2", "3", "4"];

function AddViewPage({ CloseAnOtherViewPage }: { CloseAnOtherViewPage: () => void }) {
    const [selectCategory, setSelectCategory] = useState<string>(category_dropdown_items[0]);
    const [selectLevels, setSelectLevels] = useState<string>(levels_dropdown_items[0]);
    const [levels, setLevels] = useState<number[]>([]);

    const generateLevels = () => {
        const levelCount = parseInt(selectLevels);
        if (!isNaN(levelCount)) {
            setLevels(Array.from({ length: levelCount }, (_, i) => i + 1));
        } else {
            alert("Please select a valid level number");
        }
    };

    return (
        <div>
            <div className="bg-foreground rounded-[20px] mx-6 p-6">
                <header className='mb-6'>
                    <h1 className='text-primary font-bold text-xl'>Generate the workflows</h1>
                    <p className='text-text-secondary font-regular text-sm'>Select the levels for further process</p>
                </header>
                <div className='flex gap-20'>
                    <div className='flex flex-row items-start gap-3 justify-between w-full'>
                        <Input inputType={'text'} inputLabel={'Code'} placeholderText={'Enter the code'} inputAttr={true} className={''} labelClassName={'font-semibold text-[15px]'} inputClassName={'w-[250px]'} />
                        <div className='py-2 flex text-left flex-col gap-2 items-start'>
                            <div className='font-semibold text-[15px] text-text-primary'>
                                Category<span className="text-danger ml-1">*</span>
                            </div>
                            <Dropdown placement="bottom-start" className="">
                                <DropdownTrigger>
                                    <Button disableRipple isLoading={false} className="text-sm font-bold p-0 block gap-1 h-auto w-auto">
                                        <div className='flex items-center'>
                                            <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                <p className='font-normal text-sm text-text-primary'>{selectCategory}</p>
                                                <div className='float-right w-full flex justify-end'>
                                                    <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Dynamic Actions"
                                    items={category_dropdown_items.map(item => ({ key: item, label: item }))}
                                    onAction={(key) => {
                                        const selected = category_dropdown_items.find((item) => item === key);
                                        if (selected) setSelectCategory(selected);
                                    }}
                                    className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                >
                                    {(item) => (
                                        <DropdownItem className="p-2 text-text-primary hover:text-primary hover:bg-backdrop" key={item.key}>
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
                            <Dropdown placement="bottom-start" className="">
                                <DropdownTrigger>
                                    <Button disableRipple isLoading={false} className="text-sm font-bold p-0 block gap-1 h-auto w-auto">
                                        <div className='flex items-center'>
                                            <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                <p className='font-normal text-sm text-text-primary'>{selectLevels}</p>
                                                <div className='float-right w-full flex justify-end'>
                                                    <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Dynamic Actions"
                                    items={levels_dropdown_items.map(item => ({ key: item, label: item }))}
                                    onAction={(key) => {
                                        const selected = levels_dropdown_items.find((item) => item === key);
                                        if (selected) setSelectLevels(selected);
                                    }}
                                    className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                >
                                    {(item) => (
                                        <DropdownItem className="p-2 text-text-primary hover:text-primary hover:bg-backdrop" key={item.key}>
                                            {item.label}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
                <div className="content-footer-actions flex gap-3 items-center text-xs font-bold justify-end mt-6 mb-3">
                    <CustomButton
                        variant="success"
                        borderRadius="lg"
                        width="auto"
                        height="35px"
                        onClick={generateLevels}
                        btnText='Generate'
                        btnIcon={GenerateIcon()}
                        className='text-sm'
                    />
                </div>
            </div>
            <div className="bg-foreground w-full rounded-[20px] mx-6 p-6 my-5">
                <div className='levels w-full'>
                    {levels.length > 0 && (
                        <div className="flex flex-col gap-3 justify-center">
                            {/* Header Row with Labels */}
                            <div className="flex items-center justify-center gap-5 mb-3 font-semibold text-sm">
                                <label className="flex justify-center items-center w-32">Type</label>
                                <label className="flex justify-center items-center w-32">On Success</label>
                                <label className="flex justify-center items-center w-32">On Failure</label>
                                <label className="flex justify-center items-center w-32">Status Text</label>
                            </div>

                            {/* Dynamic Rows with Dropdowns */}
                            {levels.map(level => (
                                <div key={level} className="flex items-center gap-5 mb-3 justify-center">
                                    {/* Type Dropdown */}
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button disableRipple className="input-field border rounded w-32 text-left px-2 py-1 text-sm">
                                                Workflow {level}
                                                {/* <span className="ml-auto">{DropDownIcon()}</span> */}
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            aria-label="Type Options"
                                            items={["Workflow 1", "Workflow 2", "Workflow 3"].map(item => ({ key: item, label: item }))}
                                            onAction={(key) => console.log("Selected Type:", key)}
                                        >
                                            {(item) => (
                                                <DropdownItem key={item.key} className="text-sm">
                                                    {item.label}
                                                </DropdownItem>
                                            )}
                                        </DropdownMenu>
                                    </Dropdown>

                                    {/* On Success Dropdown */}
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button disableRipple className="input-field border rounded w-32 text-left px-2 py-1 text-sm">
                                                Step 2
                                                {/* <span className="ml-auto">{DropDownIcon()}</span> */}
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            aria-label="On Success Options"
                                            items={["Step 1", "Step 2", "Step 3"].map(item => ({ key: item, label: item }))}
                                            onAction={(key) => console.log("Selected Success:", key)}
                                        >
                                            {(item) => (
                                                <DropdownItem key={item.key} className="text-sm">
                                                    {item.label}
                                                </DropdownItem>
                                            )}
                                        </DropdownMenu>
                                    </Dropdown>

                                    {/* On Failure Dropdown */}
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button disableRipple className="input-field border rounded w-32 text-left px-2 py-1 text-sm">
                                                Rejected
                                                {/* <span className="ml-auto">{DropDownIcon()}</span> */}
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            aria-label="On Failure Options"
                                            items={["Rejected", "Failed", "Incomplete"].map(item => ({ key: item, label: item }))}
                                            onAction={(key) => console.log("Selected Failure:", key)}
                                        >
                                            {(item) => (
                                                <DropdownItem key={item.key} className="text-sm">
                                                    {item.label}
                                                </DropdownItem>
                                            )}
                                        </DropdownMenu>
                                    </Dropdown>

                                    {/* Status Text Dropdown */}
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button disableRipple className="input-field border rounded w-32 text-left px-2 py-1 text-sm">
                                                Enter sample text
                                                <span className="ml-auto">{DropDownIcon()}</span>
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            aria-label="Status Text Options"
                                            items={["In Progress", "Completed", "On Hold"].map(item => ({ key: item, label: item }))}
                                            onAction={(key) => console.log("Selected Status:", key)}
                                        >
                                            {(item) => (
                                                <DropdownItem key={item.key} className="text-sm">
                                                    {item.label}
                                                </DropdownItem>
                                            )}
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            ))}                        </div>
                    )}
                </div>

                <div className='w-full flex gap-5 justify-end mt-6'>
                    <CustomButton
                        variant="outline"
                        borderRadius="full"
                        width="145px"
                        height="45px"
                        onClick={CloseAnOtherViewPage}
                        btnText='Cancel'
                    />
                    <CustomButton
                        variant="primary"
                        borderRadius="full"
                        width="145px"
                        height="45px"
                        onClick={CloseAnOtherViewPage}
                        btnText='Save'
                    />
                </div>
            </div>
        </div>
    );
}

export default AddViewPage;
