'use client';

import CustomButton from '@/components/ui/CustomButton'
import Input from '@/components/ui/Input'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import React, { useEffect } from 'react'

function PendingModelPopup({openVerificationTab, setOpenVerificationTab} : {openVerificationTab: boolean, setOpenVerificationTab: any}) {
    const { onOpen, isOpen, onOpenChange } = useDisclosure();

    useEffect(()=>{
        if(openVerificationTab){
            onOpen();
        }
    }, [openVerificationTab])

    const closeModelPopup = () => {
        setOpenVerificationTab(false);
    }

    return (
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
                            <h1 className="text-xl font-bold text-text-primary capitalize">PENDING TAB</h1>
                            <h4 className="text-sm font-semibold text-text-secondary pb-5"> of the employee</h4>
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
                                onClick={closeModelPopup}
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
    )
}


export default PendingModelPopup
