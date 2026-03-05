import IC from "../components/IC";
import Icon from "../components/Icon";

export default function ActionHeader() {
  return (
    <div
      className="flex items-center shrink-0  border-b border-default dark:border-dark-default gap-2 bg-card dark:bg-dark-card"
      style={{
        padding: "10px 20px",
      }}
    >
      <div className=" flex items-center gap-2 flex-1">
        <Icon
          d={IC.check}
          className={
            " dark:stroke-success-dark stroke-success stroke-[2.5] size-[13px]"
          }
        />
        <span className=" text-xs dark:text-success-dark text-success font-medium">
          Last updated now
        </span>
      </div>
      <button
        className=" flex items-center text-secondary dark:text-dark-secondary gap-[6px] rounded-[8px] border dark:border-dark-default border-default text-xs cursor-pointer"
        style={{
          padding: "6px 12px",
        }}
      >
        <Icon d={IC.customize} className={" size-[12px] stroek-[1.5]"} />
        Customize Widget
      </button>
      <button
        className=" flex items-center text-secondary dark:text-dark-secondary gap-[6px] rounded-[8px] border dark:border-dark-default border-default text-xs cursor-pointer"
        style={{
          padding: "6px 12px",
        }}
      >
        <Icon d={IC.import} className={" size-[12px] stroek-[1.5]"} />
        Imports
        <Icon
          d={IC.chevDown}
          className={
            " stroke-2 stroke-muted dark:stroke-dark-muted size-[11px]"
          }
        />
      </button>
      <button
        className="flex text-white cursor-pointer font- items-center items-center gap-[6px] rounded-none rounded-[8px] bg-[linear-gradient(135deg,#7c3aed,#6d28d9)]"
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          border: "none",
        }}
      >
        <Icon d={IC.export} size={12} stroke="#fff" strokeWidth={2} />
        Exports
        <Icon d={IC.chevDown} size={11} stroke="#fff" strokeWidth={2} />
      </button>
    </div>
  );
}
