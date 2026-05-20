# /interface.php?func=get_config

## response example

```xml
<config>
    <speed>{World Speed}</speed>
    <unit_speed>{Unit Speed}</unit_speed>
    <moral>{Moral Enabled}</moral>

    <premium>
        <free_Premium>{Free Premium Enabled}</free_Premium>
        <free_Premium_intervals>{Village Levels for Free Premium}</free_Premium_intervals>
        <AccountManager>{Account Manager Enabled}</AccountManager>
        <AccountManager_Premium_needed>{Premium Required for Account Manager}</AccountManager_Premium_needed>
        <ItemNameColor>{Colored Item Names Enabled}</ItemNameColor>
        <free_AccountManager>{Free Account Manager Enabled}</free_AccountManager>
        <free_AccountManager_intervals>{Village Levels for Free Account Manager}</free_AccountManager_intervals>
        <BuildTimeReduction>{Build Time Reduction Enabled}</BuildTimeReduction>
        <BuildTimeReduction_percentage>{Build Time Reduction Percentage}</BuildTimeReduction_percentage>
        <BuildInstant>{Instant Build Enabled}</BuildInstant>
        <BuildInstant_free>{Free Instant Build Enabled}</BuildInstant_free>
        <BuildCostReduction>{Build Cost Reduction Enabled}</BuildCostReduction>
        <FarmAssistent>{Farm Assistant Enabled}</FarmAssistent>
        <MerchantBonus>{Merchant Bonus Enabled}</MerchantBonus>
        <ProductionBonus>{Production Bonus Enabled}</ProductionBonus>
        <NoblemanSlot>{Additional Nobleman Slots}</NoblemanSlot>
        <MerchantExchange>{Merchant Exchange Enabled}</MerchantExchange>
        <MerchantExchange_ratio>{Merchant Exchange Ratio}</MerchantExchange_ratio>
        <PremiumExchange>{Premium Exchange Enabled}</PremiumExchange>
        <KnightBookImprove>{Knight Book Improve Enabled}</KnightBookImprove>
        <KnightBookDowngrade>{Knight Book Downgrade Enabled}</KnightBookDowngrade>
        <KnightBookReroll>{Knight Book Reroll Enabled}</KnightBookReroll>
        <KnightRespec>{Knight Respec Enabled}</KnightRespec>
        <KnightRecruitTime>{Knight Recruit Time Reduction Enabled}</KnightRecruitTime>
        <KnightRecruitInstant>{Instant Knight Recruit Enabled}</KnightRecruitInstant>
        <KnightReviveTime>{Knight Revive Time Reduction Enabled}</KnightReviveTime>
        <KnightReviveInstant>{Instant Knight Revive Enabled}</KnightReviveInstant>
        <KnightTrainingCost>{Knight Training Cost Reduction Enabled}</KnightTrainingCost>
        <KnightTrainingTime>{Knight Training Time Reduction Enabled}</KnightTrainingTime>
        <KnightTrainingInstant>{Instant Knight Training Enabled}</KnightTrainingInstant>
        <DailyBonusUnlock>{Daily Bonus Unlock Enabled}</DailyBonusUnlock>
        <ScavengingSquadLoot>{Scavenging Squad Loot Bonus Enabled}</ScavengingSquadLoot>
        <PremiumEventFeatures>{Premium Event Features Enabled}</PremiumEventFeatures>
        <PremiumRelicFeatures>{Premium Relic Features Enabled}</PremiumRelicFeatures>
        <VillageSkin>{Village Skins Enabled}</VillageSkin>
    </premium>

    <awards>
        <available>{Awards Enabled}</available>
        <milestones_available>{Award Milestones Enabled}</milestones_available>
        <AwardDailyKillsAttacker_lead_time>{Daily Attacker Kills Lead Time}</AwardDailyKillsAttacker_lead_time>
        <AwardDailyKillsDefender_lead_time>{Daily Defender Kills Lead Time}</AwardDailyKillsDefender_lead_time>
        <AwardDailyKillsSupporter_lead_time>{Daily Supporter Kills Lead Time}</AwardDailyKillsSupporter_lead_time>
        <AwardDailyLootResources_lead_time>{Daily Loot Resources Lead Time}</AwardDailyLootResources_lead_time>
        <AwardDailyScavengeResources_lead_time>{Daily Scavenge Resources Lead Time}</AwardDailyScavengeResources_lead_time>
        <AwardDailyLootVillages_lead_time>{Daily Loot Villages Lead Time}</AwardDailyLootVillages_lead_time>
        <AwardDailyVillageCount_lead_time>{Daily Village Count Lead Time}</AwardDailyVillageCount_lead_time>
        <AwardHighscoreCont_lead_time>{Continent Highscore Lead Time}</AwardHighscoreCont_lead_time>
        <AwardHighscoreGlobal_lead_time>{Global Highscore Lead Time}</AwardHighscoreGlobal_lead_time>
    </awards>

    <build>
        <destroy>{Building Destruction Enabled}</destroy>
    </build>

    <misc>
        <kill_ranking>{Kill Ranking Type}</kill_ranking>
        <tutorial>{Tutorial Step}</tutorial>
        <trade_cancel_time>{Trade Cancel Time in Seconds}</trade_cancel_time>
    </misc>

    <commands>
        <millis_arrival>{Show Millisecond Arrival}</millis_arrival>
        <attack_gap>{Attack Gap in Milliseconds}</attack_gap>
        <support_gap>{Support Gap in Milliseconds}</support_gap>
        <command_cancel_time>{Command Cancel Time in Seconds}</command_cancel_time>
    </commands>

    <newbie>
        <days>{Beginner Protection Days}</days>
        <ratio_days>{Beginner Protection Ratio Days}</ratio_days>
        <ratio>{Beginner Protection Ratio}</ratio>
        <removeNewbieVillages>{Remove Beginner Protection from Barbarian Villages}</removeNewbieVillages>
    </newbie>

    <game>
        <buildtime_formula>{Build Time Formula}</buildtime_formula>
        <knight>{Knight System Type}</knight>
        <knight_new_items>{Knight New Items Enabled}</knight_new_items>
        <knight_archer_bonus>{Knight Archer Bonus}</knight_archer_bonus>
        <archer>{Archers Enabled}</archer>
        <tech>{Research System Type}</tech>
        <farm_limit>{Farm Limit}</farm_limit>
        <church>{Church Enabled}</church>
        <watchtower>{Watchtower Enabled}</watchtower>
        <stronghold>{Stronghold Enabled}</stronghold>
        <fake_limit>{Fake Limit Percentage}</fake_limit>
        <barbarian_rise>{Barbarian Village Growth Rate}</barbarian_rise>
        <barbarian_shrink>{Barbarian Village Shrink Rate}</barbarian_shrink>
        <barbarian_max_points>{Maximum Barbarian Village Points}</barbarian_max_points>
        <scavenging>{Scavenging Enabled}</scavenging>
        <hauls>{Haul System Enabled}</hauls>
        <hauls_base>{Base Haul Capacity}</hauls_base>
        <hauls_max>{Maximum Haul Capacity}</hauls_max>
        <base_production>{Base Resource Production}</base_production>
        <event>{Active Event ID}</event>
        <suppress_events>{Suppressed Events}</suppress_events>
        <relics>{Relics Enabled}</relics>
    </game>

    <buildings>
        <custom_main>{Custom Main Building Configuration}</custom_main>
        <custom_farm>{Custom Farm Configuration}</custom_farm>
        <custom_storage>{Custom Storage Configuration}</custom_storage>
        <custom_place>{Custom Rally Point Configuration}</custom_place>
        <custom_barracks>{Custom Barracks Configuration}</custom_barracks>
        <custom_church>{Custom Church Configuration}</custom_church>
        <custom_smith>{Custom Smithy Configuration}</custom_smith>
        <custom_wood>{Custom Timber Camp Configuration}</custom_wood>
        <custom_stone>{Custom Clay Pit Configuration}</custom_stone>
        <custom_iron>{Custom Iron Mine Configuration}</custom_iron>
        <custom_market>{Custom Market Configuration}</custom_market>
        <custom_stable>{Custom Stable Configuration}</custom_stable>
        <custom_wall>{Custom Wall Configuration}</custom_wall>
        <custom_garage>{Custom Workshop Configuration}</custom_garage>
        <custom_hide>{Custom Hiding Place Configuration}</custom_hide>
        <custom_snob>{Custom Academy Configuration}</custom_snob>
        <custom_statue>{Custom Statue Configuration}</custom_statue>
        <custom_watchtower>{Custom Watchtower Configuration}</custom_watchtower>
    </buildings>

    <snob>
        <gold>{Coins Require Gold}</gold>
        <auto_minting>{Automatic Coin Minting Enabled}</auto_minting>
        <cheap_rebuild>{Cheap Rebuild Enabled}</cheap_rebuild>
        <rise>{Coin Cost Increase Factor}</rise>
        <max_dist>{Maximum Noble Distance}</max_dist>
        <factor>{Noble Conquest Factor}</factor>
        <coin_wood>{Coin Wood Cost}</coin_wood>
        <coin_stone>{Coin Clay Cost}</coin_stone>
        <coin_iron>{Coin Iron Cost}</coin_iron>
        <no_barb_conquer>{Cannot Conquer Barbarian Villages}</no_barb_conquer>
    </snob>

    <ally>
        <no_harm>{No Friendly Fire}</no_harm>
        <no_other_support>{Restrict External Support}</no_other_support>
        <no_other_support_type>{External Support Restriction Type}</no_other_support_type>
        <allytime_support>{Alliance Support Time Restriction}</allytime_support>
        <allytime_support_type>{Alliance Support Time Restriction Type}</allytime_support_type>
        <no_leave>{Leaving Alliance Disabled}</no_leave>
        <no_join>{Joining Alliance Disabled}</no_join>
        <limit>{Maximum Alliance Members}</limit>
        <fixed_allies>{Fixed Alliances Enabled}</fixed_allies>
        <fixed_allies_randomized>{Randomized Fixed Alliances}</fixed_allies_randomized>
        <wars_member_requirement>{Minimum Members for War}</wars_member_requirement>
        <wars_points_requirement>{Minimum Points for War}</wars_points_requirement>
        <wars_autoaccept_days>{War Auto Accept Days}</wars_autoaccept_days>
        <auto_lock_tribes>{Automatic Tribe Lock Enabled}</auto_lock_tribes>
        <auto_lock_dominance_percentage>{Dominance Percentage for Tribe Lock}</auto_lock_dominance_percentage>
        <auto_lock_days>{Days Until Tribe Lock}</auto_lock_days>
        <auto_lock_time_warning_sent>{Time Warning Sent}</auto_lock_time_warning_sent>
        <auto_lock_dominance_warning_sent>{Dominance Warning Sent}</auto_lock_dominance_warning_sent>
        <levels>{Alliance Levels Enabled}</levels>
        <xp_requirements>{Alliance XP Requirement Version}</xp_requirements>
    </ally>

    <coord>
        <map_size>{Map Size}</map_size>
        <func>{Coordinate Encoding Function}</func>
        <empty_villages>{Empty Villages per Player}</empty_villages>
        <bonus_villages>{Bonus Villages per Player}</bonus_villages>
        <inner>{Inner Map Radius}</inner>
        <select_start>{Select Starting Village Enabled}</select_start>
        <village_move_wait>{Village Move Wait Time in Hours}</village_move_wait>
        <noble_restart>{Noble Restart Enabled}</noble_restart>
        <start_villages>{Starting Villages}</start_villages>
    </coord>

    <sitter>
        <allow>{Sitter Mode Enabled}</allow>
        <illegal_time>{Illegal Sitting Time in Hours}</illegal_time>
        <max_sitting>{Maximum Simultaneous Sitters}</max_sitting>
    </sitter>

    <sleep>
        <active>{Sleep Mode Enabled}</active>
        <delay>{Sleep Mode Delay in Minutes}</delay>
        <min>{Minimum Sleep Hours}</min>
        <max>{Maximum Sleep Hours}</max>
        <min_awake>{Minimum Awake Hours}</min_awake>
        <max_awake>{Maximum Awake Hours}</max_awake>
        <warn_time>{Sleep Warning Time in Minutes}</warn_time>
    </sleep>

    <night>
        <active>{Night Bonus Enabled}</active>
        <start_hour>{Night Bonus Start Hour}</start_hour>
        <end_hour>{Night Bonus End Hour}</end_hour>
        <def_factor>{Night Bonus Defense Factor}</def_factor>
        <duration>{Night Bonus Duration in Days}</duration>
    </night>

    <mood>
        <loss_max>{Maximum Mood Loss}</loss_max>
        <loss_min>{Minimum Mood Loss}</loss_min>
        <load>{Mood System Enabled}</load>
    </mood>

    <win>
        <check>{Victory Condition Check Type}</check>
        <give_prizes>{Give Victory Prizes}</give_prizes>
    </win>

    <points_villages_win>
        <points>{Required Points to Win}</points>
        <villages>{Required Villages to Win}</villages>
        <hours>{Required Holding Time in Hours}</hours>
    </points_villages_win>

    <dominance_win>
        <status>{Dominance Victory Enabled}</status>
        <domination_warning>{Domination Warning Percentage}</domination_warning>
        <world_age_warning>{World Age Warning in Days}</world_age_warning>
        <domination_endgame>{Domination Percentage for Endgame}</domination_endgame>
        <world_age_endgame>{Minimum World Age for Endgame}</world_age_endgame>
        <holding_period_days>{Holding Period in Days}</holding_period_days>
        <domination_reached_at>{Timestamp Domination Reached}</domination_reached_at>
        <victory_reached_at>{Timestamp Victory Reached}</victory_reached_at>
    </dominance_win>

    <runes_win>
        <spawning_delay>{Rune Spawn Delay in Days}</spawning_delay>
        <spawn_villages_per_continent>{Villages per Continent for Rune Spawn}</spawn_villages_per_continent>
        <win_percentage>{Required Rune Percentage}</win_percentage>
        <hold_time>{Rune Hold Time in Days}</hold_time>
        <disable_morale>{Disable Morale During Rune Endgame}</disable_morale>
    </runes_win>

    <siege_win>
        <villages>{Required Villages for Siege Victory}</villages>
        <required_points>{Required Points for Siege Victory}</required_points>
        <check_days>{Check Period in Days}</check_days>
        <minimum_world_age>{Minimum World Age in Days}</minimum_world_age>
        <reduction_percentage>{Required Percentage Reduction per Check}</reduction_percentage>
        <reduction_max_percentage>{Maximum Reduction Percentage}</reduction_max_percentage>
        <disable_morale>{Disable Morale During Siege Endgame}</disable_morale>
    </siege_win>

    <casual>
        <transfer_to>{Transfer Destination World}</transfer_to>
        <attack_block>{Attack Block Enabled}</attack_block>
        <attack_block_max>{Maximum Attack Block Ratio}</attack_block_max>
        <block_noble>{Noble Attacks Blocked}</block_noble>
        <disabled_restart_deadline>{Restart Deadline in Hours}</disabled_restart_deadline>
        <automation_version>{Automation Version}</automation_version>
        <automation_start_after>{Automation Starts After}</automation_start_after>
        <automation_change_interval>{Automation Change Interval}</automation_change_interval>
        <limit_inventory_transfer>{Limit Inventory Transfer}</limit_inventory_transfer>
    </casual>
</config>
```

