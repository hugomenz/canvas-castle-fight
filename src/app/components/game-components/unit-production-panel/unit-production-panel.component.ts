import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { UnitService } from '../../../core/services/unit.service';
import { GameService } from '../../../core/services/game.service';
import { UnitType } from '../../../core/models/unit.models';

@Component({
  selector: 'app-unit-production-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unit-production-panel.component.html',
  styleUrl: './unit-production-panel.component.scss'
})
export class UnitProductionPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  unitTypes: UnitType[] = [];
  productionQueue: any[] = [];
  resources: any = {};

  constructor(
    private unitService: UnitService,
    private gameService: GameService
  ) {}

  ngOnInit() {
    this.unitTypes = this.unitService.unitTypes;

    this.unitService.productionQueue$
      .pipe(takeUntil(this.destroy$))
      .subscribe(queue => {
        this.productionQueue = queue;
      });

    this.gameService.resources$
      .pipe(takeUntil(this.destroy$))
      .subscribe(resources => {
        this.resources = resources;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canAfford(unitType: UnitType): boolean {
    return this.resources.wood >= unitType.cost.wood &&
           this.resources.food >= unitType.cost.food &&
           this.resources.gold >= unitType.cost.gold;
  }

  produceUnit(unitType: string) {
    const unitTypeData = this.unitService.getUnitType(unitType);
    if (!unitTypeData || !this.canAfford(unitTypeData)) return;

    // Spend resources
    this.gameService.spendResources(unitTypeData.cost);
    
    // Add to production queue
    this.unitService.produceUnit('default_building', unitType);
  }

  getProductionProgress(item: any): number {
    const unitType = this.unitService.getUnitType(item.unitType);
    if (!unitType) return 0;
    
    return ((unitType.productionTime - item.timeLeft) / unitType.productionTime) * 100;
  }
}
