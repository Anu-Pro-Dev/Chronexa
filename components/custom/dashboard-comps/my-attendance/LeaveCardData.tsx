import React from "react";

export const LeaveCardData = ({ data }: any) => (
    <>
        <div className='flex justify-between p-3'>
            {data.slice(0, 3).map((item: any, index: number) => (
                <React.Fragment key={item.label}>
                    <div>
                        <div className='flex gap-10'>
                            <p className='text-text-secondary font-semibold text-sm w-[60px]'>{item.label}</p>
                            <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                                {item.icon}
                            </div>
                        </div>
                        <p className={`text-2xl ${item.color} font-bold pt-2`}>{item.value}</p>
                    </div>
                    {index < 2 && <div className='w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15'></div>}
                </React.Fragment>
            ))}
        </div>
        <div className='flex justify-around py-2'>
            {Array(3).fill(null).map((_, index) => (
                <div key={index} className='h-[1px] w-[60px] bg-text-secondary flex self-center opacity-10'></div>
            ))}
        </div>
        <div className='flex justify-between p-3'>
            {data.slice(3).map((item: any, index: number) => (
                <React.Fragment key={item.label}>
                    <div>
                        <div className='flex gap-10'>
                            <p className='text-text-secondary font-semibold text-sm w-[60px]'>{item.label}</p>
                            <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                                {item.icon}
                            </div>
                        </div>
                        <p className={`text-2xl ${item.color} font-bold pt-2`}>{item.value}</p>
                    </div>
                    {index < 2 && <div className='w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15'></div>}
                </React.Fragment>
            ))}
        </div>
    </>
);