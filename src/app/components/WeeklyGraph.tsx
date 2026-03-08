import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", km: 420 },
  { day: "Tue", km: 510 },
  { day: "Wed", km: 680 },
  { day: "Thu", km: 450 },
  { day: "Fri", km: 300 },
  { day: "Sat", km: 920 },
  { day: "Sun", km: 1400 },
];

export function WeeklyGraph() {
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
            Weekly Club Mileage
          </h2>
          <p className="text-white/60 text-lg max-w-2xl">
            Our community's collective running journey this week
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-[#121212] to-[#0A0A0A] rounded-2xl p-8 border border-white/10 overflow-hidden"
        >
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <defs>
                  <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4CC9F0" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 14 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 14 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  label={{ value: "Distance (km)", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.6)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121212",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="km"
                  stroke="#FF3B30"
                  strokeWidth={3}
                  dot={{
                    fill: "#FF3B30",
                    strokeWidth: 2,
                    r: 6,
                    stroke: "#4CC9F0",
                  }}
                  activeDot={{
                    r: 8,
                    fill: "#FF3B30",
                    stroke: "#4CC9F0",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Total */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="inline-block px-8 py-4 bg-white/5 rounded-full border border-white/10">
              <span className="text-white/60 text-sm uppercase tracking-wider mr-4">
                Weekly Total
              </span>
              <span className="font-['Bebas_Neue'] text-4xl text-[#FF3B30]">
                4,680 km
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