# /interface.php?func=get_unit_info

## response example

```xml
<config>
    <spear>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </spear>

    <sword>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </sword>

    <axe>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </axe>

    <archer>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </archer>

    <spy>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </spy>

    <light>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </light>

    <marcher>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </marcher>

    <heavy>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </heavy>

    <ram>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </ram>

    <catapult>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </catapult>

    <knight>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </knight>

    <snob>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </snob>

    <militia>
        <build_time>{Build Time in Seconds}</build_time>
        <pop>{Population Cost}</pop>
        <speed>{Movement Speed}</speed>
        <attack>{Attack Strength}</attack>
        <defense>{Infantry Defense}</defense>
        <defense_cavalry>{Cavalry Defense}</defense_cavalry>
        <defense_archer>{Archer Defense}</defense_archer>
        <carry>{Resource Carry Capacity}</carry>
    </militia>
</config>
```

# /interface.php?func=get_building_info

## response example

```xml
<config>
    <main>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </main>

    <barracks>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </barracks>

    <stable>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </stable>

    <garage>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </garage>

    <church>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </church>

    <church_f>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </church_f>

    <watchtower>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </watchtower>

    <snob>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </snob>

    <smith>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </smith>

    <place>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </place>

    <statue>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </statue>

    <market>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </market>

    <wood>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </wood>

    <stone>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </stone>

    <iron>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </iron>

    <farm>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </farm>

    <storage>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </storage>

    <hide>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </hide>

    <wall>
        <max_level>{Maximum Building Level}</max_level>
        <min_level>{Minimum Building Level}</min_level>
        <wood>{Base Wood Cost}</wood>
        <stone>{Base Clay Cost}</stone>
        <iron>{Base Iron Cost}</iron>
        <pop>{Base Population Cost}</pop>
        <wood_factor>{Wood Cost Growth Factor}</wood_factor>
        <stone_factor>{Clay Cost Growth Factor}</stone_factor>
        <iron_factor>{Iron Cost Growth Factor}</iron_factor>
        <pop_factor>{Population Growth Factor}</pop_factor>
        <build_time>{Base Build Time in Seconds}</build_time>
        <build_time_factor>{Build Time Growth Factor}</build_time_factor>
    </wall>
</config>
```

