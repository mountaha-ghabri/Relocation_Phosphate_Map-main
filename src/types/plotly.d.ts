declare module 'plotly.js-dist-min' {
  namespace Plotly {
    interface Data {
      type?: string;
      lat?: number[];
      lon?: number[];
      mode?: string;
      marker?: any;
      text?: string[];
      textposition?: string;
      textfont?: any;
      customdata?: any[];
      hovertemplate?: string;
      name?: string;
      showlegend?: boolean;
      legendgroup?: string;
      legendgrouptitle?: any;
      line?: any;
    }

    interface Layout {
      title?: any;
      mapbox?: any;
      height?: number;
      width?: number;
      margin?: any;
      paper_bgcolor?: string;
      hovermode?: string;
      legend?: any;
      font?: any;
      annotations?: any[];
    }

    interface Config {
      displayModeBar?: boolean;
      displaylogo?: boolean;
      modeBarButtonsToRemove?: string[];
      scrollZoom?: boolean;
      doubleClick?: string;
      toImageButtonOptions?: any;
    }

    function newPlot(
      root: HTMLElement,
      data: Data[],
      layout: Partial<Layout>,
      config?: Partial<Config>
    ): Promise<void>;
    function purge(root: HTMLElement): void;
  }

  const Plotly: {
    newPlot: (
      root: HTMLElement,
      data: Plotly.Data[],
      layout: Partial<Plotly.Layout>,
      config?: Partial<Plotly.Config>
    ) => Promise<void>;
    purge: (root: HTMLElement) => void;
  };

  export = Plotly;
}

