import '../GantChart.styles.scss';
import { convertTimeToRelevantUnit } from 'container/TraceDetail/utils';
import { useIsDarkMode } from 'hooks/useDarkMode';
import { toFixed } from 'utils/toFixed';

import { SpanBorder, SpanLine, SpanText, SpanWrapper } from './styles';
import { Popover, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

interface SpanLengthProps {
	globalSpread: any;
	globalStart: any;
	serviceName: any;
	startTime: any;
	name: any;
	value: any;
	width: string;
	leftOffset: string;
	bgColor: string;
	inMsCount: number;
}

function Span(props: SpanLengthProps): JSX.Element {
	const {
		width,
		leftOffset,
		bgColor,
		inMsCount,
		serviceName,
		startTime,
		name,
		globalStart,
		globalSpread,
	} = props;
	const isDarkMode = useIsDarkMode();
	const { time, timeUnitName } = convertTimeToRelevantUnit(inMsCount);
	const [arrow, setArrow] = useState(false);

	useEffect(() => {
		document.documentElement.scrollTop = document.documentElement.clientHeight;
		document.documentElement.scrollLeft = document.documentElement.clientWidth;
	}, []);

	const getContent = () => {
		console.log('startTime', props);

		// console.log(first);

		const timeStamp = dayjs(startTime).format('h:mm:ss:SSS A');
		const startTimeInMs = startTime - globalStart;
		return (
			<div>
				<p>Duration : {inMsCount}</p>
				<p>
					Start Time: {startTimeInMs}ms [{timeStamp}]{' '}
				</p>
			</div>
		);
	};

	return (
		<SpanWrapper className="span-container">
			<SpanLine
				className="spanLine"
				isDarkMode={isDarkMode}
				bgColor={bgColor}
				leftOffset={leftOffset}
				width={width}
			/>

			<div>
				{/* {arrow && (
					<div
						className="spanDetails"
						style={{
							left: `${leftOffset}%`,
						}}
					>
						asdhjadshjkasd asdghjkasdhjkasd asdhjkasdhjkads
					</div>
				)} */}
				<Popover
					style={{
						left: `${leftOffset}%`,
					}}
					title={name}
					content={getContent()}
					trigger="hover"
					placement="left"
					autoAdjustOverflow
				>
					<SpanBorder
						className="spanTrack"
						isDarkMode={isDarkMode}
						bgColor={bgColor}
						leftOffset={leftOffset}
						width={width}
					/>
				</Popover>
			</div>

			<SpanText isDarkMode={isDarkMode} leftOffset={leftOffset}>{`${toFixed(
				time,
				2,
			)} ${timeUnitName}`}</SpanText>
		</SpanWrapper>
	);
}

export default Span;
