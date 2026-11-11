import useInView from "../../hookes/useInView";


const Reveal = ({ children, className = "" }) => {
  const { ref, isVisible } = useInView();

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? "active" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
