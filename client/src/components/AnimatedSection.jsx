import { useInView } from "react-intersection-observer";

export default function AnimatedSection({
  children,
  className = "",
  animationClass = "transform opacity-100 translate-x-0 transition-all duration-1000 ease-out cubic-bezier(0.68, -0.55, 0.27, 1.55)", // Mượt mà với cubic bezier
  initialClass = "transform opacity-0 translate-x-[-100px]", // Bắt đầu ngoài màn hình với độ dịch chuyển mượt mà
}) {
  const { ref, inView } = useInView({
    triggerOnce: true, // chỉ chạy 1 lần
    threshold: 0.1, // 10% phần tử phải vào viewport
  });

  return (
    <div
      ref={ref}
      className={`${className} ${inView ? animationClass : initialClass}`}
    >
      {children}
    </div>
  );
}
