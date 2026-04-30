import { FaFingerprint } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";
import { AiOutlineUser, AiOutlineCheckCircle } from "react-icons/ai";
import { motion } from "framer-motion";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const defaultSteps = [
  { position: 0, label: "شخصي معلومات", icon: AiOutlineUser },
  { position: 1, label: "د خپلوانو معلومات", icon: HiOutlineUsers },
  { position: 2, label: "بایومتریک معلومات", icon: FaFingerprint },
];

export default function ProgressIndicator({
  currentStep = 0,
  maxReached = 0,
  goToStep,
  steps = defaultSteps,
}) {
  const resolvedSteps = steps.map((step, index) => ({
    ...defaultSteps[index],
    ...step,
    icon: step.icon || defaultSteps[index]?.icon || AiOutlineUser,
  }));

  const progressPercent =
    resolvedSteps.length > 1
      ? (currentStep / (resolvedSteps.length - 1)) * 100
      : 0;

  return (
    <div className="flex w-full justify-center py-2 font-persian ">
      <div className="relative w-full  px-5">
        {/* ===== Progress Line Background ===== */}
        <div className="absolute top-1/4 w-[80%] mx-auto -translate-y-2/4 left-6 right-6 h-[2px] bg-gray-200 dark:bg-gray-100 rounded-full">
          <MotionDiv
            className="h-full  bg-success rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* ===== Steps ===== */}
        <div className="relative z-10 flex justify-between">
          {resolvedSteps.map((step, index) => {
            const isCompleted = currentStep > index;
            const isCurrent = currentStep === index;
            const isUnlocked = index <= maxReached;

            return (
              <div
                key={step.position}
                className="flex flex-col items-center text-center"
              >
                <MotionButton
                  type="button"
                  onClick={() => isUnlocked && goToStep(index)}
                  disabled={!isUnlocked}
                  className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 ${
                    isCompleted
                      ? " bg-success dark:bg-success  text-white"
                      : isCurrent
                        ? " dark:border-default border-dark-default  bg-app dark:bg-dark-app dark:text-card "
                        : isUnlocked
                          ? "border-gray-200/60 dark:border-gray-700  text-dark-app dark:text-app"
                          : " bg-app dark:bg-dark-app text-gray-300 cursor-not-allowed"
                  }`}
                  animate={{ scale: isCurrent ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {isCompleted ? (
                    <AiOutlineCheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </MotionButton>

                <p
                  className={`mt-2 text-sm font-medium rtl:font-persian ${
                    isCompleted || isCurrent
                      ? " dark:text-white text-dark-app"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
