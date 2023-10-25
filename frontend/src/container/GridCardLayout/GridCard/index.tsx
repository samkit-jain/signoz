import { PANEL_TYPES } from 'constants/queryBuilder';
import { useGetQueryRange } from 'hooks/queryBuilder/useGetQueryRange';
import { useStepInterval } from 'hooks/queryBuilder/useStepInterval';
import { useDimensions } from 'hooks/useDimensions';
import { useIntersectionObserver } from 'hooks/useIntersectionObserver';
import { getDashboardVariables } from 'lib/dashbaordVariables/getDashboardVariables';
import { getUPlotChartData, getUPlotChartOptions } from 'lib/getUplotChartData';
import isEmpty from 'lodash-es/isEmpty';
import { memo, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UpdateTimeInterval } from 'store/actions';
import { AppState } from 'store/reducers';
import { GlobalReducer } from 'types/reducer/globalTime';

import EmptyWidget from '../EmptyWidget';
import { MenuItemKeys } from '../WidgetHeader/contants';
import { GridCardGraphProps } from './types';
import WidgetGraphComponent from './WidgetGraphComponent';

function GridCardGraph({
	widget,
	name,
	onClickHandler,
	headerMenuList = [MenuItemKeys.View],
	isQueryEnabled,
	threshold,
	variables,
}: GridCardGraphProps): JSX.Element {
	const dispatch = useDispatch();
	const [errorMessage, setErrorMessage] = useState<string>();

	const onDragSelect = (start: number, end: number): void => {
		const startTimestamp = Math.trunc(start);
		const endTimestamp = Math.trunc(end);

		if (startTimestamp !== endTimestamp) {
			dispatch(UpdateTimeInterval('custom', [startTimestamp, endTimestamp]));
		}
	};

	const graphRef = useRef<HTMLSpanElement>(null);

	const isVisible = useIntersectionObserver(graphRef, undefined, true);

	const { minTime, maxTime, selectedTime: globalSelectedInterval } = useSelector<
		AppState,
		GlobalReducer
	>((state) => state.globalTime);

	const updatedQuery = useStepInterval(widget?.query);

	const isEmptyWidget =
		widget?.id === PANEL_TYPES.EMPTY_WIDGET || isEmpty(widget);

	const queryResponse = useGetQueryRange(
		{
			selectedTime: widget?.timePreferance,
			graphType: widget?.panelTypes,
			query: updatedQuery,
			globalSelectedInterval,
			variables: getDashboardVariables(variables),
		},
		{
			queryKey: [
				maxTime,
				minTime,
				globalSelectedInterval,
				variables,
				widget?.query,
				widget?.panelTypes,
				widget.timePreferance,
			],
			keepPreviousData: true,
			enabled: isVisible && !isEmptyWidget && isQueryEnabled,
			refetchOnMount: false,
			onError: (error) => {
				setErrorMessage(error.message);
			},
		},
	);

	const containerDimensions = useDimensions(graphRef);

	const chartData = getUPlotChartData(
		queryResponse.data?.payload.data.newResult.data,
	);

	const options = useMemo(
		() =>
			getUPlotChartOptions(
				queryResponse.data?.payload.data.newResult.data,
				containerDimensions,
			),
		[queryResponse?.data?.payload?.data?.newResult?.data, containerDimensions],
	);

	console.log({
		chartData,
		data: queryResponse.data?.payload.data.newResult.data,
		options,
		title: widget?.title,
	});

	const isEmptyLayout = widget?.id === PANEL_TYPES.EMPTY_WIDGET;

	return (
		<span ref={graphRef}>
			<WidgetGraphComponent
				options={options}
				widget={widget}
				queryResponse={queryResponse}
				errorMessage={errorMessage}
				data={chartData}
				isWarning={false}
				name={name}
				onDragSelect={onDragSelect}
				threshold={threshold}
				headerMenuList={headerMenuList}
				onClickHandler={onClickHandler}
			/>

			{isEmptyLayout && <EmptyWidget />}
		</span>
	);
}

GridCardGraph.defaultProps = {
	onDragSelect: undefined,
	onClickHandler: undefined,
	isQueryEnabled: true,
	threshold: undefined,
	headerMenuList: [MenuItemKeys.View],
};

export default memo(GridCardGraph);