# /interface.php?func=get_conquer&since=<timestamp>

Retorna uma lista de conquistas desde o timestamp fornecido.

## Formato de cada linha

Cada registro possui 4 campos separados por vírgula:

village_id,timestamp,new_owner_id,old_owner_id

### Descrição dos campos

| Campo        | Descrição                                  |
| ------------ | ------------------------------------------ |
| village_id   | ID da aldeia conquistada                   |
| timestamp    | Momento da conquista em Unix Timestamp     |
| new_owner_id | ID do novo proprietário                    |
| old_owner_id | ID do antigo proprietário                  |
| 0            | Indica que não havia dono (aldeia bárbara) |

# /map/village.txt

Retorna um mapa de aldeias em formato de texto.

## Formato de cada linha

Cada linha possui 7 campos separados por vírgula:

village_id,name,x,y,player_id,points,bonus_id

### Descrição dos campos

| Campo      | Descrição                               |
| ---------- | --------------------------------------- |
| village_id | ID único da aldeia                      |
| name       | Nome da aldeia (URL encoded)            |
| x          | Coordenada X                            |
| y          | Coordenada Y                            |
| player_id  | ID do dono da aldeia (0 = bárbara)      |
| points     | Pontuação da aldeia                     |
| bonus_id   | Tipo de bônus da aldeia (0 = sem bônus) |

