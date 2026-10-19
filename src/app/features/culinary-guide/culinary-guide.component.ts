import { Component } from '@angular/core';
import { CulinaryDiscoveryPanelComponent } from './culinary-discovery-panel/culinary-discovery-panel.component';
import { StreamingCulinaryDiscoveryWithMetadata } from '@/core/culinary-guide';

@Component({
  selector: 'app-culinary-guide',
  imports: [CulinaryDiscoveryPanelComponent],
  styleUrl: './culinary-guide.component.css',
  templateUrl: './culinary-guide.component.html',
})
export default class CulinaryGuideComponent {
  data: StreamingCulinaryDiscoveryWithMetadata = {
    foods: [
      {
        name: 'name 1',
        nativeName: 'native name 1',
        description: 'description 1',
      },
    ],
    honorableMentions: ['hm 1', 'hm 2'],
    thoughtSummary: 'hello',
    displaySource: 'Gemini Nano',
    source: 'on_device',
    tokenSummary: {
      totalTokenCount: 100,
      promptTokenCount: 20,
      thoughtsTokenCount: 0,
      cachedContentTokenCount: 0,
      outputTokenCount: 80,
    },
    tokenModalityBreakdown: {
      promptTokensDetails: [],
      outputTokensDetails: [],
      cacheTokensDetails: [],
    },
  };
}
