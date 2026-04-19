export const getCourseStatusTone = (status, isDark) => {
  if (status === "draft") {
    return isDark
      ? "border-[#9e6a03] bg-[#463800] text-[#d29922]"
      : "border-[#eac54f] bg-[#fff8c5] text-[#9a6700]";
  }

  if (status === "archived") {
    return isDark
      ? "border-[#57606a] bg-[#21262d] text-[#8b949e]"
      : "border-[#d0d7de] bg-[#f6f8fa] text-[#57606a]";
  }

  return isDark
    ? "border-[#2ea043] bg-[#1f6f3a66] text-[#3fb950]"
    : "border-[#55cc8a] bg-[#dafbe1] text-[#1a7f37]";
};