#### Significado do bonus_id

| bonus_id | Tipo de bônus                     |
| -------- | --------------------------------- |
| 0        | Sem bônus                         |
| 1        | Produção de madeira               |
| 2        | Produção de argila                |
| 3        | Produção de ferro                 |
| 4        | Maior capacidade de armazenamento |
| 5        | Maior população                   |
| 6        | Treinamento mais rápido           |
| 7        | Comércio mais eficiente           |
| 8        | Maior defesa                      |

_A tabela pode variar conforme a versão do mundo._

# /map/player.txt

Contém informações de todos os jogadores do mundo.

## Formato de cada linha

Cada registro possui 6 campos separados por vírgula:

player_id,name,tribe_id,villages,points,rank

### Descrição dos campos

| Campo     | Descrição                             |
| --------- | ------------------------------------- |
| player_id | ID do jogador                         |
| name      | Nome do jogador (URL encoded)         |
| tribe_id  | ID da tribo do jogador                |
| villages  | Quantidade de aldeias do jogador      |
| points    | Pontuação total do jogador            |
| rank      | Posição do jogador no ranking mundial |

# /map/ally.txt

Contém informações de todas as tribos do mundo.

## Formato de cada linha

Cada registro possui 8 campos separados por vírgula:

ally_id,name,tag,members,villages,points,all_points,rank

### Descrição dos campos

| Campo      | Descrição                            |
| ---------- | ------------------------------------ |
| ally_id    | ID único da tribo                    |
| name       | Nome completo da tribo (URL encoded) |
| tag        | Tag da tribo (URL encoded)           |
| members    | Quantidade de membros da tribo       |
| villages   | Quantidade de aldeias da tribo       |
| points     | Pontuação total da tribo             |
| all_points | Pontuação total histórica da tribo   |
| rank       | Posição da tribo no ranking mundial  |

# map/conquer_extended.txt
