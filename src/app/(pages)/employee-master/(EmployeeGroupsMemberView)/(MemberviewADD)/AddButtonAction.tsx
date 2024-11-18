
import CustomButton from '@/components/ui/CustomButton'
import React from 'react'

function AddButtonActionMemberView({ setTab, tab }: { setTab: any, tab: any }) {
  const handelEmployeesGroupsMemberViewAddClose = () => {
    setTab(tab.replace("MemberView#add", ""));
    console.log("tab: ", tab);
  };
  return (
    <div className="bg-foreground rounded-[20px] mx-6 p-6 pb-0">
      <header className='mb-6'>
        <h1 className='text-primary font-bold text-xl'>Employee Groups</h1>
        <p className='text-text-secondary font-regular text-sm'>Select the Groups of the employee</p>
      </header>
      <div className='tab-container'>
        <CustomButton
          variant="outline"
          borderRadius="full"
          width="145px"
          height="45px"
          onClick={handelEmployeesGroupsMemberViewAddClose}
          btnText='Cancel'
        />
      </div>
    </div>
  )
}

export default AddButtonActionMemberView
