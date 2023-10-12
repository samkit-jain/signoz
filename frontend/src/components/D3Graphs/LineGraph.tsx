// D3LineChart.tsx
import * as d3 from 'd3';
import { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';

interface DataPoint {
	date: Dayjs;
	value: number;
}

interface DataSet {
	name: string;
	values: DataPoint[];
}

interface D3LineChartProps {
	data: DataSet[];
}

function D3LineChart({ data }: D3LineChartProps): JSX.Element {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (!svgRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			if (!Array.isArray(entries) || !entries.length) return;

			const entry = entries[0];
			setDimensions({
				width: entry.contentRect.width,
				height: entry.contentRect.height,
			});
		});

		resizeObserver.observe(svgRef.current);

		return (): void => resizeObserver.disconnect();
	}, []);

	useEffect(() => {
		if (!dimensions.width || !dimensions.height) return;

		if (data === undefined) {
			return;
		}

		const svg = d3.select(svgRef.current);
		svg.selectAll('*').remove(); // Clear previous contents

		const margin = { top: 5, right: 0, bottom: 5, left: 30 };

		const width = dimensions.width - margin.left - margin.right;
		const height = dimensions.height - margin.top - margin.bottom;

		// Scales
		const x = d3.scaleUtc().range([0, width]);
		const y = d3.scaleLinear().range([height, 0]);

		x.domain(d3.extent(data[0].values, (d) => d.date.toDate()) as [Date, Date]);
		y.domain([
			0,
			d3.max(data, (d) => d3.max(d.values, (e) => e.value)) as number,
		]);

		// Axes
		const allDates = data.flatMap((dataset) =>
			dataset.values.map((d) => d.date.toDate()),
		);

		const xAxis = d3
			.axisBottom(x)
			.tickValues(allDates)
			.tickFormat((d) => {
				// if d is date
				if (d instanceof Date) {
					return d3.timeFormat('%Y-%m-%d')(d);
				}
				return d3.timeFormat('%Y-%m-%d')(new Date(Number(d.toString())));
			});
		const yAxis = d3.axisLeft(y);

		const chartGroup = svg
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Axis labels
		chartGroup
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0,${height - 15})`)
			.call(xAxis);

		chartGroup.append('g').attr('class', 'y axis').call(yAxis);

		// adding circle for data points
		data.forEach((dataset, index) => {
			chartGroup
				.selectAll('circle')
				.data(dataset.values)
				.enter()
				.append('circle')
				.attr('cx', (d) => x(d.date.toDate()))
				.attr('cy', (d) => y(d.value))
				.attr('r', 5) // radius of the circle
				.attr('fill', d3.schemeCategory10[index % 10]);
		});

		// Lines
		const line = d3
			.line<DataPoint>()
			.x((d) => x(d.date.toDate()))
			.y((d) => y(d.value));

		data.forEach((dataset, index) => {
			chartGroup
				.append('path')
				.datum(dataset.values)
				.attr('fill', 'none')
				.attr('stroke', d3.schemeCategory10[index % 10])
				.attr('stroke-width', 2)
				.attr('d', line);
		});
	}, [data, dimensions]);

	return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}

export default D3LineChart;
