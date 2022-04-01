import	React, {ReactElement}						from	'react';
import	useWatch, {TVault, TStrategy}				from	'contexts/useWatch';
import	{Card, SearchBox, Switch}					from	'@majorfi/web-lib/components';
import	{AlertSelector, TAlertLevels}				from	'components/AlertSelector';
import	SectionAlertList							from	'components/sections/alerts/SectionAlertList';
import	{findVaultBySearch, findStrategyBySearch}	from	'utils/filters';

function	Index(): ReactElement {
	const	{vaults} = useWatch();
	const	[filteredStrategies, set_filteredStrategies] = React.useState([] as (TStrategy | TVault)[]);
	const	[searchTerm, set_searchTerm] = React.useState('');
	const	[shouldDisplayDismissed, set_shouldDisplayDismissed] = React.useState(false);
	const	[alertFilter, set_alertFilter] = React.useState<TAlertLevels>('none');

	/* 🔵 - Yearn Finance ******************************************************
	** This effect is triggered every time the vault list or the search term is
	** changed. It filters the vault list based on the search term. This action
	** takes into account the strategies too.
	** If shouldDisplayDismissed is false then only the strategies that are not
	** dismissed are displayed.
	**************************************************************************/
	React.useEffect((): void => {
		const	_vaults = vaults;
		const	_filteredVaults = [..._vaults];
		const	_filteredStrategies = [];

		for (const vault of _filteredVaults) {
			if ((vault?.alerts || []).length > 0) {
				if (findVaultBySearch(vault, searchTerm)) {
					if (alertFilter === 'none' || vault.alerts.some((alert): boolean => alert.level === alertFilter))
						_filteredStrategies.push(vault);
				}
			}
			for (const strategy of vault.strategies) {
				if ((strategy?.alerts || []).length > 0) {
					if (findStrategyBySearch(strategy, searchTerm)) {
						if (alertFilter === 'none' || strategy.alerts.some((alert): boolean => alert.level === alertFilter))
							_filteredStrategies.push(strategy);
					}
				}
			}
		}
		set_filteredStrategies(_filteredStrategies);
	}, [vaults, searchTerm, shouldDisplayDismissed, alertFilter]);

	/* 🔵 - Yearn Finance ******************************************************
	** Main render of the page.
	**************************************************************************/
	return (
		<div className={'flex flex-col w-full h-full'}>
			<div className={'flex flex-col space-y-4 w-full h-full'}>
				<div className={'flex flex-col-reverse space-x-0 md:flex-row md:space-x-4'}>
					<div className={'flex flex-col mt-2 w-full md:mt-0'}>
						<SearchBox searchTerm={searchTerm} set_searchTerm={set_searchTerm} />
					</div>
					<div>
						<Card isNarrow>
							<label className={'flex flex-row justify-between p-2 space-x-6 w-full cursor-pointer md:p-0 md:w-max'}>
								<p className={'text-typo-secondary'}>{'Dismissed'}</p>
								<Switch isEnabled={shouldDisplayDismissed} set_isEnabled={set_shouldDisplayDismissed} />
							</label>
						</Card>
					</div>
					<div>
						<AlertSelector
							selectedLevel={alertFilter}
							onSelect={(s): void => set_alertFilter((c): TAlertLevels => c === s ? 'none' : s)} />
					</div>
				</div>
				<div className={'flex flex-col w-full h-full'}>
					<SectionAlertList
						shouldDisplayDismissed={shouldDisplayDismissed}
						stratOrVault={filteredStrategies} />
				</div>
			</div>
		</div>
	);
}

export default Index;
