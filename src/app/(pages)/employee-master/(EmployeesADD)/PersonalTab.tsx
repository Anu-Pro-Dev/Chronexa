'use client';
import React, { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import { Button, DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { CalendarIcon, DropDownIcon } from "@/lib/svg/icons";

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

function PersonalTab({ onValidityChange }: { onValidityChange: (isValid: boolean) => void }) {

    const [selectOrganization, setSelectOrganization] = useState<string>(organization_dropdown_items[0]);
    const [selectSex, setSelectSex] = useState<string>(sex_dropdown[0]);
    const [cardNumber, setCardNumber] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [mobile, setMobile] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const stylesDateInput = {
        inputWrapper: [
            "bg-foreground rounded-full border border-border-grey h-[40px] shadow-none px-4 min-w-[220px] text-[15px]",
        ],
        label: [
            "text-text-primary font-semibold text-[15px]",
        ],
    };

    useEffect(() => {
        // Basic form validation: check if required fields are filled
        const isFormValid = (
            selectOrganization !== organization_dropdown_items[0] &&
            cardNumber.trim() !== '' &&
            username.trim() !== '' &&
            name.trim() !== '' &&
            code.trim() !== '' &&
            password.trim() !== '' &&
            selectSex !== sex_dropdown[0]
        );
        onValidityChange(isFormValid);
    }, [selectOrganization, selectSex, cardNumber, username, name, onValidityChange, code, password]);


    return (
        <div>
            <div className='flex justify-evenly gap-20'>
                <div className='flex flex-col items-end'>
                    <div className='py-2 flex text-left flex-row gap-3 items-center'>
                        <div className='font-semibold text-[15px] text-text-primary'>
                            Organization<span className="text-danger ml-1">*</span>
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
                                        <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
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
                    <Input
                        inputType={'text'}
                        inputLabel={'Card number'}
                        placeholderText={'Enter your card number'}
                        inputAttr={true}
                        className={'flex-row gap-3 items-center'}
                        labelClassName={'font-semibold text-[15px]'}
                        inputClassName={'w-[220px]'}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <Input
                        inputType={'text'}
                        inputLabel={'Username'}
                        placeholderText={'Enter your username'}
                        inputAttr={true}
                        className={'flex-row gap-3 items-center'}
                        labelClassName={'font-semibold text-[15px]'}
                        inputClassName={'w-[220px]'}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        inputType={'text'}
                        inputLabel={'Name'}
                        placeholderText={'Enter your name'}
                        inputAttr={true}
                        className={'flex-row gap-3 items-center'}
                        labelClassName={'font-semibold text-[15px]'}
                        inputClassName={'w-[220px]'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        inputType={'text'}
                        inputLabel={'Mobile'}
                        placeholderText={'Enter your mobile number'}
                        inputAttr={false}
                        className={'flex-row gap-3 items-center'}
                        labelClassName={'font-semibold text-[15px]'}
                        inputClassName={'w-[220px]'}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                    />
                    <Input
                        inputType={'email'}
                        inputLabel={'Email'}
                        placeholderText={'Enter your email'}
                        inputAttr={false}
                        className={'flex-row gap-3 items-center'}
                        labelClassName={'font-semibold text-[15px]'}
                        inputClassName={'w-[220px]'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        inputType={'text'}
                        inputLabel={'Remarks'}
                        placeholderText={'Enter your remarks'}
                        inputAttr={false}
                        className={'flex-row gap-3 items-center'}
                        labelClassName={'font-semibold text-[15px]'}
                        inputClassName={'w-[220px]'}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                    <div className='py-2 flex text-left flex-row gap-3 items-center'>
                        <DatePicker
                            label="Employee system activation"
                            color='success'
                            labelPlacement="outside-left"
                            dateInputClassNames={stylesDateInput}
                            classNames={{
                                base: "text-text-primary max-w-fit gap-3",
                                selectorButton: "text-text-primary",
                                calendar: "bg-text-primary font-normal text-sm text-white border-border-grey shadow-searchbar rounded-lg",
                                calendarContent: " text-secondary",
                                input: "text-[15px] text-text-primary",
                            }}
                            selectorIcon={
                                CalendarIcon()
                            }
                        />
                    </div>
                </div>
                <div className='flex flex-col items-end'>
                    <Input
                        inputType={'text'}
                        inputLabel={'Code'}
                        placeholderText={'Enter your code'}
                        inputAttr={true}
                        className={'flex-row gap-3 items-center'}
                        labelClassName={'font-semibold text-[15px]'}
                        inputClassName={'w-[220px]'}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <Input inputType={'text'} inputLabel={'Pin'} placeholderText={'Enter your pin'} inputAttr={false} className={'flex-row gap-3 items-center'} labelClassName={'font-semibold text-[15px]'} inputClassName={'w-[220px]'} />
                    <Input inputType={'text'} inputLabel={'Password'} placeholderText={'Enter your password'} inputAttr={true} className={'flex-row gap-3 items-center'} labelClassName={'font-semibold text-[15px]'} inputClassName={'w-[220px]'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    <Input inputType={'text'} inputLabel={'Name [العربية]'} placeholderText={'Enter your name'} inputAttr={true} className={'flex-row gap-3 items-center'} labelClassName={'font-semibold text-[15px]'} inputClassName={'w-[220px]'} />
                    <div className='py-2 flex text-left flex-row gap-3 items-center'>
                        <div className='font-semibold text-[15px] text-text-primary'>
                            Sex<span className="text-danger ml-1">*</span>
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
                                    <div className='flex items-center gap-3'>
                                        <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                            <p className='font-normal text-sm text-text-primary'>
                                                {selectSex}
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
                                items={sex_dropdown.map(item => ({ key: item, label: item }))}
                                onAction={(key) => {
                                    const selected = sex_dropdown.find((item) => item === key);
                                    if (selected) {
                                        setSelectSex(selected);
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
                    <div className='py-2 flex text-left flex-row gap-3 items-center'>
                        <DatePicker
                            label="Join date"
                            color='success'
                            labelPlacement="outside-left"
                            dateInputClassNames={stylesDateInput}
                            classNames={{
                                base: "text-text-primary max-w-fit gap-3",
                                selectorButton: "text-text-primary",
                                calendar: "bg-text-primary font-normal text-sm text-white border-border-grey shadow-searchbar rounded-lg",
                                calendarContent: " text-secondary",
                                input: "text-[15px] text-text-primary",
                            }}
                            selectorIcon={
                                CalendarIcon()
                            }
                        />
                    </div>
                    <div className='py-2 flex text-left flex-row gap-3 items-center'>
                        <DatePicker
                            label="Inactive date"
                            color='success'
                            labelPlacement="outside-left"
                            dateInputClassNames={stylesDateInput}
                            classNames={{
                                base: "text-text-primary max-w-fit gap-3",
                                selectorButton: "text-text-primary",
                                calendar: "bg-text-primary font-normal text-sm text-white border-border-grey shadow-searchbar rounded-lg",
                                calendarContent: " text-secondary",
                                input: "text-[15px] text-text-primary",
                            }}
                            selectorIcon={
                                CalendarIcon()
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PersonalTab
