import	React, {MouseEvent, ReactElement}						from	'react';
import	Image													from	'next/image';
import	{TVault, TStrategy}										from	'contexts/useWatch';
import	{Card, AddressWithActions, AlertBox}					from	'@majorfi/web-lib/components';
import	{ArrowDown, AlertCritical, AlertError, AlertWarning}	from	'@majorfi/web-lib/icons';
import	{useLocalStorage}										from	'@majorfi/web-lib/hooks';
import {AutoSizer} from 'react-virtualized';

type	TSectionAlertList = {
	stratOrVault: (TStrategy | TVault)[],
	shouldDisplayDismissed: boolean
};
const	SectionAlertList = React.memo(function SectionAlertList({stratOrVault, shouldDisplayDismissed}: TSectionAlertList): ReactElement {
	const	[sortBy, set_sortBy] = React.useState('');
	const	[sortedStratOrVault, set_sortedStratOrVault] = React.useState([] as (TStrategy | TVault)[]);
	const	[dismissed, set_dismissed] = useLocalStorage('dismissedAlerts', []) as [string[], (s: string[]) => void];
	
	/* 🔵 - Yearn Finance ******************************************************
	** This effect is used to display the alerts based on the level filter.
	** The easy win for this part is to split the alerts in 3 differents array
	** and then to merge them with the right order.
	**************************************************************************/
	React.useEffect((): void => {
		const	_default = [] as (TStrategy | TVault)[];
		const	_criticals = [] as (TStrategy | TVault)[];
		const	_errors = [] as (TStrategy | TVault)[];
		const	_warnings = [] as (TStrategy | TVault)[];
		for (const _stratOrVault of stratOrVault) {
			if (dismissed.length > 0 && !shouldDisplayDismissed && dismissed.includes(_stratOrVault.alertHash))
				continue;
			if (_stratOrVault.alerts.some((alert): boolean => alert.level === 'critical'))
				_criticals.push(_stratOrVault);
			else if (_stratOrVault.alerts.some((alert): boolean => alert.level === 'error'))
				_errors.push(_stratOrVault);
			else if (_stratOrVault.alerts.some((alert): boolean => alert.level === 'warning'))
				_warnings.push(_stratOrVault);
			_default.push(_stratOrVault);
		}
		if (sortBy === 'level')
			set_sortedStratOrVault([..._criticals, ..._errors, ..._warnings]);
		else if (sortBy === '-level')
			set_sortedStratOrVault([..._warnings, ..._errors, ..._criticals]);
		else 
			set_sortedStratOrVault(_default);
	}, [stratOrVault, sortBy, dismissed, shouldDisplayDismissed]);

	/* 🔵 - Yearn Finance ******************************************************
	** The alerts can be dismissed or tracked, aka ignored or displayed. A
	** specific toggle allows us to switch the view for this. Non-dismissed
	** alers will be dismissed, and dismissed ones will be tracked.
	**************************************************************************/
	function	onDismissOrTrack(s: string): void {
		if (dismissed.includes(s))
			set_dismissed(dismissed.filter((_s): boolean => _s !== s));
		else
			set_dismissed([...new Set([...dismissed, s])]);
	}

	/* 🔵 - Yearn Finance ******************************************************
	** Render the Head of our fake table. This head will display the topic for
	** each column and allow us to sort the alerts by level.
	**************************************************************************/
	function	renderTableHead(): ReactElement {
		return (
			<div className={'flex flex-row justify-between items-center px-6 pb-2 w-max'}>
				<div className={'flex flex-row items-start w-[300px]'}>
					<p className={'text-typo-secondary-variant'}>{'Vault'}</p>
				</div>
				<div className={'flex flex-row items-start w-[300px]'}>
					<p className={'text-typo-secondary-variant'}>{'Strategy'}</p>
				</div>
				<div className={'flex flex-row items-center w-[125px] whitespace-nowrap'}>
					<p className={'text-typo-secondary-variant'}>{'Level'}</p>
					<ArrowDown
						onClick={(): void => set_sortBy(sortBy === 'level' ? '-level' : sortBy === '-level' ? '' : 'level')}
						className={`ml-1 w-4 h-4 hover:text-icons-variant transition-all cursor-pointer ${sortBy.includes('level') ? 'text-icon-variant' : 'text-icons-primary'} ${sortBy === '-level' ? 'rotate-180' : 'rotate-0'}`} />
				</div>
			</div>
		);
	}

	/* 🔵 - Yearn Finance ******************************************************
	** Render the current level of the alert. The displayed level matches the
	** highest level of the alerts (critical -> error -> warning).
	**************************************************************************/
	function	renderAlertLevel(stratOrVault: TStrategy | TVault): ReactElement {
		if (stratOrVault.alerts.some((alert): boolean => alert.level === 'critical')) {
			return (
				<div className={'flex flex-row items-center'}>
					<AlertCritical className={'mr-2 w-5 h-5 text-alert-critical-primary'} />
					<p className={'text-alert-error-primary'}>{'Error'}</p>
				</div>
			);
		}
		if (stratOrVault.alerts.some((alert): boolean => alert.level === 'error')) {
			return (
				<div className={'flex flex-row items-center'}>
					<AlertError className={'mr-2 w-5 h-5 text-alert-error-primary'} />
					<p className={'text-alert-error-primary'}>{'Error'}</p>
				</div>
			);
		}
		return (
			<div className={'flex flex-row items-center'}>
				<AlertWarning className={'mr-2 w-5 h-5 text-alert-warning-primary'} />
				<p className={'text-alert-warning-primary'}>{'Warning'}</p>
			</div>
		);
	}

	/* 🔵 - Yearn Finance ******************************************************
	** Render the first half of the Summary component. Based on if the data is
	** a Vault or a Strategy, the elements are displayed differently.
	**************************************************************************/
	function	renderSummaryStart(stratOrVault: TStrategy | TVault): ReactElement {
		if ((stratOrVault as TStrategy)?.vault) {
			stratOrVault = stratOrVault as TStrategy;
			return (
				<div className={'flex flex-row justify-between items-center w-max'}>
					<div className={'flex flex-row items-start w-[300px]'}>
						<Image width={40} height={40} src={stratOrVault.vault?.icon} quality={90} />
						<div className={'ml-2 md:ml-6'}>
							<b className={'text-base text-typo-primary'}>{stratOrVault.vault?.name}</b>
							<AddressWithActions
								address={stratOrVault.vault.address}
								explorer={stratOrVault.vault.explorer}
								wrapperClassName={'hidden md:flex'}
								className={'font-mono text-xs text-typo-secondary'} />
						</div>
					</div>
					<div className={'flex flex-row items-start w-[300px]'}>
						<div>
							<b className={'text-base text-typo-primary'}>{stratOrVault.display_name}</b>
							<AddressWithActions
								address={stratOrVault.address}
								explorer={stratOrVault.vault.explorer}
								wrapperClassName={'hidden md:flex'}
								className={'font-mono text-xs text-typo-secondary'} />
						</div>
					</div>
					<div className={'w-[125px] text-sm whitespace-nowrap'}>
						{renderAlertLevel(stratOrVault)}
					</div>
				</div>
			);
		} else {
			stratOrVault = stratOrVault as TVault;
			return (
				<div className={'flex flex-row justify-between items-center w-max'}>
					<div className={'flex flex-row items-start w-[300px]'}>
						<Image width={40} height={40} src={stratOrVault.icon} quality={90} />
						<div className={'ml-2 md:ml-6'}>
							<b className={'text-base text-typo-primary'}>{stratOrVault.name}</b>
							<AddressWithActions
								address={stratOrVault.address}
								explorer={stratOrVault.explorer}
								wrapperClassName={'hidden md:flex'}
								className={'font-mono text-xs text-typo-secondary'} />
						</div>
					</div>
					<div className={'flex flex-row items-start w-[300px]'}>
						<div>
							<b className={'text-base text-typo-primary'}>{'-'}</b>
						</div>
					</div>
					{renderAlertLevel(stratOrVault)}
				</div>
			);
		}
	}

	/* 🔵 - Yearn Finance ******************************************************
	** Render the second half of the Summary component. Based on if the data is
	** a Vault or a Strategy, the elements are displayed differently.
	**************************************************************************/
	function	renderSummaryEnd(stratOrVault: TStrategy | TVault): ReactElement {
		if ((stratOrVault as TStrategy)?.vault) {
			stratOrVault = stratOrVault as TStrategy;
			return (
				<div className={'flex flex-row justify-start items-center w-full md:justify-end'}>
					<div className={'pr-4 pl-3 text-sm font-medium text-right whitespace-nowrap sm:pr-6'}>
						<div onClick={(e: MouseEvent): void => e.stopPropagation()}>
							<button
								onClick={(e): void => {
									e.stopPropagation();
									onDismissOrTrack(stratOrVault.alertHash);
								}}
								className={'ml-0 min-w-[132px] md:ml-6 button button-outline'}>
								{dismissed.includes(stratOrVault.alertHash) ? 'Track' : 'Dismiss'}
							</button>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className={'flex flex-row justify-start items-center w-full md:justify-end'}>
					<div className={'pr-4 pl-3 text-sm font-medium text-right whitespace-nowrap sm:pr-6'}>
						<div onClick={(e: MouseEvent): void => e.stopPropagation()}>
							<button
								onClick={(e): void => {
									e.stopPropagation();
									onDismissOrTrack(stratOrVault.alertHash);
								}}
								className={'ml-0 min-w-[132px] md:ml-6 button button-outline'}>
								{dismissed.includes(stratOrVault.alertHash) ? 'Track' : 'Dismiss'}
							</button>
						</div>
					</div>
				</div>
			);
		}
	}

	/* 🔵 - Yearn Finance ******************************************************
	** Main render of the section
	**************************************************************************/
	return (
		<>
			{renderTableHead()}
			<section aria-label={'strats-vaults-alerts-list'} className={'min-w-full h-full'}>
				<AutoSizer>
					{({width, height}: {width: number, height: number}): ReactElement => (
						<div style={{width, height}}>
							<Card.List className={'overflow-y-scroll space-y-2 h-full rounded-lg'}>
								{sortedStratOrVault.map((stratOrVault): ReactElement => (
									<div key={stratOrVault.address}>
										<Card.Detail
											key={stratOrVault.address}
											variant={'surface'}
											isSticky={false}
											summary={(p: unknown): ReactElement => (
												<Card.Detail.Summary
													startChildren={renderSummaryStart(stratOrVault)}
													endChildren={renderSummaryEnd(stratOrVault)}
													{...p} />
											)}>
											<div className={'space-y-2'}>
												<AlertBox level={'critical'} alerts={stratOrVault.alerts.filter((a): unknown => a.level === 'critical')} />
												<AlertBox level={'error'} alerts={stratOrVault.alerts.filter((a): unknown => a.level === 'error')} />
												<AlertBox level={'warning'} alerts={stratOrVault.alerts.filter((a): unknown => a.level === 'warning')} />
											</div>
										</Card.Detail>
									</div>
								))}
							</Card.List>
						</div>
					)}
				</AutoSizer>
			</section>
		</>
	);
});

export default SectionAlertList;