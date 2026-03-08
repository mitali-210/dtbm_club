import { motion } from "motion/react";
import { Target, Award, CheckCircle } from "lucide-react";
import { useState } from "react";

const challenges = [
  {
    id: 1,
    title: "Run 5km today",
    description: "Complete a 5km run to earn the Daily Warrior badge",
    icon: Target,
    progress: 0,
    total: 5,
  },
  {
    id: 2,
    title: "Sunset 8km run",
    description: "Run 8km during sunset hours (5-7pm)",
    icon: Target,
    progress: 0,
    total: 8,
  },
  {
    id: 3,
    title: "Hill repeats session",
    description: "Complete 5 hill repeats to unlock the Climber badge",
    icon: Target,
    progress: 0,
    total: 5,
  },
];

export function DailyChallenge() {
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);

  const handleComplete = (id: number) => {
    if (!completedChallenges.includes(id)) {
      setCompletedChallenges([...completedChallenges, id]);
    }
  };

  return (
    <section className="relative py-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-['Bebas_Neue'] text-5xl md:text-6xl mb-4">
            Daily Challenges
          </h2>
          <p className="text-white/60 text-lg max-w-2xl">
            Push yourself with daily running challenges and unlock exclusive badges
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => {
            const isCompleted = completedChallenges.includes(challenge.id);
            const Icon = challenge.icon;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className={`relative bg-gradient-to-br from-[#121212] to-[#0A0A0A] rounded-2xl p-6 border transition-all duration-500 ${
                  isCompleted ? 'border-[#00FFA3]' : 'border-white/10 hover:border-white/20'
                }`}>
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    isCompleted ? 'bg-[#00FFA3]/20 border-2 border-[#00FFA3]' : 'bg-white/5 border border-white/10'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle size={32} className="text-[#00FFA3]" />
                    ) : (
                      <Icon size={32} className="text-[#FF3B30]" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-['Bebas_Neue'] text-2xl mb-2">
                    {challenge.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 text-sm mb-6">
                    {challenge.description}
                  </p>

                  {/* Progress */}
                  {!isCompleted && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Progress</span>
                        <span className="font-medium">{challenge.progress}/{challenge.total}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#FF3B30] to-[#4CC9F0]"
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: isCompleted ? 1 : 1.02 }}
                    whileTap={{ scale: isCompleted ? 1 : 0.98 }}
                    onClick={() => handleComplete(challenge.id)}
                    disabled={isCompleted}
                    className={`w-full py-3 rounded-full font-medium transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3] cursor-default'
                        : 'bg-[#FF3B30] text-white hover:bg-[#FF4B40]'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="flex items-center justify-center gap-2">
                        <Award size={18} />
                        Challenge Completed
                      </span>
                    ) : (
                      'Start Challenge'
                    )}
                  </motion.button>

                  {/* Glow Effect */}
                  {isCompleted && (
                    <motion.div
                      className="absolute -inset-[1px] bg-[#00FFA3] rounded-2xl opacity-30 blur-xl"
                      style={{ zIndex: -1 }}
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
