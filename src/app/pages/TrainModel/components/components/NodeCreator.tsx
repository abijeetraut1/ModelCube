import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"




const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig



export default function NodeCreator({ title, contents }) {


    const chartData = contents.map((row, idx) => ({
        step: idx + 1,
        ...Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k, parseFloat(v)])
        )
    }));

    return (
        <div>
            <Card className="pt-0">
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-desktop)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-desktop)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-mobile)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-desktop)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="step"
                                tickLine={true}
                                axisLine={true}
                                tickMargin={8}
                                minTickGap={1} // Force smaller gap
                                allowDuplicatedCategory={false}
                                interval={0} // Show every tick
                                tickFormatter={(value) => `${value}`}
                            />
                            <ChartTooltip
                                cursor={true}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => {
                                            console.log(value);
                                            `Step ${value}`
                                        }}
                                        indicator="dot"
                                    />
                                }
                            />

                            {Object.keys(chartData[0]).filter(key => key !== "step").map((key, i) => (
                                <Area
                                    key={key}
                                    dataKey={key}
                                    type="natural"
                                    // fill={i % 2 ? "url(#fillMobile)" : "url(#fillDesktop)"}
                                    fill={"transparent"}
                                    stroke={i % 2 ? "var(--color-mobile)" : "var(--color-desktop)"}
                                    stackId="a"
                                />
                            ))}
                            {/* <ChartLegend content={<ChartLegendContent />} /> */}
                        </AreaChart>
                    </ChartContainer>
                </CardContent>

                <CardFooter>
                    <div className="flex w-full justify-center items-center gap-2 text-sm">
                        <div className="flex items-center  text-center font-medium">
                            Evaluation Metrics
                        </div>
                    </div>
                </CardFooter>
            </Card>


            {/* <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Label>{title}</Label>
                    </CardTitle>

                    <CardContent>
                        {Array.isArray(contents) && <ul className="my-2 ml-6 list-disc [&>li]:mt-2">
                            {contents.map((el) => (
                                <div key={el}>
                                    <li>{el}</li>
                                </div>
                            ))}
                        </ul>}

                        {typeof (contents) === "number" &&
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                                {contents}
                            </p>
                        }

                        {contents?.type === "charts"



                        }
                    </CardContent>

                </CardHeader>
            </Card> */}
        </div>
    )
}
