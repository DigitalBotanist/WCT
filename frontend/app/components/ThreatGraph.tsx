import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const ThreatGraph = ({
    data,
}: {
    data: [{ year: number; population: number }];
}) => {
    // format [{ year: 2000, population: 500000 }]

    return (
        <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center">
                Population Growth Over Years
            </h2>

            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="year"
                        label={{
                            value: "Year",
                            position: "insideBottom",
                            offset: -5,
                        }}
                    />
                    <YAxis
                        label={{
                            value: "Population",
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                        }}
                    />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                        type="monotone"
                        dataKey="population"
                        stroke="#82ca9d"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


export default ThreatGraph
