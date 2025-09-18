export default function ThreeDotsLoader() {
  return (
    <div className="flex items-end justify-center space-x-0.5 relative -bottom-[3px]">
      <span className="w-[3px] h-[3px] bg-white rounded-full animate-bounce delay-0"></span>
      <span className="w-[3px] h-[3px] bg-white rounded-full animate-bounce delay-150"></span>
      <span className="w-[3px] h-[3px] bg-white rounded-full animate-bounce delay-300"></span>
    </div>
  )
}
