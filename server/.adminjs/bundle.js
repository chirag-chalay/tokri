(function (React, adminjs, designSystem, reactRouter) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  function useAnchoredMenu$1(open) {
    const wrapRef = React.useRef(null);
    const [openUp, setOpenUp] = React.useState(false);
    React.useEffect(() => {
      if (!open) return undefined;
      const update = () => {
        const node = wrapRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUp(spaceBelow < 240 && rect.top > spaceBelow);
      };
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      };
    }, [open]);
    return {
      wrapRef,
      openUp
    };
  }
  function SearchableMultiSelect$1({
    options,
    selected,
    onChange,
    placeholder,
    searchPlaceholder
  }) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const {
      wrapRef,
      openUp
    } = useAnchoredMenu$1(open);
    React.useEffect(() => {
      const onDocClick = event => {
        if (!wrapRef.current?.contains(event.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, [wrapRef]);
    const selectedSet = React.useMemo(() => new Set(selected), [selected]);
    const selectedOptions = options.filter(item => selectedSet.has(item.value));
    const filtered = options.filter(item => `${item.label} ${item.value}`.toLowerCase().includes(query.trim().toLowerCase()));
    const toggle = value => {
      if (selectedSet.has(value)) onChange(selected.filter(item => item !== value));else onChange([...selected, value]);
    };
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect",
      ref: wrapRef
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-multiselect-control",
      onClick: () => setOpen(value => !value)
    }, selectedOptions.length ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-multiselect-chips"
    }, selectedOptions.map(item => /*#__PURE__*/React__default.default.createElement("span", {
      key: item.value,
      className: "tokri-multiselect-chip"
    }, item.label, /*#__PURE__*/React__default.default.createElement("span", {
      role: "button",
      tabIndex: 0,
      onClick: event => {
        event.stopPropagation();
        toggle(item.value);
      }
    }, "\xD7")))) : /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-multiselect-placeholder"
    }, placeholder), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-multiselect-caret"
    }, open ? '▴' : '▾')), open ? /*#__PURE__*/React__default.default.createElement("div", {
      className: `tokri-multiselect-menu${openUp ? ' is-up' : ''}`
    }, /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: query,
      onChange: event => setQuery(event.target.value),
      placeholder: searchPlaceholder,
      autoFocus: true
    }), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect-list"
    }, filtered.length ? filtered.map(item => {
      const checked = selectedSet.has(item.value);
      return /*#__PURE__*/React__default.default.createElement("label", {
        key: item.value,
        className: `tokri-multiselect-option${checked ? ' is-selected' : ''}`
      }, /*#__PURE__*/React__default.default.createElement("input", {
        type: "checkbox",
        checked: checked,
        onChange: () => toggle(item.value)
      }), /*#__PURE__*/React__default.default.createElement("span", null, item.label));
    }) : /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect-empty"
    }, "No matches"))) : null);
  }
  function FlagCard({
    selected,
    title,
    hint,
    onClick
  }) {
    return /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: `tokri-choice-card${selected ? ' is-selected' : ''}`,
      onClick: onClick
    }, /*#__PURE__*/React__default.default.createElement("strong", null, title), /*#__PURE__*/React__default.default.createElement("span", null, hint));
  }
  function isFlagOn(value) {
    return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
  }
  function StatusSwitch({
    checked,
    onChange,
    disabled,
    title,
    hint,
    compact = false,
    onLabel = 'Active',
    offLabel = 'Inactive'
  }) {
    return /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: `tokri-switch${checked ? ' is-on' : ''}${compact ? ' is-compact' : ''}`,
      disabled: disabled,
      "aria-pressed": checked,
      onClick: event => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) onChange(!checked);
      }
    }, /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-switch-track",
      "aria-hidden": "true"
    }, /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-switch-thumb"
    })), title || hint ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-switch-copy"
    }, title ? /*#__PURE__*/React__default.default.createElement("strong", null, title) : null, hint ? /*#__PURE__*/React__default.default.createElement("span", null, hint) : null) : /*#__PURE__*/React__default.default.createElement("span", {
      className: `tokri-status-pill${checked ? ' is-on' : ''}`
    }, checked ? onLabel : offLabel));
  }
  function SearchableSelect({
    value,
    options,
    onChange,
    placeholder,
    searchPlaceholder,
    disabled
  }) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const {
      wrapRef,
      openUp
    } = useAnchoredMenu$1(open);
    const justPicked = React.useRef(false);
    const selected = options.find(item => item.value === value);
    React.useEffect(() => {
      const onDocClick = event => {
        if (!wrapRef.current?.contains(event.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, [wrapRef]);
    const filtered = options.filter(item => `${item.label} ${item.value}`.toLowerCase().includes(query.trim().toLowerCase()));
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect",
      ref: wrapRef
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-multiselect-control",
      disabled: disabled,
      onClick: () => {
        if (justPicked.current) {
          justPicked.current = false;
          setOpen(false);
          return;
        }
        if (!disabled) setOpen(current => !current);
      }
    }, /*#__PURE__*/React__default.default.createElement("span", {
      className: selected ? '' : 'tokri-multiselect-placeholder'
    }, selected?.label || placeholder), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-multiselect-caret"
    }, open ? '▴' : '▾')), open ? /*#__PURE__*/React__default.default.createElement("div", {
      className: `tokri-multiselect-menu${openUp ? ' is-up' : ''}`
    }, /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: query,
      onChange: event => setQuery(event.target.value),
      placeholder: searchPlaceholder,
      autoFocus: true
    }), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect-list"
    }, filtered.length ? filtered.map(item => {
      const active = item.value === value;
      return /*#__PURE__*/React__default.default.createElement("button", {
        type: "button",
        key: item.value || 'empty',
        className: `tokri-multiselect-option${active ? ' is-selected' : ''}`,
        onMouseDown: event => {
          event.preventDefault();
          event.stopPropagation();
          justPicked.current = true;
          onChange(item.value);
          setOpen(false);
          setQuery('');
          window.setTimeout(() => {
            justPicked.current = false;
          }, 0);
        },
        onClick: event => {
          event.preventDefault();
          event.stopPropagation();
        }
      }, item.label);
    }) : /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect-empty"
    }, "No matches"))) : null);
  }
  function LocalSelect({
    value,
    options,
    onChange,
    disabled
  }) {
    const [open, setOpen] = React.useState(false);
    const {
      wrapRef,
      openUp
    } = useAnchoredMenu$1(open);
    const selected = options.find(item => String(item.value) === String(value));
    React.useEffect(() => {
      const onDocClick = event => {
        if (!wrapRef.current?.contains(event.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, [wrapRef]);
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-local-select",
      ref: wrapRef
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-local-select-control",
      disabled: disabled,
      onClick: () => {
        if (!disabled) setOpen(current => !current);
      }
    }, /*#__PURE__*/React__default.default.createElement("span", null, selected?.label || value), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-multiselect-caret"
    }, open ? '▴' : '▾')), open ? /*#__PURE__*/React__default.default.createElement("div", {
      className: `tokri-local-select-menu${openUp ? ' is-up' : ''}`
    }, options.map(item => /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      key: item.value,
      className: `tokri-multiselect-option${String(item.value) === String(value) ? ' is-selected' : ''}`,
      onClick: () => {
        onChange(item.value);
        setOpen(false);
      }
    }, item.label))) : null);
  }

  const api$4 = new adminjs.ApiClient();
  const RANGES = [{
    value: '7d',
    label: '7 days'
  }, {
    value: 'thisMonth',
    label: 'This month'
  }, {
    value: 'lastMonth',
    label: 'Last month'
  }, {
    value: '90d',
    label: '3 months'
  }];
  const WIDGETS = ['orderValue', 'orders', 'customers', 'products'];
  const inr = value => `₹${Number(value || 0).toLocaleString('en-IN', {
  maximumFractionDigits: 0
})}`;
  function RangeSelect({
    value,
    onChange
  }) {
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-range-select"
    }, /*#__PURE__*/React__default.default.createElement(LocalSelect, {
      value: value,
      options: RANGES,
      onChange: onChange
    }));
  }
  function axisMax(value) {
    if (value <= 0) return 1000;
    const padded = value * 1.1;
    const magnitude = 10 ** Math.floor(Math.log10(padded));
    const normalized = padded / magnitude;
    const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return nice * magnitude;
  }
  function LineChart({
    series
  }) {
    const [hover, setHover] = React.useState(null);
    const width = 1200;
    const height = 320;
    const padLeft = 86;
    const padRight = 18;
    const padTop = 18;
    const padBottom = 36;
    const max = axisMax(Math.max(...series.map(point => point.orderValue), 0));
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;
    const baseline = padTop + plotHeight;
    const yFor = value => baseline - value / max * plotHeight;
    const step = series.length > 1 ? plotWidth / (series.length - 1) : plotWidth;
    const coords = series.map((point, index) => {
      const x = series.length === 1 ? padLeft + plotWidth / 2 : padLeft + index * step;
      return {
        x,
        y: yFor(point.orderValue),
        point
      };
    });
    const line = coords.map((item, index) => `${index ? 'L' : 'M'}${item.x},${item.y}`).join(' ');
    const area = coords.length ? `${line} L${coords[coords.length - 1].x},${baseline} L${coords[0].x},${baseline} Z` : '';
    const labelEvery = series.length > 20 ? Math.ceil(series.length / 8) : series.length > 10 ? 4 : 1;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
      value: Math.round(max * ratio),
      y: yFor(max * ratio)
    }));
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-chart-plot",
      onMouseLeave: () => setHover(null)
    }, /*#__PURE__*/React__default.default.createElement("svg", {
      viewBox: `0 0 ${width} ${height}`,
      className: "tokri-chart",
      role: "img"
    }, ticks.map(tick => /*#__PURE__*/React__default.default.createElement("g", {
      key: tick.value
    }, /*#__PURE__*/React__default.default.createElement("line", {
      x1: padLeft,
      x2: width - padRight,
      y1: tick.y,
      y2: tick.y,
      className: "tokri-chart-gridline"
    }), /*#__PURE__*/React__default.default.createElement("text", {
      x: padLeft - 10,
      y: tick.y + 4,
      textAnchor: "end",
      className: "tokri-chart-axis"
    }, inr(tick.value)))), /*#__PURE__*/React__default.default.createElement("path", {
      d: area,
      fill: "#047857",
      opacity: "0.16"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: line,
      fill: "none",
      stroke: "#047857",
      strokeWidth: "3",
      strokeLinejoin: "round",
      strokeLinecap: "round"
    }), coords.map(item => /*#__PURE__*/React__default.default.createElement("g", {
      key: item.point.date
    }, /*#__PURE__*/React__default.default.createElement("circle", {
      cx: item.x,
      cy: item.y,
      r: "14",
      fill: "transparent",
      onMouseEnter: () => setHover(item)
    }), /*#__PURE__*/React__default.default.createElement("circle", {
      cx: item.x,
      cy: item.y,
      r: "4.5",
      fill: "#fff",
      stroke: "#047857",
      strokeWidth: "2",
      pointerEvents: "none"
    }))), coords.map((item, index) => index % labelEvery === 0 ? /*#__PURE__*/React__default.default.createElement("text", {
      key: `${item.point.date}-label`,
      x: item.x,
      y: height - 8,
      textAnchor: "middle",
      className: "tokri-chart-label"
    }, item.point.label) : null)), hover ? /*#__PURE__*/React__default.default.createElement("div", {
      className: `tokri-chart-tip${hover.y < 90 ? ' is-below' : ''}`,
      style: {
        left: `${hover.x / width * 100}%`,
        top: `${hover.y / height * 100}%`
      }
    }, /*#__PURE__*/React__default.default.createElement("span", null, hover.point.label), /*#__PURE__*/React__default.default.createElement("strong", null, inr(hover.point.orderValue))) : null);
  }
  function Pager({
    page,
    pageSize,
    total,
    onChange
  }) {
    const pages = Math.max(1, Math.ceil((total || 0) / pageSize));
    if (pages <= 1) return null;
    const numbers = [];
    for (let number = 1; number <= pages; number += 1) numbers.push(number);
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-widget-pages"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-list-pagination-pages"
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      disabled: page <= 1,
      onClick: () => onChange(page - 1)
    }, "Prev"), numbers.map(number => /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      key: number,
      className: number === page ? 'is-current' : '',
      onClick: () => onChange(number)
    }, number)), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      disabled: page >= pages,
      onClick: () => onChange(page + 1)
    }, "Next")));
  }
  const Dashboard = () => {
    const requests = React.useRef({});
    const [ranges, setRanges] = React.useState({
      orderValue: '7d',
      orders: '7d',
      customers: '7d',
      products: '7d'
    });
    const [data, setData] = React.useState({});
    const [pages, setPages] = React.useState({
      orders: 1,
      customers: 1
    });
    const [busy, setBusy] = React.useState({
      orderValue: true,
      orders: true,
      customers: true,
      products: true
    });
    const loadWidget = (widget, range, page = 1) => {
      const ticket = (requests.current[widget] || 0) + 1;
      requests.current[widget] = ticket;
      setBusy(current => ({
        ...current,
        [widget]: true
      }));
      api$4.getDashboard({
        params: {
          widget,
          range,
          page
        }
      }).then(response => {
        if (requests.current[widget] !== ticket) return;
        setData(current => ({
          ...current,
          ...response.data
        }));
      }).finally(() => {
        if (requests.current[widget] !== ticket) return;
        setBusy(current => ({
          ...current,
          [widget]: false
        }));
      });
    };
    React.useEffect(() => {
      WIDGETS.forEach(widget => loadWidget(widget, '7d'));
    }, []);
    const changeRange = (widget, range) => {
      setRanges(current => ({
        ...current,
        [widget]: range
      }));
      if (widget === 'orders' || widget === 'customers') {
        setPages(current => ({
          ...current,
          [widget]: 1
        }));
      }
      loadWidget(widget, range, 1);
    };
    const changePage = (widget, page) => {
      setPages(current => ({
        ...current,
        [widget]: page
      }));
      loadWidget(widget, ranges[widget], page);
    };
    const orderValue = data.orderValue;
    const orders = data.orders;
    const customers = data.customers;
    const products = data.products;
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "transparent",
      className: "tokri-analytics"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-analytics-head"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      mb: "sm"
    }, "Dashboard")), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-chart-card tokri-chart-card-wide"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-widget-head"
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement(designSystem.H5, {
      mb: "sm"
    }, "Order Value"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      opacity: 0.7
    }, busy.orderValue && !orderValue ? 'Loading…' : `${inr(orderValue?.total)} from ${orderValue?.orderCount || 0} orders`)), /*#__PURE__*/React__default.default.createElement(RangeSelect, {
      value: ranges.orderValue,
      onChange: value => changeRange('orderValue', value)
    })), orderValue?.series?.length ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-chart-frame"
    }, /*#__PURE__*/React__default.default.createElement(LineChart, {
      series: orderValue.series
    })) : null), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-split"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-chart-card"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-widget-head"
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement(designSystem.H5, {
      mb: "sm"
    }, "Order Amount"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      opacity: 0.7
    }, busy.orders && !orders ? 'Loading…' : `${orders?.total || 0} orders`)), /*#__PURE__*/React__default.default.createElement(RangeSelect, {
      value: ranges.orders,
      onChange: value => changeRange('orders', value)
    })), orders?.rows?.length ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-table-wrap"
    }, /*#__PURE__*/React__default.default.createElement("table", {
      className: "tokri-data-table"
    }, /*#__PURE__*/React__default.default.createElement("thead", null, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", null, "Order number"), /*#__PURE__*/React__default.default.createElement("th", null, "Name"), /*#__PURE__*/React__default.default.createElement("th", null, "Amount"), /*#__PURE__*/React__default.default.createElement("th", null, "Placed"))), /*#__PURE__*/React__default.default.createElement("tbody", null, orders.rows.map(row => /*#__PURE__*/React__default.default.createElement("tr", {
      key: row.id
    }, /*#__PURE__*/React__default.default.createElement("td", null, row.orderNo), /*#__PURE__*/React__default.default.createElement("td", null, row.name), /*#__PURE__*/React__default.default.createElement("td", null, inr(row.amount)), /*#__PURE__*/React__default.default.createElement("td", null, row.placedAt)))))) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      opacity: 0.7
    }, busy.orders ? 'Loading…' : 'No orders in this period.'), /*#__PURE__*/React__default.default.createElement(Pager, {
      page: orders?.page || pages.orders,
      pageSize: orders?.pageSize || 10,
      total: orders?.total || 0,
      onChange: page => changePage('orders', page)
    })), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-chart-card"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-widget-head"
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement(designSystem.H5, {
      mb: "sm"
    }, "New Customers"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      opacity: 0.7
    }, busy.customers && !customers ? 'Loading…' : `${customers?.total || 0} people registered`)), /*#__PURE__*/React__default.default.createElement(RangeSelect, {
      value: ranges.customers,
      onChange: value => changeRange('customers', value)
    })), customers?.rows?.length ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-table-wrap"
    }, /*#__PURE__*/React__default.default.createElement("table", {
      className: "tokri-data-table"
    }, /*#__PURE__*/React__default.default.createElement("thead", null, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", null, "Name"), /*#__PURE__*/React__default.default.createElement("th", null, "Phone"), /*#__PURE__*/React__default.default.createElement("th", null, "Date of birth"), /*#__PURE__*/React__default.default.createElement("th", null, "Created"))), /*#__PURE__*/React__default.default.createElement("tbody", null, customers.rows.map(row => /*#__PURE__*/React__default.default.createElement("tr", {
      key: row.id
    }, /*#__PURE__*/React__default.default.createElement("td", null, row.name), /*#__PURE__*/React__default.default.createElement("td", null, "+91 ", row.phone), /*#__PURE__*/React__default.default.createElement("td", null, row.dateOfBirth), /*#__PURE__*/React__default.default.createElement("td", null, row.registeredAt)))))) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      opacity: 0.7
    }, busy.customers ? 'Loading…' : 'No new customers in this period.'), /*#__PURE__*/React__default.default.createElement(Pager, {
      page: customers?.page || pages.customers,
      pageSize: customers?.pageSize || 10,
      total: customers?.total || 0,
      onChange: page => changePage('customers', page)
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-split"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-chart-card"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-widget-head"
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement(designSystem.H5, {
      mb: "sm"
    }, "Best Selling Products"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      opacity: 0.7
    }, busy.products && !products ? 'Loading…' : 'Top 5 by number of orders')), /*#__PURE__*/React__default.default.createElement(RangeSelect, {
      value: ranges.products,
      onChange: value => changeRange('products', value)
    })), products?.rows?.length ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-table-wrap"
    }, /*#__PURE__*/React__default.default.createElement("table", {
      className: "tokri-data-table"
    }, /*#__PURE__*/React__default.default.createElement("thead", null, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", null, "Product"), /*#__PURE__*/React__default.default.createElement("th", null, "Orders"), /*#__PURE__*/React__default.default.createElement("th", null, "Amount"))), /*#__PURE__*/React__default.default.createElement("tbody", null, products.rows.map(row => /*#__PURE__*/React__default.default.createElement("tr", {
      key: row.name
    }, /*#__PURE__*/React__default.default.createElement("td", null, row.name), /*#__PURE__*/React__default.default.createElement("td", null, row.orders), /*#__PURE__*/React__default.default.createElement("td", null, inr(row.amount))))))) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      opacity: 0.7
    }, busy.products ? 'Loading…' : 'No products sold in this period.'))));
  };

  const normalizeSlugInput$1 = value => String(value || '').toLowerCase().trim().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const withoutTrailingSlash$6 = value => String(value || '').replace(/\/+$/, '');
  const PRODUCT_DETAILS_HTML = `<h3>Product Details</h3>
<div class="product-info">
<div class="product-info-item">
<p class="product-info-label">Health Benefits</p>
<p>Rich in Antioxidants</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Description</p>
<p>Write the fruit description here. Mention taste, how to use it, and what makes it special.</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Unit</p>
<p>125 g</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Shelf Life</p>
<p>4 days</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Taste Profile</p>
<p>Sweet</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Disclaimer</p>
<p>The image shown is for representation purposes only and may vary slightly from the actual product. Every effort is made to ensure the accuracy of all information displayed.</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Customer Care Details</p>
<p>Email: <a href="mailto:support@tokriii.com">support@tokriii.com</a></p>
</div>
<div class="product-info-item">
<p class="product-info-label">Country of Origin</p>
<p>India</p>
</div>
</div>`;
  function parseSlugs$2(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(item => String(item).trim()).filter(Boolean);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parseSlugs$2(parsed);
      } catch {
        // ignore
      }
      return raw.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  }
  const ProductEdit = props => {
    const {
      record: initialRecord,
      resource
    } = props;
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const addNotice = adminjs.useNotice();
    const fileRef = React.useRef(null);
    const [uploading, setUploading] = React.useState(false);
    const [slugEdited, setSlugEdited] = React.useState(Boolean(initialRecord?.params?.slug));
    const [previewUrl, setPreviewUrl] = React.useState('');
    const [categories, setCategories] = React.useState([]);
    const params = record?.params || {};
    const custom = resource?.options?.custom || {};
    const apiBaseUrl = withoutTrailingSlash$6(custom.apiBaseUrl || '/api/v1');
    const productUrlBase = withoutTrailingSlash$6(custom.productUrlBase || `${window.location.origin}/product`);
    const slugInput = params.slug ?? '';
    const previewSlug = normalizeSlugInput$1(slugInput) || normalizeSlugInput$1(params.name);
    const productUrl = previewSlug ? `${productUrlBase}/${previewSlug}` : null;
    const selectedCategorySlugs = parseSlugs$2(params.categoryIds);
    const isActive = params.isActive !== false && params.isActive !== 'false';
    const imageUrl = React.useMemo(() => {
      if (!params.image) return '';
      if (/^(https?:|data:|blob:)/.test(params.image)) return params.image;
      return `${withoutTrailingSlash$6(custom.appUrl || window.location.origin)}${params.image}`;
    }, [custom.appUrl, params.image]);
    const displayedImageUrl = previewUrl || imageUrl;
    React.useEffect(() => {
      return () => {
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      };
    }, [previewUrl]);
    React.useEffect(() => {
      let ignore = false;
      fetch(`${apiBaseUrl}/categories`).then(response => response.json()).then(data => {
        if (!ignore) setCategories(Array.isArray(data) ? data : []);
      }).catch(() => {
        if (!ignore) setCategories([]);
      });
      return () => {
        ignore = true;
      };
    }, [apiBaseUrl]);
    const setField = (key, value) => handleChange(key, value);
    const onPropertyChange = (propertyPath, value, ...rest) => {
      if (propertyPath === 'slug') {
        setSlugEdited(true);
        handleChange(propertyPath, normalizeSlugInput$1(value), ...rest);
        return;
      }
      handleChange(propertyPath, value, ...rest);
      if (propertyPath === 'name' && !slugEdited) {
        handleChange('slug', normalizeSlugInput$1(value));
      }
    };
    const setSelectedCategories = slugs => setField('categoryIds', JSON.stringify(slugs));
    const uploadImage = async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('folder', 'products');
      formData.append('file', file);
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);
      setUploading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/media/upload`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'Image upload failed');
        }
        const media = await response.json();
        handleChange('image', media.path);
        handleChange('mediaId', media.id);
        setPreviewUrl(/^(https?:|data:|blob:)/.test(media.path) ? media.path : `${withoutTrailingSlash$6(custom.appUrl || window.location.origin)}${media.path}`);
        addNotice({
          message: 'Image uploaded successfully',
          type: 'success'
        });
      } catch (error) {
        addNotice({
          message: error.message || 'Could not upload image',
          type: 'error'
        });
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save product',
            type: 'error'
          });
          return;
        }
        addNotice({
          message: 'Product saved',
          type: 'success'
        });
      }).catch(() => {
        addNotice({
          message: 'Could not save product',
          type: 'error'
        });
      });
    };
    const descriptionProperty = resource.editProperties.find(property => property.propertyPath === 'description');
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, params.name || 'New product'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "Add photos, prices, and one or more categories for the website and app.")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Product details"), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Name", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.name || '',
      onChange: event => onPropertyChange('name', event.target.value),
      placeholder: "Alphonso Mango",
      required: true
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Slug", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: slugInput,
      onChange: event => onPropertyChange('slug', event.target.value),
      placeholder: "auto-generated from name"
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "sm",
      opacity: 0.7
    }, "Preview:", ' ', productUrl ? /*#__PURE__*/React__default.default.createElement("a", {
      href: productUrl,
      target: "_blank",
      rel: "noreferrer"
    }, productUrl) : 'Generated from product name when saved'), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Price (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      min: "0",
      step: "0.01",
      value: params.priceValue ?? '',
      onChange: event => setField('priceValue', event.target.value),
      required: true
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Old price (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      min: "0",
      step: "0.01",
      value: params.oldPriceValue ?? '',
      onChange: event => setField('oldPriceValue', event.target.value),
      placeholder: "Optional"
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Weight", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.weight || '',
      onChange: event => setField('weight', event.target.value),
      placeholder: "1 kg"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Badge", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.badge || '',
      onChange: event => setField('badge', event.target.value),
      placeholder: "Fresh"
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Stock", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      min: "0",
      value: params.stock ?? 100,
      onChange: event => setField('stock', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Sort order", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      value: params.sortOrder ?? 0,
      onChange: event => setField('sortOrder', event.target.value)
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Tax & GST"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isFlagOn(params.isTaxable),
      title: "Taxable",
      hint: isFlagOn(params.isTaxable) ? 'GST will be charged at checkout' : 'No GST on this product',
      onLabel: "Yes",
      offLabel: "No",
      onChange: next => {
        setField('isTaxable', next);
        if (next && Number(params.gstRate || 0) === 0) setField('gstRate', 5);
        if (!next) setField('gstRate', 0);
      }
    })), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "HSN Code", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.hsnCode ?? '0808',
      onChange: event => setField('hsnCode', event.target.value),
      placeholder: "0802 or 0808"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "GST %", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      step: "0.01",
      min: "0",
      value: params.gstRate ?? 0,
      onChange: event => setField('gstRate', Number(event.target.value) || 0),
      placeholder: "5"
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Product image"), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-upload-drop"
    }, displayedImageUrl ? /*#__PURE__*/React__default.default.createElement("img", {
      src: displayedImageUrl,
      alt: params.name || 'Product preview'
    }) : /*#__PURE__*/React__default.default.createElement("span", null, "Click to upload a square product photo"), /*#__PURE__*/React__default.default.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: "image/*",
      onChange: uploadImage
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "sm",
      opacity: 0.7
    }, "JPG, PNG, GIF, or WebP up to 5MB."))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Categories"), /*#__PURE__*/React__default.default.createElement("p", null, "A product can appear in more than one category on the website and app."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Select categories", /*#__PURE__*/React__default.default.createElement(SearchableMultiSelect$1, {
      options: categories.map(item => ({
        value: item.slug,
        label: item.label
      })),
      selected: selectedCategorySlugs,
      onChange: setSelectedCategories,
      placeholder: "Search and select categories",
      searchPlaceholder: "Search categories"
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Store placement"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isActive,
      title: isActive ? 'Active' : 'Inactive',
      hint: isActive ? 'Visible to customers' : 'Hidden from the website and app',
      onChange: next => setField('isActive', next)
    })), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-choice-row"
    }, /*#__PURE__*/React__default.default.createElement(FlagCard, {
      selected: params.isBestSeller === true || params.isBestSeller === 'true',
      title: "Bestseller",
      hint: "Show in bestsellers",
      onClick: () => setField('isBestSeller', !(params.isBestSeller === true || params.isBestSeller === 'true'))
    }), /*#__PURE__*/React__default.default.createElement(FlagCard, {
      selected: params.isImported === true || params.isImported === 'true',
      title: "Imported",
      hint: "Show in imported fruits",
      onClick: () => setField('isImported', !(params.isImported === true || params.isImported === 'true'))
    }), /*#__PURE__*/React__default.default.createElement(FlagCard, {
      selected: params.isFeatured === true || params.isFeatured === 'true',
      title: "Featured",
      hint: "Highlight this fruit",
      onClick: () => setField('isFeatured', !(params.isFeatured === true || params.isFeatured === 'true'))
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Description"), /*#__PURE__*/React__default.default.createElement("p", null, "Click Insert details template, then edit the text for this fruit. Only Product Details stays bold. The rest stays normal text, like the store product page."), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "button",
      variant: "outlined",
      mb: "lg",
      onClick: () => setField('description', PRODUCT_DETAILS_HTML)
    }, "Insert details template"), descriptionProperty ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        minHeight: 220
      }
    }, /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent, {
      where: "edit",
      onChange: onPropertyChange,
      property: descriptionProperty,
      resource: resource,
      record: record
    })) : null), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading || uploading
    }, loading || uploading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, "Save product")));
  };

  const normalizeSlugInput = value => String(value || '').toLowerCase().trim().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const withoutTrailingSlash$5 = value => String(value || '').replace(/\/+$/, '');
  const CategoryEdit = props => {
    const {
      record: initialRecord,
      resource
    } = props;
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const addNotice = adminjs.useNotice();
    const fileRef = React.useRef(null);
    const bannerFileRef = React.useRef(null);
    const [uploading, setUploading] = React.useState(false);
    const [bannerUploading, setBannerUploading] = React.useState(false);
    const [slugEdited, setSlugEdited] = React.useState(Boolean(initialRecord?.params?.slug));
    const [previewUrl, setPreviewUrl] = React.useState('');
    const [bannerPreviewUrl, setBannerPreviewUrl] = React.useState('');
    const params = record?.params || {};
    const custom = resource?.options?.custom || {};
    const apiBaseUrl = withoutTrailingSlash$5(custom.apiBaseUrl || '/api/v1');
    const categoryUrlBase = withoutTrailingSlash$5(custom.categoryUrlBase || `${window.location.origin}/category`);
    const slugInput = params.slug ?? '';
    const previewSlug = normalizeSlugInput(slugInput) || normalizeSlugInput(params.label);
    const categoryUrl = previewSlug ? `${categoryUrlBase}/${previewSlug}` : null;
    const imageUrl = React.useMemo(() => {
      if (!params.image) return '';
      if (/^(https?:|data:|blob:)/.test(params.image)) return params.image;
      return `${withoutTrailingSlash$5(custom.appUrl || window.location.origin)}${params.image}`;
    }, [custom.appUrl, params.image]);
    const displayedImageUrl = previewUrl || imageUrl;
    const bannerImageUrl = React.useMemo(() => {
      if (!params.bannerImage) return '';
      if (/^(https?:|data:|blob:)/.test(params.bannerImage)) return params.bannerImage;
      return `${withoutTrailingSlash$5(custom.appUrl || window.location.origin)}${params.bannerImage}`;
    }, [custom.appUrl, params.bannerImage]);
    const displayedBannerUrl = bannerPreviewUrl || bannerImageUrl;
    React.useEffect(() => {
      return () => {
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      };
    }, [previewUrl]);
    React.useEffect(() => {
      return () => {
        if (bannerPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(bannerPreviewUrl);
      };
    }, [bannerPreviewUrl]);
    const setField = (key, value) => handleChange(key, value);
    const onPropertyChange = (propertyPath, value, ...rest) => {
      if (propertyPath === 'slug') {
        setSlugEdited(true);
        handleChange(propertyPath, normalizeSlugInput(value), ...rest);
        return;
      }
      handleChange(propertyPath, value, ...rest);
      if (propertyPath === 'label' && !slugEdited) {
        handleChange('slug', normalizeSlugInput(value));
      }
    };
    const uploadTo = async (file, field, setLocalPreview, setBusy, successMessage) => {
      const formData = new FormData();
      formData.append('folder', 'categories');
      formData.append('file', file);
      setLocalPreview(URL.createObjectURL(file));
      setBusy(true);
      try {
        const response = await fetch(`${apiBaseUrl}/media/upload`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'Image upload failed');
        }
        const media = await response.json();
        onPropertyChange(field, media.path);
        setLocalPreview(/^(https?:|data:|blob:)/.test(media.path) ? media.path : `${withoutTrailingSlash$5(custom.appUrl || window.location.origin)}${media.path}`);
        addNotice({
          message: successMessage,
          type: 'success'
        });
      } catch (error) {
        addNotice({
          message: error.message || 'Could not upload image',
          type: 'error'
        });
      } finally {
        setBusy(false);
      }
    };
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save category',
            type: 'error'
          });
          return;
        }
        addNotice({
          message: 'Category saved',
          type: 'success'
        });
      }).catch(() => {
        addNotice({
          message: 'Could not save category',
          type: 'error'
        });
      });
    };
    const descriptionProperty = resource.editProperties.find(property => property.propertyPath === 'description');
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, params.label || 'New category'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "Create a shop section with a thumbnail, banner, and page copy.")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Category details"), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Label", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.label || '',
      onChange: event => onPropertyChange('label', event.target.value),
      placeholder: "Fresh Fruits",
      required: true
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Page heading", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.title || '',
      onChange: event => setField('title', event.target.value),
      placeholder: "Same as label if empty"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Subtitle", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.subtitle || '',
      onChange: event => setField('subtitle', event.target.value),
      placeholder: "Short line under the heading"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Slug", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: slugInput,
      onChange: event => onPropertyChange('slug', event.target.value),
      placeholder: "auto-generated from label"
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "sm",
      opacity: 0.7
    }, "Preview:", ' ', categoryUrl ? /*#__PURE__*/React__default.default.createElement("a", {
      href: categoryUrl,
      target: "_blank",
      rel: "noreferrer"
    }, categoryUrl) : 'Generated from category label when saved'), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Sort order", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      value: params.sortOrder ?? 0,
      onChange: event => setField('sortOrder', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Status", /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-choice-row",
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React__default.default.createElement(FlagCard, {
      selected: params.isActive !== false && params.isActive !== 'false',
      title: "Active",
      hint: "Shown on website and app",
      onClick: () => setField('isActive', !(params.isActive !== false && params.isActive !== 'false'))
    }))))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Category image"), /*#__PURE__*/React__default.default.createElement("p", null, "Square thumbnail used in the home category grid."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-upload-drop"
    }, displayedImageUrl ? /*#__PURE__*/React__default.default.createElement("img", {
      src: displayedImageUrl,
      alt: params.label || 'Category preview'
    }) : /*#__PURE__*/React__default.default.createElement("span", null, "Click to upload category image"), /*#__PURE__*/React__default.default.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: "image/*",
      onChange: event => {
        const file = event.target.files?.[0];
        if (file) {
          uploadTo(file, 'image', setPreviewUrl, setUploading, 'Image uploaded successfully');
        }
        event.target.value = '';
      }
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Category banner"), /*#__PURE__*/React__default.default.createElement("p", null, "Wide image shown at the top of the category page."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-upload-drop tokri-upload-drop-wide"
    }, displayedBannerUrl ? /*#__PURE__*/React__default.default.createElement("img", {
      src: displayedBannerUrl,
      alt: params.label || 'Category banner'
    }) : /*#__PURE__*/React__default.default.createElement("span", null, "Click to upload a wide banner (1600\xD7400 recommended)"), /*#__PURE__*/React__default.default.createElement("input", {
      ref: bannerFileRef,
      type: "file",
      accept: "image/*",
      onChange: event => {
        const file = event.target.files?.[0];
        if (file) {
          uploadTo(file, 'bannerImage', setBannerPreviewUrl, setBannerUploading, 'Banner uploaded successfully');
        }
        event.target.value = '';
      }
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Description"), descriptionProperty ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        minHeight: 220
      }
    }, /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent, {
      where: "edit",
      onChange: onPropertyChange,
      property: descriptionProperty,
      resource: resource,
      record: record
    })) : null), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        display: 'none'
      },
      "aria-hidden": "true"
    }, resource.editProperties.filter(property => ['image', 'bannerImage'].includes(property.propertyPath)).map(property => /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent, {
      key: property.propertyPath,
      where: "edit",
      onChange: onPropertyChange,
      property: property,
      resource: resource,
      record: record
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading || uploading || bannerUploading
    }, loading || uploading || bannerUploading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, "Save category")));
  };

  const PER_PAGE_OPTIONS = [10, 25, 50];
  const CmsList = props => {
    const {
      resource,
      setTag
    } = props;
    const titleProp = resource.titleProperty?.name || resource.titleProperty?.propertyPath || 'id';
    const {
      storeParams,
      filters,
      parsedQuery
    } = adminjs.useQueryParams();
    const {
      records,
      loading,
      direction,
      sortBy,
      page,
      total,
      fetchData,
      perPage
    } = adminjs.useRecords(resource.id);
    const {
      selectedRecords,
      handleSelect,
      handleSelectAll,
      setSelectedRecords
    } = adminjs.useSelectedRecords(records);
    const [query, setQuery] = React.useState(() => String(parsedQuery?.q || filters?.[titleProp] || ''));
    const debounceRef = React.useRef(null);
    const storeParamsRef = React.useRef(storeParams);
    storeParamsRef.current = storeParams;
    React.useEffect(() => {
      setQuery(String(parsedQuery?.q || filters?.[titleProp] || ''));
      setSelectedRecords([]);
    }, [resource.id, titleProp, setSelectedRecords]);
    React.useEffect(() => {
      if (setTag) setTag(total.toString());
    }, [total, setTag]);
    const handleQueryChange = event => {
      const value = event.target.value;
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const trimmed = value.trim();
        storeParamsRef.current({
          page: '1',
          q: trimmed || undefined
        });
      }, 300);
    };
    React.useEffect(() => {
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, []);
    const handleActionPerformed = () => fetchData();
    const currentPage = Number(page) || 1;
    const rowsPerPage = Number(perPage) || 10;
    const totalRows = Number(total) || 0;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage) || 1);
    const from = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const to = Math.min(currentPage * rowsPerPage, totalRows);
    const goToPage = nextPage => {
      const safe = Math.min(Math.max(1, nextPage), totalPages);
      storeParams({
        page: String(safe),
        q: parsedQuery?.q || filters?.[titleProp] || undefined
      });
    };
    const changePerPage = next => {
      storeParams({
        page: '1',
        perPage: String(next),
        q: parsedQuery?.q || filters?.[titleProp] || undefined
      });
    };
    const pageNumbers = [];
    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    for (let number = start; number <= end; number += 1) pageNumbers.push(number);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "grey"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg",
      style: {
        position: 'relative',
        maxWidth: 420
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        position: 'absolute',
        top: '50%',
        left: 12,
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        opacity: 0.6
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Search"
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      value: query,
      onChange: handleQueryChange,
      placeholder: `Search all ${resource.name}...`,
      style: {
        width: '100%',
        paddingLeft: 36
      }
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "container"
    }, /*#__PURE__*/React__default.default.createElement(adminjs.RecordsTable, {
      resource: resource,
      records: records,
      actionPerformed: handleActionPerformed,
      onSelect: handleSelect,
      onSelectAll: handleSelectAll,
      selectedRecords: selectedRecords,
      direction: direction,
      sortBy: sortBy,
      isLoading: loading
    }), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-list-pagination"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      className: "tokri-list-pagination-summary"
    }, totalRows === 0 ? 'No records' : `Showing ${from}–${to} of ${totalRows}`), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-list-pagination-size"
    }, /*#__PURE__*/React__default.default.createElement("span", null, "Rows"), /*#__PURE__*/React__default.default.createElement(LocalSelect, {
      value: String(rowsPerPage),
      options: PER_PAGE_OPTIONS.map(option => ({
        value: String(option),
        label: String(option)
      })),
      onChange: next => changePerPage(Number(next))
    })), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-list-pagination-pages"
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      disabled: currentPage <= 1,
      onClick: () => goToPage(currentPage - 1)
    }, "Prev"), pageNumbers.map(number => /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      key: number,
      className: number === currentPage ? 'is-current' : '',
      onClick: () => goToPage(number)
    }, number)), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      disabled: currentPage >= totalPages,
      onClick: () => goToPage(currentPage + 1)
    }, "Next")))));
  };

  const withoutTrailingSlash$4 = value => String(value || '').replace(/\/+$/, '');
  function resolveImageUrl$2(path, appUrl) {
    if (!path) return '';
    if (/^(https?:|data:|blob:)/.test(path)) return path;
    return `${withoutTrailingSlash$4(appUrl || window.location.origin)}${path}`;
  }
  function FieldError$4({
    error
  }) {
    if (!error?.message) return null;
    return /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, error.message);
  }
  const ReviewEdit = props => {
    const {
      record: initialRecord,
      resource,
      action
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const fileRef = React.useRef(null);
    const [uploading, setUploading] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState('');
    const params = record?.params || {};
    const isNew = action?.name === 'new' || !record?.id;
    const custom = resource?.options?.custom || {};
    const apiBaseUrl = withoutTrailingSlash$4(custom.apiBaseUrl || '/api/v1');
    const appUrl = custom.appUrl || window.location.origin;
    const errors = React.useMemo(() => record?.errors || {}, [record?.errors]);
    const rating = Math.min(5, Math.max(1, Number(params.rating) || 5));
    const isApproved = isNew && (params.isApproved === undefined || params.isApproved === '') ? true : isFlagOn(params.isApproved);
    React.useEffect(() => {
      if (isNew && (params.isApproved === undefined || params.isApproved === '')) {
        handleChange('isApproved', true);
      }
      if (isNew && !params.rating) handleChange('rating', 5);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNew]);
    React.useEffect(() => {
      return () => {
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      };
    }, [previewUrl]);
    const imageUrl = React.useMemo(() => resolveImageUrl$2(params.image, appUrl), [appUrl, params.image]);
    const displayedImageUrl = previewUrl || imageUrl;
    const setField = (key, value) => handleChange(key, value);
    const uploadImage = async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('folder', 'reviews');
      formData.append('file', file);
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);
      setUploading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/media/upload`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'Image upload failed');
        }
        const media = await response.json();
        setField('image', media.path);
        setPreviewUrl(resolveImageUrl$2(media.path, appUrl));
        addNotice({
          message: 'Photo uploaded',
          type: 'success'
        });
      } catch (error) {
        addNotice({
          message: error.message || 'Could not upload image',
          type: 'error'
        });
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save review',
            type: 'error'
          });
          return;
        }
        addNotice({
          message: isNew ? 'Review created' : 'Review updated',
          type: 'success'
        });
      }).catch(() => {
        addNotice({
          message: 'Could not save review. Please try again.',
          type: 'error'
        });
      });
      return false;
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, isNew ? 'Add homepage review' : params.title || 'Review'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "Approved reviews appear on the website homepage. Hidden reviews stay in CMS only.")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Website visibility"), /*#__PURE__*/React__default.default.createElement("p", null, "Turn this off to hide the review without deleting it."), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isApproved,
      onLabel: "Approved",
      offLabel: "Hidden",
      title: isApproved ? 'Approved' : 'Hidden',
      hint: isApproved ? 'Visible on the homepage' : 'Hidden until you approve it',
      onChange: next => setField('isApproved', next)
    })), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Rating"), /*#__PURE__*/React__default.default.createElement("p", null, "Shown as stars on the homepage review card."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Stars", /*#__PURE__*/React__default.default.createElement(LocalSelect, {
      value: rating,
      options: [5, 4, 3, 2, 1].map(value => ({
        value,
        label: `${value} star${value === 1 ? '' : 's'}`
      })),
      onChange: next => setField('rating', Number(next))
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Review text"), /*#__PURE__*/React__default.default.createElement("p", null, "Keep it short. This is what customers read on the homepage."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Title", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      value: params.title || '',
      onChange: event => setField('title', event.target.value),
      placeholder: "Super fresh fruits"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$4, {
      error: errors.title
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Reviewer name", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      value: params.name || '',
      onChange: event => setField('name', event.target.value),
      placeholder: "Priya Sharma"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$4, {
      error: errors.name
    }))), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Review", /*#__PURE__*/React__default.default.createElement("textarea", {
      className: "tokri-coupon-input",
      rows: 4,
      required: true,
      value: params.content || '',
      onChange: event => setField('content', event.target.value),
      placeholder: "Always fresh and delivered right on time."
    }), /*#__PURE__*/React__default.default.createElement(FieldError$4, {
      error: errors.content
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Reviewer photo"), /*#__PURE__*/React__default.default.createElement("p", null, "Optional. If empty, the website shows initials instead."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Photo", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-upload-drop tokri-upload-drop-round"
    }, displayedImageUrl ? /*#__PURE__*/React__default.default.createElement("img", {
      src: displayedImageUrl,
      alt: params.name || 'Reviewer'
    }) : /*#__PURE__*/React__default.default.createElement("span", null, uploading ? 'Uploading…' : 'Click to upload a photo'), /*#__PURE__*/React__default.default.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: "image/*",
      onChange: uploadImage
    })), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "JPG, PNG, GIF, or WebP up to 5MB"))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading || uploading
    }, loading || uploading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, isNew ? 'Create review' : 'Save review')));
  };

  const withoutTrailingSlash$3 = value => String(value || '').replace(/\/+$/, '');
  const EDITOR_OPTIONS = {
    plugins: ['link', 'lists', 'image', 'autolink', 'code', 'wordcount'],
    toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | link image | removeformat',
    height: 420
  };
  function resolveImageUrl$1(path, appUrl) {
    if (!path) return '';
    if (/^(https?:|data:|blob:)/.test(path)) return path;
    return `${withoutTrailingSlash$3(appUrl || window.location.origin)}${path}`;
  }
  function dateInputValue(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  function pad$2(value) {
    return String(value).padStart(2, '0');
  }
  function parseDateValue(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  function toDateValue(date) {
    return `${date.getFullYear()}-${pad$2(date.getMonth() + 1)}-${pad$2(date.getDate())}`;
  }
  function DateField({
    value,
    onChange
  }) {
    const selected = parseDateValue(value);
    const [open, setOpen] = React.useState(false);
    const [monthDate, setMonthDate] = React.useState(selected || new Date());
    const wrapRef = React.useRef(null);
    const [openUp, setOpenUp] = React.useState(false);
    React.useEffect(() => {
      if (!open) return undefined;
      const update = () => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUp(spaceBelow < 320 && rect.top > spaceBelow);
      };
      update();
      const onDocClick = event => {
        if (!wrapRef.current?.contains(event.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => {
        document.removeEventListener('mousedown', onDocClick);
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      };
    }, [open]);
    React.useEffect(() => {
      if (selected) setMonthDate(selected);
    }, [value]);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let index = 0; index < firstDay; index += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) cells.push(day);
    const selectedDay = selected && selected.getFullYear() === year && selected.getMonth() === month ? selected.getDate() : null;
    const choose = day => {
      onChange(toDateValue(new Date(year, month, day)));
      setOpen(false);
    };
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker",
      ref: wrapRef
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-datepicker-control",
      onClick: () => setOpen(current => !current)
    }, /*#__PURE__*/React__default.default.createElement("span", null, selected ? selected.toLocaleDateString('en-GB') : 'Select a date'), /*#__PURE__*/React__default.default.createElement("span", {
      "aria-hidden": "true"
    }, "\uD83D\uDCC5")), open ? /*#__PURE__*/React__default.default.createElement("div", {
      className: `tokri-datepicker-pop${openUp ? ' is-up' : ''}`
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker-nav"
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setMonthDate(new Date(year, month - 1, 1))
    }, "\u2039"), /*#__PURE__*/React__default.default.createElement("strong", null, monthDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setMonthDate(new Date(year, month + 1, 1))
    }, "\u203A")), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker-week"
    }, ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => /*#__PURE__*/React__default.default.createElement("span", {
      key: `${label}-${index}`
    }, label))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker-grid"
    }, cells.map((day, index) => day ? /*#__PURE__*/React__default.default.createElement("button", {
      key: `${year}-${month}-${day}`,
      type: "button",
      className: selectedDay === day ? 'is-selected' : '',
      onClick: () => choose(day)
    }, day) : /*#__PURE__*/React__default.default.createElement("span", {
      key: `empty-${index}`
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker-actions"
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-datepicker-clear",
      onClick: () => {
        onChange('');
        setOpen(false);
      }
    }, "Clear"), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-datepicker-clear",
      onClick: () => {
        const today = new Date();
        setMonthDate(today);
        onChange(toDateValue(today));
        setOpen(false);
      }
    }, "Today"))) : null);
  }
  function FieldError$3({
    error
  }) {
    if (!error?.message) return null;
    return /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, error.message);
  }
  const BlogEdit = props => {
    const {
      record: initialRecord,
      resource,
      action
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const fileRef = React.useRef(null);
    const [uploading, setUploading] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState('');
    const params = record?.params || {};
    const isNew = action?.name === 'new' || !record?.id;
    const custom = resource?.options?.custom || {};
    const apiBaseUrl = withoutTrailingSlash$3(custom.apiBaseUrl || '/api/v1');
    const appUrl = custom.appUrl || window.location.origin;
    const errors = React.useMemo(() => record?.errors || {}, [record?.errors]);
    const isPublished = isNew && (params.isPublished === undefined || params.isPublished === '') ? true : isFlagOn(params.isPublished);
    React.useEffect(() => {
      if (isNew && (params.isPublished === undefined || params.isPublished === '')) {
        handleChange('isPublished', true);
      }
      if (isNew && !params.author) handleChange('author', 'Tokriii');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNew]);
    React.useEffect(() => () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);
    const imageUrl = React.useMemo(() => resolveImageUrl$1(params.coverImage, appUrl), [appUrl, params.coverImage]);
    const displayedImageUrl = previewUrl || imageUrl;
    const setField = (key, value) => handleChange(key, value);
    const uploadImage = async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('folder', 'blog');
      formData.append('file', file);
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);
      setUploading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/media/upload`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'Image upload failed');
        }
        const media = await response.json();
        setField('coverImage', media.path);
        setPreviewUrl(resolveImageUrl$1(media.path, appUrl));
        addNotice({
          message: 'Cover image uploaded',
          type: 'success'
        });
      } catch (error) {
        addNotice({
          message: error.message || 'Could not upload image',
          type: 'error'
        });
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save blog post',
            type: 'error'
          });
          return;
        }
        addNotice({
          message: isNew ? 'Blog post created' : 'Blog post updated',
          type: 'success'
        });
      }).catch(() => {
        addNotice({
          message: 'Could not save the blog post. Please try again.',
          type: 'error'
        });
      });
      return false;
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, isNew ? 'New blog post' : params.title || 'Blog post'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "Published posts appear on the website at /blog. Hidden posts stay in the admin only.")), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Website visibility"), /*#__PURE__*/React__default.default.createElement("p", null, "Turn this off to keep a draft without deleting it."), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isPublished,
      onLabel: "Published",
      offLabel: "Draft",
      title: isPublished ? 'Published' : 'Draft',
      hint: isPublished ? 'Visible on the blog' : 'Hidden until you publish it',
      onChange: next => setField('isPublished', next)
    })), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Post"), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Title", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      value: params.title || '',
      onChange: event => setField('title', event.target.value),
      placeholder: "How we pack a morning Tokriii"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$3, {
      error: errors.title
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "URL slug", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.slug || '',
      onChange: event => setField('slug', event.target.value),
      placeholder: "Leave blank to use the title"
    }), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "The page will be /blog/this-slug"), /*#__PURE__*/React__default.default.createElement(FieldError$3, {
      error: errors.slug
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Author", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.author || '',
      onChange: event => setField('author', event.target.value),
      placeholder: "Tokriii"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Category", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.category || '',
      onChange: event => setField('category', event.target.value),
      placeholder: "Guides"
    }), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "Shown above the title on the blog listing and the story page.")), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Publish date", /*#__PURE__*/React__default.default.createElement(DateField, {
      value: dateInputValue(params.publishedAt),
      onChange: next => setField('publishedAt', next)
    }), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "Leave blank to use today when the post is published."))), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Short summary", /*#__PURE__*/React__default.default.createElement("textarea", {
      className: "tokri-coupon-input",
      rows: 3,
      value: params.excerpt || '',
      onChange: event => setField('excerpt', event.target.value),
      placeholder: "One or two lines for the blog listing."
    }), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "If you leave this empty, the first lines of the post are used."))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Cover image"), /*#__PURE__*/React__default.default.createElement("p", null, "Shown on the blog listing and at the top of the story."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Cover", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-upload-drop"
    }, displayedImageUrl ? /*#__PURE__*/React__default.default.createElement("img", {
      src: displayedImageUrl,
      alt: params.title || 'Cover'
    }) : /*#__PURE__*/React__default.default.createElement("span", null, uploading ? 'Uploading…' : 'Click to upload a cover image'), /*#__PURE__*/React__default.default.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: "image/*",
      onChange: uploadImage
    })), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "JPG, PNG, GIF, or WebP up to 5MB")), displayedImageUrl ? /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "button",
      variant: "text",
      mt: "default",
      onClick: () => {
        setField('coverImage', '');
        setPreviewUrl('');
      }
    }, "Remove cover") : null), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Story"), /*#__PURE__*/React__default.default.createElement(designSystem.TinyMCE, {
      value: params.body || '',
      onChange: next => setField('body', next),
      options: EDITOR_OPTIONS
    }), /*#__PURE__*/React__default.default.createElement(FieldError$3, {
      error: errors.body
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading || uploading
    }, loading || uploading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, isNew ? 'Publish post' : 'Save post')));
  };

  const TABS = [{
    id: 'general',
    label: 'General',
    fields: ['storeName', 'storeTagline', 'storeEmail', 'storePhone1', 'storePhone2', 'storeAddress', 'promoBanner', 'earlyDelivery']
  }, {
    id: 'social',
    label: 'Social',
    fields: []
  }, {
    id: 'charges',
    label: 'Charges',
    fields: ['morningDeliveryTitle', 'morningDeliverySubtitle', 'morningShippingFee', 'morningFreeAbove', 'expressDeliveryTitle', 'expressDeliverySubtitle', 'expressShippingFee', 'expressFreeAbove', 'expressMinimumOrderValue', 'firstThreeMorningEnabled', 'handlingFee']
  }, {
    id: 'homepage',
    label: 'Homepage',
    fields: ['homeBannerImage', 'homeMobileBannerImage', 'homeHighlightImage', 'homeFeaturedCategorySlugs']
  }, {
    id: 'payments',
    label: 'Payments',
    fields: ['razorpayEnabled', 'razorpayKeyId', 'razorpayKeySecret', 'codEnabled']
  }, {
    id: 'notifications',
    label: 'Notifications',
    fields: ['msg91Enabled', 'msg91AuthKey', 'msg91SenderId', 'msg91OtpTemplateId', 'msg91OrderTemplateId', 'msg91WhatsappEnabled', 'msg91WhatsappNumber', 'msg91WhatsappNamespace', 'msg91WhatsappOtpEnabled', 'msg91WhatsappOtpTemplate', 'msg91WhatsappOtpButton', 'msg91WhatsappOrderEnabled', 'msg91WhatsappOrderTemplate', 'msg91WhatsappPartnerEnabled', 'msg91WhatsappPartnerTemplate']
  }];
  const withoutTrailingSlash$2 = value => String(value || '').replace(/\/+$/, '');
  function parseSlugs$1(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(item => String(item).trim()).filter(Boolean);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parseSlugs$1(parsed);
      } catch {
        // ignore
      }
      return raw.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  }
  function resolveImageUrl(path, appUrl) {
    if (!path) return '';
    if (/^(https?:|data:|blob:)/.test(path)) return path;
    return `${withoutTrailingSlash$2(appUrl || window.location.origin)}${path}`;
  }
  function ImageUploader({
    label,
    hint,
    value,
    previewUrl,
    uploading,
    fileRef,
    onUpload,
    wide
  }) {
    const displayed = previewUrl || value;
    return /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, label, /*#__PURE__*/React__default.default.createElement("span", {
      className: `tokri-upload-drop${wide ? ' tokri-upload-drop-wide' : ''}`
    }, displayed ? /*#__PURE__*/React__default.default.createElement("img", {
      src: displayed,
      alt: `${label} preview`
    }) : /*#__PURE__*/React__default.default.createElement("span", null, uploading ? 'Uploading…' : 'Click to upload an image'), /*#__PURE__*/React__default.default.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: "image/*",
      onChange: onUpload
    })), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, hint));
  }
  const NOTIFICATION_SECTIONS = [{
    id: 'sms',
    title: 'SMS',
    intro: 'Login OTP and order confirmation through MSG91 SMS.',
    fields: [{
      key: 'msg91Enabled',
      type: 'switch',
      label: 'Enable MSG91 SMS'
    }, {
      key: 'msg91AuthKey',
      type: 'password',
      label: 'MSG91 Auth Key',
      hint: 'Leave blank to keep the current key'
    }, {
      key: 'msg91SenderId',
      type: 'text',
      label: 'Sender ID',
      hint: '6-character DLT approved header, e.g. TOKRII'
    }, {
      key: 'msg91OtpTemplateId',
      type: 'text',
      label: 'Login OTP template ID',
      hint: 'MSG91 Template ID from the copy icon, e.g. 6aae9748a337d718910d31f3. Do not paste the 19-digit Airtel DLT ID.'
    }, {
      key: 'msg91OrderTemplateId',
      type: 'text',
      label: 'Order confirmation template ID',
      hint: 'MSG91 Template ID from the copy icon, e.g. 6aae978b1d0d6a12170b93f4. Do not paste the 19-digit Airtel DLT ID.'
    }]
  }, {
    id: 'whatsapp',
    title: 'WhatsApp',
    intro: 'Shared number and namespace for every WhatsApp template.',
    fields: [{
      key: 'msg91WhatsappEnabled',
      type: 'switch',
      label: 'Enable MSG91 WhatsApp',
      hint: 'Used when SMS is off or the SMS gateway rejects a message'
    }, {
      key: 'msg91WhatsappNumber',
      type: 'text',
      label: 'WhatsApp business number',
      hint: 'The number on your MSG91 WhatsApp account. A 10-digit Indian mobile gets 91 added automatically.'
    }, {
      key: 'msg91WhatsappNamespace',
      type: 'text',
      label: 'WhatsApp template namespace',
      hint: 'Required by MSG91. Delivery and OTP templates are told apart by this namespace.'
    }]
  }, {
    id: 'otp',
    title: 'OTP message',
    intro: 'Login code sent to the customer on WhatsApp.',
    fields: [{
      key: 'msg91WhatsappOtpEnabled',
      type: 'switch',
      label: 'Send OTP WhatsApp',
      hint: 'Login OTP to the customer'
    }, {
      key: 'msg91WhatsappOtpTemplate',
      type: 'text',
      label: 'OTP template name',
      hint: 'Approved MSG91 template with 1 body variable: the OTP code'
    }, {
      key: 'msg91WhatsappOtpButton',
      type: 'switch',
      label: 'OTP template has a copy-code button',
      hint: 'Turn on only if your WhatsApp OTP template includes the copy-code button'
    }]
  }, {
    id: 'order',
    title: 'Order message',
    intro: 'Customer confirmation after COD is placed or online payment is confirmed.',
    fields: [{
      key: 'msg91WhatsappOrderEnabled',
      type: 'switch',
      label: 'Send order WhatsApp',
      hint: 'Customer confirmation after COD is placed or online payment is confirmed'
    }, {
      key: 'msg91WhatsappOrderTemplate',
      type: 'text',
      label: 'Order template name',
      hint: 'Approved template with 3 body variables: name, order number, amount'
    }]
  }, {
    id: 'partner',
    title: 'Delivery partner message',
    intro: 'Sent after COD is placed or online payment is confirmed, if a partner is assigned.',
    fields: [{
      key: 'msg91WhatsappPartnerEnabled',
      type: 'switch',
      label: 'Send delivery-partner WhatsApp',
      hint: 'Sent after COD is placed or online payment is confirmed, if a partner is assigned'
    }, {
      key: 'msg91WhatsappPartnerTemplate',
      type: 'text',
      label: 'Delivery-partner template name',
      hint: 'Approved template tokriii_delivery_assigned with 8 body variables and a Search in map button. Button URL: https://www.google.com/maps/search/?api=1&query={{1}}'
    }]
  }];
  function FieldTip({
    text
  }) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (!open) return undefined;
      const onPointerDown = event => {
        if (!ref.current?.contains(event.target)) setOpen(false);
      };
      const timer = window.setTimeout(() => {
        document.addEventListener('pointerdown', onPointerDown);
      }, 0);
      return () => {
        window.clearTimeout(timer);
        document.removeEventListener('pointerdown', onPointerDown);
      };
    }, [open]);
    return /*#__PURE__*/React__default.default.createElement("span", {
      className: `tokri-hint${open ? ' is-open' : ''}`,
      ref: ref,
      onPointerDown: event => event.stopPropagation()
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-hint-trigger",
      "aria-label": "Field help",
      "aria-expanded": open,
      onClick: event => {
        event.preventDefault();
        event.stopPropagation();
        setOpen(current => !current);
      }
    }, "?"), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-hint-pop",
      role: "tooltip"
    }, text));
  }
  function NotifyInput({
    field,
    value,
    onChange
  }) {
    const isWhatsappNumber = field.key === 'msg91WhatsappNumber';
    const [locked, setLocked] = React.useState(field.type === 'password');
    return /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: field.type === 'password' ? 'password' : 'text',
      name: `tokri-${field.key}`,
      value: isWhatsappNumber ? String(value ?? '').replace(/\D/g, '') : value,
      readOnly: locked,
      inputMode: isWhatsappNumber ? 'numeric' : undefined,
      maxLength: isWhatsappNumber ? 15 : undefined,
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: false,
      placeholder: field.type === 'password' ? 'Leave blank to keep the current key' : isWhatsappNumber ? 'MSG91 WhatsApp number' : undefined,
      onFocus: () => setLocked(false),
      onChange: event => onChange(field.key, isWhatsappNumber ? event.target.value.replace(/\D/g, '').slice(0, 15) : event.target.value)
    });
  }
  const SOCIAL_FIELDS = [{
    key: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/tokriii'
  }, {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/tokriii'
  }, {
    key: 'threads',
    label: 'Threads',
    placeholder: 'https://www.threads.net/@tokriii'
  }, {
    key: 'x',
    label: 'X',
    placeholder: 'https://x.com/tokriii'
  }, {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://www.linkedin.com/company/tokriii'
  }];
  function readSocialLinks(raw) {
    const links = Object.fromEntries(SOCIAL_FIELDS.map(field => [field.key, '']));
    let value = raw;
    if (!raw) return links;
    if (typeof raw === 'string') {
      try {
        value = JSON.parse(raw);
      } catch {
        return links;
      }
    }
    if (!value || typeof value !== 'object') return links;
    for (const field of SOCIAL_FIELDS) {
      links[field.key] = typeof value[field.key] === 'string' ? value[field.key] : '';
    }
    return links;
  }
  function SocialFields({
    value,
    onChange
  }) {
    const links = readSocialLinks(value);
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-notify-fields"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Footer icons"), /*#__PURE__*/React__default.default.createElement("p", null, "These links appear under the address on the website. Leave a box empty to hide that icon."), SOCIAL_FIELDS.map(field => /*#__PURE__*/React__default.default.createElement("label", {
      key: field.key,
      className: "tokri-coupon-label"
    }, field.label, /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "url",
      inputMode: "url",
      autoComplete: "off",
      spellCheck: false,
      placeholder: field.placeholder,
      value: links[field.key],
      onChange: event => onChange('socialLinks', JSON.stringify({
        ...links,
        [field.key]: event.target.value
      }))
    })))));
  }
  function NotificationsFields({
    params,
    onChange
  }) {
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-notify-fields"
    }, NOTIFICATION_SECTIONS.map(section => /*#__PURE__*/React__default.default.createElement("section", {
      key: section.id,
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, section.title), /*#__PURE__*/React__default.default.createElement("p", null, section.intro), section.fields.map(field => field.type === 'switch' ? /*#__PURE__*/React__default.default.createElement("div", {
      key: field.key,
      className: "tokri-notify-switch"
    }, /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isFlagOn(params[field.key]),
      title: field.label,
      onChange: next => onChange(field.key, next)
    }), field.hint ? /*#__PURE__*/React__default.default.createElement(FieldTip, {
      text: field.hint
    }) : null) : /*#__PURE__*/React__default.default.createElement("label", {
      key: field.key,
      className: "tokri-coupon-label"
    }, /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-label-line"
    }, field.label, field.hint ? /*#__PURE__*/React__default.default.createElement(FieldTip, {
      text: field.hint
    }) : null), /*#__PURE__*/React__default.default.createElement(NotifyInput, {
      field: field,
      value: params[field.key] ?? '',
      onChange: onChange
    }))))));
  }
  const SettingsEdit = props => {
    const {
      record: initialRecord,
      resource
    } = props;
    const [activeTab, setActiveTab] = React.useState('general');
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const bannerFileRef = React.useRef(null);
    const mobileBannerFileRef = React.useRef(null);
    const highlightFileRef = React.useRef(null);
    const [bannerPreview, setBannerPreview] = React.useState('');
    const [mobileBannerPreview, setMobileBannerPreview] = React.useState('');
    const [highlightPreview, setHighlightPreview] = React.useState('');
    const [bannerUploading, setBannerUploading] = React.useState(false);
    const [mobileBannerUploading, setMobileBannerUploading] = React.useState(false);
    const [highlightUploading, setHighlightUploading] = React.useState(false);
    const [categories, setCategories] = React.useState([]);
    const params = record?.params || {};
    const custom = resource?.options?.custom || {};
    const apiBaseUrl = withoutTrailingSlash$2(custom.apiBaseUrl || '/api/v1');
    const appUrl = custom.appUrl || window.location.origin;
    const selectedCategorySlugs = parseSlugs$1(params.homeFeaturedCategorySlugs);
    const bannerImageUrl = React.useMemo(() => resolveImageUrl(params.homeBannerImage, appUrl), [appUrl, params.homeBannerImage]);
    const mobileBannerImageUrl = React.useMemo(() => resolveImageUrl(params.homeMobileBannerImage, appUrl), [appUrl, params.homeMobileBannerImage]);
    const highlightImageUrl = React.useMemo(() => resolveImageUrl(params.homeHighlightImage, appUrl), [appUrl, params.homeHighlightImage]);
    React.useEffect(() => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'appearance') {
        setActiveTab('charges');
        return;
      }
      if (hash && TABS.some(tab => tab.id === hash)) {
        setActiveTab(hash);
      }
    }, []);
    React.useEffect(() => {
      window.history.replaceState(null, '', `#${activeTab}`);
    }, [activeTab]);
    React.useEffect(() => {
      return () => {
        if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview);
      };
    }, [bannerPreview]);
    React.useEffect(() => {
      return () => {
        if (mobileBannerPreview?.startsWith('blob:')) URL.revokeObjectURL(mobileBannerPreview);
      };
    }, [mobileBannerPreview]);
    React.useEffect(() => {
      return () => {
        if (highlightPreview?.startsWith('blob:')) URL.revokeObjectURL(highlightPreview);
      };
    }, [highlightPreview]);
    React.useEffect(() => {
      let ignore = false;
      fetch(`${apiBaseUrl}/categories`).then(response => response.json()).then(data => {
        if (!ignore) setCategories(Array.isArray(data) ? data : []);
      }).catch(() => {
        if (!ignore) setCategories([]);
      });
      return () => {
        ignore = true;
      };
    }, [apiBaseUrl]);
    const uploadImage = async (event, field, setPreview, setBusy, fileRef, successMessage) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('folder', 'general');
      formData.append('file', file);
      const localPreviewUrl = URL.createObjectURL(file);
      setPreview(localPreviewUrl);
      setBusy(true);
      try {
        const response = await fetch(`${apiBaseUrl}/media/upload`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'Image upload failed');
        }
        const media = await response.json();
        handleChange(field, media.path);
        setPreview(resolveImageUrl(media.path, appUrl));
        addNotice({
          message: successMessage,
          type: 'success'
        });
      } catch (error) {
        addNotice({
          message: error.message || 'Could not upload image',
          type: 'error'
        });
      } finally {
        setBusy(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save settings',
            type: 'error'
          });
        } else if (notice?.type === 'success' || response?.data?.record) {
          addNotice({
            message: 'Settings saved successfully',
            type: 'success'
          });
        }
      }).catch(() => {
        addNotice({
          message: 'Could not save settings. Please try again.',
          type: 'error'
        });
      });
      return false;
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      flex: true,
      flexDirection: "column",
      className: "tokri-settings-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-settings-tabs",
      mb: "xl"
    }, TABS.map(tab => /*#__PURE__*/React__default.default.createElement("button", {
      key: tab.id,
      type: "button",
      className: `tokri-settings-tab${activeTab === tab.id ? ' is-active' : ''}`,
      onClick: () => setActiveTab(tab.id)
    }, tab.label))), /*#__PURE__*/React__default.default.createElement(designSystem.DrawerContent, null, TABS.map(tab => {
      const properties = resource.editProperties.filter(property => tab.fields.includes(property.propertyPath));
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        key: tab.id,
        className: "tokri-settings-panel",
        p: "xl",
        style: {
          display: activeTab === tab.id ? 'block' : 'none'
        }
      }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
        mb: "sm"
      }, tab.label), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
        mb: "xl",
        opacity: 0.75
      }, tab.id === 'charges' ? 'Set copy and prices for Morning and Express delivery. Handling fee is added to every order.' : tab.id === 'homepage' ? 'These images and categories appear on the website homepage. Click Save changes after uploading.' : tab.id === 'social' ? 'Paste each page link. A link without https:// is completed for you. Save changes when you are done.' : tab.id === 'notifications' ? 'Auth key, WhatsApp number, and namespace are shared. Each template has its own name and on/off toggle. Order and partner messages send only after COD is placed or the online payment is confirmed.' : 'Update your store settings and click Save changes below.'), tab.id === 'charges' ? /*#__PURE__*/React__default.default.createElement("div", {
        className: "tokri-charges-fields"
      }, /*#__PURE__*/React__default.default.createElement("section", {
        className: "tokri-coupon-card"
      }, /*#__PURE__*/React__default.default.createElement("h4", null, "Morning delivery"), /*#__PURE__*/React__default.default.createElement("p", null, "Shown at checkout when this option is on for the pincode."), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Title", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "text",
        value: record?.params?.morningDeliveryTitle ?? '',
        onChange: event => handleChange('morningDeliveryTitle', event.target.value),
        placeholder: "Flawless Morning Delivery"
      })), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Subtitle", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "text",
        value: record?.params?.morningDeliverySubtitle ?? '',
        onChange: event => handleChange('morningDeliverySubtitle', event.target.value),
        placeholder: "Freshness Guaranteed"
      })), /*#__PURE__*/React__default.default.createElement("div", {
        className: "tokri-coupon-two"
      }, /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Shipping fee (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "number",
        min: "0",
        step: "0.01",
        value: record?.params?.morningShippingFee ?? '',
        onChange: event => handleChange('morningShippingFee', event.target.value)
      })), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Free above (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "number",
        min: "0",
        step: "0.01",
        value: record?.params?.morningFreeAbove ?? '',
        onChange: event => handleChange('morningFreeAbove', event.target.value)
      }), /*#__PURE__*/React__default.default.createElement("span", {
        className: "tokri-field-hint"
      }, "0 means no free delivery")))), /*#__PURE__*/React__default.default.createElement("section", {
        className: "tokri-coupon-card"
      }, /*#__PURE__*/React__default.default.createElement("h4", null, "Express delivery"), /*#__PURE__*/React__default.default.createElement("p", null, "Shown at checkout. Disabled pincodes still see this as coming soon."), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Title", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "text",
        value: record?.params?.expressDeliveryTitle ?? '',
        onChange: event => handleChange('expressDeliveryTitle', event.target.value),
        placeholder: "Same day"
      })), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Subtitle", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "text",
        value: record?.params?.expressDeliverySubtitle ?? '',
        onChange: event => handleChange('expressDeliverySubtitle', event.target.value),
        placeholder: "On-Demand Luxury"
      })), /*#__PURE__*/React__default.default.createElement("div", {
        className: "tokri-coupon-two"
      }, /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Shipping fee (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "number",
        min: "0",
        step: "0.01",
        value: record?.params?.expressShippingFee ?? '',
        onChange: event => handleChange('expressShippingFee', event.target.value)
      })), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Free above (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "number",
        min: "0",
        step: "0.01",
        value: record?.params?.expressFreeAbove ?? '',
        onChange: event => handleChange('expressFreeAbove', event.target.value)
      }), /*#__PURE__*/React__default.default.createElement("span", {
        className: "tokri-field-hint"
      }, "0 means no free delivery"))), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Minimum order value (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "number",
        min: "0",
        step: "0.01",
        value: record?.params?.expressMinimumOrderValue ?? '',
        onChange: event => handleChange('expressMinimumOrderValue', event.target.value)
      }))), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, /*#__PURE__*/React__default.default.createElement("input", {
        type: "checkbox",
        checked: isFlagOn(record?.params?.firstThreeMorningEnabled),
        onChange: event => handleChange('firstThreeMorningEnabled', event.target.checked)
      }), "First 3 orders free on Morning Delivery"), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label tokri-charges-handling"
      }, "Handling charge (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
        className: "tokri-coupon-input",
        type: "number",
        min: "0",
        step: "0.01",
        value: record?.params?.handlingFee ?? '',
        onChange: event => handleChange('handlingFee', event.target.value)
      }), /*#__PURE__*/React__default.default.createElement("span", {
        className: "tokri-field-hint"
      }, "Cart handling fee added to every order"))) : tab.id === 'homepage' ? /*#__PURE__*/React__default.default.createElement("div", {
        className: "tokri-homepage-fields"
      }, /*#__PURE__*/React__default.default.createElement(ImageUploader, {
        label: "Home banner image",
        hint: "Desktop / large-screen hero banner. JPG, PNG, GIF, or WebP up to 5MB.",
        value: bannerImageUrl,
        previewUrl: bannerPreview,
        uploading: bannerUploading,
        fileRef: bannerFileRef,
        wide: true,
        onUpload: event => uploadImage(event, 'homeBannerImage', setBannerPreview, setBannerUploading, bannerFileRef, 'Banner image uploaded')
      }), /*#__PURE__*/React__default.default.createElement(ImageUploader, {
        label: "Home mobile banner image",
        hint: "Shown on phones. If empty, the desktop banner is used instead.",
        value: mobileBannerImageUrl,
        previewUrl: mobileBannerPreview,
        uploading: mobileBannerUploading,
        fileRef: mobileBannerFileRef,
        onUpload: event => uploadImage(event, 'homeMobileBannerImage', setMobileBannerPreview, setMobileBannerUploading, mobileBannerFileRef, 'Mobile banner image uploaded')
      }), /*#__PURE__*/React__default.default.createElement(ImageUploader, {
        label: "Fruit highlight image",
        hint: "Replaces the kiwi image in \u201CThe Small Fruit with a Big Punch\u201D on the website.",
        value: highlightImageUrl,
        previewUrl: highlightPreview,
        uploading: highlightUploading,
        fileRef: highlightFileRef,
        onUpload: event => uploadImage(event, 'homeHighlightImage', setHighlightPreview, setHighlightUploading, highlightFileRef, 'Highlight image uploaded')
      }), /*#__PURE__*/React__default.default.createElement("label", {
        className: "tokri-coupon-label"
      }, "Homepage categories", /*#__PURE__*/React__default.default.createElement(SearchableMultiSelect$1, {
        options: categories.map(item => ({
          value: item.slug,
          label: item.label || item.title || item.slug
        })),
        selected: selectedCategorySlugs,
        onChange: slugs => handleChange('homeFeaturedCategorySlugs', JSON.stringify(slugs)),
        placeholder: "Search and select categories",
        searchPlaceholder: "Search categories"
      }), /*#__PURE__*/React__default.default.createElement("span", {
        className: "tokri-field-hint"
      }, "These categories load on the website after the fruit highlight section, one at a time as the visitor scrolls."))) : tab.id === 'notifications' ? /*#__PURE__*/React__default.default.createElement(NotificationsFields, {
        params: params,
        onChange: handleChange
      }) : tab.id === 'social' ? /*#__PURE__*/React__default.default.createElement(SocialFields, {
        value: params.socialLinks,
        onChange: handleChange
      }) : properties.map(property => /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent, {
        key: property.propertyPath,
        where: "edit",
        onChange: handleChange,
        property: property,
        resource: resource,
        record: record
      })));
    })), /*#__PURE__*/React__default.default.createElement(designSystem.DrawerFooter, null, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, "Save changes")));
  };

  function FieldError$2({
    error
  }) {
    if (!error?.message) return null;
    return /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, error.message);
  }
  const AppReleaseEdit = props => {
    const {
      record: initialRecord,
      resource
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const params = record?.params || {};
    const errors = record?.errors || {};
    const platform = params.platform || record?.id || 'app';
    const setField = (key, value) => handleChange(key, value);
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice) addNotice(notice);
      }).catch(error => {
        addNotice({
          message: error.message || 'Could not save the app update rule',
          type: 'error'
        });
      });
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, platform === 'ios' ? 'iPhone' : 'Android', " update"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "Leave this off until the new app is actually available in the store. Raising the minimum before that sends people to a store page with nothing to download.")), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Turn this platform on"), /*#__PURE__*/React__default.default.createElement("p", null, "Off means the app opens normally, even if the numbers below are filled in."), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isFlagOn(params.enabled),
      onLabel: "On",
      offLabel: "Off",
      title: isFlagOn(params.enabled) ? 'Checking versions' : 'Not checking',
      hint: isFlagOn(params.enabled) ? 'The app will read these rules' : 'No update screen is shown',
      onChange: next => setField('enabled', next)
    })), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Build numbers"), /*#__PURE__*/React__default.default.createElement("p", null, "Use the build number, not the name 1.0.3. Android calls it version code. iPhone uses the build number."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Latest build", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      inputMode: "numeric",
      value: params.latestBuild ?? 0,
      onChange: event => setField('latestBuild', event.target.value)
    }), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "Older builds see Update and Not now."), /*#__PURE__*/React__default.default.createElement(FieldError$2, {
      error: errors.latestBuild
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Minimum build", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      inputMode: "numeric",
      value: params.minimumBuild ?? 0,
      onChange: event => setField('minimumBuild', event.target.value)
    }), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "Anything older must update. Use 0 while you are not forcing anyone."), /*#__PURE__*/React__default.default.createElement(FieldError$2, {
      error: errors.minimumBuild
    }))), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Blocked builds", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.blockedBuilds || '',
      onChange: event => setField('blockedBuilds', event.target.value),
      placeholder: "7, 9"
    }), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "Only these exact builds are stopped. Other older builds can keep working.")), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Ask again after (hours)", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      inputMode: "numeric",
      value: params.remindAfterHours ?? 24,
      onChange: event => setField('remindAfterHours', event.target.value)
    }), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "After Not now, the soft prompt stays quiet for this long."), /*#__PURE__*/React__default.default.createElement(FieldError$2, {
      error: errors.remindAfterHours
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Update message"), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Title", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.title || '',
      onChange: event => setField('title', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Message", /*#__PURE__*/React__default.default.createElement("textarea", {
      className: "tokri-coupon-input",
      rows: 3,
      value: params.message || '',
      onChange: event => setField('message', event.target.value)
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Pause the app"), /*#__PURE__*/React__default.default.createElement("p", null, "Use this for an outage. It does not send anyone to the store."), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isFlagOn(params.maintenance),
      onLabel: "Paused",
      offLabel: "Open",
      title: isFlagOn(params.maintenance) ? 'App is paused' : 'App is open',
      hint: isFlagOn(params.maintenance) ? 'People see this message instead of the shop' : 'Maintenance screen is hidden',
      onChange: next => setField('maintenance', next)
    }), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Pause title", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.maintenanceTitle || '',
      onChange: event => setField('maintenanceTitle', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Pause message", /*#__PURE__*/React__default.default.createElement("textarea", {
      className: "tokri-coupon-input",
      rows: 3,
      value: params.maintenanceMessage || '',
      onChange: event => setField('maintenanceMessage', event.target.value)
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, "Save rule")));
  };

  const withoutTrailingSlash$1 = value => String(value).replace(/\/+$/, '');
  function parseSlugs(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(item => String(item).trim()).filter(Boolean);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parseSlugs(parsed);
      } catch {
        // ignore
      }
      return raw.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  }
  function pad$1(num) {
    return String(num).padStart(2, '0');
  }
  function toDatetimeValue(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${pad$1(date.getMonth() + 1)}-${pad$1(date.getDate())}T${pad$1(date.getHours())}:${pad$1(date.getMinutes())}`;
  }
  function formatDatetimeLabel(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  function useAnchoredMenu(open) {
    const wrapRef = React.useRef(null);
    const [openUp, setOpenUp] = React.useState(false);
    React.useEffect(() => {
      if (!open) return undefined;
      const update = () => {
        const node = wrapRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUp(spaceBelow < 240 && rect.top > spaceBelow);
      };
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      };
    }, [open]);
    return {
      wrapRef,
      openUp
    };
  }
  function ChoiceCard({
    selected,
    title,
    hint,
    onClick
  }) {
    return /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: `tokri-choice-card${selected ? ' is-selected' : ''}`,
      onClick: onClick
    }, /*#__PURE__*/React__default.default.createElement("strong", null, title), /*#__PURE__*/React__default.default.createElement("span", null, hint));
  }
  function AnchoredSelect({
    value,
    options,
    onChange,
    placeholder
  }) {
    const [open, setOpen] = React.useState(false);
    const {
      wrapRef,
      openUp
    } = useAnchoredMenu(open);
    const selected = options.find(item => item.value === value);
    React.useEffect(() => {
      const onDocClick = event => {
        if (!wrapRef.current?.contains(event.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, [wrapRef]);
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect",
      ref: wrapRef
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-multiselect-control",
      onClick: () => setOpen(current => !current)
    }, /*#__PURE__*/React__default.default.createElement("span", null, selected?.label || placeholder), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-multiselect-caret"
    }, open ? '▴' : '▾')), open ? /*#__PURE__*/React__default.default.createElement("div", {
      className: `tokri-multiselect-menu${openUp ? ' is-up' : ''}`
    }, options.map(item => /*#__PURE__*/React__default.default.createElement("button", {
      key: item.value,
      type: "button",
      className: `tokri-multiselect-option${item.value === value ? ' is-selected' : ''}`,
      onClick: () => {
        onChange(item.value);
        setOpen(false);
      }
    }, item.label))) : null);
  }
  function SearchableMultiSelect({
    options,
    selected,
    onChange,
    placeholder,
    searchPlaceholder
  }) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const {
      wrapRef,
      openUp
    } = useAnchoredMenu(open);
    React.useEffect(() => {
      const onDocClick = event => {
        if (!wrapRef.current?.contains(event.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, [wrapRef]);
    const selectedSet = React.useMemo(() => new Set(selected), [selected]);
    const selectedOptions = options.filter(item => selectedSet.has(item.value));
    const filtered = options.filter(item => `${item.label} ${item.value}`.toLowerCase().includes(query.trim().toLowerCase()));
    const toggle = value => {
      if (selectedSet.has(value)) onChange(selected.filter(item => item !== value));else onChange([...selected, value]);
    };
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect",
      ref: wrapRef
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-multiselect-control",
      onClick: () => setOpen(value => !value)
    }, selectedOptions.length ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-multiselect-chips"
    }, selectedOptions.map(item => /*#__PURE__*/React__default.default.createElement("span", {
      key: item.value,
      className: "tokri-multiselect-chip"
    }, item.label, /*#__PURE__*/React__default.default.createElement("span", {
      role: "button",
      tabIndex: 0,
      onClick: event => {
        event.stopPropagation();
        toggle(item.value);
      }
    }, "\xD7")))) : /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-multiselect-placeholder"
    }, placeholder), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-multiselect-caret"
    }, open ? '▴' : '▾')), open ? /*#__PURE__*/React__default.default.createElement("div", {
      className: `tokri-multiselect-menu${openUp ? ' is-up' : ''}`
    }, /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: query,
      onChange: event => setQuery(event.target.value),
      placeholder: searchPlaceholder,
      autoFocus: true
    }), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect-list"
    }, filtered.length ? filtered.map(item => {
      const checked = selectedSet.has(item.value);
      return /*#__PURE__*/React__default.default.createElement("label", {
        key: item.value,
        className: `tokri-multiselect-option${checked ? ' is-selected' : ''}`
      }, /*#__PURE__*/React__default.default.createElement("input", {
        type: "checkbox",
        checked: checked,
        onChange: () => toggle(item.value)
      }), /*#__PURE__*/React__default.default.createElement("span", null, item.label));
    }) : /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-multiselect-empty"
    }, "No matches"))) : null);
  }
  function DateTimePicker({
    value,
    onChange,
    placeholder
  }) {
    const parsed = value ? new Date(value) : null;
    const valid = parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
    const [open, setOpen] = React.useState(false);
    const [monthDate, setMonthDate] = React.useState(valid || new Date());
    const [hours, setHours] = React.useState(valid ? pad$1(valid.getHours()) : '00');
    const [minutes, setMinutes] = React.useState(valid ? pad$1(valid.getMinutes()) : '00');
    const {
      wrapRef,
      openUp
    } = useAnchoredMenu(open);
    React.useEffect(() => {
      const onDocClick = event => {
        if (!wrapRef.current?.contains(event.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, [wrapRef]);
    React.useEffect(() => {
      if (!valid) return;
      setMonthDate(valid);
      setHours(pad$1(valid.getHours()));
      setMinutes(pad$1(valid.getMinutes()));
    }, [value]);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) cells.push(day);
    const apply = (day, nextHours = hours, nextMinutes = minutes) => {
      const next = `${year}-${pad$1(month + 1)}-${pad$1(day)}T${pad$1(Number(nextHours) || 0)}:${pad$1(Number(nextMinutes) || 0)}`;
      onChange(next);
    };
    const selectedDay = valid && valid.getFullYear() === year && valid.getMonth() === month ? valid.getDate() : null;
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker",
      ref: wrapRef
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-datepicker-control",
      onClick: () => setOpen(current => !current)
    }, /*#__PURE__*/React__default.default.createElement("span", null, valid ? formatDatetimeLabel(valid) : placeholder), /*#__PURE__*/React__default.default.createElement("span", null, "\uD83D\uDCC5")), open ? /*#__PURE__*/React__default.default.createElement("div", {
      className: `tokri-datepicker-pop${openUp ? ' is-up' : ''}`
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker-nav"
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setMonthDate(new Date(year, month - 1, 1))
    }, "\u2039"), /*#__PURE__*/React__default.default.createElement("strong", null, monthDate.toLocaleString('en-IN', {
      month: 'long',
      year: 'numeric'
    })), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setMonthDate(new Date(year, month + 1, 1))
    }, "\u203A")), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker-week"
    }, ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(label => /*#__PURE__*/React__default.default.createElement("span", {
      key: label
    }, label))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker-grid"
    }, cells.map((day, index) => day ? /*#__PURE__*/React__default.default.createElement("button", {
      key: `${year}-${month}-${day}`,
      type: "button",
      className: selectedDay === day ? 'is-selected' : '',
      onClick: () => apply(day)
    }, day) : /*#__PURE__*/React__default.default.createElement("span", {
      key: `empty-${index}`
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-datepicker-time"
    }, /*#__PURE__*/React__default.default.createElement("label", null, "Hour", /*#__PURE__*/React__default.default.createElement("input", {
      type: "number",
      min: "0",
      max: "23",
      value: hours,
      onChange: event => {
        const next = pad$1(Math.min(23, Math.max(0, Number(event.target.value) || 0)));
        setHours(next);
        if (selectedDay) apply(selectedDay, next, minutes);
      }
    })), /*#__PURE__*/React__default.default.createElement("label", null, "Minute", /*#__PURE__*/React__default.default.createElement("input", {
      type: "number",
      min: "0",
      max: "59",
      value: minutes,
      onChange: event => {
        const next = pad$1(Math.min(59, Math.max(0, Number(event.target.value) || 0)));
        setMinutes(next);
        if (selectedDay) apply(selectedDay, hours, next);
      }
    })), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-datepicker-clear",
      onClick: () => {
        onChange('');
        setOpen(false);
      }
    }, "Clear"))) : null);
  }
  const CouponEdit = props => {
    const {
      record: initialRecord,
      resource
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const params = record?.params || {};
    const custom = resource?.options?.custom || {};
    const apiBaseUrl = withoutTrailingSlash$1(custom.apiBaseUrl || '/api/v1');
    const [products, setProducts] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const selectedSlugs = parseSlugs(params.targetSlugs);
    const targetType = params.targetType || 'all';
    const applyOn = params.applyOn || 'cart';
    const usageType = params.usageType || 'unlimited';
    const couponType = params.type || 'percent';
    const isActive = params.isActive !== false && params.isActive !== 'false';
    const knowMoreProperty = resource.editProperties.find(property => property.propertyPath === 'knowMoreHtml');
    React.useEffect(() => {
      let ignore = false;
      async function loadCatalog() {
        try {
          const categoryData = await fetch(`${apiBaseUrl}/categories`).then(response => response.json());
          const allProducts = [];
          let page = 1;
          let hasMore = true;
          while (hasMore && page <= 20) {
            const productData = await fetch(`${apiBaseUrl}/products?page=${page}&limit=100`).then(response => response.json());
            allProducts.push(...(productData.products || []));
            hasMore = Boolean(productData.hasMore);
            page += 1;
          }
          if (ignore) return;
          setProducts(allProducts);
          setCategories(Array.isArray(categoryData) ? categoryData : []);
        } catch {
          if (!ignore) {
            setProducts([]);
            setCategories([]);
          }
        }
      }
      loadCatalog();
      return () => {
        ignore = true;
      };
    }, [apiBaseUrl]);
    const setField = (key, value) => handleChange(key, value);
    const setSelectedSlugs = next => setField('targetSlugs', JSON.stringify(next));
    const productOptions = React.useMemo(() => products.map(item => ({
      value: item.slug,
      label: item.name
    })), [products]);
    const categoryOptions = React.useMemo(() => categories.map(item => ({
      value: item.slug,
      label: item.label
    })), [categories]);
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save coupon',
            type: 'error'
          });
          return;
        }
        addNotice({
          message: 'Coupon saved',
          type: 'success'
        });
      }).catch(() => {
        addNotice({
          message: 'Could not save coupon. Please try again.',
          type: 'error'
        });
      });
      return false;
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, "Create a store coupon"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "Set who gets the discount, where it applies, and how many times it can be used.")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Coupon code"), /*#__PURE__*/React__default.default.createElement("p", null, "Customers will type this at checkout on the website and app."), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input tokri-coupon-code",
      value: params.code || '',
      onChange: event => setField('code', event.target.value.toUpperCase()),
      placeholder: "WELCOME10",
      required: true
    }), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-toggle"
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "checkbox",
      checked: isActive,
      onChange: event => setField('isActive', event.target.checked)
    }), "Coupon is active")), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Discount"), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-toggle"
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "checkbox",
      checked: params.showAtCheckout === true || params.showAtCheckout === 'true',
      onChange: event => setField('showAtCheckout', event.target.checked)
    }), "Show publicly in checkout Available Coupons"), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-choice-row"
    }, /*#__PURE__*/React__default.default.createElement(ChoiceCard, {
      selected: couponType === 'percent',
      title: "Percent off",
      hint: "e.g. 10% off",
      onClick: () => setField('type', 'percent')
    }), /*#__PURE__*/React__default.default.createElement(ChoiceCard, {
      selected: couponType === 'flat',
      title: "Flat amount",
      hint: "e.g. \u20B950 off",
      onClick: () => setField('type', 'flat')
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, couponType === 'percent' ? 'Percent value' : 'Amount (₹)', /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      min: "0",
      step: "0.01",
      value: params.value ?? '',
      onChange: event => setField('value', event.target.value),
      required: true
    })), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Min cart (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      min: "0",
      step: "0.01",
      value: params.minCart ?? '',
      onChange: event => setField('minCart', event.target.value),
      placeholder: "0"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Max discount (\u20B9)", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      min: "0",
      step: "0.01",
      value: params.maxDiscount ?? '',
      onChange: event => setField('maxDiscount', event.target.value),
      placeholder: "No cap"
    }))))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Apply discount on"), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-choice-row"
    }, /*#__PURE__*/React__default.default.createElement(ChoiceCard, {
      selected: applyOn === 'cart',
      title: "Cart total",
      hint: "Reduce the items subtotal",
      onClick: () => setField('applyOn', 'cart')
    }), /*#__PURE__*/React__default.default.createElement(ChoiceCard, {
      selected: applyOn === 'shipping',
      title: "Shipping fee",
      hint: "Reduce delivery charges",
      onClick: () => setField('applyOn', 'shipping')
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Who can get this discount"), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Apply to", /*#__PURE__*/React__default.default.createElement(AnchoredSelect, {
      value: targetType,
      placeholder: "Choose who this coupon applies to",
      onChange: next => {
        setField('targetType', next);
        setSelectedSlugs([]);
      },
      options: [{
        value: 'all',
        label: 'All products'
      }, {
        value: 'products',
        label: 'Selected products'
      }, {
        value: 'categories',
        label: 'Selected categories'
      }]
    })), targetType === 'products' ? /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Products", /*#__PURE__*/React__default.default.createElement(SearchableMultiSelect, {
      options: productOptions,
      selected: selectedSlugs,
      onChange: setSelectedSlugs,
      placeholder: "Select products",
      searchPlaceholder: "Search products"
    })) : null, targetType === 'categories' ? /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Categories", /*#__PURE__*/React__default.default.createElement(SearchableMultiSelect, {
      options: categoryOptions,
      selected: selectedSlugs,
      onChange: setSelectedSlugs,
      placeholder: "Select categories",
      searchPlaceholder: "Search categories"
    })) : null), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Usage"), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-choice-row"
    }, /*#__PURE__*/React__default.default.createElement(ChoiceCard, {
      selected: usageType === 'unlimited',
      title: "Unlimited",
      hint: "Customers can reuse it",
      onClick: () => setField('usageType', 'unlimited')
    }), /*#__PURE__*/React__default.default.createElement(ChoiceCard, {
      selected: usageType === 'single',
      title: "Single use",
      hint: "One use per customer",
      onClick: () => setField('usageType', 'single')
    })), usageType === 'unlimited' ? /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Optional global cap", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      min: "1",
      value: params.usageLimit ?? '',
      onChange: event => setField('usageLimit', event.target.value),
      placeholder: "Leave blank for unlimited"
    })) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, "Each logged-in customer can use this coupon once."), params.usedCount ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "default"
    }, "Used ", params.usedCount, " time(s) so far.") : null), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Schedule"), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Starts at", /*#__PURE__*/React__default.default.createElement(DateTimePicker, {
      value: toDatetimeValue(params.startsAt),
      onChange: next => setField('startsAt', next || null),
      placeholder: "Select start date and time"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Expires at", /*#__PURE__*/React__default.default.createElement(DateTimePicker, {
      value: toDatetimeValue(params.expiresAt),
      onChange: next => setField('expiresAt', next || null),
      placeholder: "Select expiry date and time"
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Know more"), /*#__PURE__*/React__default.default.createElement("p", null, "Optional HTML shown under Know more in Coupons & offers on the website. Leave empty to hide Know more for this coupon."), knowMoreProperty ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        minHeight: 220
      }
    }, /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent, {
      where: "edit",
      onChange: handleChange,
      property: knowMoreProperty,
      resource: resource,
      record: record
    })) : null), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, "Save coupon")));
  };

  const FULFILLMENT$1 = {
    pending: {
      label: 'Waiting for fulfillment',
      tone: 'pending'
    },
    paid: {
      label: 'Processing',
      tone: 'processing'
    },
    packed: {
      label: 'Packed',
      tone: 'packed'
    },
    shipped: {
      label: 'Shipped',
      tone: 'shipped'
    },
    delivered: {
      label: 'Delivered',
      tone: 'delivered'
    },
    cancelled: {
      label: 'Cancelled',
      tone: 'cancelled'
    }
  };
  function isOnlineOrder(params = {}) {
    const mode = String(params.paymentMode || '').toLowerCase();
    if (mode === 'online') return true;
    if (mode === 'cod') return false;
    return Boolean(params.razorpayPaymentId || params.razorpayOrderId);
  }
  function paymentBadge(params = {}) {
    const online = isOnlineOrder(params);
    const method = online ? 'Online' : 'COD';
    const status = String(params.paymentStatus || 'pending').toLowerCase();
    if (status === 'paid') return {
      label: `${method} · Paid`,
      tone: 'paid'
    };
    if (status === 'failed') return {
      label: `${method} · Failed`,
      tone: 'failed'
    };
    if (status === 'refunded') return {
      label: `${method} · Refunded`,
      tone: 'refunded'
    };
    if (online) return {
      label: 'Online · Waiting',
      tone: 'waiting'
    };
    return {
      label: 'COD · Unpaid',
      tone: 'pending'
    };
  }
  function Pill({
    label,
    tone
  }) {
    return /*#__PURE__*/React__default.default.createElement("span", {
      className: `tokri-order-pill tokri-list-pill is-${tone}`
    }, label);
  }
  function getFulfillmentBadge(status) {
    const key = String(status || 'pending').toLowerCase();
    return FULFILLMENT$1[key] || FULFILLMENT$1.pending;
  }
  function getPaymentBadge(params) {
    return paymentBadge(params);
  }
  function FulfillmentBadge({
    record
  }) {
    const badge = getFulfillmentBadge(record?.params?.status);
    return /*#__PURE__*/React__default.default.createElement(Pill, {
      label: badge.label,
      tone: badge.tone
    });
  }
  function PaymentBadge({
    record
  }) {
    const badge = getPaymentBadge(record?.params);
    return /*#__PURE__*/React__default.default.createElement(Pill, {
      label: badge.label,
      tone: badge.tone
    });
  }
  function OrderListBadge({
    record,
    property
  }) {
    const path = property?.path || property?.propertyPath || '';
    if (path === 'status') return /*#__PURE__*/React__default.default.createElement(FulfillmentBadge, {
      record: record
    });
    return /*#__PURE__*/React__default.default.createElement(PaymentBadge, {
      record: record
    });
  }

  const api$3 = new adminjs.ApiClient();
  const FULFILLMENT = [{
    value: 'pending',
    label: 'Waiting for fulfillment'
  }, {
    value: 'paid',
    label: 'Processing'
  }, {
    value: 'packed',
    label: 'Packed'
  }, {
    value: 'shipped',
    label: 'Shipped'
  }, {
    value: 'delivered',
    label: 'Delivered'
  }, {
    value: 'cancelled',
    label: 'Cancelled'
  }];
  const PAYMENT_OPTIONS = [{
    value: 'pending',
    label: 'Pending'
  }, {
    value: 'paid',
    label: 'Paid'
  }, {
    value: 'failed',
    label: 'Failed'
  }, {
    value: 'refunded',
    label: 'Refunded'
  }];
  function CopyId({
    label,
    value,
    href
  }) {
    const [copied, setCopied] = React.useState(false);
    if (!value) return null;
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-rzp-row"
    }, /*#__PURE__*/React__default.default.createElement("span", null, label), /*#__PURE__*/React__default.default.createElement("code", null, value), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => {
        navigator.clipboard?.writeText(value)?.then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }).catch(() => {});
      }
    }, copied ? 'Copied' : 'Copy'), href ? /*#__PURE__*/React__default.default.createElement("a", {
      href: href,
      target: "_blank",
      rel: "noopener noreferrer"
    }, "Open in Razorpay") : null);
  }
  function deliveryChoiceLabel(option) {
    if (option === 'express') return 'Express';
    if (option === 'morning') return 'Morning';
    return '';
  }
  function formatExpectedDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  }
  const formatMoney = value => {
    const amount = Number(value);
    if (Number.isNaN(amount)) return '₹0';
    return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2
  })}`;
  };
  const formatDateTime = value => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };
  const resolveImage = value => {
    if (!value) return '';
    if (/^(https?:|data:|blob:)/.test(value)) return value;
    if (value.startsWith('/')) return `${window.location.origin}${value}`;
    return value;
  };
  function MoreMenu({
    unpaid,
    canSyncRazorpay,
    busy,
    onCash,
    onQr,
    onSyncRazorpay,
    onResendPartner
  }) {
    const [open, setOpen] = React.useState(false);
    const {
      wrapRef,
      openUp
    } = useAnchoredMenu$1(open);
    React.useEffect(() => {
      const onDocClick = event => {
        if (!wrapRef.current?.contains(event.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, [wrapRef]);
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-more",
      ref: wrapRef
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setOpen(value => !value)
    }, "More actions", /*#__PURE__*/React__default.default.createElement("span", null, open ? '▴' : '▾')), open ? /*#__PURE__*/React__default.default.createElement("div", {
      className: `tokri-order-more-menu${openUp ? ' is-up' : ''}`
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      disabled: Boolean(busy),
      onClick: () => {
        setOpen(false);
        onResendPartner();
      }
    }, busy === 'resendPartnerWhatsapp' ? 'Sending…' : 'Resend message to delivery partner'), unpaid ? /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      disabled: Boolean(busy),
      onClick: () => {
        setOpen(false);
        onCash();
      }
    }, busy === 'collectCash' ? 'Saving…' : 'Mark cash collected'), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      disabled: Boolean(busy),
      onClick: () => {
        setOpen(false);
        onQr();
      }
    }, busy === 'generateQr' ? 'Creating…' : 'Generate payment QR')) : null, canSyncRazorpay ? /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      disabled: Boolean(busy),
      onClick: () => {
        setOpen(false);
        onSyncRazorpay();
      }
    }, busy === 'syncRazorpay' ? 'Checking Razorpay…' : 'Sync Razorpay payment') : null) : null);
  }
  function snapshot(params = {}) {
    return {
      status: params.status || '',
      paymentStatus: params.paymentStatus || '',
      deliveryPartnerId: params.deliveryPartnerId || '',
      contactName: params.contactName || '',
      contactPhone: params.contactPhone || '',
      addressLine1: params.addressLine1 || '',
      addressLine2: params.addressLine2 || '',
      addressCity: params.addressCity || '',
      addressState: params.addressState || '',
      addressPincode: params.addressPincode || '',
      addressLandmark: params.addressLandmark || ''
    };
  }
  const OrderDetail = props => {
    const {
      record: initialRecord,
      resource,
      action
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit,
      loading,
      setRecord
    } = adminjs.useRecord(initialRecord, resource.id);
    const params = record?.params || {};
    const [saving, setSaving] = React.useState(false);
    const [actionBusy, setActionBusy] = React.useState('');
    const [partners, setPartners] = React.useState([{
      value: '',
      label: 'Unassigned'
    }]);
    const [baseline, setBaseline] = React.useState(() => snapshot(initialRecord?.params));
    const [editContact, setEditContact] = React.useState(false);
    const [editAddress, setEditAddress] = React.useState(false);
    React.useEffect(() => {
      if (action?.name !== 'show') return undefined;
      const next = window.location.pathname.replace(/\/show\/?$/, '/edit');
      if (next !== window.location.pathname) window.location.replace(next);
      return undefined;
    }, [action?.name]);
    React.useEffect(() => {
      let ignore = false;
      api$3.resourceAction({
        resourceId: 'DeliveryPartner',
        actionName: 'list',
        params: {
          perPage: 200
        }
      }).then(response => {
        if (ignore) return;
        const records = response.data?.records || [];
        setPartners([{
          value: '',
          label: 'Unassigned'
        }, ...records.map(item => ({
          value: item.id || item.params?.id,
          label: item.params?.isActive === false ? `${item.params?.name || 'Partner'} (inactive)` : item.params?.name || 'Partner'
        }))]);
      }).catch(() => {
        if (!ignore) setPartners([{
          value: '',
          label: 'Unassigned'
        }]);
      });
      return () => {
        ignore = true;
      };
    }, []);
    const items = React.useMemo(() => {
      try {
        const parsed = JSON.parse(params.itemsJson || '[]');
        return parsed.map(item => ({
          ...item,
          image: resolveImage(item.image)
        }));
      } catch {
        return [];
      }
    }, [params.itemsJson]);
    const current = snapshot(params);
    const dirty = Object.keys(current).some(key => current[key] !== baseline[key]);
    const listUrl = window.location.pathname.replace(/\/records\/.*$/, '');
    const unpaid = params.paymentStatus !== 'paid';
    const canSyncRazorpay = unpaid && params.paymentMode === 'online';
    React.useEffect(() => {
      if (!canSyncRazorpay || !record?.id) return undefined;
      let ignore = false;
      api$3.recordAction({
        resourceId: resource.id,
        recordId: record.id,
        actionName: 'syncRazorpay'
      }).then(response => {
        if (ignore) return;
        if (response.data?.record) {
          setRecord(response.data.record);
          setBaseline(snapshot(response.data.record.params));
        }
        const notice = response.data?.notice;
        if (notice?.type === 'success') addNotice(notice);
      }).catch(() => {});
      return () => {
        ignore = true;
      };
    }, [canSyncRazorpay, record?.id, resource.id, setRecord]);
    const handleSave = async event => {
      event.preventDefault();
      const phone = String(params.contactPhone || '').replace(/\D/g, '');
      const pin = String(params.addressPincode || '').replace(/\D/g, '');
      if (!String(params.contactName || '').trim() || phone.length < 10) {
        addNotice({
          message: 'Enter the customer name and a 10-digit contact number.',
          type: 'error'
        });
        return;
      }
      if (!String(params.addressLine1 || '').trim() || !String(params.addressCity || '').trim() || !String(params.addressState || '').trim() || pin.length !== 6) {
        addNotice({
          message: 'Enter the house, city, state, and a 6-digit pincode.',
          type: 'error'
        });
        return;
      }
      setSaving(true);
      try {
        const response = await submit();
        const next = response?.data?.record?.params;
        if (next) {
          setBaseline(snapshot(next));
          setEditContact(false);
          setEditAddress(false);
        }
      } finally {
        setSaving(false);
      }
    };
    const runPaymentAction = async actionName => {
      if (actionName === 'collectCash' && !window.confirm('Mark this order as paid in cash?')) return;
      setActionBusy(actionName);
      try {
        const response = await api$3.recordAction({
          resourceId: resource.id,
          recordId: record.id,
          actionName
        });
        if (response.data?.record) {
          setRecord(response.data.record);
          setBaseline(snapshot(response.data.record.params));
        }
        addNotice(response.data?.notice || {
          message: 'Updated.',
          type: 'success'
        });
      } catch (error) {
        addNotice({
          message: error.message || 'Could not complete this action.',
          type: 'error'
        });
      } finally {
        setActionBusy('');
      }
    };
    if (action?.name === 'show') return null;
    const fulfillment = getFulfillmentBadge(params.status);
    const payment = getPaymentBadge(params);
    const statusLabel = fulfillment.label;
    const restoreFields = (keys, close) => {
      keys.forEach(key => handleChange(key, baseline[key] || ''));
      close(false);
    };
    const addressText = [params.addressLine1, params.addressLine2, [params.addressCity, params.addressState, params.addressPincode].filter(Boolean).join(', '), params.addressLandmark ? `Landmark: ${params.addressLandmark}` : ''].filter(Boolean);
    const paymentLabel = payment.label;
    const partnerName = params.deliveryPartnerName ? `${params.deliveryPartnerName}${params.deliveryPartnerPhone ? ` · ${params.deliveryPartnerPhone}` : ''}` : 'No delivery partner yet';
    const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const deliveryName = deliveryChoiceLabel(params.deliveryOption);
    const expectedDelivery = formatExpectedDate(params.expectedDeliveryDate);
    return /*#__PURE__*/React__default.default.createElement("form", {
      className: "tokri-order",
      onSubmit: handleSave
    }, /*#__PURE__*/React__default.default.createElement("header", {
      className: "tokri-order-top"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-title"
    }, /*#__PURE__*/React__default.default.createElement("a", {
      className: "tokri-order-back",
      href: listUrl,
      "aria-label": "Back to orders"
    }, "\u2190"), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-title-row"
    }, /*#__PURE__*/React__default.default.createElement("h2", null, "#", params.orderNo), /*#__PURE__*/React__default.default.createElement("span", {
      className: `tokri-order-pill is-${payment.tone}`
    }, paymentLabel), /*#__PURE__*/React__default.default.createElement("span", {
      className: `tokri-order-pill is-${fulfillment.tone}`
    }, statusLabel)), /*#__PURE__*/React__default.default.createElement("p", null, formatDateTime(params.createdAt)))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-actions"
    }, /*#__PURE__*/React__default.default.createElement("a", {
      className: "tokri-order-invoice",
      href: `/tokri-backoffice/orders/${record.id}/invoice?download=1`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Download PDF invoice"
    }, "Download Invoice"), /*#__PURE__*/React__default.default.createElement("button", {
      className: "tokri-order-save",
      type: "submit",
      disabled: !dirty || loading || saving
    }, saving ? 'Saving…' : 'Save'), /*#__PURE__*/React__default.default.createElement(MoreMenu, {
      unpaid: unpaid,
      canSyncRazorpay: canSyncRazorpay,
      busy: actionBusy,
      onCash: () => runPaymentAction('collectCash'),
      onQr: () => runPaymentAction('generateQr'),
      onSyncRazorpay: () => runPaymentAction('syncRazorpay'),
      onResendPartner: () => runPaymentAction('resendPartnerWhatsapp')
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-layout"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-main"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-order-card"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-card-head"
    }, /*#__PURE__*/React__default.default.createElement("span", {
      className: `tokri-order-mark is-${fulfillment.tone}`
    }), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("strong", null, statusLabel), /*#__PURE__*/React__default.default.createElement("span", null, itemCount, " ", itemCount === 1 ? 'item' : 'items', " \xB7 ", partnerName)), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-select"
    }, /*#__PURE__*/React__default.default.createElement(LocalSelect, {
      value: params.status || 'pending',
      options: FULFILLMENT,
      onChange: value => handleChange('status', value)
    }))), items.length === 0 ? /*#__PURE__*/React__default.default.createElement("p", {
      className: "tokri-order-empty"
    }, "No items on this order.") : /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-items"
    }, items.map(item => /*#__PURE__*/React__default.default.createElement("article", {
      key: item.id
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-thumb-wrap"
    }, item.image ? /*#__PURE__*/React__default.default.createElement("img", {
      src: item.image,
      alt: ""
    }) : /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-order-thumb"
    }), /*#__PURE__*/React__default.default.createElement("em", null, item.quantity)), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("strong", null, item.name), item.weight ? /*#__PURE__*/React__default.default.createElement("span", null, item.weight) : null), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-order-qty"
    }, formatMoney(item.priceValue), " \xD7 ", item.quantity), /*#__PURE__*/React__default.default.createElement("b", null, formatMoney(item.lineTotal)))))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-order-card"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-card-head"
    }, /*#__PURE__*/React__default.default.createElement("span", {
      className: `tokri-order-mark is-${payment.tone}`
    }), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("strong", null, paymentLabel), /*#__PURE__*/React__default.default.createElement("span", null, params.paymentMethod || 'Cash on delivery')), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-select"
    }, /*#__PURE__*/React__default.default.createElement(LocalSelect, {
      value: params.paymentStatus || 'pending',
      options: PAYMENT_OPTIONS,
      onChange: value => handleChange('paymentStatus', value)
    }))), /*#__PURE__*/React__default.default.createElement("dl", {
      className: "tokri-order-totals"
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Subtotal"), /*#__PURE__*/React__default.default.createElement("dd", null, itemCount, " ", itemCount === 1 ? 'item' : 'items'), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.itemsTotal))), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Delivery", deliveryName ? ` - ${deliveryName}` : ''), /*#__PURE__*/React__default.default.createElement("dd", null, expectedDelivery ? `Expected ${expectedDelivery}` : ''), /*#__PURE__*/React__default.default.createElement("dd", null, params.freeDeliveryApplied || Number(params.deliveryCharge) === 0 ? 'Free (Welcome offer)' : formatMoney(params.deliveryCharge))), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Handling"), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.handlingCharge))), Number(params.taxTotal) > 0 ? /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Taxes (GST)", params.isInterState ? ' · IGST' : ' · CGST+SGST'), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.taxTotal))) : null, Number(params.smallCartCharge) > 0 ? /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Small cart"), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.smallCartCharge))) : null, Number(params.discount) > 0 ? /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, params.automaticDiscountPercentage ? `Automatic discount (${params.automaticDiscountPercentage}%)` : 'Discount', params.couponCode ? ` · ${params.couponCode}` : ''), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, "-", formatMoney(params.discount))) : null, /*#__PURE__*/React__default.default.createElement("div", {
      className: "is-total"
    }, /*#__PURE__*/React__default.default.createElement("dt", null, "Total"), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.grandTotal)))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-collected"
    }, /*#__PURE__*/React__default.default.createElement("span", null, params.paymentStatus === 'paid' ? 'Paid by customer' : 'Still to collect'), /*#__PURE__*/React__default.default.createElement("b", null, formatMoney(params.grandTotal))), params.paymentCollectedAs ? /*#__PURE__*/React__default.default.createElement("p", {
      className: "tokri-order-meta"
    }, "Collected as ", params.paymentCollectedAs) : null, params.paymentMode === 'online' || params.razorpayPaymentId || params.razorpayOrderId ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-rzp"
    }, /*#__PURE__*/React__default.default.createElement(CopyId, {
      label: "Payment ID",
      value: params.razorpayPaymentId,
      href: params.razorpayPaymentId ? `https://dashboard.razorpay.com/app/payments/${encodeURIComponent(params.razorpayPaymentId)}` : ''
    }), /*#__PURE__*/React__default.default.createElement(CopyId, {
      label: "Razorpay order",
      value: params.razorpayOrderId,
      href: params.razorpayOrderId ? `https://dashboard.razorpay.com/app/orders/${encodeURIComponent(params.razorpayOrderId)}` : ''
    }), !params.razorpayPaymentId ? /*#__PURE__*/React__default.default.createElement("p", {
      className: "tokri-order-meta"
    }, "No Razorpay payment ID yet. Use Sync Razorpay payment if money was captured.") : null) : null, params.razorpayQrUrl ? /*#__PURE__*/React__default.default.createElement("img", {
      className: "tokri-order-qr",
      src: params.razorpayQrUrl,
      alt: "Doorstep payment QR"
    }) : null)), /*#__PURE__*/React__default.default.createElement("aside", {
      className: "tokri-order-side"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-order-card"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-section-head"
    }, /*#__PURE__*/React__default.default.createElement("h3", null, "Customer")), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-section-head"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Contact"), editContact ? /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-order-edit",
      onClick: () => restoreFields(['contactName', 'contactPhone'], setEditContact)
    }, "Cancel") : /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-order-edit",
      onClick: () => setEditContact(true)
    }, "Edit")), editContact ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-edit-fields"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-order-field"
    }, "Name", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-order-input",
      value: params.contactName || '',
      onChange: event => handleChange('contactName', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-order-field"
    }, "Phone number", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-order-input",
      inputMode: "numeric",
      value: params.contactPhone || '',
      onChange: event => handleChange('contactPhone', event.target.value)
    }))) : /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-read"
    }, /*#__PURE__*/React__default.default.createElement("strong", null, params.contactName || '—'), /*#__PURE__*/React__default.default.createElement("p", null, params.contactPhone ? `+91 ${params.contactPhone}` : '—')), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-section-head"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Shipping address"), editAddress ? /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-order-edit",
      onClick: () => restoreFields(['addressLine1', 'addressLine2', 'addressCity', 'addressState', 'addressPincode', 'addressLandmark'], setEditAddress)
    }, "Cancel") : /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-order-edit",
      onClick: () => setEditAddress(true)
    }, "Edit")), editAddress ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-edit-fields"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-order-field"
    }, "House / flat", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-order-input",
      value: params.addressLine1 || '',
      onChange: event => handleChange('addressLine1', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-order-field"
    }, "Street / area", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-order-input",
      value: params.addressLine2 || '',
      onChange: event => handleChange('addressLine2', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-address-grid"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-order-field"
    }, "City", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-order-input",
      value: params.addressCity || '',
      onChange: event => handleChange('addressCity', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-order-field"
    }, "State", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-order-input",
      value: params.addressState || '',
      onChange: event => handleChange('addressState', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-order-field"
    }, "Pincode", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-order-input",
      inputMode: "numeric",
      value: params.addressPincode || '',
      onChange: event => handleChange('addressPincode', event.target.value)
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-order-field"
    }, "Landmark", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-order-input",
      value: params.addressLandmark || '',
      onChange: event => handleChange('addressLandmark', event.target.value)
    })))) : /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-order-read"
    }, addressText.length ? addressText.map(line => /*#__PURE__*/React__default.default.createElement("p", {
      key: line
    }, line)) : /*#__PURE__*/React__default.default.createElement("p", null, "\u2014")), /*#__PURE__*/React__default.default.createElement("h4", null, "Delivery partner"), /*#__PURE__*/React__default.default.createElement(SearchableSelect, {
      value: params.deliveryPartnerId || '',
      options: partners,
      onChange: value => handleChange('deliveryPartnerId', value),
      placeholder: "Unassigned",
      searchPlaceholder: "Search partners"
    })))));
  };

  const api$2 = new adminjs.ApiClient();
  const EyeIcon = ({
    hidden
  }) => hidden ? /*#__PURE__*/React__default.default.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React__default.default.createElement("path", {
    d: "M3 3l18 18"
  }), /*#__PURE__*/React__default.default.createElement("path", {
    d: "M10.6 10.6A2 2 0 0 0 13.4 13.4"
  }), /*#__PURE__*/React__default.default.createElement("path", {
    d: "M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 9 4.5 10 8a12.8 12.8 0 0 1-2.1 3.6"
  }), /*#__PURE__*/React__default.default.createElement("path", {
    d: "M6.6 6.6C4.3 8 2.7 10.2 2 12c1 3.5 5 8 10 8 1.5 0 2.9-.4 4.1-1"
  })) : /*#__PURE__*/React__default.default.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React__default.default.createElement("path", {
    d: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
  }), /*#__PURE__*/React__default.default.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }));
  function PasswordField$1({
    id,
    label,
    value,
    onChange,
    visible,
    onToggle
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: id,
      required: true
    }, label), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      position: "relative",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      id: id,
      type: visible ? 'text' : 'password',
      value: value,
      onChange: event => onChange(event.target.value),
      autoComplete: "new-password",
      style: {
        width: '100%',
        paddingRight: 42
      }
    }), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      "aria-label": visible ? 'Hide password' : 'Show password',
      onClick: onToggle,
      style: {
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        border: 0,
        background: 'transparent',
        color: '#047857',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        padding: 0
      }
    }, /*#__PURE__*/React__default.default.createElement(EyeIcon, {
      hidden: visible
    }))));
  }
  const ChangePassword = props => {
    const {
      record,
      resource
    } = props;
    const addNotice = adminjs.useNotice();
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');
    const close = () => {
      window.history.back();
    };
    const save = async event => {
      event.preventDefault();
      setError('');
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('New password and confirm password must be the same.');
        return;
      }
      setSaving(true);
      try {
        const response = await api$2.recordAction({
          resourceId: resource.id,
          recordId: record.id,
          actionName: 'changePassword',
          method: 'post',
          data: {
            password,
            confirmPassword
          }
        });
        const notice = response.data?.notice;
        if (notice?.type === 'error') {
          setError(notice.message || 'Could not save password.');
          return;
        }
        if (notice) addNotice(notice);
        const redirectUrl = response.data?.redirectUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
        close();
      } catch (err) {
        setError(err.message || 'Could not save password.');
      } finally {
        setSaving(false);
      }
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 12, 8, 0.62)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 80,
        padding: 16
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: save,
      bg: "white",
      width: ['100%', '420px'],
      p: "xl",
      style: {
        borderRadius: 16,
        boxShadow: '0 24px 70px rgba(2, 44, 34, 0.28)'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "sm"
    }, "Change password"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "xl",
      color: "#64748b"
    }, "Set a new password for ", record?.params?.name || record?.params?.email || 'this user', "."), /*#__PURE__*/React__default.default.createElement(PasswordField$1, {
      id: "new-password",
      label: "New password",
      value: password,
      onChange: setPassword,
      visible: showPassword,
      onToggle: () => setShowPassword(value => !value)
    }), /*#__PURE__*/React__default.default.createElement(PasswordField$1, {
      id: "confirm-password",
      label: "Confirm password",
      value: confirmPassword,
      onChange: setConfirmPassword,
      visible: showConfirm,
      onToggle: () => setShowConfirm(value => !value)
    }), error ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "lg",
      color: "#dc2626"
    }, error) : null, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      justifyContent: "flex-end",
      style: {
        gap: 10
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "button",
      variant: "text",
      onClick: close,
      disabled: saving
    }, "Cancel"), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "submit",
      variant: "contained",
      disabled: saving
    }, saving ? 'Saving…' : 'Save password'))));
  };

  /** ISO 3166-2:IN codes. Kept next to the AdminJS form so the dropdown always has every state. */
  const INDIA_STATES = [{
    code: 'AN',
    name: 'Andaman and Nicobar Islands'
  }, {
    code: 'AP',
    name: 'Andhra Pradesh'
  }, {
    code: 'AR',
    name: 'Arunachal Pradesh'
  }, {
    code: 'AS',
    name: 'Assam'
  }, {
    code: 'BR',
    name: 'Bihar'
  }, {
    code: 'CH',
    name: 'Chandigarh'
  }, {
    code: 'CT',
    name: 'Chhattisgarh'
  }, {
    code: 'DH',
    name: 'Dadra and Nagar Haveli and Daman and Diu'
  }, {
    code: 'DL',
    name: 'Delhi'
  }, {
    code: 'GA',
    name: 'Goa'
  }, {
    code: 'GJ',
    name: 'Gujarat'
  }, {
    code: 'HR',
    name: 'Haryana'
  }, {
    code: 'HP',
    name: 'Himachal Pradesh'
  }, {
    code: 'JK',
    name: 'Jammu and Kashmir'
  }, {
    code: 'JH',
    name: 'Jharkhand'
  }, {
    code: 'KA',
    name: 'Karnataka'
  }, {
    code: 'KL',
    name: 'Kerala'
  }, {
    code: 'LA',
    name: 'Ladakh'
  }, {
    code: 'LD',
    name: 'Lakshadweep'
  }, {
    code: 'MP',
    name: 'Madhya Pradesh'
  }, {
    code: 'MH',
    name: 'Maharashtra'
  }, {
    code: 'MN',
    name: 'Manipur'
  }, {
    code: 'ML',
    name: 'Meghalaya'
  }, {
    code: 'MZ',
    name: 'Mizoram'
  }, {
    code: 'NL',
    name: 'Nagaland'
  }, {
    code: 'OR',
    name: 'Odisha'
  }, {
    code: 'PY',
    name: 'Puducherry'
  }, {
    code: 'PB',
    name: 'Punjab'
  }, {
    code: 'RJ',
    name: 'Rajasthan'
  }, {
    code: 'SK',
    name: 'Sikkim'
  }, {
    code: 'TN',
    name: 'Tamil Nadu'
  }, {
    code: 'TG',
    name: 'Telangana'
  }, {
    code: 'TR',
    name: 'Tripura'
  }, {
    code: 'UP',
    name: 'Uttar Pradesh'
  }, {
    code: 'UT',
    name: 'Uttarakhand'
  }, {
    code: 'WB',
    name: 'West Bengal'
  }];

  const VEHICLE_TYPES = [{
    value: 'Bike',
    label: 'Bike'
  }, {
    value: 'Scooter',
    label: 'Scooter'
  }, {
    value: 'Electric bike',
    label: 'Electric bike'
  }, {
    value: 'Cycle',
    label: 'Cycle'
  }, {
    value: 'Van',
    label: 'Van'
  }, {
    value: 'Other',
    label: 'Other'
  }];
  const STATE_OPTIONS$1 = INDIA_STATES.map(item => ({
    value: item.name,
    label: item.name
  }));
  function FieldError$1({
    error
  }) {
    if (!error?.message) return null;
    return /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, error.message);
  }
  const PartnerEdit = props => {
    const {
      record: initialRecord,
      resource,
      action
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const params = record?.params || {};
    const isNew = action?.name === 'new' || !record?.id;
    const readOnly = action?.name === 'show';
    const hasPassword = Boolean(params.hasPassword);
    const isActive = isNew && (params.isActive === undefined || params.isActive === '') ? true : isFlagOn(params.isActive);
    React.useEffect(() => {
      if (isNew && (params.isActive === undefined || params.isActive === '')) {
        handleChange('isActive', true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNew]);
    const errors = React.useMemo(() => record?.errors || {}, [record?.errors]);
    const setField = (key, value) => handleChange(key, value);
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save partner',
            type: 'error'
          });
          return;
        }
        addNotice({
          message: isNew ? 'Partner saved. A password email will be sent if they do not have a password yet.' : 'Partner updated',
          type: 'success'
        });
      }).catch(() => {
        addNotice({
          message: 'Could not save partner. Please try again.',
          type: 'error'
        });
      });
      return false;
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, isNew ? 'Add delivery partner' : params.name || 'Delivery partner'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "Collect full KYC and contact details. They log in to the Tokriii Partner app with this email after setting a password from the invite mail.")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Account status"), /*#__PURE__*/React__default.default.createElement("p", null, "Inactive partners cannot log in, even if they already set a password."), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isActive,
      disabled: readOnly,
      title: isActive ? 'Active' : 'Inactive',
      hint: isActive ? 'Can sign in to the partner app' : 'Login is blocked until you turn this on',
      onChange: next => setField('isActive', next)
    }), !isNew ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "lg",
      opacity: 0.7
    }, hasPassword ? 'Password is already set.' : 'No password yet — send the invite email after saving.') : null), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Login details"), /*#__PURE__*/React__default.default.createElement("p", null, "Email is used to create and reset the partner password. No SMS is sent."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Email", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "email",
      required: true,
      readOnly: readOnly,
      value: params.email || '',
      onChange: event => setField('email', event.target.value),
      placeholder: "partner@example.com"
    }), errors.email ? /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.email
    }) : /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "Password link is sent to this inbox")), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Mobile number", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      inputMode: "numeric",
      maxLength: 10,
      required: true,
      readOnly: readOnly,
      value: params.phone || '',
      onChange: event => setField('phone', event.target.value.replace(/\D/g, '').slice(0, 10)),
      placeholder: "10-digit number"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.phone
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Personal details"), /*#__PURE__*/React__default.default.createElement("p", null, "Name is shown on orders. Father's name and DOB help with KYC records."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Full name", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      readOnly: readOnly,
      value: params.name || '',
      onChange: event => setField('name', event.target.value),
      placeholder: "Partner full name"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.name
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Father's / guardian name ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      readOnly: readOnly,
      value: params.fatherName || '',
      onChange: event => setField('fatherName', event.target.value),
      placeholder: "As on Aadhaar / documents"
    }))), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Date of birth ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "date",
      readOnly: readOnly,
      value: params.dateOfBirth || '',
      onChange: event => setField('dateOfBirth', event.target.value)
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "KYC documents"), /*#__PURE__*/React__default.default.createElement("p", null, "PAN and Aadhaar are required for partner onboarding."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "PAN number", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      readOnly: readOnly,
      maxLength: 10,
      value: params.panNumber || '',
      onChange: event => setField('panNumber', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)),
      placeholder: "ABCDE1234F"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.panNumber
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Aadhaar number", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      readOnly: readOnly,
      inputMode: "numeric",
      maxLength: 12,
      value: params.aadhaarNumber || '',
      onChange: event => setField('aadhaarNumber', event.target.value.replace(/\D/g, '').slice(0, 12)),
      placeholder: "12-digit Aadhaar"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.aadhaarNumber
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Current address"), /*#__PURE__*/React__default.default.createElement("p", null, "Where the partner currently lives / operates from."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Address line 1", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      readOnly: readOnly,
      value: params.addressLine1 || '',
      onChange: event => setField('addressLine1', event.target.value),
      placeholder: "House / street / area"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.addressLine1
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Address line 2 ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      readOnly: readOnly,
      value: params.addressLine2 || '',
      onChange: event => setField('addressLine2', event.target.value),
      placeholder: "Landmark, colony"
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "City", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      readOnly: readOnly,
      value: params.city || '',
      onChange: event => setField('city', event.target.value),
      placeholder: "City"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.city
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Pincode", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      readOnly: readOnly,
      inputMode: "numeric",
      maxLength: 6,
      value: params.pincode || '',
      onChange: event => setField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6)),
      placeholder: "6-digit pincode"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.pincode
    }))), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "State", /*#__PURE__*/React__default.default.createElement(SearchableSelect, {
      value: params.state || '',
      options: [{
        value: '',
        label: 'Select state'
      }, ...STATE_OPTIONS$1],
      onChange: next => setField('state', next),
      disabled: readOnly,
      placeholder: "Select state",
      searchPlaceholder: "Search states"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.state
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Permanent address ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("textarea", {
      className: "tokri-coupon-input tokri-textarea",
      rows: 3,
      readOnly: readOnly,
      value: params.permanentAddress || '',
      onChange: event => setField('permanentAddress', event.target.value),
      placeholder: "If different from current address"
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Emergency contact"), /*#__PURE__*/React__default.default.createElement("p", null, "Someone we can call if the partner is unreachable."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Contact name ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      readOnly: readOnly,
      value: params.emergencyName || '',
      onChange: event => setField('emergencyName', event.target.value),
      placeholder: "Relative / friend name"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Contact mobile ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      inputMode: "numeric",
      maxLength: 10,
      readOnly: readOnly,
      value: params.emergencyPhone || '',
      onChange: event => setField('emergencyPhone', event.target.value.replace(/\D/g, '').slice(0, 10)),
      placeholder: "10-digit number"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.emergencyPhone
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Vehicle details"), /*#__PURE__*/React__default.default.createElement("p", null, "Used for delivery assignment and support."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Vehicle type ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React__default.default.createElement(LocalSelect, {
      value: params.vehicleType || '',
      options: [{
        value: '',
        label: 'Select vehicle'
      }, ...VEHICLE_TYPES],
      onChange: next => setField('vehicleType', next),
      disabled: readOnly
    }))), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Vehicle number ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      readOnly: readOnly,
      value: params.vehicleNumber || '',
      onChange: event => setField('vehicleNumber', event.target.value.toUpperCase().slice(0, 20)),
      placeholder: "e.g. MH12AB1234"
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Bank details"), /*#__PURE__*/React__default.default.createElement("p", null, "For payouts and reimbursements. Optional for now, but recommended."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Account holder name ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      readOnly: readOnly,
      value: params.accountHolderName || '',
      onChange: event => setField('accountHolderName', event.target.value),
      placeholder: "As per bank account"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Account number ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      readOnly: readOnly,
      value: params.accountNumber || '',
      onChange: event => setField('accountNumber', event.target.value.replace(/\s+/g, '')),
      placeholder: "Bank account number"
    }))), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "IFSC code ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      readOnly: readOnly,
      maxLength: 11,
      value: params.ifscCode || '',
      onChange: event => setField('ifscCode', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)),
      placeholder: "SBIN0001234"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$1, {
      error: errors.ifscCode
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Internal notes"), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Notes ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("textarea", {
      className: "tokri-coupon-input tokri-textarea",
      rows: 4,
      readOnly: readOnly,
      value: params.notes || '',
      onChange: event => setField('notes', event.target.value),
      placeholder: "Shift timing, hub, or anything your team should remember"
    }))), readOnly ? null : /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, isNew ? 'Create partner' : 'Save partner')));
  };

  const api$1 = new adminjs.ApiClient();
  const STATE_OPTIONS = INDIA_STATES.map(item => ({
    value: item.code,
    label: `${item.name} (${item.code})`
  }));
  const PincodeEdit = props => {
    const {
      record: initialRecord,
      resource,
      action
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const params = record?.params || {};
    const isNew = action?.name === 'new' || !record?.id;
    const readOnly = action?.name === 'show';
    const isActive = isNew && (params.isActive === undefined || params.isActive === '') ? true : isFlagOn(params.isActive);
    const morningEnabled = isNew && (params.morningEnabled === undefined || params.morningEnabled === '') ? true : isFlagOn(params.morningEnabled);
    const expressEnabled = isNew && (params.expressEnabled === undefined || params.expressEnabled === '') ? false : isFlagOn(params.expressEnabled);
    const [partners, setPartners] = React.useState([]);
    React.useEffect(() => {
      if (isNew && (params.isActive === undefined || params.isActive === '')) {
        handleChange('isActive', true);
      }
      if (isNew && (params.morningEnabled === undefined || params.morningEnabled === '')) {
        handleChange('morningEnabled', true);
      }
      if (isNew && (params.expressEnabled === undefined || params.expressEnabled === '')) {
        handleChange('expressEnabled', false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNew]);
    React.useEffect(() => {
      let ignore = false;
      api$1.resourceAction({
        resourceId: 'DeliveryPartner',
        actionName: 'list',
        params: {
          perPage: 200
        }
      }).then(response => {
        if (ignore) return;
        const records = response.data?.records || [];
        setPartners(records.map(item => ({
          value: item.id || item.params?.id,
          label: isFlagOn(item.params?.isActive) ? item.params?.name || 'Partner' : `${item.params?.name || 'Partner'} (inactive)`
        })));
      }).catch(() => {
        if (!ignore) setPartners([]);
      });
      return () => {
        ignore = true;
      };
    }, []);
    const errors = React.useMemo(() => record?.errors || {}, [record?.errors]);
    const partnerId = params.partnerId || params.partner || '';
    const setField = (key, value) => handleChange(key, value);
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save pincode',
            type: 'error'
          });
          return;
        }
        addNotice({
          message: isNew ? 'Pincode added' : 'Pincode updated',
          type: 'success'
        });
      }).catch(() => {
        addNotice({
          message: 'Could not save pincode. Please try again.',
          type: 'error'
        });
      });
      return false;
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, isNew ? 'Add serviceable pincode' : `PIN ${params.pincode || ''}`), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: 0,
        color: '#fff',
        opacity: 0.9
      }
    }, "Customers can save an address and check out only when this pincode is active.")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Delivery coverage"), /*#__PURE__*/React__default.default.createElement("p", null, "Turn this off to stop taking orders for this PIN without deleting it."), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isActive,
      disabled: readOnly,
      title: isActive ? 'We deliver here' : 'Not delivering',
      hint: isActive ? 'Address save and checkout are allowed' : 'Customers will see that this PIN is not serviceable',
      onChange: next => setField('isActive', next)
    })), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Delivery options"), /*#__PURE__*/React__default.default.createElement("p", null, "Turn an option off to show it as coming soon at checkout. If both are off, this PIN is not deliverable."), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: morningEnabled,
      disabled: readOnly,
      onLabel: "On",
      offLabel: "Off",
      title: "Morning delivery",
      hint: morningEnabled ? 'Shoppers can choose morning delivery' : 'Shown as coming soon',
      onChange: next => setField('morningEnabled', next)
    }), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        height: 12
      }
    }), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: expressEnabled,
      disabled: readOnly,
      onLabel: "On",
      offLabel: "Off",
      title: "Express delivery",
      hint: expressEnabled ? 'Shoppers can choose Express delivery' : 'Shown as coming soon',
      onChange: next => setField('expressEnabled', next)
    })), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Assigned partner"), /*#__PURE__*/React__default.default.createElement("p", null, "New orders in this PIN are auto-assigned to this partner. You can reassign later on the order."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Delivery partner ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement(SearchableSelect, {
      value: partnerId,
      options: [{
        value: '',
        label: 'No partner assigned'
      }, ...partners],
      disabled: readOnly,
      onChange: next => {
        setField('partnerId', next);
        setField('partner', next);
      },
      placeholder: "Select a partner",
      searchPlaceholder: "Search partners"
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Location"), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Pincode", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      inputMode: "numeric",
      maxLength: 6,
      required: true,
      readOnly: readOnly || !isNew,
      value: params.pincode || '',
      onChange: event => setField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6)),
      placeholder: "6-digit PIN"
    }), errors.pincode ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, errors.pincode.message) : /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "India PIN code, 6 digits")), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Area name ", /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-optional"
    }, "(optional)"), /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      readOnly: readOnly,
      value: params.areaLabel || '',
      onChange: event => setField('areaLabel', event.target.value),
      placeholder: "Andheri West, Bandra, \u2026"
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "City", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      readOnly: readOnly,
      value: params.city || '',
      onChange: event => setField('city', event.target.value),
      placeholder: "Mumbai"
    }), errors.city ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, errors.city.message) : null), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "State", /*#__PURE__*/React__default.default.createElement(SearchableSelect, {
      value: params.stateCode || params.state || '',
      options: [{
        value: '',
        label: 'Select state'
      }, ...STATE_OPTIONS],
      disabled: readOnly,
      onChange: next => {
        setField('stateCode', next);
        setField('state', next);
      },
      placeholder: "Select state",
      searchPlaceholder: "Search states"
    }), errors.state || errors.stateCode ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, (errors.state || errors.stateCode).message) : /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "All Indian states and union territories")))), readOnly ? null : /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, isNew ? 'Add pincode' : 'Save pincode')));
  };

  const api = new adminjs.ApiClient();
  const StatusToggle = props => {
    const {
      record,
      resource,
      property,
      where,
      onChange
    } = props;
    const addNotice = adminjs.useNotice();
    const field = property?.path || 'isActive';
    const actionName = property?.custom?.actionName || 'toggleActive';
    const onLabel = property?.custom?.onLabel || 'Active';
    const offLabel = property?.custom?.offLabel || 'Inactive';
    const raw = record?.params?.[field];
    const [checked, setChecked] = React.useState(isFlagOn(raw));
    const [busy, setBusy] = React.useState(false);
    React.useEffect(() => {
      setChecked(isFlagOn(raw));
    }, [raw, record?.id]);
    const persist = async next => {
      if (!record?.id) return;
      setBusy(true);
      try {
        const response = await api.recordAction({
          resourceId: resource.id,
          recordId: record.id,
          actionName,
          method: 'post',
          data: {
            [field]: next
          }
        });
        const saved = response.data?.record?.params?.[field];
        setChecked(saved === undefined ? next : isFlagOn(saved));
        const notice = response.data?.notice;
        addNotice({
          message: notice?.message || (next ? `Marked ${onLabel.toLowerCase()}` : `Marked ${offLabel.toLowerCase()}`),
          type: notice?.type || 'success'
        });
      } catch (error) {
        addNotice({
          message: error.message || 'Could not update status.',
          type: 'error'
        });
      } finally {
        setBusy(false);
      }
    };
    const handleChange = next => {
      if (where === 'edit' && typeof onChange === 'function') {
        setChecked(next);
        onChange(field, next);
        return;
      }
      persist(next);
    };
    return /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      compact: where !== 'edit',
      checked: checked,
      disabled: busy,
      onLabel: onLabel,
      offLabel: offLabel,
      title: where === 'edit' ? checked ? onLabel : offLabel : undefined,
      hint: where === 'edit' ? property?.description : undefined,
      onChange: handleChange
    });
  };

  function pad(value) {
    return String(value).padStart(2, '0');
  }
  function toDateInput(value) {
    if (!value) return '';
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  function formatWhen$1(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }
  function parseAddresses(params) {
    const raw = params.addresses;
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (raw && typeof raw === 'object') return [raw];
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
        if (parsed && typeof parsed === 'object') return [parsed];
      } catch {
        // flattened AdminJS params below
      }
    }
    const grouped = {};
    Object.entries(params).forEach(([key, value]) => {
      const match = key.match(/^addresses\.(\d+)\.(.+)$/);
      if (!match || value === undefined || value === null || value === '') return;
      const [, index, field] = match;
      grouped[index] = grouped[index] || {};
      grouped[index][field] = value;
    });
    return Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map(key => grouped[key]);
  }
  function addressLines(address) {
    return [address.line1, address.line2, [address.city, address.state, address.pincode].filter(Boolean).join(', '), address.landmark ? `Landmark: ${address.landmark}` : ''].filter(Boolean);
  }
  const CustomerEdit = props => {
    const {
      record: initialRecord,
      resource
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const params = record?.params || {};
    const isActive = params.isActive === undefined || params.isActive === '' ? true : isFlagOn(params.isActive);
    const addresses = React.useMemo(() => parseAddresses(params), [params]);
    const errors = React.useMemo(() => record?.errors || {}, [record?.errors]);
    const setField = (key, value) => handleChange(key, value);
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save customer',
            type: 'error'
          });
          return;
        }
        addNotice({
          message: 'Customer updated',
          type: 'success'
        });
      }).catch(() => {
        addNotice({
          message: 'Could not save customer. Please try again.',
          type: 'error'
        });
      });
      return false;
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, params.name || 'Customer'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "+91 ", params.phone || '—', " \xB7 joined ", formatWhen$1(params.createdAt))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Account status"), /*#__PURE__*/React__default.default.createElement("p", null, "Inactive customers cannot sign in with this mobile number."), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isActive,
      title: isActive ? 'Active' : 'Inactive',
      hint: isActive ? 'Can log in on the website and app' : 'Login is blocked until you turn this on',
      onChange: next => setField('isActive', next)
    })), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Profile"), /*#__PURE__*/React__default.default.createElement("p", null, "Phone comes from OTP login and stays as the customer\u2019s login id."), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Name", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.name || '',
      onChange: event => setField('name', event.target.value),
      placeholder: "Customer name"
    }), errors.name ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, errors.name.message) : null), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Mobile", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.phone || '',
      readOnly: true
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Date of birth", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "date",
      value: toDateInput(params.dateOfBirth),
      onChange: event => setField('dateOfBirth', event.target.value)
    }), errors.dateOfBirth ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, errors.dateOfBirth.message) : null)))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Saved addresses"), /*#__PURE__*/React__default.default.createElement("p", null, addresses.length ? `${addresses.length} address${addresses.length === 1 ? '' : 'es'} saved in the customer account.` : 'This customer has not saved a delivery address yet.'), addresses.length ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-address-grid"
    }, addresses.map((address, index) => /*#__PURE__*/React__default.default.createElement("article", {
      key: address.id || `${address.pincode}-${index}`,
      className: "tokri-address-card"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-address-top"
    }, /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-address-label"
    }, address.label || 'Address'), address.pincode ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-address-pin"
    }, address.pincode) : null), /*#__PURE__*/React__default.default.createElement("strong", null, address.name || params.name || 'Customer'), address.phone ? /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-address-phone"
    }, "+91 ", address.phone) : null, addressLines(address).map(line => /*#__PURE__*/React__default.default.createElement("p", {
      key: line
    }, line))))) : null), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, "Save customer")));
  };

  const ROLES = [{
    value: 'staff',
    title: 'Staff',
    hint: 'Access only the areas you tick below'
  }, {
    value: 'admin',
    title: 'Admin',
    hint: 'Full access to the CMS'
  }, {
    value: 'super_admin',
    title: 'Super admin',
    hint: 'Full access, same as admin'
  }];
  const PERMISSIONS = [{
    key: 'manageProducts',
    label: 'Products',
    hint: 'Add and edit products'
  }, {
    key: 'manageCatalog',
    label: 'Catalog',
    hint: 'Categories and collections'
  }, {
    key: 'manageMedia',
    label: 'Media',
    hint: 'Upload and replace images'
  }, {
    key: 'manageOrders',
    label: 'Orders',
    hint: 'View and update orders'
  }, {
    key: 'manageCoupons',
    label: 'Coupons',
    hint: 'Create discount codes'
  }, {
    key: 'manageContent',
    label: 'Content',
    hint: 'Pages and reviews'
  }, {
    key: 'manageSettings',
    label: 'Settings',
    hint: 'Store and homepage settings'
  }, {
    key: 'manageUsers',
    label: 'Team',
    hint: 'Create users and change access'
  }];
  function FieldError({
    error
  }) {
    if (!error?.message) return null;
    return /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-error"
    }, error.message);
  }
  function PasswordField({
    label,
    value,
    onChange,
    error,
    placeholder
  }) {
    const [visible, setVisible] = React.useState(false);
    return /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, label, /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-password-wrap"
    }, /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: visible ? 'text' : 'password',
      value: value,
      onChange: event => onChange(event.target.value),
      placeholder: placeholder,
      autoComplete: "new-password"
    }), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-password-toggle",
      "aria-label": visible ? 'Hide password' : 'Show password',
      onClick: () => setVisible(current => !current)
    }, visible ? 'Hide' : 'Show')), /*#__PURE__*/React__default.default.createElement(FieldError, {
      error: error
    }));
  }
  const TeamEdit = props => {
    const {
      record: initialRecord,
      resource,
      action
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const params = record?.params || {};
    const isNew = action?.name === 'new' || !record?.id;
    const role = params.role || 'staff';
    const isActive = isNew && (params.isActive === undefined || params.isActive === '') ? true : isFlagOn(params.isActive);
    React.useEffect(() => {
      if (isNew && (params.isActive === undefined || params.isActive === '')) {
        handleChange('isActive', true);
      }
      if (isNew && !params.role) handleChange('role', 'staff');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNew]);
    const errors = React.useMemo(() => record?.errors || {}, [record?.errors]);
    const setField = (key, value) => handleChange(key, value);
    const permissionOn = key => isFlagOn(params[`permissions.${key}`]);
    const submit = event => {
      event.preventDefault();
      handleSubmit().then(response => {
        const notice = response?.data?.notice;
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save team member',
            type: 'error'
          });
          return;
        }
        addNotice({
          message: isNew ? 'Team member created' : 'Team member updated',
          type: 'success'
        });
      }).catch(() => {
        addNotice({
          message: 'Could not save team member. Please try again.',
          type: 'error'
        });
      });
      return false;
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: submit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, isNew ? 'Add team member' : params.name || 'Team member'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "They sign in to Tokriii CMS with username or email. Inactive users cannot log in.")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Account status"), /*#__PURE__*/React__default.default.createElement("p", null, "Turn this off to block CMS login without deleting the account."), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isActive,
      title: isActive ? 'Active' : 'Inactive',
      hint: isActive ? 'Can sign in to the admin panel' : 'Login is blocked until you turn this on',
      onChange: next => setField('isActive', next)
    })), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Role"), /*#__PURE__*/React__default.default.createElement("p", null, "Admin and super admin get full access. Staff only gets the permissions you enable."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-choice-row"
    }, ROLES.map(item => /*#__PURE__*/React__default.default.createElement(FlagCard, {
      key: item.value,
      selected: role === item.value,
      title: item.title,
      hint: item.hint,
      onClick: () => setField('role', item.value)
    }))))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Login details"), /*#__PURE__*/React__default.default.createElement("p", null, "Username or email can be used on the CMS login screen."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Full name", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      value: params.name || '',
      onChange: event => setField('name', event.target.value),
      placeholder: "Team member name"
    }), /*#__PURE__*/React__default.default.createElement(FieldError, {
      error: errors.name
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Username", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      value: params.username || '',
      onChange: event => setField('username', event.target.value.trim()),
      placeholder: "e.g. ravi.cms"
    }), /*#__PURE__*/React__default.default.createElement(FieldError, {
      error: errors.username
    }))), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Email", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "email",
      required: true,
      value: params.email || '',
      onChange: event => setField('email', event.target.value),
      placeholder: "name@tokriii.com"
    }), /*#__PURE__*/React__default.default.createElement(FieldError, {
      error: errors.email
    })), isNew ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-two"
    }, /*#__PURE__*/React__default.default.createElement(PasswordField, {
      label: "Password",
      value: params.password || '',
      onChange: value => setField('password', value),
      error: errors.password,
      placeholder: "At least 6 characters"
    }), /*#__PURE__*/React__default.default.createElement(PasswordField, {
      label: "Confirm password",
      value: params.confirmPassword || '',
      onChange: value => setField('confirmPassword', value),
      error: errors.confirmPassword,
      placeholder: "Type password again"
    })) : /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "Use Change password from the team list to reset login.")), role === 'staff' ? /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Permissions"), /*#__PURE__*/React__default.default.createElement("p", null, "Only used for staff. Toggle what this person can open in the CMS."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-perm-list"
    }, PERMISSIONS.map(item => /*#__PURE__*/React__default.default.createElement("div", {
      key: item.key,
      className: "tokri-perm-row"
    }, /*#__PURE__*/React__default.default.createElement("span", null, /*#__PURE__*/React__default.default.createElement("strong", null, item.label), /*#__PURE__*/React__default.default.createElement("span", null, item.hint)), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      compact: true,
      checked: permissionOn(item.key),
      onChange: next => setField(`permissions.${item.key}`, next)
    }))))) : null, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, isNew ? 'Create team member' : 'Save team member')));
  };

  const FOLDERS = ['all', 'products', 'categories', 'reviews', 'pages', 'general'];
  const withoutTrailingSlash = value => String(value || '').replace(/\/+$/, '');
  function formatSize(bytes) {
    const size = Number(bytes) || 0;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  function formatWhen(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  function resolveUrl(path, appUrl) {
    if (!path) return '';
    if (/^(https?:|data:|blob:)/.test(path)) return path;
    return `${withoutTrailingSlash(appUrl || window.location.origin)}${path}`;
  }
  const MediaLibrary = props => {
    const {
      resource,
      setTag
    } = props;
    const addNotice = adminjs.useNotice();
    const {
      storeParams,
      filters
    } = adminjs.useQueryParams();
    const {
      records,
      loading,
      fetchData,
      total,
      perPage
    } = adminjs.useRecords(resource.id);
    const fileRef = React.useRef(null);
    const [uploading, setUploading] = React.useState(false);
    const [busyId, setBusyId] = React.useState('');
    const folder = String(filters?.folder || 'all');
    const custom = resource?.options?.custom || {};
    const apiBaseUrl = withoutTrailingSlash(custom.apiBaseUrl || '/api/v1');
    const appUrl = custom.appUrl || window.location.origin;
    const uploadFolder = folder === 'all' ? 'general' : folder;
    React.useEffect(() => {
      if (setTag) setTag(String(total || 0));
    }, [total, setTag]);
    React.useEffect(() => {
      if (Number(perPage) < 50) storeParams({
        perPage: '50'
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const items = React.useMemo(() => (records || []).map(item => ({
      id: item.id,
      name: item.params?.originalName || item.params?.filename || 'Image',
      folder: item.params?.folder || 'general',
      path: item.params?.path || '',
      size: item.params?.size,
      createdAt: item.params?.createdAt,
      url: resolveUrl(item.params?.path, appUrl)
    })), [appUrl, records]);
    const setFolder = next => {
      storeParams({
        page: '1',
        filters: next === 'all' ? {} : {
          folder: next
        }
      });
    };
    const uploadFiles = async files => {
      const list = [...files].filter(file => file.type.startsWith('image/'));
      if (!list.length) return;
      setUploading(true);
      try {
        for (const file of list) {
          const formData = new FormData();
          formData.append('folder', uploadFolder);
          formData.append('file', file);
          const response = await fetch(`${apiBaseUrl}/media/upload`, {
            method: 'POST',
            body: formData
          });
          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Could not upload ${file.name}`);
          }
        }
        addNotice({
          message: list.length === 1 ? 'Image uploaded' : `${list.length} images uploaded`,
          type: 'success'
        });
        fetchData();
      } catch (error) {
        addNotice({
          message: error.message || 'Upload failed',
          type: 'error'
        });
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    const copyPath = async path => {
      try {
        await navigator.clipboard.writeText(path);
        addNotice({
          message: 'File path copied',
          type: 'success'
        });
      } catch {
        addNotice({
          message: path,
          type: 'info'
        });
      }
    };
    const remove = async (id, name) => {
      if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
      setBusyId(id);
      try {
        const response = await fetch(`${apiBaseUrl}/media/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || 'Could not delete image');
        }
        addNotice({
          message: data.message || 'Image deleted',
          type: 'success'
        });
        fetchData();
      } catch (error) {
        addNotice({
          message: error.message || 'Could not delete image',
          type: 'error'
        });
      } finally {
        setBusyId('');
      }
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-hero"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      color: "white"
    }, "Media library"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, "Upload images used on products, categories, reviews, and the homepage. Files stay on this server.")), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Upload"), /*#__PURE__*/React__default.default.createElement("p", null, "Files go into the ", /*#__PURE__*/React__default.default.createElement("strong", null, uploadFolder), " folder", folder === 'all' ? ' (select a folder below to change this).' : '.'), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-upload-drop",
      onDragOver: event => event.preventDefault(),
      onDrop: event => {
        event.preventDefault();
        uploadFiles(event.dataTransfer.files);
      }
    }, /*#__PURE__*/React__default.default.createElement("span", null, uploading ? 'Uploading…' : 'Click or drop images here'), /*#__PURE__*/React__default.default.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: "image/*",
      multiple: true,
      disabled: uploading,
      onChange: event => uploadFiles(event.target.files)
    })), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-field-hint"
    }, "JPG, PNG, GIF, or WebP up to 5MB each")), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Library"), /*#__PURE__*/React__default.default.createElement("p", null, total || 0, " file", (total || 0) === 1 ? '' : 's', folder !== 'all' ? ` in ${folder}` : '', "."), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-folder-chips"
    }, FOLDERS.map(item => /*#__PURE__*/React__default.default.createElement("button", {
      key: item,
      type: "button",
      className: `tokri-folder-chip${folder === item ? ' is-on' : ''}`,
      onClick: () => setFolder(item)
    }, item === 'all' ? 'All folders' : item))), loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "xl"
    }, "Loading images\u2026") : items.length ? /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-media-grid"
    }, items.map(item => /*#__PURE__*/React__default.default.createElement("article", {
      key: item.id,
      className: "tokri-media-card"
    }, /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-media-thumb"
    }, item.url ? /*#__PURE__*/React__default.default.createElement("img", {
      src: item.url,
      alt: item.name
    }) : /*#__PURE__*/React__default.default.createElement("span", null, "No preview")), /*#__PURE__*/React__default.default.createElement("strong", {
      title: item.name
    }, item.name), /*#__PURE__*/React__default.default.createElement("span", null, item.folder, " \xB7 ", formatSize(item.size), item.createdAt ? ` · ${formatWhen(item.createdAt)}` : ''), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-media-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      size: "sm",
      variant: "text",
      onClick: () => copyPath(item.path)
    }, "Copy path"), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      size: "sm",
      variant: "danger",
      disabled: busyId === item.id,
      onClick: () => remove(item.id, item.name)
    }, busyId === item.id ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, "Delete"))))) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "xl"
    }, "No images in this folder yet.")));
  };

  const TaxEdit = props => {
    const {
      record: initialRecord,
      resource
    } = props;
    const {
      record,
      handleChange,
      submit: handleSubmit,
      loading
    } = adminjs.useRecord(initialRecord, resource.id);
    const addNotice = adminjs.useNotice();
    const params = record?.params || {};
    const setField = (key, value) => handleChange(key, value);
    const isTaxableBool = isFlagOn(params.isTaxable);
    const handleTaxableToggle = value => {
      setField('isTaxable', value);
      if (!value) {
        setField('gstRate', 0);
      } else if (Number(params.gstRate || 0) === 0) {
        setField('gstRate', 5);
      }
    };
    const onSubmit = async event => {
      event?.preventDefault?.();
      try {
        await handleSubmit();
        addNotice({
          message: 'Tax configuration updated successfully.',
          type: 'success'
        });
      } catch (error) {
        addNotice({
          message: error.message || 'Failed to update tax configuration',
          type: 'error'
        });
      }
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: onSubmit,
      className: "tokri-coupon-form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-head"
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement(designSystem.H3, null, params.productName || 'Edit Product Tax'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      opacity: 0.7
    }, "Configure HSN code and GST percentage for this product."))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Product details"), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Product name", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.productName || '',
      disabled: true,
      style: {
        opacity: 0.7,
        cursor: 'not-allowed'
      }
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Category", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.categoryName || 'General',
      disabled: true,
      style: {
        opacity: 0.7,
        cursor: 'not-allowed'
      }
    })))), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Taxability status"), /*#__PURE__*/React__default.default.createElement(StatusSwitch, {
      checked: isTaxableBool,
      title: "Taxable",
      hint: isTaxableBool ? 'GST will be charged at checkout' : '0% GST (fresh fruits / exempt)',
      onLabel: "Yes",
      offLabel: "No",
      onChange: handleTaxableToggle
    })), /*#__PURE__*/React__default.default.createElement("section", {
      className: "tokri-coupon-card"
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "GST & HSN details"), /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-coupon-grid"
    }, /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "HSN code", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      value: params.hsnCode || '0808',
      onChange: event => setField('hsnCode', event.target.value),
      placeholder: "e.g. 0802 for dry fruits, 0808 for fresh fruits"
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "GST % rate", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      type: "number",
      step: "0.01",
      min: "0",
      max: "100",
      value: params.gstRate ?? (isTaxableBool ? 5 : 0),
      onChange: event => setField('gstRate', Number(event.target.value) || 0),
      placeholder: "e.g. 5 for dry fruits"
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "sm",
      opacity: 0.7,
      fontSize: "12px"
    }, isTaxableBool ? `At checkout, intra-state orders split into ${(Number(params.gstRate || 5) / 2).toFixed(1)}% CGST + ${(Number(params.gstRate || 5) / 2).toFixed(1)}% SGST; inter-state orders charge ${Number(params.gstRate || 5)}% IGST.` : 'Product is exempt/non-taxable (0% GST).')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      className: "tokri-coupon-actions"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "contained",
      type: "submit",
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Loader",
      spin: true
    }) : null, "Save tax settings")));
  };

  function copyText(value) {
    if (!value || !navigator.clipboard?.writeText) return Promise.reject();
    return navigator.clipboard.writeText(value);
  }
  function RazorpayPaymentId({
    record
  }) {
    const paymentId = String(record?.params?.razorpayPaymentId || '').trim();
    const paid = record?.params?.paymentStatus === 'paid';
    const [copied, setCopied] = React.useState(false);
    if (!paid || !paymentId) {
      return /*#__PURE__*/React__default.default.createElement("span", {
        className: "tokri-rzp-empty"
      }, "\u2014");
    }
    const handleCopy = event => {
      event.preventDefault();
      event.stopPropagation();
      copyText(paymentId).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }).catch(() => {});
    };
    return /*#__PURE__*/React__default.default.createElement("div", {
      className: "tokri-rzp-cell",
      onClick: event => event.stopPropagation()
    }, /*#__PURE__*/React__default.default.createElement("a", {
      className: "tokri-rzp-id",
      href: `https://dashboard.razorpay.com/app/payments/${encodeURIComponent(paymentId)}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Open this payment in Razorpay"
    }, paymentId), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      className: "tokri-rzp-copy",
      onClick: handleCopy
    }, copied ? 'Copied' : 'Copy'));
  }

  const REMEMBERED_LOGIN_KEY = 'tokri_admin_login';
  const Login = () => {
    const {
      action,
      errorMessage
    } = window.__APP_STATE__ || {};
    const {
      translateMessage
    } = adminjs.useTranslation();
    const adminRoot = action?.replace(/\/login$/, '') || '';
    const forgotPasswordUrl = `${adminRoot}/forgot-password`;
    const [identifier, setIdentifier] = React.useState('');
    const [rememberLogin, setRememberLogin] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    React.useEffect(() => {
      const rememberedLogin = window.localStorage.getItem(REMEMBERED_LOGIN_KEY);
      if (rememberedLogin) {
        setIdentifier(rememberedLogin);
        setRememberLogin(true);
      }
    }, []);
    const handleSubmit = event => {
      const form = event.currentTarget;
      const emailInput = form.elements.namedItem('email');
      const value = (emailInput && 'value' in emailInput ? String(emailInput.value) : identifier).trim();
      if (emailInput && 'value' in emailInput) {
        emailInput.value = value;
      }
      if (rememberLogin && value) {
        window.localStorage.setItem(REMEMBERED_LOGIN_KEY, value);
      } else {
        window.localStorage.removeItem(REMEMBERED_LOGIN_KEY);
      }
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      bg: "linear-gradient(135deg, #022c22, #047857)",
      p: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      width: ['100%', '440px'],
      borderRadius: "18px",
      boxShadow: "0 24px 70px rgba(2, 44, 34, 0.35)",
      p: "x3"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      color: "#022c22",
      mb: "sm"
    }, "Tokriii CMS"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "#64748b",
      mb: "xl"
    }, "Sign in with your admin email or username to manage products, orders, and content."), errorMessage ? /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      mb: "lg",
      message: errorMessage.split(' ').length > 1 ? errorMessage : translateMessage(errorMessage),
      variant: "danger"
    }) : null, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      action: action,
      method: "POST",
      onSubmit: handleSubmit
    }, /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Email or username"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "email",
      placeholder: "Enter email or username",
      autoComplete: "username",
      defaultValue: identifier,
      key: identifier || 'login-email'
    })), /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      position: "relative",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: showPassword ? 'text' : 'password',
      name: "password",
      placeholder: "Enter password",
      autoComplete: "current-password",
      style: {
        width: '100%',
        paddingRight: 42
      }
    }), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      "aria-label": showPassword ? 'Hide password' : 'Show password',
      onClick: () => setShowPassword(value => !value),
      style: {
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        border: 0,
        background: 'transparent',
        color: '#047857',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        padding: 0
      }
    }, showPassword ? /*#__PURE__*/React__default.default.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React__default.default.createElement("path", {
      d: "M3 3l18 18"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M10.6 10.6A2 2 0 0 0 13.4 13.4"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 9 4.5 10 8a12.8 12.8 0 0 1-2.1 3.6"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M6.6 6.6C4.3 8 2.7 10.2 2 12c1 3.5 5 8 10 8 1.5 0 2.9-.4 4.1-1"
    })) : /*#__PURE__*/React__default.default.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React__default.default.createElement("path", {
      d: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
    }), /*#__PURE__*/React__default.default.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      alignItems: "center",
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement("input", {
      id: "remember-login",
      type: "checkbox",
      checked: rememberLogin,
      onChange: event => setRememberLogin(event.target.checked),
      style: {
        marginRight: 8
      }
    }), /*#__PURE__*/React__default.default.createElement("label", {
      htmlFor: "remember-login",
      style: {
        color: '#475569',
        fontSize: 14
      }
    }, "Remember my email or username on this device")), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "submit",
      variant: "contained",
      width: "100%",
      mt: "lg"
    }, "Sign in")), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "xl",
      textAlign: "center"
    }, /*#__PURE__*/React__default.default.createElement("a", {
      href: forgotPasswordUrl,
      style: {
        color: '#047857',
        fontWeight: 700
      }
    }, "Forgot password?"))));
  };

  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }

  function adminRootPath() {
    const match = window.location.pathname.match(/^(.*)\/resources\//);
    return match ? match[1] : window.location.pathname.replace(/\/$/, '');
  }
  function catalogConfig(resourceId) {
    if (resourceId === 'Category') {
      return {
        exportUrl: 'categories/export',
        importUrl: 'categories/import'
      };
    }
    if (resourceId === 'Product') {
      return {
        exportUrl: 'products/export',
        importUrl: 'products/import'
      };
    }
    return null;
  }
  function CatalogListHeaderActions({
    resource,
    onImported
  }) {
    const {
      translateButton,
      translateAction
    } = adminjs.useTranslation();
    const {
      toggleFilter,
      filtersCount
    } = adminjs.useFilterDrawer();
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(null);
    const fileRef = React.useRef(null);
    const resourceId = resource.id;
    const config = catalogConfig(resourceId);
    const root = adminRootPath();
    const handleImport = async event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file || !config) return;
      setLoading(true);
      setMessage(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${root}/catalog/${config.importUrl}`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || 'Import failed.');
        }
        const errorCount = data.errors?.length || 0;
        setMessage({
          type: errorCount ? 'info' : 'success',
          text: errorCount > 0 ? `Import finished. ${data.created} added, ${data.updated} updated. ${errorCount} row(s) could not be imported. Existing rows are matched by slug.` : `Import finished. ${data.created} added, ${data.updated} updated. Existing rows are matched by slug — keep slug the same to update price.`
        });
        onImported?.();
      } catch (error) {
        setMessage({
          type: 'danger',
          text: error.message || 'Import failed.'
        });
      } finally {
        setLoading(false);
      }
    };
    const buttons = React.useMemo(() => {
      if (!config) return [];
      const items = [{
        label: 'Export CSV',
        variant: 'text',
        href: `${root}/catalog/${config.exportUrl}`
      }, {
        label: 'Export Excel',
        variant: 'text',
        href: `${root}/catalog/${config.exportUrl}?format=xlsx`
      }, {
        label: loading ? 'Importing...' : 'Import',
        variant: 'text',
        onClick: loading ? undefined : () => fileRef.current?.click()
      }];
      const newAction = resource.resourceActions?.find(action => action.name === 'new');
      if (newAction) {
        items.push({
          icon: newAction.icon,
          label: translateAction(newAction.label, resourceId),
          variant: newAction.variant,
          href: `${root}/resources/${resourceId}/actions/new`,
          'data-css': `${resourceId}-new-button`
        });
      }
      const filterKey = filtersCount > 0 ? 'filterActive' : 'filter';
      items.push({
        label: translateButton(filterKey, resourceId, {
          count: filtersCount
        }),
        onClick: toggleFilter,
        icon: 'Filter',
        'data-css': `${resourceId}-filter-button`
      });
      return items;
    }, [config, root, loading, resource.resourceActions, resourceId, translateAction, translateButton, filtersCount, toggleFilter]);
    if (!config) return null;
    return /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "xl",
      mb: "default",
      display: "flex",
      justifyContent: "flex-end",
      flexShrink: 0,
      px: ['default', 0],
      style: {
        marginTop: '-52px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.ButtonGroup, {
      buttons: buttons
    }), /*#__PURE__*/React__default.default.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: ".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      style: {
        display: 'none'
      },
      onChange: handleImport
    })), message && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "default",
      px: ['default', 0]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      variant: message.type,
      message: message.text,
      onCloseClick: () => setMessage(null)
    })));
  }

  const CATALOG_RESOURCES = new Set(['Product', 'Category']);
  function ActionHeader(props) {
    const {
      OriginalComponent,
      action,
      resource
    } = props;
    const BaseHeader = OriginalComponent || adminjs.OriginalActionHeader;
    const isCatalogList = action?.name === 'list' && CATALOG_RESOURCES.has(resource?.id);
    if (!isCatalogList) {
      return /*#__PURE__*/React__default.default.createElement(BaseHeader, props);
    }
    const {
      OriginalComponent: _ignored,
      ...headerProps
    } = props;
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(BaseHeader, _extends({}, headerProps, {
      omitActions: true
    })), /*#__PURE__*/React__default.default.createElement(CatalogListHeaderActions, {
      resource: resource,
      onImported: props.actionPerformed
    }));
  }

  const DEFAULT_OPTIONS = {
    plugins: ['code', 'link', 'lists', 'image', 'table', 'autolink', 'preview', 'searchreplace', 'wordcount', 'media', 'codesample'],
    toolbar: 'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table codesample | code | removeformat',
    height: 400
  };
  const RichtextEdit = props => {
    const {
      property,
      record,
      onChange
    } = props;
    const value = record.params?.[property.path] ?? '';
    const error = record.errors?.[property.path];
    const handleUpdate = React.useCallback(newValue => {
      onChange(property.path, newValue);
    }, [onChange, property.path]);
    const options = {
      ...DEFAULT_OPTIONS,
      ...(property.props || {})
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      error: Boolean(error)
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: property.isRequired
    }, property.label), /*#__PURE__*/React__default.default.createElement(designSystem.TinyMCE, {
      value: value,
      onChange: handleUpdate,
      options: options
    }), /*#__PURE__*/React__default.default.createElement(designSystem.FormMessage, null, error?.message));
  };
  var DefaultRichtextEditProperty = /*#__PURE__*/React.memo(RichtextEdit);

  function adminRoot(pathname) {
    const cut = pathname.search(/\/(resources|pages)(\/|$)/);
    const root = cut === -1 ? pathname : pathname.slice(0, cut);
    return root.replace(/\/$/, '') || '/';
  }
  function SidebarResourceSection(props) {
    const Original = props.OriginalComponent;
    const location = reactRouter.useLocation();
    const navigate = reactRouter.useNavigate();
    const href = adminRoot(location.pathname);
    const selected = location.pathname.replace(/\/$/, '') === href.replace(/\/$/, '') || location.pathname === `${href}/`;
    return /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement("a", {
      className: `tokri-sidebar-dashboard${selected ? ' is-active' : ''}`,
      href: href,
      onClick: event => {
        event.preventDefault();
        navigate(href);
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Home"
    }), /*#__PURE__*/React__default.default.createElement("span", null, "Dashboard")), Original ? /*#__PURE__*/React__default.default.createElement(Original, {
      resources: props.resources
    }) : null);
  }

  const getResourceElementCss$1 = (resourceId, suffix) => `${resourceId}-${suffix}`;

  /**
   * AdminJS marks the header checkbox checked when ANY row is selected.
   * Override so: none = unchecked, some = indeterminate, all = checked.
   */
  function RecordsTable(props) {
    const {
      resource,
      records,
      actionPerformed,
      sortBy,
      direction,
      isLoading,
      onSelect,
      selectedRecords,
      onSelectAll
    } = props;
    if (!records.length) {
      if (isLoading) return /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null);
      return /*#__PURE__*/React__default.default.createElement(adminjs.NoRecords, {
        resource: resource
      });
    }
    const selectedCount = selectedRecords ? records.filter(record => selectedRecords.some(selected => selected.id === record.id)).length : 0;
    const selectedAll = selectedCount > 0 && selectedCount === records.length;
    const indeterminate = selectedCount > 0 && selectedCount < records.length;
    const recordsHaveBulkAction = !!records.find(record => record.bulkActions.length);
    const contentTag = getResourceElementCss$1(resource.id, 'table');
    const selectedTag = getResourceElementCss$1(resource.id, 'table-selected-records');
    const bodyTag = getResourceElementCss$1(resource.id, 'table-body');
    return /*#__PURE__*/React__default.default.createElement(designSystem.Table, {
      "data-css": contentTag
    }, /*#__PURE__*/React__default.default.createElement(adminjs.SelectedRecords, {
      resource: resource,
      selectedRecords: selectedRecords,
      "data-css": selectedTag
    }), /*#__PURE__*/React__default.default.createElement(adminjs.RecordsTableHeader, {
      properties: resource.listProperties,
      titleProperty: resource.titleProperty,
      direction: direction,
      sortBy: sortBy,
      onSelectAll: recordsHaveBulkAction ? onSelectAll : undefined,
      selectedAll: selectedAll,
      indeterminate: indeterminate
    }), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, {
      "data-css": bodyTag
    }, records.map(record => /*#__PURE__*/React__default.default.createElement(adminjs.RecordInList, {
      record: record,
      resource: resource,
      key: record.id,
      actionPerformed: actionPerformed,
      isLoading: isLoading,
      onSelect: onSelect,
      isSelected: selectedRecords && !!selectedRecords.find(selected => selected.id === record.id)
    }))));
  }

  const getResourceElementCss = (resourceId, suffix) => `${resourceId}-${suffix}`;
  const display = isTitle => [isTitle ? 'table-cell' : 'none', isTitle ? 'table-cell' : 'none', 'table-cell', 'table-cell'];
  function SelectAllCheckBox({
    checked,
    indeterminate,
    onChange
  }) {
    const inputRef = React.useRef(null);
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate, checked]);
    return /*#__PURE__*/React__default.default.createElement("label", {
      className: `tokri-select-all${indeterminate ? ' is-indeterminate' : ''}${checked ? ' is-checked' : ''}`,
      style: {
        marginLeft: 5
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      ref: inputRef,
      type: "checkbox",
      checked: Boolean(checked),
      onChange: onChange,
      "aria-checked": indeterminate ? 'mixed' : checked ? 'true' : 'false'
    }), /*#__PURE__*/React__default.default.createElement("span", {
      className: "tokri-select-all-box",
      "aria-hidden": "true"
    }, indeterminate ? /*#__PURE__*/React__default.default.createElement("svg", {
      viewBox: "0 0 24 24",
      className: "tokri-select-all-icon"
    }, /*#__PURE__*/React__default.default.createElement("line", {
      x1: "6",
      y1: "12",
      x2: "18",
      y2: "12"
    })) : checked ? /*#__PURE__*/React__default.default.createElement("svg", {
      viewBox: "0 0 24 24",
      className: "tokri-select-all-icon"
    }, /*#__PURE__*/React__default.default.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })) : null));
  }
  function RecordsTableHeader(props) {
    const {
      titleProperty,
      properties,
      sortBy,
      direction,
      onSelectAll,
      selectedAll,
      indeterminate
    } = props;
    const contentTag = getResourceElementCss(titleProperty.resourceId, 'table-head');
    const rowTag = `${titleProperty.resourceId}-table-head-row`;
    const checkboxCss = `${titleProperty.resourceId}-checkbox-table-cell`;
    return /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, {
      "data-css": contentTag
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      "data-css": rowTag
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      "data-css": checkboxCss
    }, onSelectAll ? /*#__PURE__*/React__default.default.createElement(SelectAllCheckBox, {
      onChange: () => onSelectAll(),
      checked: Boolean(selectedAll),
      indeterminate: Boolean(indeterminate)
    }) : null), properties.map(property => /*#__PURE__*/React__default.default.createElement(adminjs.PropertyHeader, {
      display: display(property.isTitle),
      key: property.propertyPath,
      titleProperty: titleProperty,
      property: property,
      sortBy: sortBy,
      direction: direction
    })), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      key: "actions",
      style: {
        width: 80
      }
    })));
  }

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.ProductEdit = ProductEdit;
  AdminJS.UserComponents.CategoryEdit = CategoryEdit;
  AdminJS.UserComponents.CmsList = CmsList;
  AdminJS.UserComponents.ReviewEdit = ReviewEdit;
  AdminJS.UserComponents.BlogEdit = BlogEdit;
  AdminJS.UserComponents.SettingsEdit = SettingsEdit;
  AdminJS.UserComponents.AppReleaseEdit = AppReleaseEdit;
  AdminJS.UserComponents.CouponEdit = CouponEdit;
  AdminJS.UserComponents.OrderDetail = OrderDetail;
  AdminJS.UserComponents.ChangePassword = ChangePassword;
  AdminJS.UserComponents.PartnerEdit = PartnerEdit;
  AdminJS.UserComponents.PincodeEdit = PincodeEdit;
  AdminJS.UserComponents.StatusToggle = StatusToggle;
  AdminJS.UserComponents.CustomerEdit = CustomerEdit;
  AdminJS.UserComponents.TeamEdit = TeamEdit;
  AdminJS.UserComponents.MediaLibrary = MediaLibrary;
  AdminJS.UserComponents.TaxEdit = TaxEdit;
  AdminJS.UserComponents.RazorpayPaymentId = RazorpayPaymentId;
  AdminJS.UserComponents.OrderListBadge = OrderListBadge;
  AdminJS.UserComponents.Login = Login;
  AdminJS.UserComponents.ActionHeader = ActionHeader;
  AdminJS.UserComponents.DefaultRichtextEditProperty = DefaultRichtextEditProperty;
  AdminJS.UserComponents.SidebarResourceSection = SidebarResourceSection;
  AdminJS.UserComponents.RecordsTable = RecordsTable;
  AdminJS.UserComponents.RecordsTableHeader = RecordsTableHeader;

})(React, AdminJS, AdminJSDesignSystem, ReactRouter);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9mb3JtLWNvbnRyb2xzLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9wcm9kdWN0LWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY2F0ZWdvcnktZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jbXMtbGlzdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZXZpZXctZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9ibG9nLWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvc2V0dGluZ3MtZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9hcHAtcmVsZWFzZS1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2NvdXBvbi1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWxpc3QtYmFkZ2VzLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWRldGFpbC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jaGFuZ2UtcGFzc3dvcmQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvaW5kaWEtc3RhdGVzLmpzIiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcGFydG5lci1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3BpbmNvZGUtZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9zdGF0dXMtdG9nZ2xlLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2N1c3RvbWVyLWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGVhbS1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL21lZGlhLWxpYnJhcnkuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGF4LWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmF6b3JwYXktcGF5bWVudC1pZC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9sb2dpbi5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jYXRhbG9nLWxpc3QtaGVhZGVyLWFjdGlvbnMuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvYWN0aW9uLWhlYWRlci5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yaWNodGV4dC1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3NpZGViYXItZGFzaGJvYXJkLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JlY29yZHMtdGFibGUuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmVjb3Jkcy10YWJsZS1oZWFkZXIuanN4IiwiZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlQW5jaG9yZWRNZW51KG9wZW4pIHtcbiAgY29uc3Qgd3JhcFJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbb3BlblVwLCBzZXRPcGVuVXBdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSB3cmFwUmVmLmN1cnJlbnRcbiAgICAgIGlmICghbm9kZSkgcmV0dXJuXG4gICAgICBjb25zdCByZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3Qgc3BhY2VCZWxvdyA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3QuYm90dG9tXG4gICAgICBzZXRPcGVuVXAoc3BhY2VCZWxvdyA8IDI0MCAmJiByZWN0LnRvcCA+IHNwYWNlQmVsb3cpXG4gICAgfVxuXG4gICAgdXBkYXRlKClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB1cGRhdGUsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdXBkYXRlLCB0cnVlKVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHJldHVybiB7IHdyYXBSZWYsIG9wZW5VcCB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hhYmxlTXVsdGlTZWxlY3QoeyBvcHRpb25zLCBzZWxlY3RlZCwgb25DaGFuZ2UsIHBsYWNlaG9sZGVyLCBzZWFyY2hQbGFjZWhvbGRlciB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIGNvbnN0IHNlbGVjdGVkU2V0ID0gdXNlTWVtbygoKSA9PiBuZXcgU2V0KHNlbGVjdGVkKSwgW3NlbGVjdGVkXSlcbiAgY29uc3Qgc2VsZWN0ZWRPcHRpb25zID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+IHNlbGVjdGVkU2V0LmhhcyhpdGVtLnZhbHVlKSlcbiAgY29uc3QgZmlsdGVyZWQgPSBvcHRpb25zLmZpbHRlcigoaXRlbSkgPT5cbiAgICBgJHtpdGVtLmxhYmVsfSAke2l0ZW0udmFsdWV9YC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpKSxcbiAgKVxuXG4gIGNvbnN0IHRvZ2dsZSA9ICh2YWx1ZSkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFNldC5oYXModmFsdWUpKSBvbkNoYW5nZShzZWxlY3RlZC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IHZhbHVlKSlcbiAgICBlbHNlIG9uQ2hhbmdlKFsuLi5zZWxlY3RlZCwgdmFsdWVdKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0XCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNvbnRyb2xcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKCh2YWx1ZSkgPT4gIXZhbHVlKX0+XG4gICAgICAgIHtzZWxlY3RlZE9wdGlvbnMubGVuZ3RoID8gKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNoaXBzXCI+XG4gICAgICAgICAgICB7c2VsZWN0ZWRPcHRpb25zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8c3BhbiBrZXk9e2l0ZW0udmFsdWV9IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNoaXBcIj5cbiAgICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgcm9sZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICB0b2dnbGUoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgw5dcbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1wbGFjZWhvbGRlclwiPntwbGFjZWhvbGRlcn08L3NwYW4+XG4gICAgICAgICl9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNhcmV0XCI+e29wZW4gPyAn4pa0JyA6ICfilr4nfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cXVlcnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRRdWVyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3NlYXJjaFBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICAgIHtmaWx0ZXJlZC5sZW5ndGggPyAoXG4gICAgICAgICAgICAgIGZpbHRlcmVkLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSBzZWxlY3RlZFNldC5oYXMoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGtleT17aXRlbS52YWx1ZX0gY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3Qtb3B0aW9uJHtjaGVja2VkID8gJyBpcy1zZWxlY3RlZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e2NoZWNrZWR9IG9uQ2hhbmdlPXsoKSA9PiB0b2dnbGUoaXRlbS52YWx1ZSl9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1lbXB0eVwiPk5vIG1hdGNoZXM8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZsYWdDYXJkKHsgc2VsZWN0ZWQsIHRpdGxlLCBoaW50LCBvbkNsaWNrIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YHRva3JpLWNob2ljZS1jYXJkJHtzZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgPlxuICAgICAgPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+XG4gICAgICA8c3Bhbj57aGludH08L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmxhZ09uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gJ3RydWUnIHx8IHZhbHVlID09PSAnb24nIHx8IHZhbHVlID09PSAxIHx8IHZhbHVlID09PSAnMSdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0YXR1c1N3aXRjaCh7XG4gIGNoZWNrZWQsXG4gIG9uQ2hhbmdlLFxuICBkaXNhYmxlZCxcbiAgdGl0bGUsXG4gIGhpbnQsXG4gIGNvbXBhY3QgPSBmYWxzZSxcbiAgb25MYWJlbCA9ICdBY3RpdmUnLFxuICBvZmZMYWJlbCA9ICdJbmFjdGl2ZScsXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B0b2tyaS1zd2l0Y2gke2NoZWNrZWQgPyAnIGlzLW9uJyA6ICcnfSR7Y29tcGFjdCA/ICcgaXMtY29tcGFjdCcgOiAnJ31gfVxuICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgYXJpYS1wcmVzc2VkPXtjaGVja2VkfVxuICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgaWYgKCFkaXNhYmxlZCkgb25DaGFuZ2UoIWNoZWNrZWQpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXN3aXRjaC10cmFja1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1zd2l0Y2gtdGh1bWJcIiAvPlxuICAgICAgPC9zcGFuPlxuICAgICAge3RpdGxlIHx8IGhpbnQgPyAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXN3aXRjaC1jb3B5XCI+XG4gICAgICAgICAge3RpdGxlID8gPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+IDogbnVsbH1cbiAgICAgICAgICB7aGludCA/IDxzcGFuPntoaW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApIDogKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0b2tyaS1zdGF0dXMtcGlsbCR7Y2hlY2tlZCA/ICcgaXMtb24nIDogJyd9YH0+XG4gICAgICAgICAge2NoZWNrZWQgPyBvbkxhYmVsIDogb2ZmTGFiZWx9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICl9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNlYXJjaGFibGVTZWxlY3QoeyB2YWx1ZSwgb3B0aW9ucywgb25DaGFuZ2UsIHBsYWNlaG9sZGVyLCBzZWFyY2hQbGFjZWhvbGRlciwgZGlzYWJsZWQgfSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuICBjb25zdCBqdXN0UGlja2VkID0gdXNlUmVmKGZhbHNlKVxuICBjb25zdCBzZWxlY3RlZCA9IG9wdGlvbnMuZmluZCgoaXRlbSkgPT4gaXRlbS52YWx1ZSA9PT0gdmFsdWUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIGNvbnN0IGZpbHRlcmVkID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+XG4gICAgYCR7aXRlbS5sYWJlbH0gJHtpdGVtLnZhbHVlfWAudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKSksXG4gIClcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3RcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY29udHJvbFwiXG4gICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGlmIChqdXN0UGlja2VkLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGp1c3RQaWNrZWQuY3VycmVudCA9IGZhbHNlXG4gICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghZGlzYWJsZWQpIHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3NlbGVjdGVkID8gJycgOiAndG9rcmktbXVsdGlzZWxlY3QtcGxhY2Vob2xkZXInfT5cbiAgICAgICAgICB7c2VsZWN0ZWQ/LmxhYmVsIHx8IHBsYWNlaG9sZGVyfVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNhcmV0XCI+e29wZW4gPyAn4pa0JyA6ICfilr4nfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cXVlcnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRRdWVyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3NlYXJjaFBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICAgIHtmaWx0ZXJlZC5sZW5ndGggPyAoXG4gICAgICAgICAgICAgIGZpbHRlcmVkLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2ZSA9IGl0ZW0udmFsdWUgPT09IHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZSB8fCAnZW1wdHknfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1tdWx0aXNlbGVjdC1vcHRpb24ke2FjdGl2ZSA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgIGp1c3RQaWNrZWQuY3VycmVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZShpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgc2V0UXVlcnkoJycpXG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAganVzdFBpY2tlZC5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICB9LCAwKVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWVtcHR5XCI+Tm8gbWF0Y2hlczwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTG9jYWxTZWxlY3QoeyB2YWx1ZSwgb3B0aW9ucywgb25DaGFuZ2UsIGRpc2FibGVkIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHsgd3JhcFJlZiwgb3BlblVwIH0gPSB1c2VBbmNob3JlZE1lbnUob3BlbilcbiAgY29uc3Qgc2VsZWN0ZWQgPSBvcHRpb25zLmZpbmQoKGl0ZW0pID0+IFN0cmluZyhpdGVtLnZhbHVlKSA9PT0gU3RyaW5nKHZhbHVlKSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9uRG9jQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghd3JhcFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICB9LCBbd3JhcFJlZl0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxvY2FsLXNlbGVjdFwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1sb2NhbC1zZWxlY3QtY29udHJvbFwiXG4gICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGlmICghZGlzYWJsZWQpIHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3Bhbj57c2VsZWN0ZWQ/LmxhYmVsIHx8IHZhbHVlfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY2FyZXRcIj57b3BlbiA/ICfilrQnIDogJ+KWvid9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b2tyaS1sb2NhbC1zZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICB7b3B0aW9ucy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3Qtb3B0aW9uJHtTdHJpbmcoaXRlbS52YWx1ZSkgPT09IFN0cmluZyh2YWx1ZSkgPyAnIGlzLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEFwaUNsaWVudCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBCb3gsIEgyLCBINSwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBMb2NhbFNlbGVjdCB9IGZyb20gJy4vZm9ybS1jb250cm9scydcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5jb25zdCBSQU5HRVMgPSBbXG4gIHsgdmFsdWU6ICc3ZCcsIGxhYmVsOiAnNyBkYXlzJyB9LFxuICB7IHZhbHVlOiAndGhpc01vbnRoJywgbGFiZWw6ICdUaGlzIG1vbnRoJyB9LFxuICB7IHZhbHVlOiAnbGFzdE1vbnRoJywgbGFiZWw6ICdMYXN0IG1vbnRoJyB9LFxuICB7IHZhbHVlOiAnOTBkJywgbGFiZWw6ICczIG1vbnRocycgfSxcbl1cbmNvbnN0IFdJREdFVFMgPSBbJ29yZGVyVmFsdWUnLCAnb3JkZXJzJywgJ2N1c3RvbWVycycsICdwcm9kdWN0cyddXG5cbmNvbnN0IGluciA9ICh2YWx1ZSkgPT5cbiAgYOKCuSR7TnVtYmVyKHZhbHVlIHx8IDApLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAwIH0pfWBcblxuZnVuY3Rpb24gUmFuZ2VTZWxlY3QoeyB2YWx1ZSwgb25DaGFuZ2UgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktcmFuZ2Utc2VsZWN0XCI+XG4gICAgICA8TG9jYWxTZWxlY3QgdmFsdWU9e3ZhbHVlfSBvcHRpb25zPXtSQU5HRVN9IG9uQ2hhbmdlPXtvbkNoYW5nZX0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBheGlzTWF4KHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA8PSAwKSByZXR1cm4gMTAwMFxuICBjb25zdCBwYWRkZWQgPSB2YWx1ZSAqIDEuMVxuICBjb25zdCBtYWduaXR1ZGUgPSAxMCAqKiBNYXRoLmZsb29yKE1hdGgubG9nMTAocGFkZGVkKSlcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHBhZGRlZCAvIG1hZ25pdHVkZVxuICBjb25zdCBuaWNlID0gbm9ybWFsaXplZCA8PSAxID8gMSA6IG5vcm1hbGl6ZWQgPD0gMiA/IDIgOiBub3JtYWxpemVkIDw9IDUgPyA1IDogMTBcbiAgcmV0dXJuIG5pY2UgKiBtYWduaXR1ZGVcbn1cblxuZnVuY3Rpb24gTGluZUNoYXJ0KHsgc2VyaWVzIH0pIHtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZShudWxsKVxuICBjb25zdCB3aWR0aCA9IDEyMDBcbiAgY29uc3QgaGVpZ2h0ID0gMzIwXG4gIGNvbnN0IHBhZExlZnQgPSA4NlxuICBjb25zdCBwYWRSaWdodCA9IDE4XG4gIGNvbnN0IHBhZFRvcCA9IDE4XG4gIGNvbnN0IHBhZEJvdHRvbSA9IDM2XG4gIGNvbnN0IG1heCA9IGF4aXNNYXgoTWF0aC5tYXgoLi4uc2VyaWVzLm1hcCgocG9pbnQpID0+IHBvaW50Lm9yZGVyVmFsdWUpLCAwKSlcbiAgY29uc3QgcGxvdFdpZHRoID0gd2lkdGggLSBwYWRMZWZ0IC0gcGFkUmlnaHRcbiAgY29uc3QgcGxvdEhlaWdodCA9IGhlaWdodCAtIHBhZFRvcCAtIHBhZEJvdHRvbVxuICBjb25zdCBiYXNlbGluZSA9IHBhZFRvcCArIHBsb3RIZWlnaHRcbiAgY29uc3QgeUZvciA9ICh2YWx1ZSkgPT4gYmFzZWxpbmUgLSAodmFsdWUgLyBtYXgpICogcGxvdEhlaWdodFxuICBjb25zdCBzdGVwID0gc2VyaWVzLmxlbmd0aCA+IDEgPyBwbG90V2lkdGggLyAoc2VyaWVzLmxlbmd0aCAtIDEpIDogcGxvdFdpZHRoXG4gIGNvbnN0IGNvb3JkcyA9IHNlcmllcy5tYXAoKHBvaW50LCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHggPSBzZXJpZXMubGVuZ3RoID09PSAxID8gcGFkTGVmdCArIHBsb3RXaWR0aCAvIDIgOiBwYWRMZWZ0ICsgaW5kZXggKiBzdGVwXG4gICAgcmV0dXJuIHsgeCwgeTogeUZvcihwb2ludC5vcmRlclZhbHVlKSwgcG9pbnQgfVxuICB9KVxuICBjb25zdCBsaW5lID0gY29vcmRzLm1hcCgoaXRlbSwgaW5kZXgpID0+IGAke2luZGV4ID8gJ0wnIDogJ00nfSR7aXRlbS54fSwke2l0ZW0ueX1gKS5qb2luKCcgJylcbiAgY29uc3QgYXJlYSA9IGNvb3Jkcy5sZW5ndGhcbiAgICA/IGAke2xpbmV9IEwke2Nvb3Jkc1tjb29yZHMubGVuZ3RoIC0gMV0ueH0sJHtiYXNlbGluZX0gTCR7Y29vcmRzWzBdLnh9LCR7YmFzZWxpbmV9IFpgXG4gICAgOiAnJ1xuICBjb25zdCBsYWJlbEV2ZXJ5ID0gc2VyaWVzLmxlbmd0aCA+IDIwID8gTWF0aC5jZWlsKHNlcmllcy5sZW5ndGggLyA4KSA6IHNlcmllcy5sZW5ndGggPiAxMCA/IDQgOiAxXG4gIGNvbnN0IHRpY2tzID0gWzAsIDAuMjUsIDAuNSwgMC43NSwgMV0ubWFwKChyYXRpbykgPT4gKHtcbiAgICB2YWx1ZTogTWF0aC5yb3VuZChtYXggKiByYXRpbyksXG4gICAgeTogeUZvcihtYXggKiByYXRpbyksXG4gIH0pKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1wbG90XCIgb25Nb3VzZUxlYXZlPXsoKSA9PiBzZXRIb3ZlcihudWxsKX0+XG4gICAgICA8c3ZnIHZpZXdCb3g9e2AwIDAgJHt3aWR0aH0gJHtoZWlnaHR9YH0gY2xhc3NOYW1lPVwidG9rcmktY2hhcnRcIiByb2xlPVwiaW1nXCI+XG4gICAgICAgIHt0aWNrcy5tYXAoKHRpY2spID0+IChcbiAgICAgICAgICA8ZyBrZXk9e3RpY2sudmFsdWV9PlxuICAgICAgICAgICAgPGxpbmUgeDE9e3BhZExlZnR9IHgyPXt3aWR0aCAtIHBhZFJpZ2h0fSB5MT17dGljay55fSB5Mj17dGljay55fSBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1ncmlkbGluZVwiIC8+XG4gICAgICAgICAgICA8dGV4dCB4PXtwYWRMZWZ0IC0gMTB9IHk9e3RpY2sueSArIDR9IHRleHRBbmNob3I9XCJlbmRcIiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1heGlzXCI+XG4gICAgICAgICAgICAgIHtpbnIodGljay52YWx1ZSl9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9nPlxuICAgICAgICApKX1cbiAgICAgICAgPHBhdGggZD17YXJlYX0gZmlsbD1cIiMwNDc4NTdcIiBvcGFjaXR5PVwiMC4xNlwiIC8+XG4gICAgICAgIDxwYXRoIGQ9e2xpbmV9IGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiIzA0Nzg1N1wiIHN0cm9rZVdpZHRoPVwiM1wiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiAvPlxuICAgICAgICB7Y29vcmRzLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgIDxnIGtleT17aXRlbS5wb2ludC5kYXRlfT5cbiAgICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgICAgY3g9e2l0ZW0ueH1cbiAgICAgICAgICAgICAgY3k9e2l0ZW0ueX1cbiAgICAgICAgICAgICAgcj1cIjE0XCJcbiAgICAgICAgICAgICAgZmlsbD1cInRyYW5zcGFyZW50XCJcbiAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiBzZXRIb3ZlcihpdGVtKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Y2lyY2xlIGN4PXtpdGVtLnh9IGN5PXtpdGVtLnl9IHI9XCI0LjVcIiBmaWxsPVwiI2ZmZlwiIHN0cm9rZT1cIiMwNDc4NTdcIiBzdHJva2VXaWR0aD1cIjJcIiBwb2ludGVyRXZlbnRzPVwibm9uZVwiIC8+XG4gICAgICAgICAgPC9nPlxuICAgICAgICApKX1cbiAgICAgICAge2Nvb3Jkcy5tYXAoKGl0ZW0sIGluZGV4KSA9PlxuICAgICAgICAgIGluZGV4ICUgbGFiZWxFdmVyeSA9PT0gMCA/IChcbiAgICAgICAgICAgIDx0ZXh0IGtleT17YCR7aXRlbS5wb2ludC5kYXRlfS1sYWJlbGB9IHg9e2l0ZW0ueH0geT17aGVpZ2h0IC0gOH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWxhYmVsXCI+XG4gICAgICAgICAgICAgIHtpdGVtLnBvaW50LmxhYmVsfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICkgOiBudWxsLFxuICAgICAgICApfVxuICAgICAgPC9zdmc+XG4gICAgICB7aG92ZXIgPyAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1jaGFydC10aXAke2hvdmVyLnkgPCA5MCA/ICcgaXMtYmVsb3cnIDogJyd9YH1cbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBgJHsoaG92ZXIueCAvIHdpZHRoKSAqIDEwMH0lYCwgdG9wOiBgJHsoaG92ZXIueSAvIGhlaWdodCkgKiAxMDB9JWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuPntob3Zlci5wb2ludC5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgPHN0cm9uZz57aW5yKGhvdmVyLnBvaW50Lm9yZGVyVmFsdWUpfTwvc3Ryb25nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIFBhZ2VyKHsgcGFnZSwgcGFnZVNpemUsIHRvdGFsLCBvbkNoYW5nZSB9KSB7XG4gIGNvbnN0IHBhZ2VzID0gTWF0aC5tYXgoMSwgTWF0aC5jZWlsKCh0b3RhbCB8fCAwKSAvIHBhZ2VTaXplKSlcbiAgaWYgKHBhZ2VzIDw9IDEpIHJldHVybiBudWxsXG4gIGNvbnN0IG51bWJlcnMgPSBbXVxuICBmb3IgKGxldCBudW1iZXIgPSAxOyBudW1iZXIgPD0gcGFnZXM7IG51bWJlciArPSAxKSBudW1iZXJzLnB1c2gobnVtYmVyKVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktd2lkZ2V0LXBhZ2VzXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxpc3QtcGFnaW5hdGlvbi1wYWdlc1wiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17cGFnZSA8PSAxfSBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZShwYWdlIC0gMSl9PlxuICAgICAgICAgIFByZXZcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIHtudW1iZXJzLm1hcCgobnVtYmVyKSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBrZXk9e251bWJlcn1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17bnVtYmVyID09PSBwYWdlID8gJ2lzLWN1cnJlbnQnIDogJyd9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZShudW1iZXIpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtudW1iZXJ9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17cGFnZSA+PSBwYWdlc30gb25DbGljaz17KCkgPT4gb25DaGFuZ2UocGFnZSArIDEpfT5cbiAgICAgICAgICBOZXh0XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgRGFzaGJvYXJkID0gKCkgPT4ge1xuICBjb25zdCByZXF1ZXN0cyA9IHVzZVJlZih7fSlcbiAgY29uc3QgW3Jhbmdlcywgc2V0UmFuZ2VzXSA9IHVzZVN0YXRlKHtcbiAgICBvcmRlclZhbHVlOiAnN2QnLFxuICAgIG9yZGVyczogJzdkJyxcbiAgICBjdXN0b21lcnM6ICc3ZCcsXG4gICAgcHJvZHVjdHM6ICc3ZCcsXG4gIH0pXG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKHt9KVxuICBjb25zdCBbcGFnZXMsIHNldFBhZ2VzXSA9IHVzZVN0YXRlKHsgb3JkZXJzOiAxLCBjdXN0b21lcnM6IDEgfSlcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoe1xuICAgIG9yZGVyVmFsdWU6IHRydWUsXG4gICAgb3JkZXJzOiB0cnVlLFxuICAgIGN1c3RvbWVyczogdHJ1ZSxcbiAgICBwcm9kdWN0czogdHJ1ZSxcbiAgfSlcblxuICBjb25zdCBsb2FkV2lkZ2V0ID0gKHdpZGdldCwgcmFuZ2UsIHBhZ2UgPSAxKSA9PiB7XG4gICAgY29uc3QgdGlja2V0ID0gKHJlcXVlc3RzLmN1cnJlbnRbd2lkZ2V0XSB8fCAwKSArIDFcbiAgICByZXF1ZXN0cy5jdXJyZW50W3dpZGdldF0gPSB0aWNrZXRcbiAgICBzZXRCdXN5KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBbd2lkZ2V0XTogdHJ1ZSB9KSlcbiAgICBhcGlcbiAgICAgIC5nZXREYXNoYm9hcmQoeyBwYXJhbXM6IHsgd2lkZ2V0LCByYW5nZSwgcGFnZSB9IH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlcXVlc3RzLmN1cnJlbnRbd2lkZ2V0XSAhPT0gdGlja2V0KSByZXR1cm5cbiAgICAgICAgc2V0RGF0YSgoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgLi4ucmVzcG9uc2UuZGF0YSB9KSlcbiAgICAgIH0pXG4gICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgIGlmIChyZXF1ZXN0cy5jdXJyZW50W3dpZGdldF0gIT09IHRpY2tldCkgcmV0dXJuXG4gICAgICAgIHNldEJ1c3koKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiBmYWxzZSB9KSlcbiAgICAgIH0pXG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIFdJREdFVFMuZm9yRWFjaCgod2lkZ2V0KSA9PiBsb2FkV2lkZ2V0KHdpZGdldCwgJzdkJykpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGNoYW5nZVJhbmdlID0gKHdpZGdldCwgcmFuZ2UpID0+IHtcbiAgICBzZXRSYW5nZXMoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiByYW5nZSB9KSlcbiAgICBpZiAod2lkZ2V0ID09PSAnb3JkZXJzJyB8fCB3aWRnZXQgPT09ICdjdXN0b21lcnMnKSB7XG4gICAgICBzZXRQYWdlcygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgW3dpZGdldF06IDEgfSkpXG4gICAgfVxuICAgIGxvYWRXaWRnZXQod2lkZ2V0LCByYW5nZSwgMSlcbiAgfVxuXG4gIGNvbnN0IGNoYW5nZVBhZ2UgPSAod2lkZ2V0LCBwYWdlKSA9PiB7XG4gICAgc2V0UGFnZXMoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiBwYWdlIH0pKVxuICAgIGxvYWRXaWRnZXQod2lkZ2V0LCByYW5nZXNbd2lkZ2V0XSwgcGFnZSlcbiAgfVxuXG4gIGNvbnN0IG9yZGVyVmFsdWUgPSBkYXRhLm9yZGVyVmFsdWVcbiAgY29uc3Qgb3JkZXJzID0gZGF0YS5vcmRlcnNcbiAgY29uc3QgY3VzdG9tZXJzID0gZGF0YS5jdXN0b21lcnNcbiAgY29uc3QgcHJvZHVjdHMgPSBkYXRhLnByb2R1Y3RzXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHZhcmlhbnQ9XCJ0cmFuc3BhcmVudFwiIGNsYXNzTmFtZT1cInRva3JpLWFuYWx5dGljc1wiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1hbmFseXRpY3MtaGVhZFwiPlxuICAgICAgICA8SDIgbWI9XCJzbVwiPkRhc2hib2FyZDwvSDI+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY2hhcnQtY2FyZCB0b2tyaS1jaGFydC1jYXJkLXdpZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS13aWRnZXQtaGVhZFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8SDUgbWI9XCJzbVwiPk9yZGVyIFZhbHVlPC9INT5cbiAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgIHtidXN5Lm9yZGVyVmFsdWUgJiYgIW9yZGVyVmFsdWVcbiAgICAgICAgICAgICAgICA/ICdMb2FkaW5n4oCmJ1xuICAgICAgICAgICAgICAgIDogYCR7aW5yKG9yZGVyVmFsdWU/LnRvdGFsKX0gZnJvbSAke29yZGVyVmFsdWU/Lm9yZGVyQ291bnQgfHwgMH0gb3JkZXJzYH1cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8UmFuZ2VTZWxlY3QgdmFsdWU9e3Jhbmdlcy5vcmRlclZhbHVlfSBvbkNoYW5nZT17KHZhbHVlKSA9PiBjaGFuZ2VSYW5nZSgnb3JkZXJWYWx1ZScsIHZhbHVlKX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtvcmRlclZhbHVlPy5zZXJpZXM/Lmxlbmd0aCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWZyYW1lXCI+XG4gICAgICAgICAgICA8TGluZUNoYXJ0IHNlcmllcz17b3JkZXJWYWx1ZS5zZXJpZXN9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXNwbGl0XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWNhcmRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXdpZGdldC1oZWFkXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8SDUgbWI9XCJzbVwiPk9yZGVyIEFtb3VudDwvSDU+XG4gICAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgICAge2J1c3kub3JkZXJzICYmICFvcmRlcnMgPyAnTG9hZGluZ+KApicgOiBgJHtvcmRlcnM/LnRvdGFsIHx8IDB9IG9yZGVyc2B9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPFJhbmdlU2VsZWN0IHZhbHVlPXtyYW5nZXMub3JkZXJzfSBvbkNoYW5nZT17KHZhbHVlKSA9PiBjaGFuZ2VSYW5nZSgnb3JkZXJzJywgdmFsdWUpfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtvcmRlcnM/LnJvd3M/Lmxlbmd0aCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktdGFibGUtd3JhcFwiPlxuICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidG9rcmktZGF0YS10YWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPk9yZGVyIG51bWJlcjwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkFtb3VudDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5QbGFjZWQ8L3RoPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgIHtvcmRlcnMucm93cy5tYXAoKHJvdykgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtyb3cuaWR9PlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57cm93Lm9yZGVyTm99PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntpbnIocm93LmFtb3VudCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5wbGFjZWRBdH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8VGV4dCBvcGFjaXR5PXswLjd9PntidXN5Lm9yZGVycyA/ICdMb2FkaW5n4oCmJyA6ICdObyBvcmRlcnMgaW4gdGhpcyBwZXJpb2QuJ308L1RleHQ+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8UGFnZXJcbiAgICAgICAgICAgIHBhZ2U9e29yZGVycz8ucGFnZSB8fCBwYWdlcy5vcmRlcnN9XG4gICAgICAgICAgICBwYWdlU2l6ZT17b3JkZXJzPy5wYWdlU2l6ZSB8fCAxMH1cbiAgICAgICAgICAgIHRvdGFsPXtvcmRlcnM/LnRvdGFsIHx8IDB9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHBhZ2UpID0+IGNoYW5nZVBhZ2UoJ29yZGVycycsIHBhZ2UpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1jYXJkXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS13aWRnZXQtaGVhZFwiPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPEg1IG1iPVwic21cIj5OZXcgQ3VzdG9tZXJzPC9INT5cbiAgICAgICAgICAgICAgPFRleHQgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgICAgICB7YnVzeS5jdXN0b21lcnMgJiYgIWN1c3RvbWVycyA/ICdMb2FkaW5n4oCmJyA6IGAke2N1c3RvbWVycz8udG90YWwgfHwgMH0gcGVvcGxlIHJlZ2lzdGVyZWRgfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxSYW5nZVNlbGVjdCB2YWx1ZT17cmFuZ2VzLmN1c3RvbWVyc30gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gY2hhbmdlUmFuZ2UoJ2N1c3RvbWVycycsIHZhbHVlKX0gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7Y3VzdG9tZXJzPy5yb3dzPy5sZW5ndGggPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInRva3JpLWRhdGEtdGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlBob25lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkRhdGUgb2YgYmlydGg8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+Q3JlYXRlZDwvdGg+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAge2N1c3RvbWVycy5yb3dzLm1hcCgocm93KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e3Jvdy5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cubmFtZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD4rOTEge3Jvdy5waG9uZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57cm93LmRhdGVPZkJpcnRofTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cucmVnaXN0ZXJlZEF0fTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+e2J1c3kuY3VzdG9tZXJzID8gJ0xvYWRpbmfigKYnIDogJ05vIG5ldyBjdXN0b21lcnMgaW4gdGhpcyBwZXJpb2QuJ308L1RleHQ+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8UGFnZXJcbiAgICAgICAgICAgIHBhZ2U9e2N1c3RvbWVycz8ucGFnZSB8fCBwYWdlcy5jdXN0b21lcnN9XG4gICAgICAgICAgICBwYWdlU2l6ZT17Y3VzdG9tZXJzPy5wYWdlU2l6ZSB8fCAxMH1cbiAgICAgICAgICAgIHRvdGFsPXtjdXN0b21lcnM/LnRvdGFsIHx8IDB9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHBhZ2UpID0+IGNoYW5nZVBhZ2UoJ2N1c3RvbWVycycsIHBhZ2UpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXNwbGl0XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWNhcmRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXdpZGdldC1oZWFkXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8SDUgbWI9XCJzbVwiPkJlc3QgU2VsbGluZyBQcm9kdWN0czwvSDU+XG4gICAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgICAge2J1c3kucHJvZHVjdHMgJiYgIXByb2R1Y3RzID8gJ0xvYWRpbmfigKYnIDogJ1RvcCA1IGJ5IG51bWJlciBvZiBvcmRlcnMnfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxSYW5nZVNlbGVjdCB2YWx1ZT17cmFuZ2VzLnByb2R1Y3RzfSBvbkNoYW5nZT17KHZhbHVlKSA9PiBjaGFuZ2VSYW5nZSgncHJvZHVjdHMnLCB2YWx1ZSl9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Byb2R1Y3RzPy5yb3dzPy5sZW5ndGggPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInRva3JpLWRhdGEtdGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5Qcm9kdWN0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPk9yZGVyczwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5BbW91bnQ8L3RoPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgIHtwcm9kdWN0cy5yb3dzLm1hcCgocm93KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e3Jvdy5uYW1lfT5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cub3JkZXJzfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntpbnIocm93LmFtb3VudCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPFRleHQgb3BhY2l0eT17MC43fT57YnVzeS5wcm9kdWN0cyA/ICdMb2FkaW5n4oCmJyA6ICdObyBwcm9kdWN0cyBzb2xkIGluIHRoaXMgcGVyaW9kLid9PC9UZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IERhc2hib2FyZFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEJhc2VQcm9wZXJ0eUNvbXBvbmVudCwgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgRmxhZ0NhcmQsIGlzRmxhZ09uLCBTZWFyY2hhYmxlTXVsdGlTZWxlY3QsIFN0YXR1c1N3aXRjaCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IG5vcm1hbGl6ZVNsdWdJbnB1dCA9ICh2YWx1ZSkgPT5cbiAgU3RyaW5nKHZhbHVlIHx8ICcnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnRyaW0oKVxuICAgIC5yZXBsYWNlKC9bJ1wiXS9nLCAnJylcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tK3wtKyQvZywgJycpXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmNvbnN0IFBST0RVQ1RfREVUQUlMU19IVE1MID0gYDxoMz5Qcm9kdWN0IERldGFpbHM8L2gzPlxuPGRpdiBjbGFzcz1cInByb2R1Y3QtaW5mb1wiPlxuPGRpdiBjbGFzcz1cInByb2R1Y3QtaW5mby1pdGVtXCI+XG48cCBjbGFzcz1cInByb2R1Y3QtaW5mby1sYWJlbFwiPkhlYWx0aCBCZW5lZml0czwvcD5cbjxwPlJpY2ggaW4gQW50aW94aWRhbnRzPC9wPlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwicHJvZHVjdC1pbmZvLWl0ZW1cIj5cbjxwIGNsYXNzPVwicHJvZHVjdC1pbmZvLWxhYmVsXCI+RGVzY3JpcHRpb248L3A+XG48cD5Xcml0ZSB0aGUgZnJ1aXQgZGVzY3JpcHRpb24gaGVyZS4gTWVudGlvbiB0YXN0ZSwgaG93IHRvIHVzZSBpdCwgYW5kIHdoYXQgbWFrZXMgaXQgc3BlY2lhbC48L3A+XG48L2Rpdj5cbjxkaXYgY2xhc3M9XCJwcm9kdWN0LWluZm8taXRlbVwiPlxuPHAgY2xhc3M9XCJwcm9kdWN0LWluZm8tbGFiZWxcIj5Vbml0PC9wPlxuPHA+MTI1IGc8L3A+XG48L2Rpdj5cbjxkaXYgY2xhc3M9XCJwcm9kdWN0LWluZm8taXRlbVwiPlxuPHAgY2xhc3M9XCJwcm9kdWN0LWluZm8tbGFiZWxcIj5TaGVsZiBMaWZlPC9wPlxuPHA+NCBkYXlzPC9wPlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwicHJvZHVjdC1pbmZvLWl0ZW1cIj5cbjxwIGNsYXNzPVwicHJvZHVjdC1pbmZvLWxhYmVsXCI+VGFzdGUgUHJvZmlsZTwvcD5cbjxwPlN3ZWV0PC9wPlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwicHJvZHVjdC1pbmZvLWl0ZW1cIj5cbjxwIGNsYXNzPVwicHJvZHVjdC1pbmZvLWxhYmVsXCI+RGlzY2xhaW1lcjwvcD5cbjxwPlRoZSBpbWFnZSBzaG93biBpcyBmb3IgcmVwcmVzZW50YXRpb24gcHVycG9zZXMgb25seSBhbmQgbWF5IHZhcnkgc2xpZ2h0bHkgZnJvbSB0aGUgYWN0dWFsIHByb2R1Y3QuIEV2ZXJ5IGVmZm9ydCBpcyBtYWRlIHRvIGVuc3VyZSB0aGUgYWNjdXJhY3kgb2YgYWxsIGluZm9ybWF0aW9uIGRpc3BsYXllZC48L3A+XG48L2Rpdj5cbjxkaXYgY2xhc3M9XCJwcm9kdWN0LWluZm8taXRlbVwiPlxuPHAgY2xhc3M9XCJwcm9kdWN0LWluZm8tbGFiZWxcIj5DdXN0b21lciBDYXJlIERldGFpbHM8L3A+XG48cD5FbWFpbDogPGEgaHJlZj1cIm1haWx0bzpzdXBwb3J0QHRva3JpaWkuY29tXCI+c3VwcG9ydEB0b2tyaWlpLmNvbTwvYT48L3A+XG48L2Rpdj5cbjxkaXYgY2xhc3M9XCJwcm9kdWN0LWluZm8taXRlbVwiPlxuPHAgY2xhc3M9XCJwcm9kdWN0LWluZm8tbGFiZWxcIj5Db3VudHJ5IG9mIE9yaWdpbjwvcD5cbjxwPkluZGlhPC9wPlxuPC9kaXY+XG48L2Rpdj5gXG5cbmZ1bmN0aW9uIHBhcnNlU2x1Z3MocmF3KSB7XG4gIGlmICghcmF3KSByZXR1cm4gW11cbiAgaWYgKEFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIHJhdy5tYXAoKGl0ZW0pID0+IFN0cmluZyhpdGVtKS50cmltKCkpLmZpbHRlcihCb29sZWFuKVxuICBpZiAodHlwZW9mIHJhdyA9PT0gJ3N0cmluZycpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJzZWQpKSByZXR1cm4gcGFyc2VTbHVncyhwYXJzZWQpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmVcbiAgICB9XG4gICAgcmV0dXJuIHJhd1xuICAgICAgLnNwbGl0KCcsJylcbiAgICAgIC5tYXAoKGl0ZW0pID0+IGl0ZW0udHJpbSgpKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICB9XG4gIHJldHVybiBbXVxufVxuXG5jb25zdCBQcm9kdWN0RWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFt1cGxvYWRpbmcsIHNldFVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NsdWdFZGl0ZWQsIHNldFNsdWdFZGl0ZWRdID0gdXNlU3RhdGUoQm9vbGVhbihpbml0aWFsUmVjb3JkPy5wYXJhbXM/LnNsdWcpKVxuICBjb25zdCBbcHJldmlld1VybCwgc2V0UHJldmlld1VybF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2NhdGVnb3JpZXMsIHNldENhdGVnb3JpZXNdID0gdXNlU3RhdGUoW10pXG5cbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgY3VzdG9tID0gcmVzb3VyY2U/Lm9wdGlvbnM/LmN1c3RvbSB8fCB7fVxuICBjb25zdCBhcGlCYXNlVXJsID0gd2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwaUJhc2VVcmwgfHwgJy9hcGkvdjEnKVxuICBjb25zdCBwcm9kdWN0VXJsQmFzZSA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKFxuICAgIGN1c3RvbS5wcm9kdWN0VXJsQmFzZSB8fCBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9wcm9kdWN0YCxcbiAgKVxuICBjb25zdCBzbHVnSW5wdXQgPSBwYXJhbXMuc2x1ZyA/PyAnJ1xuICBjb25zdCBwcmV2aWV3U2x1ZyA9IG5vcm1hbGl6ZVNsdWdJbnB1dChzbHVnSW5wdXQpIHx8IG5vcm1hbGl6ZVNsdWdJbnB1dChwYXJhbXMubmFtZSlcbiAgY29uc3QgcHJvZHVjdFVybCA9IHByZXZpZXdTbHVnID8gYCR7cHJvZHVjdFVybEJhc2V9LyR7cHJldmlld1NsdWd9YCA6IG51bGxcbiAgY29uc3Qgc2VsZWN0ZWRDYXRlZ29yeVNsdWdzID0gcGFyc2VTbHVncyhwYXJhbXMuY2F0ZWdvcnlJZHMpXG4gIGNvbnN0IGlzQWN0aXZlID0gcGFyYW1zLmlzQWN0aXZlICE9PSBmYWxzZSAmJiBwYXJhbXMuaXNBY3RpdmUgIT09ICdmYWxzZSdcblxuICBjb25zdCBpbWFnZVVybCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghcGFyYW1zLmltYWdlKSByZXR1cm4gJydcbiAgICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGFyYW1zLmltYWdlKSkgcmV0dXJuIHBhcmFtcy5pbWFnZVxuICAgIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGFyYW1zLmltYWdlfWBcbiAgfSwgW2N1c3RvbS5hcHBVcmwsIHBhcmFtcy5pbWFnZV0pXG5cbiAgY29uc3QgZGlzcGxheWVkSW1hZ2VVcmwgPSBwcmV2aWV3VXJsIHx8IGltYWdlVXJsXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHByZXZpZXdVcmw/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwocHJldmlld1VybClcbiAgICB9XG4gIH0sIFtwcmV2aWV3VXJsXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBpZ25vcmUgPSBmYWxzZVxuICAgIGZldGNoKGAke2FwaUJhc2VVcmx9L2NhdGVnb3JpZXNgKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0Q2F0ZWdvcmllcyhBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFtdKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGlmICghaWdub3JlKSBzZXRDYXRlZ29yaWVzKFtdKVxuICAgICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWdub3JlID0gdHJ1ZVxuICAgIH1cbiAgfSwgW2FwaUJhc2VVcmxdKVxuXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IG9uUHJvcGVydHlDaGFuZ2UgPSAocHJvcGVydHlQYXRoLCB2YWx1ZSwgLi4ucmVzdCkgPT4ge1xuICAgIGlmIChwcm9wZXJ0eVBhdGggPT09ICdzbHVnJykge1xuICAgICAgc2V0U2x1Z0VkaXRlZCh0cnVlKVxuICAgICAgaGFuZGxlQ2hhbmdlKHByb3BlcnR5UGF0aCwgbm9ybWFsaXplU2x1Z0lucHV0KHZhbHVlKSwgLi4ucmVzdClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBoYW5kbGVDaGFuZ2UocHJvcGVydHlQYXRoLCB2YWx1ZSwgLi4ucmVzdClcbiAgICBpZiAocHJvcGVydHlQYXRoID09PSAnbmFtZScgJiYgIXNsdWdFZGl0ZWQpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnc2x1ZycsIG5vcm1hbGl6ZVNsdWdJbnB1dCh2YWx1ZSkpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc2V0U2VsZWN0ZWRDYXRlZ29yaWVzID0gKHNsdWdzKSA9PiBzZXRGaWVsZCgnY2F0ZWdvcnlJZHMnLCBKU09OLnN0cmluZ2lmeShzbHVncykpXG5cbiAgY29uc3QgdXBsb2FkSW1hZ2UgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICBpZiAoIWZpbGUpIHJldHVyblxuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZm9sZGVyJywgJ3Byb2R1Y3RzJylcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIGNvbnN0IGxvY2FsUHJldmlld1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSlcbiAgICBzZXRQcmV2aWV3VXJsKGxvY2FsUHJldmlld1VybClcbiAgICBzZXRVcGxvYWRpbmcodHJ1ZSlcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L21lZGlhL3VwbG9hZGAsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgfSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UgfHwgJ0ltYWdlIHVwbG9hZCBmYWlsZWQnKVxuICAgICAgfVxuICAgICAgY29uc3QgbWVkaWEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIGhhbmRsZUNoYW5nZSgnaW1hZ2UnLCBtZWRpYS5wYXRoKVxuICAgICAgaGFuZGxlQ2hhbmdlKCdtZWRpYUlkJywgbWVkaWEuaWQpXG4gICAgICBzZXRQcmV2aWV3VXJsKFxuICAgICAgICAvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChtZWRpYS5wYXRoKVxuICAgICAgICAgID8gbWVkaWEucGF0aFxuICAgICAgICAgIDogYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke21lZGlhLnBhdGh9YCxcbiAgICAgIClcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdJbWFnZSB1cGxvYWRlZCBzdWNjZXNzZnVsbHknLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IHVwbG9hZCBpbWFnZScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0VXBsb2FkaW5nKGZhbHNlKVxuICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCkgZmlsZVJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgcHJvZHVjdCcsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnUHJvZHVjdCBzYXZlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSBwcm9kdWN0JywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgfVxuXG4gIGNvbnN0IGRlc2NyaXB0aW9uUHJvcGVydHkgPSByZXNvdXJjZS5lZGl0UHJvcGVydGllcy5maW5kKFxuICAgIChwcm9wZXJ0eSkgPT4gcHJvcGVydHkucHJvcGVydHlQYXRoID09PSAnZGVzY3JpcHRpb24nLFxuICApXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e3BhcmFtcy5uYW1lIHx8ICdOZXcgcHJvZHVjdCd9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPkFkZCBwaG90b3MsIHByaWNlcywgYW5kIG9uZSBvciBtb3JlIGNhdGVnb3JpZXMgZm9yIHRoZSB3ZWJzaXRlIGFuZCBhcHAuPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+UHJvZHVjdCBkZXRhaWxzPC9oND5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBOYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5uYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblByb3BlcnR5Q2hhbmdlKCduYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBbHBob25zbyBNYW5nb1wiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgU2x1Z1xuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtzbHVnSW5wdXR9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uUHJvcGVydHlDaGFuZ2UoJ3NsdWcnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImF1dG8tZ2VuZXJhdGVkIGZyb20gbmFtZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPFRleHQgbXQ9XCJzbVwiIG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICBQcmV2aWV3OnsnICd9XG4gICAgICAgICAgICB7cHJvZHVjdFVybCA/IChcbiAgICAgICAgICAgICAgPGEgaHJlZj17cHJvZHVjdFVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlclwiPlxuICAgICAgICAgICAgICAgIHtwcm9kdWN0VXJsfVxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAnR2VuZXJhdGVkIGZyb20gcHJvZHVjdCBuYW1lIHdoZW4gc2F2ZWQnXG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgUHJpY2UgKOKCuSlcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5wcmljZVZhbHVlID8/ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdwcmljZVZhbHVlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgT2xkIHByaWNlICjigrkpXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMub2xkUHJpY2VWYWx1ZSA/PyAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnb2xkUHJpY2VWYWx1ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJPcHRpb25hbFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBXZWlnaHRcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLndlaWdodCB8fCAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnd2VpZ2h0JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjEga2dcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgQmFkZ2VcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmJhZGdlIHx8ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdiYWRnZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJGcmVzaFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBTdG9ja1xuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc3RvY2sgPz8gMTAwfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdzdG9jaycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBTb3J0IG9yZGVyXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zb3J0T3JkZXIgPz8gMH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnc29ydE9yZGVyJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5UYXggJiBHU1Q8L2g0PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxMiB9fT5cbiAgICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgICAgY2hlY2tlZD17aXNGbGFnT24ocGFyYW1zLmlzVGF4YWJsZSl9XG4gICAgICAgICAgICAgIHRpdGxlPVwiVGF4YWJsZVwiXG4gICAgICAgICAgICAgIGhpbnQ9e2lzRmxhZ09uKHBhcmFtcy5pc1RheGFibGUpID8gJ0dTVCB3aWxsIGJlIGNoYXJnZWQgYXQgY2hlY2tvdXQnIDogJ05vIEdTVCBvbiB0aGlzIHByb2R1Y3QnfVxuICAgICAgICAgICAgICBvbkxhYmVsPVwiWWVzXCJcbiAgICAgICAgICAgICAgb2ZmTGFiZWw9XCJOb1wiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdpc1RheGFibGUnLCBuZXh0KVxuICAgICAgICAgICAgICAgIGlmIChuZXh0ICYmIE51bWJlcihwYXJhbXMuZ3N0UmF0ZSB8fCAwKSA9PT0gMCkgc2V0RmllbGQoJ2dzdFJhdGUnLCA1KVxuICAgICAgICAgICAgICAgIGlmICghbmV4dCkgc2V0RmllbGQoJ2dzdFJhdGUnLCAwKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgSFNOIENvZGVcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmhzbkNvZGUgPz8gJzA4MDgnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdoc25Db2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjA4MDIgb3IgMDgwOFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBHU1QgJVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmdzdFJhdGUgPz8gMH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZ3N0UmF0ZScsIE51bWJlcihldmVudC50YXJnZXQudmFsdWUpIHx8IDApfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiNVwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+UHJvZHVjdCBpbWFnZTwvaDQ+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLXVwbG9hZC1kcm9wXCI+XG4gICAgICAgICAgICB7ZGlzcGxheWVkSW1hZ2VVcmwgPyAoXG4gICAgICAgICAgICAgIDxpbWcgc3JjPXtkaXNwbGF5ZWRJbWFnZVVybH0gYWx0PXtwYXJhbXMubmFtZSB8fCAnUHJvZHVjdCBwcmV2aWV3J30gLz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxzcGFuPkNsaWNrIHRvIHVwbG9hZCBhIHNxdWFyZSBwcm9kdWN0IHBob3RvPC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDxpbnB1dCByZWY9e2ZpbGVSZWZ9IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIG9uQ2hhbmdlPXt1cGxvYWRJbWFnZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxUZXh0IG10PVwic21cIiBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgSlBHLCBQTkcsIEdJRiwgb3IgV2ViUCB1cCB0byA1TUIuXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkNhdGVnb3JpZXM8L2g0PlxuICAgICAgICA8cD5BIHByb2R1Y3QgY2FuIGFwcGVhciBpbiBtb3JlIHRoYW4gb25lIGNhdGVnb3J5IG9uIHRoZSB3ZWJzaXRlIGFuZCBhcHAuPC9wPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgU2VsZWN0IGNhdGVnb3JpZXNcbiAgICAgICAgICA8U2VhcmNoYWJsZU11bHRpU2VsZWN0XG4gICAgICAgICAgICBvcHRpb25zPXtjYXRlZ29yaWVzLm1hcCgoaXRlbSkgPT4gKHsgdmFsdWU6IGl0ZW0uc2x1ZywgbGFiZWw6IGl0ZW0ubGFiZWwgfSkpfVxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkQ2F0ZWdvcnlTbHVnc31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTZWxlY3RlZENhdGVnb3JpZXN9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBhbmQgc2VsZWN0IGNhdGVnb3JpZXNcIlxuICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggY2F0ZWdvcmllc1wiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlN0b3JlIHBsYWNlbWVudDwvaDQ+XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxMiB9fT5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgIHRpdGxlPXtpc0FjdGl2ZSA/ICdBY3RpdmUnIDogJ0luYWN0aXZlJ31cbiAgICAgICAgICAgIGhpbnQ9e2lzQWN0aXZlID8gJ1Zpc2libGUgdG8gY3VzdG9tZXJzJyA6ICdIaWRkZW4gZnJvbSB0aGUgd2Vic2l0ZSBhbmQgYXBwJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzQWN0aXZlJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hvaWNlLXJvd1wiPlxuICAgICAgICAgIDxGbGFnQ2FyZFxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3BhcmFtcy5pc0Jlc3RTZWxsZXIgPT09IHRydWUgfHwgcGFyYW1zLmlzQmVzdFNlbGxlciA9PT0gJ3RydWUnfVxuICAgICAgICAgICAgdGl0bGU9XCJCZXN0c2VsbGVyXCJcbiAgICAgICAgICAgIGhpbnQ9XCJTaG93IGluIGJlc3RzZWxsZXJzXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCdpc0Jlc3RTZWxsZXInLCAhKHBhcmFtcy5pc0Jlc3RTZWxsZXIgPT09IHRydWUgfHwgcGFyYW1zLmlzQmVzdFNlbGxlciA9PT0gJ3RydWUnKSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8RmxhZ0NhcmRcbiAgICAgICAgICAgIHNlbGVjdGVkPXtwYXJhbXMuaXNJbXBvcnRlZCA9PT0gdHJ1ZSB8fCBwYXJhbXMuaXNJbXBvcnRlZCA9PT0gJ3RydWUnfVxuICAgICAgICAgICAgdGl0bGU9XCJJbXBvcnRlZFwiXG4gICAgICAgICAgICBoaW50PVwiU2hvdyBpbiBpbXBvcnRlZCBmcnVpdHNcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ2lzSW1wb3J0ZWQnLCAhKHBhcmFtcy5pc0ltcG9ydGVkID09PSB0cnVlIHx8IHBhcmFtcy5pc0ltcG9ydGVkID09PSAndHJ1ZScpKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGbGFnQ2FyZFxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3BhcmFtcy5pc0ZlYXR1cmVkID09PSB0cnVlIHx8IHBhcmFtcy5pc0ZlYXR1cmVkID09PSAndHJ1ZSd9XG4gICAgICAgICAgICB0aXRsZT1cIkZlYXR1cmVkXCJcbiAgICAgICAgICAgIGhpbnQ9XCJIaWdobGlnaHQgdGhpcyBmcnVpdFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgnaXNGZWF0dXJlZCcsICEocGFyYW1zLmlzRmVhdHVyZWQgPT09IHRydWUgfHwgcGFyYW1zLmlzRmVhdHVyZWQgPT09ICd0cnVlJykpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+RGVzY3JpcHRpb248L2g0PlxuICAgICAgICA8cD5cbiAgICAgICAgICBDbGljayBJbnNlcnQgZGV0YWlscyB0ZW1wbGF0ZSwgdGhlbiBlZGl0IHRoZSB0ZXh0IGZvciB0aGlzIGZydWl0LiBPbmx5IFByb2R1Y3QgRGV0YWlsc1xuICAgICAgICAgIHN0YXlzIGJvbGQuIFRoZSByZXN0IHN0YXlzIG5vcm1hbCB0ZXh0LCBsaWtlIHRoZSBzdG9yZSBwcm9kdWN0IHBhZ2UuXG4gICAgICAgIDwvcD5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgbWI9XCJsZ1wiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ2Rlc2NyaXB0aW9uJywgUFJPRFVDVF9ERVRBSUxTX0hUTUwpfVxuICAgICAgICA+XG4gICAgICAgICAgSW5zZXJ0IGRldGFpbHMgdGVtcGxhdGVcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIHtkZXNjcmlwdGlvblByb3BlcnR5ID8gKFxuICAgICAgICAgIDxCb3ggc3R5bGU9e3sgbWluSGVpZ2h0OiAyMjAgfX0+XG4gICAgICAgICAgICA8QmFzZVByb3BlcnR5Q29tcG9uZW50XG4gICAgICAgICAgICAgIHdoZXJlPVwiZWRpdFwiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtvblByb3BlcnR5Q2hhbmdlfVxuICAgICAgICAgICAgICBwcm9wZXJ0eT17ZGVzY3JpcHRpb25Qcm9wZXJ0eX1cbiAgICAgICAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICAgICAgICByZWNvcmQ9e3JlY29yZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZyB8fCB1cGxvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nIHx8IHVwbG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICBTYXZlIHByb2R1Y3RcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcm9kdWN0RWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEJhc2VQcm9wZXJ0eUNvbXBvbmVudCwgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgRmxhZ0NhcmQgfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5jb25zdCBub3JtYWxpemVTbHVnSW5wdXQgPSAodmFsdWUpID0+XG4gIFN0cmluZyh2YWx1ZSB8fCAnJylcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC50cmltKClcbiAgICAucmVwbGFjZSgvWydcIl0vZywgJycpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxuICAgIC5yZXBsYWNlKC9eLSt8LSskL2csICcnKVxuXG5jb25zdCB3aXRob3V0VHJhaWxpbmdTbGFzaCA9ICh2YWx1ZSkgPT4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9cXC8rJC8sICcnKVxuXG5jb25zdCBDYXRlZ29yeUVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wc1xuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgZmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBiYW5uZXJGaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFt1cGxvYWRpbmcsIHNldFVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Jhbm5lclVwbG9hZGluZywgc2V0QmFubmVyVXBsb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2x1Z0VkaXRlZCwgc2V0U2x1Z0VkaXRlZF0gPSB1c2VTdGF0ZShCb29sZWFuKGluaXRpYWxSZWNvcmQ/LnBhcmFtcz8uc2x1ZykpXG4gIGNvbnN0IFtwcmV2aWV3VXJsLCBzZXRQcmV2aWV3VXJsXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbYmFubmVyUHJldmlld1VybCwgc2V0QmFubmVyUHJldmlld1VybF0gPSB1c2VTdGF0ZSgnJylcblxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG4gIGNvbnN0IGNhdGVnb3J5VXJsQmFzZSA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKFxuICAgIGN1c3RvbS5jYXRlZ29yeVVybEJhc2UgfHwgYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vY2F0ZWdvcnlgLFxuICApXG4gIGNvbnN0IHNsdWdJbnB1dCA9IHBhcmFtcy5zbHVnID8/ICcnXG4gIGNvbnN0IHByZXZpZXdTbHVnID0gbm9ybWFsaXplU2x1Z0lucHV0KHNsdWdJbnB1dCkgfHwgbm9ybWFsaXplU2x1Z0lucHV0KHBhcmFtcy5sYWJlbClcbiAgY29uc3QgY2F0ZWdvcnlVcmwgPSBwcmV2aWV3U2x1ZyA/IGAke2NhdGVnb3J5VXJsQmFzZX0vJHtwcmV2aWV3U2x1Z31gIDogbnVsbFxuXG4gIGNvbnN0IGltYWdlVXJsID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFwYXJhbXMuaW1hZ2UpIHJldHVybiAnJ1xuICAgIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChwYXJhbXMuaW1hZ2UpKSByZXR1cm4gcGFyYW1zLmltYWdlXG4gICAgcmV0dXJuIGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHtwYXJhbXMuaW1hZ2V9YFxuICB9LCBbY3VzdG9tLmFwcFVybCwgcGFyYW1zLmltYWdlXSlcblxuICBjb25zdCBkaXNwbGF5ZWRJbWFnZVVybCA9IHByZXZpZXdVcmwgfHwgaW1hZ2VVcmxcblxuICBjb25zdCBiYW5uZXJJbWFnZVVybCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghcGFyYW1zLmJhbm5lckltYWdlKSByZXR1cm4gJydcbiAgICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGFyYW1zLmJhbm5lckltYWdlKSkgcmV0dXJuIHBhcmFtcy5iYW5uZXJJbWFnZVxuICAgIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGFyYW1zLmJhbm5lckltYWdlfWBcbiAgfSwgW2N1c3RvbS5hcHBVcmwsIHBhcmFtcy5iYW5uZXJJbWFnZV0pXG5cbiAgY29uc3QgZGlzcGxheWVkQmFubmVyVXJsID0gYmFubmVyUHJldmlld1VybCB8fCBiYW5uZXJJbWFnZVVybFxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChwcmV2aWV3VXJsPy5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKHByZXZpZXdVcmwpXG4gICAgfVxuICB9LCBbcHJldmlld1VybF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGJhbm5lclByZXZpZXdVcmw/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwoYmFubmVyUHJldmlld1VybClcbiAgICB9XG4gIH0sIFtiYW5uZXJQcmV2aWV3VXJsXSlcblxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCBvblByb3BlcnR5Q2hhbmdlID0gKHByb3BlcnR5UGF0aCwgdmFsdWUsIC4uLnJlc3QpID0+IHtcbiAgICBpZiAocHJvcGVydHlQYXRoID09PSAnc2x1ZycpIHtcbiAgICAgIHNldFNsdWdFZGl0ZWQodHJ1ZSlcbiAgICAgIGhhbmRsZUNoYW5nZShwcm9wZXJ0eVBhdGgsIG5vcm1hbGl6ZVNsdWdJbnB1dCh2YWx1ZSksIC4uLnJlc3QpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaGFuZGxlQ2hhbmdlKHByb3BlcnR5UGF0aCwgdmFsdWUsIC4uLnJlc3QpXG4gICAgaWYgKHByb3BlcnR5UGF0aCA9PT0gJ2xhYmVsJyAmJiAhc2x1Z0VkaXRlZCkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdzbHVnJywgbm9ybWFsaXplU2x1Z0lucHV0KHZhbHVlKSlcbiAgICB9XG4gIH1cblxuICBjb25zdCB1cGxvYWRUbyA9IGFzeW5jIChmaWxlLCBmaWVsZCwgc2V0TG9jYWxQcmV2aWV3LCBzZXRCdXN5LCBzdWNjZXNzTWVzc2FnZSkgPT4ge1xuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZvbGRlcicsICdjYXRlZ29yaWVzJylcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIHNldExvY2FsUHJldmlldyhVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpKVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS91cGxvYWRgLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIH0pXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdJbWFnZSB1cGxvYWQgZmFpbGVkJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1lZGlhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICBvblByb3BlcnR5Q2hhbmdlKGZpZWxkLCBtZWRpYS5wYXRoKVxuICAgICAgc2V0TG9jYWxQcmV2aWV3KFxuICAgICAgICAvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChtZWRpYS5wYXRoKVxuICAgICAgICAgID8gbWVkaWEucGF0aFxuICAgICAgICAgIDogYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke21lZGlhLnBhdGh9YCxcbiAgICAgIClcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IHN1Y2Nlc3NNZXNzYWdlLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IHVwbG9hZCBpbWFnZScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgY2F0ZWdvcnknLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NhdGVnb3J5IHNhdmVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIGNhdGVnb3J5JywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgfVxuXG4gIGNvbnN0IGRlc2NyaXB0aW9uUHJvcGVydHkgPSByZXNvdXJjZS5lZGl0UHJvcGVydGllcy5maW5kKFxuICAgIChwcm9wZXJ0eSkgPT4gcHJvcGVydHkucHJvcGVydHlQYXRoID09PSAnZGVzY3JpcHRpb24nLFxuICApXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e3BhcmFtcy5sYWJlbCB8fCAnTmV3IGNhdGVnb3J5J308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+Q3JlYXRlIGEgc2hvcCBzZWN0aW9uIHdpdGggYSB0aHVtYm5haWwsIGJhbm5lciwgYW5kIHBhZ2UgY29weS48L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5DYXRlZ29yeSBkZXRhaWxzPC9oND5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBMYWJlbFxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubGFiZWwgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uUHJvcGVydHlDaGFuZ2UoJ2xhYmVsJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJGcmVzaCBGcnVpdHNcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFBhZ2UgaGVhZGluZ1xuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudGl0bGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd0aXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2FtZSBhcyBsYWJlbCBpZiBlbXB0eVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgU3VidGl0bGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnN1YnRpdGxlIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnc3VidGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNob3J0IGxpbmUgdW5kZXIgdGhlIGhlYWRpbmdcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFNsdWdcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17c2x1Z0lucHV0fVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblByb3BlcnR5Q2hhbmdlKCdzbHVnJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJhdXRvLWdlbmVyYXRlZCBmcm9tIGxhYmVsXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8VGV4dCBtdD1cInNtXCIgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgIFByZXZpZXc6eycgJ31cbiAgICAgICAgICAgIHtjYXRlZ29yeVVybCA/IChcbiAgICAgICAgICAgICAgPGEgaHJlZj17Y2F0ZWdvcnlVcmx9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXJcIj5cbiAgICAgICAgICAgICAgICB7Y2F0ZWdvcnlVcmx9XG4gICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICdHZW5lcmF0ZWQgZnJvbSBjYXRlZ29yeSBsYWJlbCB3aGVuIHNhdmVkJ1xuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIFNvcnQgb3JkZXJcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnNvcnRPcmRlciA/PyAwfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdzb3J0T3JkZXInLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgU3RhdHVzXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hvaWNlLXJvd1wiIHN0eWxlPXt7IG1hcmdpblRvcDogNiB9fT5cbiAgICAgICAgICAgICAgICA8RmxhZ0NhcmRcbiAgICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtwYXJhbXMuaXNBY3RpdmUgIT09IGZhbHNlICYmIHBhcmFtcy5pc0FjdGl2ZSAhPT0gJ2ZhbHNlJ31cbiAgICAgICAgICAgICAgICAgIHRpdGxlPVwiQWN0aXZlXCJcbiAgICAgICAgICAgICAgICAgIGhpbnQ9XCJTaG93biBvbiB3ZWJzaXRlIGFuZCBhcHBcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT5cbiAgICAgICAgICAgICAgICAgICAgc2V0RmllbGQoJ2lzQWN0aXZlJywgIShwYXJhbXMuaXNBY3RpdmUgIT09IGZhbHNlICYmIHBhcmFtcy5pc0FjdGl2ZSAhPT0gJ2ZhbHNlJykpXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+Q2F0ZWdvcnkgaW1hZ2U8L2g0PlxuICAgICAgICAgIDxwPlNxdWFyZSB0aHVtYm5haWwgdXNlZCBpbiB0aGUgaG9tZSBjYXRlZ29yeSBncmlkLjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktdXBsb2FkLWRyb3BcIj5cbiAgICAgICAgICAgIHtkaXNwbGF5ZWRJbWFnZVVybCA/IChcbiAgICAgICAgICAgICAgPGltZyBzcmM9e2Rpc3BsYXllZEltYWdlVXJsfSBhbHQ9e3BhcmFtcy5sYWJlbCB8fCAnQ2F0ZWdvcnkgcHJldmlldyd9IC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8c3Bhbj5DbGljayB0byB1cGxvYWQgY2F0ZWdvcnkgaW1hZ2U8L3NwYW4+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHJlZj17ZmlsZVJlZn1cbiAgICAgICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgICAgICBhY2NlcHQ9XCJpbWFnZS8qXCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXVxuICAgICAgICAgICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICAgICAgICB1cGxvYWRUbyhmaWxlLCAnaW1hZ2UnLCBzZXRQcmV2aWV3VXJsLCBzZXRVcGxvYWRpbmcsICdJbWFnZSB1cGxvYWRlZCBzdWNjZXNzZnVsbHknKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJ1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkNhdGVnb3J5IGJhbm5lcjwvaDQ+XG4gICAgICAgIDxwPldpZGUgaW1hZ2Ugc2hvd24gYXQgdGhlIHRvcCBvZiB0aGUgY2F0ZWdvcnkgcGFnZS48L3A+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS11cGxvYWQtZHJvcCB0b2tyaS11cGxvYWQtZHJvcC13aWRlXCI+XG4gICAgICAgICAge2Rpc3BsYXllZEJhbm5lclVybCA/IChcbiAgICAgICAgICAgIDxpbWcgc3JjPXtkaXNwbGF5ZWRCYW5uZXJVcmx9IGFsdD17cGFyYW1zLmxhYmVsIHx8ICdDYXRlZ29yeSBiYW5uZXInfSAvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8c3Bhbj5DbGljayB0byB1cGxvYWQgYSB3aWRlIGJhbm5lciAoMTYwMMOXNDAwIHJlY29tbWVuZGVkKTwvc3Bhbj5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgcmVmPXtiYW5uZXJGaWxlUmVmfVxuICAgICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgICAgYWNjZXB0PVwiaW1hZ2UvKlwiXG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXVxuICAgICAgICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgICAgIHVwbG9hZFRvKFxuICAgICAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgICAgICdiYW5uZXJJbWFnZScsXG4gICAgICAgICAgICAgICAgICBzZXRCYW5uZXJQcmV2aWV3VXJsLFxuICAgICAgICAgICAgICAgICAgc2V0QmFubmVyVXBsb2FkaW5nLFxuICAgICAgICAgICAgICAgICAgJ0Jhbm5lciB1cGxvYWRlZCBzdWNjZXNzZnVsbHknLFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJ1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+RGVzY3JpcHRpb248L2g0PlxuICAgICAgICB7ZGVzY3JpcHRpb25Qcm9wZXJ0eSA/IChcbiAgICAgICAgICA8Qm94IHN0eWxlPXt7IG1pbkhlaWdodDogMjIwIH19PlxuICAgICAgICAgICAgPEJhc2VQcm9wZXJ0eUNvbXBvbmVudFxuICAgICAgICAgICAgICB3aGVyZT1cImVkaXRcIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17b25Qcm9wZXJ0eUNoYW5nZX1cbiAgICAgICAgICAgICAgcHJvcGVydHk9e2Rlc2NyaXB0aW9uUHJvcGVydHl9XG4gICAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX0gYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgIHtyZXNvdXJjZS5lZGl0UHJvcGVydGllc1xuICAgICAgICAgIC5maWx0ZXIoKHByb3BlcnR5KSA9PiBbJ2ltYWdlJywgJ2Jhbm5lckltYWdlJ10uaW5jbHVkZXMocHJvcGVydHkucHJvcGVydHlQYXRoKSlcbiAgICAgICAgICAubWFwKChwcm9wZXJ0eSkgPT4gKFxuICAgICAgICAgICAgPEJhc2VQcm9wZXJ0eUNvbXBvbmVudFxuICAgICAgICAgICAgICBrZXk9e3Byb3BlcnR5LnByb3BlcnR5UGF0aH1cbiAgICAgICAgICAgICAgd2hlcmU9XCJlZGl0XCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9e29uUHJvcGVydHlDaGFuZ2V9XG4gICAgICAgICAgICAgIHByb3BlcnR5PXtwcm9wZXJ0eX1cbiAgICAgICAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICAgICAgICByZWNvcmQ9e3JlY29yZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSl9XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmcgfHwgdXBsb2FkaW5nIHx8IGJhbm5lclVwbG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgfHwgdXBsb2FkaW5nIHx8IGJhbm5lclVwbG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICBTYXZlIGNhdGVnb3J5XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2F0ZWdvcnlFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEljb24sIElucHV0LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7XG4gIFJlY29yZHNUYWJsZSxcbiAgdXNlUXVlcnlQYXJhbXMsXG4gIHVzZVJlY29yZHMsXG4gIHVzZVNlbGVjdGVkUmVjb3Jkcyxcbn0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IExvY2FsU2VsZWN0IH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3QgUEVSX1BBR0VfT1BUSU9OUyA9IFsxMCwgMjUsIDUwXVxuXG5jb25zdCBDbXNMaXN0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVzb3VyY2UsIHNldFRhZyB9ID0gcHJvcHNcbiAgY29uc3QgdGl0bGVQcm9wID0gcmVzb3VyY2UudGl0bGVQcm9wZXJ0eT8ubmFtZSB8fCByZXNvdXJjZS50aXRsZVByb3BlcnR5Py5wcm9wZXJ0eVBhdGggfHwgJ2lkJ1xuXG4gIGNvbnN0IHsgc3RvcmVQYXJhbXMsIGZpbHRlcnMsIHBhcnNlZFF1ZXJ5IH0gPSB1c2VRdWVyeVBhcmFtcygpXG4gIGNvbnN0IHtcbiAgICByZWNvcmRzLFxuICAgIGxvYWRpbmcsXG4gICAgZGlyZWN0aW9uLFxuICAgIHNvcnRCeSxcbiAgICBwYWdlLFxuICAgIHRvdGFsLFxuICAgIGZldGNoRGF0YSxcbiAgICBwZXJQYWdlLFxuICB9ID0gdXNlUmVjb3JkcyhyZXNvdXJjZS5pZClcbiAgY29uc3Qge1xuICAgIHNlbGVjdGVkUmVjb3JkcyxcbiAgICBoYW5kbGVTZWxlY3QsXG4gICAgaGFuZGxlU2VsZWN0QWxsLFxuICAgIHNldFNlbGVjdGVkUmVjb3JkcyxcbiAgfSA9IHVzZVNlbGVjdGVkUmVjb3JkcyhyZWNvcmRzKVxuXG4gIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gdXNlU3RhdGUoKCkgPT4gU3RyaW5nKHBhcnNlZFF1ZXJ5Py5xIHx8IGZpbHRlcnM/Llt0aXRsZVByb3BdIHx8ICcnKSlcbiAgY29uc3QgZGVib3VuY2VSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3Qgc3RvcmVQYXJhbXNSZWYgPSB1c2VSZWYoc3RvcmVQYXJhbXMpXG4gIHN0b3JlUGFyYW1zUmVmLmN1cnJlbnQgPSBzdG9yZVBhcmFtc1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0UXVlcnkoU3RyaW5nKHBhcnNlZFF1ZXJ5Py5xIHx8IGZpbHRlcnM/Llt0aXRsZVByb3BdIHx8ICcnKSlcbiAgICBzZXRTZWxlY3RlZFJlY29yZHMoW10pXG4gIH0sIFtyZXNvdXJjZS5pZCwgdGl0bGVQcm9wLCBzZXRTZWxlY3RlZFJlY29yZHNdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNldFRhZykgc2V0VGFnKHRvdGFsLnRvU3RyaW5nKCkpXG4gIH0sIFt0b3RhbCwgc2V0VGFnXSlcblxuICBjb25zdCBoYW5kbGVRdWVyeUNoYW5nZSA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlXG4gICAgc2V0UXVlcnkodmFsdWUpXG5cbiAgICBpZiAoZGVib3VuY2VSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KGRlYm91bmNlUmVmLmN1cnJlbnQpXG4gICAgZGVib3VuY2VSZWYuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3QgdHJpbW1lZCA9IHZhbHVlLnRyaW0oKVxuICAgICAgc3RvcmVQYXJhbXNSZWYuY3VycmVudCh7XG4gICAgICAgIHBhZ2U6ICcxJyxcbiAgICAgICAgcTogdHJpbW1lZCB8fCB1bmRlZmluZWQsXG4gICAgICB9KVxuICAgIH0sIDMwMClcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChkZWJvdW5jZVJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQoZGVib3VuY2VSZWYuY3VycmVudClcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZUFjdGlvblBlcmZvcm1lZCA9ICgpID0+IGZldGNoRGF0YSgpXG5cbiAgY29uc3QgY3VycmVudFBhZ2UgPSBOdW1iZXIocGFnZSkgfHwgMVxuICBjb25zdCByb3dzUGVyUGFnZSA9IE51bWJlcihwZXJQYWdlKSB8fCAxMFxuICBjb25zdCB0b3RhbFJvd3MgPSBOdW1iZXIodG90YWwpIHx8IDBcbiAgY29uc3QgdG90YWxQYWdlcyA9IE1hdGgubWF4KDEsIE1hdGguY2VpbCh0b3RhbFJvd3MgLyByb3dzUGVyUGFnZSkgfHwgMSlcbiAgY29uc3QgZnJvbSA9IHRvdGFsUm93cyA9PT0gMCA/IDAgOiAoY3VycmVudFBhZ2UgLSAxKSAqIHJvd3NQZXJQYWdlICsgMVxuICBjb25zdCB0byA9IE1hdGgubWluKGN1cnJlbnRQYWdlICogcm93c1BlclBhZ2UsIHRvdGFsUm93cylcblxuICBjb25zdCBnb1RvUGFnZSA9IChuZXh0UGFnZSkgPT4ge1xuICAgIGNvbnN0IHNhZmUgPSBNYXRoLm1pbihNYXRoLm1heCgxLCBuZXh0UGFnZSksIHRvdGFsUGFnZXMpXG4gICAgc3RvcmVQYXJhbXMoe1xuICAgICAgcGFnZTogU3RyaW5nKHNhZmUpLFxuICAgICAgcTogcGFyc2VkUXVlcnk/LnEgfHwgZmlsdGVycz8uW3RpdGxlUHJvcF0gfHwgdW5kZWZpbmVkLFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjaGFuZ2VQZXJQYWdlID0gKG5leHQpID0+IHtcbiAgICBzdG9yZVBhcmFtcyh7XG4gICAgICBwYWdlOiAnMScsXG4gICAgICBwZXJQYWdlOiBTdHJpbmcobmV4dCksXG4gICAgICBxOiBwYXJzZWRRdWVyeT8ucSB8fCBmaWx0ZXJzPy5bdGl0bGVQcm9wXSB8fCB1bmRlZmluZWQsXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHBhZ2VOdW1iZXJzID0gW11cbiAgY29uc3Qgd2luZG93U2l6ZSA9IDVcbiAgbGV0IHN0YXJ0ID0gTWF0aC5tYXgoMSwgY3VycmVudFBhZ2UgLSBNYXRoLmZsb29yKHdpbmRvd1NpemUgLyAyKSlcbiAgbGV0IGVuZCA9IE1hdGgubWluKHRvdGFsUGFnZXMsIHN0YXJ0ICsgd2luZG93U2l6ZSAtIDEpXG4gIHN0YXJ0ID0gTWF0aC5tYXgoMSwgZW5kIC0gd2luZG93U2l6ZSArIDEpXG4gIGZvciAobGV0IG51bWJlciA9IHN0YXJ0OyBudW1iZXIgPD0gZW5kOyBudW1iZXIgKz0gMSkgcGFnZU51bWJlcnMucHVzaChudW1iZXIpXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHZhcmlhbnQ9XCJncmV5XCI+XG4gICAgICA8Qm94IG1iPVwibGdcIiBzdHlsZT17eyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgbWF4V2lkdGg6IDQyMCB9fT5cbiAgICAgICAgPEJveFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogJzUwJScsXG4gICAgICAgICAgICBsZWZ0OiAxMixcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoLTUwJSknLFxuICAgICAgICAgICAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICAgICAgICAgICAgb3BhY2l0eTogMC42LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8SWNvbiBpY29uPVwiU2VhcmNoXCIgLz5cbiAgICAgICAgPC9Cb3g+XG4gICAgICAgIDxJbnB1dFxuICAgICAgICAgIHZhbHVlPXtxdWVyeX1cbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlUXVlcnlDaGFuZ2V9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e2BTZWFyY2ggYWxsICR7cmVzb3VyY2UubmFtZX0uLi5gfVxuICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmdMZWZ0OiAzNiB9fVxuICAgICAgICAvPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggdmFyaWFudD1cImNvbnRhaW5lclwiPlxuICAgICAgICA8UmVjb3Jkc1RhYmxlXG4gICAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICAgIHJlY29yZHM9e3JlY29yZHN9XG4gICAgICAgICAgYWN0aW9uUGVyZm9ybWVkPXtoYW5kbGVBY3Rpb25QZXJmb3JtZWR9XG4gICAgICAgICAgb25TZWxlY3Q9e2hhbmRsZVNlbGVjdH1cbiAgICAgICAgICBvblNlbGVjdEFsbD17aGFuZGxlU2VsZWN0QWxsfVxuICAgICAgICAgIHNlbGVjdGVkUmVjb3Jkcz17c2VsZWN0ZWRSZWNvcmRzfVxuICAgICAgICAgIGRpcmVjdGlvbj17ZGlyZWN0aW9ufVxuICAgICAgICAgIHNvcnRCeT17c29ydEJ5fVxuICAgICAgICAgIGlzTG9hZGluZz17bG9hZGluZ31cbiAgICAgICAgLz5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxpc3QtcGFnaW5hdGlvblwiPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRva3JpLWxpc3QtcGFnaW5hdGlvbi1zdW1tYXJ5XCI+XG4gICAgICAgICAgICB7dG90YWxSb3dzID09PSAwID8gJ05vIHJlY29yZHMnIDogYFNob3dpbmcgJHtmcm9tfeKAkyR7dG99IG9mICR7dG90YWxSb3dzfWB9XG4gICAgICAgICAgPC9UZXh0PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1saXN0LXBhZ2luYXRpb24tc2l6ZVwiPlxuICAgICAgICAgICAgPHNwYW4+Um93czwvc3Bhbj5cbiAgICAgICAgICAgIDxMb2NhbFNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17U3RyaW5nKHJvd3NQZXJQYWdlKX1cbiAgICAgICAgICAgICAgb3B0aW9ucz17UEVSX1BBR0VfT1BUSU9OUy5tYXAoKG9wdGlvbikgPT4gKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogU3RyaW5nKG9wdGlvbiksXG4gICAgICAgICAgICAgICAgbGFiZWw6IFN0cmluZyhvcHRpb24pLFxuICAgICAgICAgICAgICB9KSl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gY2hhbmdlUGVyUGFnZShOdW1iZXIobmV4dCkpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbGlzdC1wYWdpbmF0aW9uLXBhZ2VzXCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPD0gMX0gb25DbGljaz17KCkgPT4gZ29Ub1BhZ2UoY3VycmVudFBhZ2UgLSAxKX0+XG4gICAgICAgICAgICAgIFByZXZcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAge3BhZ2VOdW1iZXJzLm1hcCgobnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBrZXk9e251bWJlcn1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e251bWJlciA9PT0gY3VycmVudFBhZ2UgPyAnaXMtY3VycmVudCcgOiAnJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBnb1RvUGFnZShudW1iZXIpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge251bWJlcn1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRpc2FibGVkPXtjdXJyZW50UGFnZSA+PSB0b3RhbFBhZ2VzfSBvbkNsaWNrPXsoKSA9PiBnb1RvUGFnZShjdXJyZW50UGFnZSArIDEpfT5cbiAgICAgICAgICAgICAgTmV4dFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ21zTGlzdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IExvY2FsU2VsZWN0LCBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuZnVuY3Rpb24gcmVzb2x2ZUltYWdlVXJsKHBhdGgsIGFwcFVybCkge1xuICBpZiAoIXBhdGgpIHJldHVybiAnJ1xuICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGF0aCkpIHJldHVybiBwYXRoXG4gIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChhcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHtwYXRofWBcbn1cblxuZnVuY3Rpb24gRmllbGRFcnJvcih7IGVycm9yIH0pIHtcbiAgaWYgKCFlcnJvcj8ubWVzc2FnZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9yLm1lc3NhZ2V9PC9zcGFuPlxufVxuXG5jb25zdCBSZXZpZXdFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSwgYWN0aW9uIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgZmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbdXBsb2FkaW5nLCBzZXRVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtwcmV2aWV3VXJsLCBzZXRQcmV2aWV3VXJsXSA9IHVzZVN0YXRlKCcnKVxuXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzTmV3ID0gYWN0aW9uPy5uYW1lID09PSAnbmV3JyB8fCAhcmVjb3JkPy5pZFxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG4gIGNvbnN0IGFwcFVybCA9IGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICBjb25zdCBlcnJvcnMgPSB1c2VNZW1vKCgpID0+IHJlY29yZD8uZXJyb3JzIHx8IHt9LCBbcmVjb3JkPy5lcnJvcnNdKVxuICBjb25zdCByYXRpbmcgPSBNYXRoLm1pbig1LCBNYXRoLm1heCgxLCBOdW1iZXIocGFyYW1zLnJhdGluZykgfHwgNSkpXG4gIGNvbnN0IGlzQXBwcm92ZWQgPVxuICAgIGlzTmV3ICYmIChwYXJhbXMuaXNBcHByb3ZlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FwcHJvdmVkID09PSAnJylcbiAgICAgID8gdHJ1ZVxuICAgICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNBcHByb3ZlZClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLmlzQXBwcm92ZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBcHByb3ZlZCA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ2lzQXBwcm92ZWQnLCB0cnVlKVxuICAgIH1cbiAgICBpZiAoaXNOZXcgJiYgIXBhcmFtcy5yYXRpbmcpIGhhbmRsZUNoYW5nZSgncmF0aW5nJywgNSlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtpc05ld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHByZXZpZXdVcmw/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwocHJldmlld1VybClcbiAgICB9XG4gIH0sIFtwcmV2aWV3VXJsXSlcblxuICBjb25zdCBpbWFnZVVybCA9IHVzZU1lbW8oXG4gICAgKCkgPT4gcmVzb2x2ZUltYWdlVXJsKHBhcmFtcy5pbWFnZSwgYXBwVXJsKSxcbiAgICBbYXBwVXJsLCBwYXJhbXMuaW1hZ2VdLFxuICApXG4gIGNvbnN0IGRpc3BsYXllZEltYWdlVXJsID0gcHJldmlld1VybCB8fCBpbWFnZVVybFxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCB1cGxvYWRJbWFnZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXVxuICAgIGlmICghZmlsZSkgcmV0dXJuXG5cbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmb2xkZXInLCAncmV2aWV3cycpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSlcbiAgICBjb25zdCBsb2NhbFByZXZpZXdVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpXG4gICAgc2V0UHJldmlld1VybChsb2NhbFByZXZpZXdVcmwpXG4gICAgc2V0VXBsb2FkaW5nKHRydWUpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS91cGxvYWRgLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIH0pXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdJbWFnZSB1cGxvYWQgZmFpbGVkJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1lZGlhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICBzZXRGaWVsZCgnaW1hZ2UnLCBtZWRpYS5wYXRoKVxuICAgICAgc2V0UHJldmlld1VybChyZXNvbHZlSW1hZ2VVcmwobWVkaWEucGF0aCwgYXBwVXJsKSlcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdQaG90byB1cGxvYWRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgdXBsb2FkIGltYWdlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRVcGxvYWRpbmcoZmFsc2UpXG4gICAgICBpZiAoZmlsZVJlZi5jdXJyZW50KSBmaWxlUmVmLmN1cnJlbnQudmFsdWUgPSAnJ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSByZXZpZXcnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogaXNOZXcgPyAnUmV2aWV3IGNyZWF0ZWQnIDogJ1JldmlldyB1cGRhdGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHJldmlldy4gUGxlYXNlIHRyeSBhZ2Fpbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e2lzTmV3ID8gJ0FkZCBob21lcGFnZSByZXZpZXcnIDogcGFyYW1zLnRpdGxlIHx8ICdSZXZpZXcnfTwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5cbiAgICAgICAgICBBcHByb3ZlZCByZXZpZXdzIGFwcGVhciBvbiB0aGUgd2Vic2l0ZSBob21lcGFnZS4gSGlkZGVuIHJldmlld3Mgc3RheSBpbiBDTVMgb25seS5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+V2Vic2l0ZSB2aXNpYmlsaXR5PC9oND5cbiAgICAgICAgICA8cD5UdXJuIHRoaXMgb2ZmIHRvIGhpZGUgdGhlIHJldmlldyB3aXRob3V0IGRlbGV0aW5nIGl0LjwvcD5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtpc0FwcHJvdmVkfVxuICAgICAgICAgICAgb25MYWJlbD1cIkFwcHJvdmVkXCJcbiAgICAgICAgICAgIG9mZkxhYmVsPVwiSGlkZGVuXCJcbiAgICAgICAgICAgIHRpdGxlPXtpc0FwcHJvdmVkID8gJ0FwcHJvdmVkJyA6ICdIaWRkZW4nfVxuICAgICAgICAgICAgaGludD17aXNBcHByb3ZlZCA/ICdWaXNpYmxlIG9uIHRoZSBob21lcGFnZScgOiAnSGlkZGVuIHVudGlsIHlvdSBhcHByb3ZlIGl0J31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzQXBwcm92ZWQnLCBuZXh0KX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+UmF0aW5nPC9oND5cbiAgICAgICAgICA8cD5TaG93biBhcyBzdGFycyBvbiB0aGUgaG9tZXBhZ2UgcmV2aWV3IGNhcmQuPC9wPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFN0YXJzXG4gICAgICAgICAgICA8TG9jYWxTZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e3JhdGluZ31cbiAgICAgICAgICAgICAgb3B0aW9ucz17WzUsIDQsIDMsIDIsIDFdLm1hcCgodmFsdWUpID0+ICh7XG4gICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGAke3ZhbHVlfSBzdGFyJHt2YWx1ZSA9PT0gMSA/ICcnIDogJ3MnfWAsXG4gICAgICAgICAgICAgIH0pKX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgncmF0aW5nJywgTnVtYmVyKG5leHQpKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5SZXZpZXcgdGV4dDwvaDQ+XG4gICAgICAgIDxwPktlZXAgaXQgc2hvcnQuIFRoaXMgaXMgd2hhdCBjdXN0b21lcnMgcmVhZCBvbiB0aGUgaG9tZXBhZ2UuPC9wPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBUaXRsZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudGl0bGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd0aXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU3VwZXIgZnJlc2ggZnJ1aXRzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnRpdGxlfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUmV2aWV3ZXIgbmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ25hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlByaXlhIFNoYXJtYVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5uYW1lfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgUmV2aWV3XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgcm93cz17NH1cbiAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNvbnRlbnQgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnY29udGVudCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFsd2F5cyBmcmVzaCBhbmQgZGVsaXZlcmVkIHJpZ2h0IG9uIHRpbWUuXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuY29udGVudH0gLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlJldmlld2VyIHBob3RvPC9oND5cbiAgICAgICAgPHA+T3B0aW9uYWwuIElmIGVtcHR5LCB0aGUgd2Vic2l0ZSBzaG93cyBpbml0aWFscyBpbnN0ZWFkLjwvcD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIFBob3RvXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktdXBsb2FkLWRyb3AgdG9rcmktdXBsb2FkLWRyb3Atcm91bmRcIj5cbiAgICAgICAgICAgIHtkaXNwbGF5ZWRJbWFnZVVybCA/IChcbiAgICAgICAgICAgICAgPGltZyBzcmM9e2Rpc3BsYXllZEltYWdlVXJsfSBhbHQ9e3BhcmFtcy5uYW1lIHx8ICdSZXZpZXdlcid9IC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8c3Bhbj57dXBsb2FkaW5nID8gJ1VwbG9hZGluZ+KApicgOiAnQ2xpY2sgdG8gdXBsb2FkIGEgcGhvdG8nfTwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8aW5wdXQgcmVmPXtmaWxlUmVmfSB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiBvbkNoYW5nZT17dXBsb2FkSW1hZ2V9IC8+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5KUEcsIFBORywgR0lGLCBvciBXZWJQIHVwIHRvIDVNQjwvc3Bhbj5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmcgfHwgdXBsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyB8fCB1cGxvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAge2lzTmV3ID8gJ0NyZWF0ZSByZXZpZXcnIDogJ1NhdmUgcmV2aWV3J31cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZXZpZXdFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQsIFRpbnlNQ0UgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmNvbnN0IEVESVRPUl9PUFRJT05TID0ge1xuICBwbHVnaW5zOiBbJ2xpbmsnLCAnbGlzdHMnLCAnaW1hZ2UnLCAnYXV0b2xpbmsnLCAnY29kZScsICd3b3JkY291bnQnXSxcbiAgdG9vbGJhcjogJ3VuZG8gcmVkbyB8IGJsb2NrcyB8IGJvbGQgaXRhbGljIHVuZGVybGluZSB8IGJ1bGxpc3QgbnVtbGlzdCB8IGxpbmsgaW1hZ2UgfCByZW1vdmVmb3JtYXQnLFxuICBoZWlnaHQ6IDQyMCxcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUltYWdlVXJsKHBhdGgsIGFwcFVybCkge1xuICBpZiAoIXBhdGgpIHJldHVybiAnJ1xuICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGF0aCkpIHJldHVybiBwYXRoXG4gIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChhcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHtwYXRofWBcbn1cblxuZnVuY3Rpb24gZGF0ZUlucHV0VmFsdWUodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcbiAgaWYgKE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiBTdHJpbmcodmFsdWUpLnNsaWNlKDAsIDEwKVxuICBjb25zdCB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpXG4gIGNvbnN0IG1vbnRoID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJylcbiAgY29uc3QgZGF5ID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpXG4gIHJldHVybiBgJHt5ZWFyfS0ke21vbnRofS0ke2RheX1gXG59XG5cbmZ1bmN0aW9uIHBhZCh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5wYWRTdGFydCgyLCAnMCcpXG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF0ZVZhbHVlKHZhbHVlKSB7XG4gIGNvbnN0IHRleHQgPSBTdHJpbmcodmFsdWUgfHwgJycpLnRyaW0oKVxuICBpZiAoIXRleHQpIHJldHVybiBudWxsXG4gIGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaCgvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pLylcbiAgaWYgKG1hdGNoKSB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKE51bWJlcihtYXRjaFsxXSksIE51bWJlcihtYXRjaFsyXSkgLSAxLCBOdW1iZXIobWF0Y2hbM10pKVxuICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpID8gbnVsbCA6IGRhdGVcbiAgfVxuICBjb25zdCBkYXRlID0gbmV3IERhdGUodGV4dClcbiAgcmV0dXJuIE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkgPyBudWxsIDogZGF0ZVxufVxuXG5mdW5jdGlvbiB0b0RhdGVWYWx1ZShkYXRlKSB7XG4gIHJldHVybiBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9LSR7cGFkKGRhdGUuZ2V0TW9udGgoKSArIDEpfS0ke3BhZChkYXRlLmdldERhdGUoKSl9YFxufVxuXG5mdW5jdGlvbiBEYXRlRmllbGQoeyB2YWx1ZSwgb25DaGFuZ2UgfSkge1xuICBjb25zdCBzZWxlY3RlZCA9IHBhcnNlRGF0ZVZhbHVlKHZhbHVlKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW21vbnRoRGF0ZSwgc2V0TW9udGhEYXRlXSA9IHVzZVN0YXRlKHNlbGVjdGVkIHx8IG5ldyBEYXRlKCkpXG4gIGNvbnN0IHdyYXBSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgW29wZW5VcCwgc2V0T3BlblVwXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3QgdXBkYXRlID0gKCkgPT4ge1xuICAgICAgY29uc3QgcmVjdCA9IHdyYXBSZWYuY3VycmVudD8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGlmICghcmVjdCkgcmV0dXJuXG4gICAgICBjb25zdCBzcGFjZUJlbG93ID0gd2luZG93LmlubmVySGVpZ2h0IC0gcmVjdC5ib3R0b21cbiAgICAgIHNldE9wZW5VcChzcGFjZUJlbG93IDwgMzIwICYmIHJlY3QudG9wID4gc3BhY2VCZWxvdylcbiAgICB9XG4gICAgdXBkYXRlKClcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB1cGRhdGUsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHVwZGF0ZSwgdHJ1ZSlcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZWxlY3RlZCkgc2V0TW9udGhEYXRlKHNlbGVjdGVkKVxuICB9LCBbdmFsdWVdKVxuXG4gIGNvbnN0IHllYXIgPSBtb250aERhdGUuZ2V0RnVsbFllYXIoKVxuICBjb25zdCBtb250aCA9IG1vbnRoRGF0ZS5nZXRNb250aCgpXG4gIGNvbnN0IGZpcnN0RGF5ID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpLmdldERheSgpXG4gIGNvbnN0IHRvdGFsRGF5cyA9IG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMCkuZ2V0RGF0ZSgpXG4gIGNvbnN0IGNlbGxzID0gW11cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGZpcnN0RGF5OyBpbmRleCArPSAxKSBjZWxscy5wdXNoKG51bGwpXG4gIGZvciAobGV0IGRheSA9IDE7IGRheSA8PSB0b3RhbERheXM7IGRheSArPSAxKSBjZWxscy5wdXNoKGRheSlcbiAgY29uc3Qgc2VsZWN0ZWREYXkgPSBzZWxlY3RlZCAmJiBzZWxlY3RlZC5nZXRGdWxsWWVhcigpID09PSB5ZWFyICYmIHNlbGVjdGVkLmdldE1vbnRoKCkgPT09IG1vbnRoXG4gICAgPyBzZWxlY3RlZC5nZXREYXRlKClcbiAgICA6IG51bGxcblxuICBjb25zdCBjaG9vc2UgPSAoZGF5KSA9PiB7XG4gICAgb25DaGFuZ2UodG9EYXRlVmFsdWUobmV3IERhdGUoeWVhciwgbW9udGgsIGRheSkpKVxuICAgIHNldE9wZW4oZmFsc2UpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlclwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWNvbnRyb2xcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKChjdXJyZW50KSA9PiAhY3VycmVudCl9PlxuICAgICAgICA8c3Bhbj57c2VsZWN0ZWQgPyBzZWxlY3RlZC50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLUdCJykgOiAnU2VsZWN0IGEgZGF0ZSd9PC9zcGFuPlxuICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj7wn5OFPC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b2tyaS1kYXRlcGlja2VyLXBvcCR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItbmF2XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb250aERhdGUobmV3IERhdGUoeWVhciwgbW9udGggLSAxLCAxKSl9PuKAuTwvYnV0dG9uPlxuICAgICAgICAgICAgPHN0cm9uZz57bW9udGhEYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tVVMnLCB7IG1vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJyB9KX08L3N0cm9uZz5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE1vbnRoRGF0ZShuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDEpKX0+4oC6PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLXdlZWtcIj5cbiAgICAgICAgICAgIHtbJ1MnLCAnTScsICdUJywgJ1cnLCAnVCcsICdGJywgJ1MnXS5tYXAoKGxhYmVsLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICA8c3BhbiBrZXk9e2Ake2xhYmVsfS0ke2luZGV4fWB9PntsYWJlbH08L3NwYW4+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItZ3JpZFwiPlxuICAgICAgICAgICAge2NlbGxzLm1hcCgoZGF5LCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICBkYXkgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAga2V5PXtgJHt5ZWFyfS0ke21vbnRofS0ke2RheX1gfVxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NlbGVjdGVkRGF5ID09PSBkYXkgPyAnaXMtc2VsZWN0ZWQnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBjaG9vc2UoZGF5KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7ZGF5fVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogPHNwYW4ga2V5PXtgZW1wdHktJHtpbmRleH1gfSAvPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWFjdGlvbnNcIj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItY2xlYXJcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoJycpXG4gICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgQ2xlYXJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1jbGVhclwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgICAgICBzZXRNb250aERhdGUodG9kYXkpXG4gICAgICAgICAgICAgICAgb25DaGFuZ2UodG9EYXRlVmFsdWUodG9kYXkpKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFRvZGF5XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBGaWVsZEVycm9yKHsgZXJyb3IgfSkge1xuICBpZiAoIWVycm9yPy5tZXNzYWdlKSByZXR1cm4gbnVsbFxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3IubWVzc2FnZX08L3NwYW4+XG59XG5cbmNvbnN0IEJsb2dFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSwgYWN0aW9uIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKGluaXRpYWxSZWNvcmQsIHJlc291cmNlLmlkKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFt1cGxvYWRpbmcsIHNldFVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3ByZXZpZXdVcmwsIHNldFByZXZpZXdVcmxdID0gdXNlU3RhdGUoJycpXG5cbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgaXNOZXcgPSBhY3Rpb24/Lm5hbWUgPT09ICduZXcnIHx8ICFyZWNvcmQ/LmlkXG4gIGNvbnN0IGN1c3RvbSA9IHJlc291cmNlPy5vcHRpb25zPy5jdXN0b20gfHwge31cbiAgY29uc3QgYXBpQmFzZVVybCA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcGlCYXNlVXJsIHx8ICcvYXBpL3YxJylcbiAgY29uc3QgYXBwVXJsID0gY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IGlzUHVibGlzaGVkID0gaXNOZXcgJiYgKHBhcmFtcy5pc1B1Ymxpc2hlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc1B1Ymxpc2hlZCA9PT0gJycpXG4gICAgPyB0cnVlXG4gICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNQdWJsaXNoZWQpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5pc1B1Ymxpc2hlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc1B1Ymxpc2hlZCA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ2lzUHVibGlzaGVkJywgdHJ1ZSlcbiAgICB9XG4gICAgaWYgKGlzTmV3ICYmICFwYXJhbXMuYXV0aG9yKSBoYW5kbGVDaGFuZ2UoJ2F1dGhvcicsICdUb2tyaWlpJylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtpc05ld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAocHJldmlld1VybD8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChwcmV2aWV3VXJsKVxuICB9LCBbcHJldmlld1VybF0pXG5cbiAgY29uc3QgaW1hZ2VVcmwgPSB1c2VNZW1vKFxuICAgICgpID0+IHJlc29sdmVJbWFnZVVybChwYXJhbXMuY292ZXJJbWFnZSwgYXBwVXJsKSxcbiAgICBbYXBwVXJsLCBwYXJhbXMuY292ZXJJbWFnZV0sXG4gIClcbiAgY29uc3QgZGlzcGxheWVkSW1hZ2VVcmwgPSBwcmV2aWV3VXJsIHx8IGltYWdlVXJsXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IHVwbG9hZEltYWdlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgaWYgKCFmaWxlKSByZXR1cm5cblxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZvbGRlcicsICdibG9nJylcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIGNvbnN0IGxvY2FsUHJldmlld1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSlcbiAgICBzZXRQcmV2aWV3VXJsKGxvY2FsUHJldmlld1VybClcbiAgICBzZXRVcGxvYWRpbmcodHJ1ZSlcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L21lZGlhL3VwbG9hZGAsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgfSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UgfHwgJ0ltYWdlIHVwbG9hZCBmYWlsZWQnKVxuICAgICAgfVxuICAgICAgY29uc3QgbWVkaWEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIHNldEZpZWxkKCdjb3ZlckltYWdlJywgbWVkaWEucGF0aClcbiAgICAgIHNldFByZXZpZXdVcmwocmVzb2x2ZUltYWdlVXJsKG1lZGlhLnBhdGgsIGFwcFVybCkpXG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ292ZXIgaW1hZ2UgdXBsb2FkZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IHVwbG9hZCBpbWFnZScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0VXBsb2FkaW5nKGZhbHNlKVxuICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCkgZmlsZVJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgYmxvZyBwb3N0JywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGlzTmV3ID8gJ0Jsb2cgcG9zdCBjcmVhdGVkJyA6ICdCbG9nIHBvc3QgdXBkYXRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSB0aGUgYmxvZyBwb3N0LiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57aXNOZXcgPyAnTmV3IGJsb2cgcG9zdCcgOiBwYXJhbXMudGl0bGUgfHwgJ0Jsb2cgcG9zdCd9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIFB1Ymxpc2hlZCBwb3N0cyBhcHBlYXIgb24gdGhlIHdlYnNpdGUgYXQgL2Jsb2cuIEhpZGRlbiBwb3N0cyBzdGF5IGluIHRoZSBhZG1pbiBvbmx5LlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PldlYnNpdGUgdmlzaWJpbGl0eTwvaDQ+XG4gICAgICAgIDxwPlR1cm4gdGhpcyBvZmYgdG8ga2VlcCBhIGRyYWZ0IHdpdGhvdXQgZGVsZXRpbmcgaXQuPC9wPlxuICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgY2hlY2tlZD17aXNQdWJsaXNoZWR9XG4gICAgICAgICAgb25MYWJlbD1cIlB1Ymxpc2hlZFwiXG4gICAgICAgICAgb2ZmTGFiZWw9XCJEcmFmdFwiXG4gICAgICAgICAgdGl0bGU9e2lzUHVibGlzaGVkID8gJ1B1Ymxpc2hlZCcgOiAnRHJhZnQnfVxuICAgICAgICAgIGhpbnQ9e2lzUHVibGlzaGVkID8gJ1Zpc2libGUgb24gdGhlIGJsb2cnIDogJ0hpZGRlbiB1bnRpbCB5b3UgcHVibGlzaCBpdCd9XG4gICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnaXNQdWJsaXNoZWQnLCBuZXh0KX1cbiAgICAgICAgLz5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlBvc3Q8L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBUaXRsZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudGl0bGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd0aXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiSG93IHdlIHBhY2sgYSBtb3JuaW5nIFRva3JpaWlcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMudGl0bGV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBVUkwgc2x1Z1xuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc2x1ZyB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3NsdWcnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkxlYXZlIGJsYW5rIHRvIHVzZSB0aGUgdGl0bGVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5UaGUgcGFnZSB3aWxsIGJlIC9ibG9nL3RoaXMtc2x1Zzwvc3Bhbj5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuc2x1Z30gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQXV0aG9yXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hdXRob3IgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdhdXRob3InLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlRva3JpaWlcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIENhdGVnb3J5XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jYXRlZ29yeSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2NhdGVnb3J5JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJHdWlkZXNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5TaG93biBhYm92ZSB0aGUgdGl0bGUgb24gdGhlIGJsb2cgbGlzdGluZyBhbmQgdGhlIHN0b3J5IHBhZ2UuPC9zcGFuPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUHVibGlzaCBkYXRlXG4gICAgICAgICAgICA8RGF0ZUZpZWxkXG4gICAgICAgICAgICAgIHZhbHVlPXtkYXRlSW5wdXRWYWx1ZShwYXJhbXMucHVibGlzaGVkQXQpfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdwdWJsaXNoZWRBdCcsIG5leHQpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5MZWF2ZSBibGFuayB0byB1c2UgdG9kYXkgd2hlbiB0aGUgcG9zdCBpcyBwdWJsaXNoZWQuPC9zcGFuPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgU2hvcnQgc3VtbWFyeVxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHJvd3M9ezN9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmV4Y2VycHQgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZXhjZXJwdCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIk9uZSBvciB0d28gbGluZXMgZm9yIHRoZSBibG9nIGxpc3RpbmcuXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5JZiB5b3UgbGVhdmUgdGhpcyBlbXB0eSwgdGhlIGZpcnN0IGxpbmVzIG9mIHRoZSBwb3N0IGFyZSB1c2VkLjwvc3Bhbj5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkNvdmVyIGltYWdlPC9oND5cbiAgICAgICAgPHA+U2hvd24gb24gdGhlIGJsb2cgbGlzdGluZyBhbmQgYXQgdGhlIHRvcCBvZiB0aGUgc3RvcnkuPC9wPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgQ292ZXJcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS11cGxvYWQtZHJvcFwiPlxuICAgICAgICAgICAge2Rpc3BsYXllZEltYWdlVXJsID8gKFxuICAgICAgICAgICAgICA8aW1nIHNyYz17ZGlzcGxheWVkSW1hZ2VVcmx9IGFsdD17cGFyYW1zLnRpdGxlIHx8ICdDb3Zlcid9IC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8c3Bhbj57dXBsb2FkaW5nID8gJ1VwbG9hZGluZ+KApicgOiAnQ2xpY2sgdG8gdXBsb2FkIGEgY292ZXIgaW1hZ2UnfTwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8aW5wdXQgcmVmPXtmaWxlUmVmfSB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiBvbkNoYW5nZT17dXBsb2FkSW1hZ2V9IC8+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5KUEcsIFBORywgR0lGLCBvciBXZWJQIHVwIHRvIDVNQjwvc3Bhbj5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAge2Rpc3BsYXllZEltYWdlVXJsID8gKFxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgICAgbXQ9XCJkZWZhdWx0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0RmllbGQoJ2NvdmVySW1hZ2UnLCAnJylcbiAgICAgICAgICAgICAgc2V0UHJldmlld1VybCgnJylcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgUmVtb3ZlIGNvdmVyXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+U3Rvcnk8L2g0PlxuICAgICAgICA8VGlueU1DRVxuICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYm9keSB8fCAnJ31cbiAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdib2R5JywgbmV4dCl9XG4gICAgICAgICAgb3B0aW9ucz17RURJVE9SX09QVElPTlN9XG4gICAgICAgIC8+XG4gICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuYm9keX0gLz5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmcgfHwgdXBsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyB8fCB1cGxvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAge2lzTmV3ID8gJ1B1Ymxpc2ggcG9zdCcgOiAnU2F2ZSBwb3N0J31cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBCbG9nRWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgQm94LFxuICBCdXR0b24sXG4gIERyYXdlckNvbnRlbnQsXG4gIERyYXdlckZvb3RlcixcbiAgSDQsXG4gIEljb24sXG4gIFRleHQsXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBCYXNlUHJvcGVydHlDb21wb25lbnQsIHVzZVJlY29yZCwgdXNlTm90aWNlIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IGlzRmxhZ09uLCBTZWFyY2hhYmxlTXVsdGlTZWxlY3QsIFN0YXR1c1N3aXRjaCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IFRBQlMgPSBbXG4gIHtcbiAgICBpZDogJ2dlbmVyYWwnLFxuICAgIGxhYmVsOiAnR2VuZXJhbCcsXG4gICAgZmllbGRzOiBbXG4gICAgICAnc3RvcmVOYW1lJyxcbiAgICAgICdzdG9yZVRhZ2xpbmUnLFxuICAgICAgJ3N0b3JlRW1haWwnLFxuICAgICAgJ3N0b3JlUGhvbmUxJyxcbiAgICAgICdzdG9yZVBob25lMicsXG4gICAgICAnc3RvcmVBZGRyZXNzJyxcbiAgICAgICdwcm9tb0Jhbm5lcicsXG4gICAgICAnZWFybHlEZWxpdmVyeScsXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnc29jaWFsJyxcbiAgICBsYWJlbDogJ1NvY2lhbCcsXG4gICAgZmllbGRzOiBbXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnY2hhcmdlcycsXG4gICAgbGFiZWw6ICdDaGFyZ2VzJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgICdtb3JuaW5nRGVsaXZlcnlUaXRsZScsXG4gICAgICAnbW9ybmluZ0RlbGl2ZXJ5U3VidGl0bGUnLFxuICAgICAgJ21vcm5pbmdTaGlwcGluZ0ZlZScsXG4gICAgICAnbW9ybmluZ0ZyZWVBYm92ZScsXG4gICAgICAnZXhwcmVzc0RlbGl2ZXJ5VGl0bGUnLFxuICAgICAgJ2V4cHJlc3NEZWxpdmVyeVN1YnRpdGxlJyxcbiAgICAgICdleHByZXNzU2hpcHBpbmdGZWUnLFxuICAgICAgJ2V4cHJlc3NGcmVlQWJvdmUnLFxuICAgICAgJ2V4cHJlc3NNaW5pbXVtT3JkZXJWYWx1ZScsXG4gICAgICAnZmlyc3RUaHJlZU1vcm5pbmdFbmFibGVkJyxcbiAgICAgICdoYW5kbGluZ0ZlZScsXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnaG9tZXBhZ2UnLFxuICAgIGxhYmVsOiAnSG9tZXBhZ2UnLFxuICAgIGZpZWxkczogW1xuICAgICAgJ2hvbWVCYW5uZXJJbWFnZScsXG4gICAgICAnaG9tZU1vYmlsZUJhbm5lckltYWdlJyxcbiAgICAgICdob21lSGlnaGxpZ2h0SW1hZ2UnLFxuICAgICAgJ2hvbWVGZWF0dXJlZENhdGVnb3J5U2x1Z3MnLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ3BheW1lbnRzJyxcbiAgICBsYWJlbDogJ1BheW1lbnRzJyxcbiAgICBmaWVsZHM6IFsncmF6b3JwYXlFbmFibGVkJywgJ3Jhem9ycGF5S2V5SWQnLCAncmF6b3JwYXlLZXlTZWNyZXQnLCAnY29kRW5hYmxlZCddLFxuICB9LFxuICB7XG4gICAgaWQ6ICdub3RpZmljYXRpb25zJyxcbiAgICBsYWJlbDogJ05vdGlmaWNhdGlvbnMnLFxuICAgIGZpZWxkczogW1xuICAgICAgJ21zZzkxRW5hYmxlZCcsXG4gICAgICAnbXNnOTFBdXRoS2V5JyxcbiAgICAgICdtc2c5MVNlbmRlcklkJyxcbiAgICAgICdtc2c5MU90cFRlbXBsYXRlSWQnLFxuICAgICAgJ21zZzkxT3JkZXJUZW1wbGF0ZUlkJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwRW5hYmxlZCcsXG4gICAgICAnbXNnOTFXaGF0c2FwcE51bWJlcicsXG4gICAgICAnbXNnOTFXaGF0c2FwcE5hbWVzcGFjZScsXG4gICAgICAnbXNnOTFXaGF0c2FwcE90cEVuYWJsZWQnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBPdHBUZW1wbGF0ZScsXG4gICAgICAnbXNnOTFXaGF0c2FwcE90cEJ1dHRvbicsXG4gICAgICAnbXNnOTFXaGF0c2FwcE9yZGVyRW5hYmxlZCcsXG4gICAgICAnbXNnOTFXaGF0c2FwcE9yZGVyVGVtcGxhdGUnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBQYXJ0bmVyRW5hYmxlZCcsXG4gICAgICAnbXNnOTFXaGF0c2FwcFBhcnRuZXJUZW1wbGF0ZScsXG4gICAgXSxcbiAgfSxcbl1cblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuZnVuY3Rpb24gcGFyc2VTbHVncyhyYXcpIHtcbiAgaWYgKCFyYXcpIHJldHVybiBbXVxuICBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSByZXR1cm4gcmF3Lm1hcCgoaXRlbSkgPT4gU3RyaW5nKGl0ZW0pLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pXG4gIGlmICh0eXBlb2YgcmF3ID09PSAnc3RyaW5nJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdylcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcnNlZCkpIHJldHVybiBwYXJzZVNsdWdzKHBhcnNlZClcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGlnbm9yZVxuICAgIH1cbiAgICByZXR1cm4gcmF3XG4gICAgICAuc3BsaXQoJywnKVxuICAgICAgLm1hcCgoaXRlbSkgPT4gaXRlbS50cmltKCkpXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gIH1cbiAgcmV0dXJuIFtdXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVJbWFnZVVybChwYXRoLCBhcHBVcmwpIHtcbiAgaWYgKCFwYXRoKSByZXR1cm4gJydcbiAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhdGgpKSByZXR1cm4gcGF0aFxuICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGF0aH1gXG59XG5cbmZ1bmN0aW9uIEltYWdlVXBsb2FkZXIoe1xuICBsYWJlbCxcbiAgaGludCxcbiAgdmFsdWUsXG4gIHByZXZpZXdVcmwsXG4gIHVwbG9hZGluZyxcbiAgZmlsZVJlZixcbiAgb25VcGxvYWQsXG4gIHdpZGUsXG59KSB7XG4gIGNvbnN0IGRpc3BsYXllZCA9IHByZXZpZXdVcmwgfHwgdmFsdWVcblxuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgIHtsYWJlbH1cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRva3JpLXVwbG9hZC1kcm9wJHt3aWRlID8gJyB0b2tyaS11cGxvYWQtZHJvcC13aWRlJyA6ICcnfWB9PlxuICAgICAgICB7ZGlzcGxheWVkID8gKFxuICAgICAgICAgIDxpbWcgc3JjPXtkaXNwbGF5ZWR9IGFsdD17YCR7bGFiZWx9IHByZXZpZXdgfSAvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxzcGFuPnt1cGxvYWRpbmcgPyAnVXBsb2FkaW5n4oCmJyA6ICdDbGljayB0byB1cGxvYWQgYW4gaW1hZ2UnfTwvc3Bhbj5cbiAgICAgICAgKX1cbiAgICAgICAgPGlucHV0IHJlZj17ZmlsZVJlZn0gdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgb25DaGFuZ2U9e29uVXBsb2FkfSAvPlxuICAgICAgPC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPntoaW50fTwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmNvbnN0IE5PVElGSUNBVElPTl9TRUNUSU9OUyA9IFtcbiAge1xuICAgIGlkOiAnc21zJyxcbiAgICB0aXRsZTogJ1NNUycsXG4gICAgaW50cm86ICdMb2dpbiBPVFAgYW5kIG9yZGVyIGNvbmZpcm1hdGlvbiB0aHJvdWdoIE1TRzkxIFNNUy4nLFxuICAgIGZpZWxkczogW1xuICAgICAgeyBrZXk6ICdtc2c5MUVuYWJsZWQnLCB0eXBlOiAnc3dpdGNoJywgbGFiZWw6ICdFbmFibGUgTVNHOTEgU01TJyB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MUF1dGhLZXknLFxuICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICBsYWJlbDogJ01TRzkxIEF1dGggS2V5JyxcbiAgICAgICAgaGludDogJ0xlYXZlIGJsYW5rIHRvIGtlZXAgdGhlIGN1cnJlbnQga2V5JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxU2VuZGVySWQnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnU2VuZGVyIElEJyxcbiAgICAgICAgaGludDogJzYtY2hhcmFjdGVyIERMVCBhcHByb3ZlZCBoZWFkZXIsIGUuZy4gVE9LUklJJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxT3RwVGVtcGxhdGVJZCcsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdMb2dpbiBPVFAgdGVtcGxhdGUgSUQnLFxuICAgICAgICBoaW50OiAnTVNHOTEgVGVtcGxhdGUgSUQgZnJvbSB0aGUgY29weSBpY29uLCBlLmcuIDZhYWU5NzQ4YTMzN2Q3MTg5MTBkMzFmMy4gRG8gbm90IHBhc3RlIHRoZSAxOS1kaWdpdCBBaXJ0ZWwgRExUIElELicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MU9yZGVyVGVtcGxhdGVJZCcsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdPcmRlciBjb25maXJtYXRpb24gdGVtcGxhdGUgSUQnLFxuICAgICAgICBoaW50OiAnTVNHOTEgVGVtcGxhdGUgSUQgZnJvbSB0aGUgY29weSBpY29uLCBlLmcuIDZhYWU5NzhiMWQwZDZhMTIxNzBiOTNmNC4gRG8gbm90IHBhc3RlIHRoZSAxOS1kaWdpdCBBaXJ0ZWwgRExUIElELicsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ3doYXRzYXBwJyxcbiAgICB0aXRsZTogJ1doYXRzQXBwJyxcbiAgICBpbnRybzogJ1NoYXJlZCBudW1iZXIgYW5kIG5hbWVzcGFjZSBmb3IgZXZlcnkgV2hhdHNBcHAgdGVtcGxhdGUuJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcEVuYWJsZWQnLFxuICAgICAgICB0eXBlOiAnc3dpdGNoJyxcbiAgICAgICAgbGFiZWw6ICdFbmFibGUgTVNHOTEgV2hhdHNBcHAnLFxuICAgICAgICBoaW50OiAnVXNlZCB3aGVuIFNNUyBpcyBvZmYgb3IgdGhlIFNNUyBnYXRld2F5IHJlamVjdHMgYSBtZXNzYWdlJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBOdW1iZXInLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnV2hhdHNBcHAgYnVzaW5lc3MgbnVtYmVyJyxcbiAgICAgICAgaGludDogJ1RoZSBudW1iZXIgb24geW91ciBNU0c5MSBXaGF0c0FwcCBhY2NvdW50LiBBIDEwLWRpZ2l0IEluZGlhbiBtb2JpbGUgZ2V0cyA5MSBhZGRlZCBhdXRvbWF0aWNhbGx5LicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwTmFtZXNwYWNlJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBsYWJlbDogJ1doYXRzQXBwIHRlbXBsYXRlIG5hbWVzcGFjZScsXG4gICAgICAgIGhpbnQ6ICdSZXF1aXJlZCBieSBNU0c5MS4gRGVsaXZlcnkgYW5kIE9UUCB0ZW1wbGF0ZXMgYXJlIHRvbGQgYXBhcnQgYnkgdGhpcyBuYW1lc3BhY2UuJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnb3RwJyxcbiAgICB0aXRsZTogJ09UUCBtZXNzYWdlJyxcbiAgICBpbnRybzogJ0xvZ2luIGNvZGUgc2VudCB0byB0aGUgY3VzdG9tZXIgb24gV2hhdHNBcHAuJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcE90cEVuYWJsZWQnLFxuICAgICAgICB0eXBlOiAnc3dpdGNoJyxcbiAgICAgICAgbGFiZWw6ICdTZW5kIE9UUCBXaGF0c0FwcCcsXG4gICAgICAgIGhpbnQ6ICdMb2dpbiBPVFAgdG8gdGhlIGN1c3RvbWVyJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBPdHBUZW1wbGF0ZScsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdPVFAgdGVtcGxhdGUgbmFtZScsXG4gICAgICAgIGhpbnQ6ICdBcHByb3ZlZCBNU0c5MSB0ZW1wbGF0ZSB3aXRoIDEgYm9keSB2YXJpYWJsZTogdGhlIE9UUCBjb2RlJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBPdHBCdXR0b24nLFxuICAgICAgICB0eXBlOiAnc3dpdGNoJyxcbiAgICAgICAgbGFiZWw6ICdPVFAgdGVtcGxhdGUgaGFzIGEgY29weS1jb2RlIGJ1dHRvbicsXG4gICAgICAgIGhpbnQ6ICdUdXJuIG9uIG9ubHkgaWYgeW91ciBXaGF0c0FwcCBPVFAgdGVtcGxhdGUgaW5jbHVkZXMgdGhlIGNvcHktY29kZSBidXR0b24nLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICdvcmRlcicsXG4gICAgdGl0bGU6ICdPcmRlciBtZXNzYWdlJyxcbiAgICBpbnRybzogJ0N1c3RvbWVyIGNvbmZpcm1hdGlvbiBhZnRlciBDT0QgaXMgcGxhY2VkIG9yIG9ubGluZSBwYXltZW50IGlzIGNvbmZpcm1lZC4nLFxuICAgIGZpZWxkczogW1xuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwT3JkZXJFbmFibGVkJyxcbiAgICAgICAgdHlwZTogJ3N3aXRjaCcsXG4gICAgICAgIGxhYmVsOiAnU2VuZCBvcmRlciBXaGF0c0FwcCcsXG4gICAgICAgIGhpbnQ6ICdDdXN0b21lciBjb25maXJtYXRpb24gYWZ0ZXIgQ09EIGlzIHBsYWNlZCBvciBvbmxpbmUgcGF5bWVudCBpcyBjb25maXJtZWQnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcE9yZGVyVGVtcGxhdGUnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnT3JkZXIgdGVtcGxhdGUgbmFtZScsXG4gICAgICAgIGhpbnQ6ICdBcHByb3ZlZCB0ZW1wbGF0ZSB3aXRoIDMgYm9keSB2YXJpYWJsZXM6IG5hbWUsIG9yZGVyIG51bWJlciwgYW1vdW50JyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAncGFydG5lcicsXG4gICAgdGl0bGU6ICdEZWxpdmVyeSBwYXJ0bmVyIG1lc3NhZ2UnLFxuICAgIGludHJvOiAnU2VudCBhZnRlciBDT0QgaXMgcGxhY2VkIG9yIG9ubGluZSBwYXltZW50IGlzIGNvbmZpcm1lZCwgaWYgYSBwYXJ0bmVyIGlzIGFzc2lnbmVkLicsXG4gICAgZmllbGRzOiBbXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBQYXJ0bmVyRW5hYmxlZCcsXG4gICAgICAgIHR5cGU6ICdzd2l0Y2gnLFxuICAgICAgICBsYWJlbDogJ1NlbmQgZGVsaXZlcnktcGFydG5lciBXaGF0c0FwcCcsXG4gICAgICAgIGhpbnQ6ICdTZW50IGFmdGVyIENPRCBpcyBwbGFjZWQgb3Igb25saW5lIHBheW1lbnQgaXMgY29uZmlybWVkLCBpZiBhIHBhcnRuZXIgaXMgYXNzaWduZWQnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcFBhcnRuZXJUZW1wbGF0ZScsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdEZWxpdmVyeS1wYXJ0bmVyIHRlbXBsYXRlIG5hbWUnLFxuICAgICAgICBoaW50OiAnQXBwcm92ZWQgdGVtcGxhdGUgdG9rcmlpaV9kZWxpdmVyeV9hc3NpZ25lZCB3aXRoIDggYm9keSB2YXJpYWJsZXMgYW5kIGEgU2VhcmNoIGluIG1hcCBidXR0b24uIEJ1dHRvbiBVUkw6IGh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vbWFwcy9zZWFyY2gvP2FwaT0xJnF1ZXJ5PXt7MX19JyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbl1cblxuZnVuY3Rpb24gRmllbGRUaXAoeyB0ZXh0IH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHJlZiA9IHVzZVJlZihudWxsKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3Qgb25Qb2ludGVyRG93biA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCFyZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgY29uc3QgdGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG9uUG9pbnRlckRvd24pXG4gICAgfSwgMClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lcilcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgb25Qb2ludGVyRG93bilcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICByZXR1cm4gKFxuICAgIDxzcGFuXG4gICAgICBjbGFzc05hbWU9e2B0b2tyaS1oaW50JHtvcGVuID8gJyBpcy1vcGVuJyA6ICcnfWB9XG4gICAgICByZWY9e3JlZn1cbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9XG4gICAgPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktaGludC10cmlnZ2VyXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIkZpZWxkIGhlbHBcIlxuICAgICAgICBhcmlhLWV4cGFuZGVkPXtvcGVufVxuICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBzZXRPcGVuKChjdXJyZW50KSA9PiAhY3VycmVudClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgP1xuICAgICAgPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1oaW50LXBvcFwiIHJvbGU9XCJ0b29sdGlwXCI+XG4gICAgICAgIHt0ZXh0fVxuICAgICAgPC9zcGFuPlxuICAgIDwvc3Bhbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBOb3RpZnlJbnB1dCh7IGZpZWxkLCB2YWx1ZSwgb25DaGFuZ2UgfSkge1xuICBjb25zdCBpc1doYXRzYXBwTnVtYmVyID0gZmllbGQua2V5ID09PSAnbXNnOTFXaGF0c2FwcE51bWJlcidcbiAgY29uc3QgW2xvY2tlZCwgc2V0TG9ja2VkXSA9IHVzZVN0YXRlKGZpZWxkLnR5cGUgPT09ICdwYXNzd29yZCcpXG5cbiAgcmV0dXJuIChcbiAgICA8aW5wdXRcbiAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICB0eXBlPXtmaWVsZC50eXBlID09PSAncGFzc3dvcmQnID8gJ3Bhc3N3b3JkJyA6ICd0ZXh0J31cbiAgICAgIG5hbWU9e2B0b2tyaS0ke2ZpZWxkLmtleX1gfVxuICAgICAgdmFsdWU9e2lzV2hhdHNhcHBOdW1iZXIgPyBTdHJpbmcodmFsdWUgPz8gJycpLnJlcGxhY2UoL1xcRC9nLCAnJykgOiB2YWx1ZX1cbiAgICAgIHJlYWRPbmx5PXtsb2NrZWR9XG4gICAgICBpbnB1dE1vZGU9e2lzV2hhdHNhcHBOdW1iZXIgPyAnbnVtZXJpYycgOiB1bmRlZmluZWR9XG4gICAgICBtYXhMZW5ndGg9e2lzV2hhdHNhcHBOdW1iZXIgPyAxNSA6IHVuZGVmaW5lZH1cbiAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICBhdXRvQ29ycmVjdD1cIm9mZlwiXG4gICAgICBzcGVsbENoZWNrPXtmYWxzZX1cbiAgICAgIHBsYWNlaG9sZGVyPXtcbiAgICAgICAgZmllbGQudHlwZSA9PT0gJ3Bhc3N3b3JkJ1xuICAgICAgICAgID8gJ0xlYXZlIGJsYW5rIHRvIGtlZXAgdGhlIGN1cnJlbnQga2V5J1xuICAgICAgICAgIDogaXNXaGF0c2FwcE51bWJlclxuICAgICAgICAgICAgPyAnTVNHOTEgV2hhdHNBcHAgbnVtYmVyJ1xuICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIG9uRm9jdXM9eygpID0+IHNldExvY2tlZChmYWxzZSl9XG4gICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICBvbkNoYW5nZShcbiAgICAgICAgICBmaWVsZC5rZXksXG4gICAgICAgICAgaXNXaGF0c2FwcE51bWJlciA/IGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXEQvZywgJycpLnNsaWNlKDAsIDE1KSA6IGV2ZW50LnRhcmdldC52YWx1ZSxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIC8+XG4gIClcbn1cblxuY29uc3QgU09DSUFMX0ZJRUxEUyA9IFtcbiAgeyBrZXk6ICdmYWNlYm9vaycsIGxhYmVsOiAnRmFjZWJvb2snLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8vZmFjZWJvb2suY29tL3Rva3JpaWknIH0sXG4gIHsga2V5OiAnaW5zdGFncmFtJywgbGFiZWw6ICdJbnN0YWdyYW0nLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8vaW5zdGFncmFtLmNvbS90b2tyaWlpJyB9LFxuICB7IGtleTogJ3RocmVhZHMnLCBsYWJlbDogJ1RocmVhZHMnLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8vd3d3LnRocmVhZHMubmV0L0B0b2tyaWlpJyB9LFxuICB7IGtleTogJ3gnLCBsYWJlbDogJ1gnLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8veC5jb20vdG9rcmlpaScgfSxcbiAgeyBrZXk6ICdsaW5rZWRpbicsIGxhYmVsOiAnTGlua2VkSW4nLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8vd3d3LmxpbmtlZGluLmNvbS9jb21wYW55L3Rva3JpaWknIH0sXG5dXG5cbmZ1bmN0aW9uIHJlYWRTb2NpYWxMaW5rcyhyYXcpIHtcbiAgY29uc3QgbGlua3MgPSBPYmplY3QuZnJvbUVudHJpZXMoU09DSUFMX0ZJRUxEUy5tYXAoKGZpZWxkKSA9PiBbZmllbGQua2V5LCAnJ10pKVxuICBsZXQgdmFsdWUgPSByYXdcbiAgaWYgKCFyYXcpIHJldHVybiBsaW5rc1xuICBpZiAodHlwZW9mIHJhdyA9PT0gJ3N0cmluZycpIHtcbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSBKU09OLnBhcnNlKHJhdylcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBsaW5rc1xuICAgIH1cbiAgfVxuICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybiBsaW5rc1xuICBmb3IgKGNvbnN0IGZpZWxkIG9mIFNPQ0lBTF9GSUVMRFMpIHtcbiAgICBsaW5rc1tmaWVsZC5rZXldID0gdHlwZW9mIHZhbHVlW2ZpZWxkLmtleV0gPT09ICdzdHJpbmcnID8gdmFsdWVbZmllbGQua2V5XSA6ICcnXG4gIH1cbiAgcmV0dXJuIGxpbmtzXG59XG5cbmZ1bmN0aW9uIFNvY2lhbEZpZWxkcyh7IHZhbHVlLCBvbkNoYW5nZSB9KSB7XG4gIGNvbnN0IGxpbmtzID0gcmVhZFNvY2lhbExpbmtzKHZhbHVlKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1ub3RpZnktZmllbGRzXCI+XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+Rm9vdGVyIGljb25zPC9oND5cbiAgICAgICAgPHA+VGhlc2UgbGlua3MgYXBwZWFyIHVuZGVyIHRoZSBhZGRyZXNzIG9uIHRoZSB3ZWJzaXRlLiBMZWF2ZSBhIGJveCBlbXB0eSB0byBoaWRlIHRoYXQgaWNvbi48L3A+XG4gICAgICAgIHtTT0NJQUxfRklFTERTLm1hcCgoZmllbGQpID0+IChcbiAgICAgICAgICA8bGFiZWwga2V5PXtmaWVsZC5rZXl9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAge2ZpZWxkLmxhYmVsfVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJ1cmxcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJ1cmxcIlxuICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICBzcGVsbENoZWNrPXtmYWxzZX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e2ZpZWxkLnBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICB2YWx1ZT17bGlua3NbZmllbGQua2V5XX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICBvbkNoYW5nZShcbiAgICAgICAgICAgICAgICAgICdzb2NpYWxMaW5rcycsXG4gICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7IC4uLmxpbmtzLCBbZmllbGQua2V5XTogZXZlbnQudGFyZ2V0LnZhbHVlIH0pLFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICApKX1cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBOb3RpZmljYXRpb25zRmllbGRzKHsgcGFyYW1zLCBvbkNoYW5nZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1ub3RpZnktZmllbGRzXCI+XG4gICAgICB7Tk9USUZJQ0FUSU9OX1NFQ1RJT05TLm1hcCgoc2VjdGlvbikgPT4gKFxuICAgICAgICA8c2VjdGlvbiBrZXk9e3NlY3Rpb24uaWR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PntzZWN0aW9uLnRpdGxlfTwvaDQ+XG4gICAgICAgICAgPHA+e3NlY3Rpb24uaW50cm99PC9wPlxuICAgICAgICAgIHtzZWN0aW9uLmZpZWxkcy5tYXAoKGZpZWxkKSA9PlxuICAgICAgICAgICAgZmllbGQudHlwZSA9PT0gJ3N3aXRjaCcgPyAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtmaWVsZC5rZXl9IGNsYXNzTmFtZT1cInRva3JpLW5vdGlmeS1zd2l0Y2hcIj5cbiAgICAgICAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICAgICAgICBjaGVja2VkPXtpc0ZsYWdPbihwYXJhbXNbZmllbGQua2V5XSl9XG4gICAgICAgICAgICAgICAgICB0aXRsZT17ZmllbGQubGFiZWx9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IG9uQ2hhbmdlKGZpZWxkLmtleSwgbmV4dCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7ZmllbGQuaGludCA/IDxGaWVsZFRpcCB0ZXh0PXtmaWVsZC5oaW50fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGxhYmVsIGtleT17ZmllbGQua2V5fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1sYWJlbC1saW5lXCI+XG4gICAgICAgICAgICAgICAgICB7ZmllbGQubGFiZWx9XG4gICAgICAgICAgICAgICAgICB7ZmllbGQuaGludCA/IDxGaWVsZFRpcCB0ZXh0PXtmaWVsZC5oaW50fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxOb3RpZnlJbnB1dFxuICAgICAgICAgICAgICAgICAgZmllbGQ9e2ZpZWxkfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtc1tmaWVsZC5rZXldID8/ICcnfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICApLFxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IFNldHRpbmdzRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnZ2VuZXJhbCcpXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBiYW5uZXJGaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IG1vYmlsZUJhbm5lckZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgaGlnaGxpZ2h0RmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbYmFubmVyUHJldmlldywgc2V0QmFubmVyUHJldmlld10gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW21vYmlsZUJhbm5lclByZXZpZXcsIHNldE1vYmlsZUJhbm5lclByZXZpZXddID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtoaWdobGlnaHRQcmV2aWV3LCBzZXRIaWdobGlnaHRQcmV2aWV3XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbYmFubmVyVXBsb2FkaW5nLCBzZXRCYW5uZXJVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFttb2JpbGVCYW5uZXJVcGxvYWRpbmcsIHNldE1vYmlsZUJhbm5lclVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2hpZ2hsaWdodFVwbG9hZGluZywgc2V0SGlnaGxpZ2h0VXBsb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY2F0ZWdvcmllcywgc2V0Q2F0ZWdvcmllc10gPSB1c2VTdGF0ZShbXSlcblxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG4gIGNvbnN0IGFwcFVybCA9IGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICBjb25zdCBzZWxlY3RlZENhdGVnb3J5U2x1Z3MgPSBwYXJzZVNsdWdzKHBhcmFtcy5ob21lRmVhdHVyZWRDYXRlZ29yeVNsdWdzKVxuXG4gIGNvbnN0IGJhbm5lckltYWdlVXJsID0gdXNlTWVtbyhcbiAgICAoKSA9PiByZXNvbHZlSW1hZ2VVcmwocGFyYW1zLmhvbWVCYW5uZXJJbWFnZSwgYXBwVXJsKSxcbiAgICBbYXBwVXJsLCBwYXJhbXMuaG9tZUJhbm5lckltYWdlXSxcbiAgKVxuICBjb25zdCBtb2JpbGVCYW5uZXJJbWFnZVVybCA9IHVzZU1lbW8oXG4gICAgKCkgPT4gcmVzb2x2ZUltYWdlVXJsKHBhcmFtcy5ob21lTW9iaWxlQmFubmVySW1hZ2UsIGFwcFVybCksXG4gICAgW2FwcFVybCwgcGFyYW1zLmhvbWVNb2JpbGVCYW5uZXJJbWFnZV0sXG4gIClcbiAgY29uc3QgaGlnaGxpZ2h0SW1hZ2VVcmwgPSB1c2VNZW1vKFxuICAgICgpID0+IHJlc29sdmVJbWFnZVVybChwYXJhbXMuaG9tZUhpZ2hsaWdodEltYWdlLCBhcHBVcmwpLFxuICAgIFthcHBVcmwsIHBhcmFtcy5ob21lSGlnaGxpZ2h0SW1hZ2VdLFxuICApXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKVxuICAgIGlmIChoYXNoID09PSAnYXBwZWFyYW5jZScpIHtcbiAgICAgIHNldEFjdGl2ZVRhYignY2hhcmdlcycpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKGhhc2ggJiYgVEFCUy5zb21lKCh0YWIpID0+IHRhYi5pZCA9PT0gaGFzaCkpIHtcbiAgICAgIHNldEFjdGl2ZVRhYihoYXNoKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgJycsIGAjJHthY3RpdmVUYWJ9YClcbiAgfSwgW2FjdGl2ZVRhYl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGJhbm5lclByZXZpZXc/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwoYmFubmVyUHJldmlldylcbiAgICB9XG4gIH0sIFtiYW5uZXJQcmV2aWV3XSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9iaWxlQmFubmVyUHJldmlldz8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChtb2JpbGVCYW5uZXJQcmV2aWV3KVxuICAgIH1cbiAgfSwgW21vYmlsZUJhbm5lclByZXZpZXddKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChoaWdobGlnaHRQcmV2aWV3Py5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKGhpZ2hsaWdodFByZXZpZXcpXG4gICAgfVxuICB9LCBbaGlnaGxpZ2h0UHJldmlld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgaWdub3JlID0gZmFsc2VcbiAgICBmZXRjaChgJHthcGlCYXNlVXJsfS9jYXRlZ29yaWVzYClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgaWYgKCFpZ25vcmUpIHNldENhdGVnb3JpZXMoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbXSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0Q2F0ZWdvcmllcyhbXSlcbiAgICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlnbm9yZSA9IHRydWVcbiAgICB9XG4gIH0sIFthcGlCYXNlVXJsXSlcblxuICBjb25zdCB1cGxvYWRJbWFnZSA9IGFzeW5jIChldmVudCwgZmllbGQsIHNldFByZXZpZXcsIHNldEJ1c3ksIGZpbGVSZWYsIHN1Y2Nlc3NNZXNzYWdlKSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgaWYgKCFmaWxlKSByZXR1cm5cblxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZvbGRlcicsICdnZW5lcmFsJylcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIGNvbnN0IGxvY2FsUHJldmlld1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSlcbiAgICBzZXRQcmV2aWV3KGxvY2FsUHJldmlld1VybClcbiAgICBzZXRCdXN5KHRydWUpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS91cGxvYWRgLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIH0pXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdJbWFnZSB1cGxvYWQgZmFpbGVkJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1lZGlhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICBoYW5kbGVDaGFuZ2UoZmllbGQsIG1lZGlhLnBhdGgpXG4gICAgICBzZXRQcmV2aWV3KHJlc29sdmVJbWFnZVVybChtZWRpYS5wYXRoLCBhcHBVcmwpKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogc3VjY2Vzc01lc3NhZ2UsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgdXBsb2FkIGltYWdlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCkgZmlsZVJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgICBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgc2V0dGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKG5vdGljZT8udHlwZSA9PT0gJ3N1Y2Nlc3MnIHx8IHJlc3BvbnNlPy5kYXRhPy5yZWNvcmQpIHtcbiAgICAgICAgICBhZGROb3RpY2Uoe1xuICAgICAgICAgICAgbWVzc2FnZTogJ1NldHRpbmdzIHNhdmVkIHN1Y2Nlc3NmdWxseScsXG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHNldHRpbmdzLiBQbGVhc2UgdHJ5IGFnYWluLicsXG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBmbGV4IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBjbGFzc05hbWU9XCJ0b2tyaS1zZXR0aW5ncy1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLXNldHRpbmdzLXRhYnNcIiBtYj1cInhsXCI+XG4gICAgICAgIHtUQUJTLm1hcCgodGFiKSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAga2V5PXt0YWIuaWR9XG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17YHRva3JpLXNldHRpbmdzLXRhYiR7YWN0aXZlVGFiID09PSB0YWIuaWQgPyAnIGlzLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKHRhYi5pZCl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3RhYi5sYWJlbH1cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKSl9XG4gICAgICA8L0JveD5cblxuICAgICAgPERyYXdlckNvbnRlbnQ+XG4gICAgICAgIHtUQUJTLm1hcCgodGFiKSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHJlc291cmNlLmVkaXRQcm9wZXJ0aWVzLmZpbHRlcigocHJvcGVydHkpID0+XG4gICAgICAgICAgICB0YWIuZmllbGRzLmluY2x1ZGVzKHByb3BlcnR5LnByb3BlcnR5UGF0aCksXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAga2V5PXt0YWIuaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLXNldHRpbmdzLXBhbmVsXCJcbiAgICAgICAgICAgICAgcD1cInhsXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogYWN0aXZlVGFiID09PSB0YWIuaWQgPyAnYmxvY2snIDogJ25vbmUnIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxINCBtYj1cInNtXCI+e3RhYi5sYWJlbH08L0g0PlxuICAgICAgICAgICAgICA8VGV4dCBtYj1cInhsXCIgb3BhY2l0eT17MC43NX0+XG4gICAgICAgICAgICAgICAge3RhYi5pZCA9PT0gJ2NoYXJnZXMnXG4gICAgICAgICAgICAgICAgICA/ICdTZXQgY29weSBhbmQgcHJpY2VzIGZvciBNb3JuaW5nIGFuZCBFeHByZXNzIGRlbGl2ZXJ5LiBIYW5kbGluZyBmZWUgaXMgYWRkZWQgdG8gZXZlcnkgb3JkZXIuJ1xuICAgICAgICAgICAgICAgICAgOiB0YWIuaWQgPT09ICdob21lcGFnZSdcbiAgICAgICAgICAgICAgICAgICAgPyAnVGhlc2UgaW1hZ2VzIGFuZCBjYXRlZ29yaWVzIGFwcGVhciBvbiB0aGUgd2Vic2l0ZSBob21lcGFnZS4gQ2xpY2sgU2F2ZSBjaGFuZ2VzIGFmdGVyIHVwbG9hZGluZy4nXG4gICAgICAgICAgICAgICAgICAgIDogdGFiLmlkID09PSAnc29jaWFsJ1xuICAgICAgICAgICAgICAgICAgICAgID8gJ1Bhc3RlIGVhY2ggcGFnZSBsaW5rLiBBIGxpbmsgd2l0aG91dCBodHRwczovLyBpcyBjb21wbGV0ZWQgZm9yIHlvdS4gU2F2ZSBjaGFuZ2VzIHdoZW4geW91IGFyZSBkb25lLidcbiAgICAgICAgICAgICAgICAgICAgICA6IHRhYi5pZCA9PT0gJ25vdGlmaWNhdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgICAgPyAnQXV0aCBrZXksIFdoYXRzQXBwIG51bWJlciwgYW5kIG5hbWVzcGFjZSBhcmUgc2hhcmVkLiBFYWNoIHRlbXBsYXRlIGhhcyBpdHMgb3duIG5hbWUgYW5kIG9uL29mZiB0b2dnbGUuIE9yZGVyIGFuZCBwYXJ0bmVyIG1lc3NhZ2VzIHNlbmQgb25seSBhZnRlciBDT0QgaXMgcGxhY2VkIG9yIHRoZSBvbmxpbmUgcGF5bWVudCBpcyBjb25maXJtZWQuJ1xuICAgICAgICAgICAgICAgICAgICAgIDogJ1VwZGF0ZSB5b3VyIHN0b3JlIHNldHRpbmdzIGFuZCBjbGljayBTYXZlIGNoYW5nZXMgYmVsb3cuJ31cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICB7dGFiLmlkID09PSAnY2hhcmdlcycgPyAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFyZ2VzLWZpZWxkc1wiPlxuICAgICAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGg0Pk1vcm5pbmcgZGVsaXZlcnk8L2g0PlxuICAgICAgICAgICAgICAgICAgICA8cD5TaG93biBhdCBjaGVja291dCB3aGVuIHRoaXMgb3B0aW9uIGlzIG9uIGZvciB0aGUgcGluY29kZS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICBUaXRsZVxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8ubW9ybmluZ0RlbGl2ZXJ5VGl0bGUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdEZWxpdmVyeVRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRmxhd2xlc3MgTW9ybmluZyBEZWxpdmVyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIFN1YnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5tb3JuaW5nRGVsaXZlcnlTdWJ0aXRsZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnbW9ybmluZ0RlbGl2ZXJ5U3VidGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJGcmVzaG5lc3MgR3VhcmFudGVlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgU2hpcHBpbmcgZmVlICjigrkpXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8ubW9ybmluZ1NoaXBwaW5nRmVlID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdTaGlwcGluZ0ZlZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgRnJlZSBhYm92ZSAo4oK5KVxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/Lm1vcm5pbmdGcmVlQWJvdmUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnbW9ybmluZ0ZyZWVBYm92ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPjAgbWVhbnMgbm8gZnJlZSBkZWxpdmVyeTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoND5FeHByZXNzIGRlbGl2ZXJ5PC9oND5cbiAgICAgICAgICAgICAgICAgICAgPHA+U2hvd24gYXQgY2hlY2tvdXQuIERpc2FibGVkIHBpbmNvZGVzIHN0aWxsIHNlZSB0aGlzIGFzIGNvbWluZyBzb29uLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIFRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5leHByZXNzRGVsaXZlcnlUaXRsZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc0RlbGl2ZXJ5VGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTYW1lIGRheVwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIFN1YnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5leHByZXNzRGVsaXZlcnlTdWJ0aXRsZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc0RlbGl2ZXJ5U3VidGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJPbi1EZW1hbmQgTHV4dXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBTaGlwcGluZyBmZWUgKOKCuSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5leHByZXNzU2hpcHBpbmdGZWUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc1NoaXBwaW5nRmVlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBGcmVlIGFib3ZlICjigrkpXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8uZXhwcmVzc0ZyZWVBYm92ZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdleHByZXNzRnJlZUFib3ZlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+MCBtZWFucyBubyBmcmVlIGRlbGl2ZXJ5PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgTWluaW11bSBvcmRlciB2YWx1ZSAo4oK5KVxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/LmV4cHJlc3NNaW5pbXVtT3JkZXJWYWx1ZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc01pbmltdW1PcmRlclZhbHVlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2lzRmxhZ09uKHJlY29yZD8ucGFyYW1zPy5maXJzdFRocmVlTW9ybmluZ0VuYWJsZWQpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZmlyc3RUaHJlZU1vcm5pbmdFbmFibGVkJywgZXZlbnQudGFyZ2V0LmNoZWNrZWQpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICBGaXJzdCAzIG9yZGVycyBmcmVlIG9uIE1vcm5pbmcgRGVsaXZlcnlcbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsIHRva3JpLWNoYXJnZXMtaGFuZGxpbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgSGFuZGxpbmcgY2hhcmdlICjigrkpXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8uaGFuZGxpbmdGZWUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdoYW5kbGluZ0ZlZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5DYXJ0IGhhbmRsaW5nIGZlZSBhZGRlZCB0byBldmVyeSBvcmRlcjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiB0YWIuaWQgPT09ICdob21lcGFnZScgPyAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1ob21lcGFnZS1maWVsZHNcIj5cbiAgICAgICAgICAgICAgICAgIDxJbWFnZVVwbG9hZGVyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPVwiSG9tZSBiYW5uZXIgaW1hZ2VcIlxuICAgICAgICAgICAgICAgICAgICBoaW50PVwiRGVza3RvcCAvIGxhcmdlLXNjcmVlbiBoZXJvIGJhbm5lci4gSlBHLCBQTkcsIEdJRiwgb3IgV2ViUCB1cCB0byA1TUIuXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2Jhbm5lckltYWdlVXJsfVxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3VXJsPXtiYW5uZXJQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRpbmc9e2Jhbm5lclVwbG9hZGluZ31cbiAgICAgICAgICAgICAgICAgICAgZmlsZVJlZj17YmFubmVyRmlsZVJlZn1cbiAgICAgICAgICAgICAgICAgICAgd2lkZVxuICAgICAgICAgICAgICAgICAgICBvblVwbG9hZD17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIHVwbG9hZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaG9tZUJhbm5lckltYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEJhbm5lclByZXZpZXcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRCYW5uZXJVcGxvYWRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYW5uZXJGaWxlUmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Jhbm5lciBpbWFnZSB1cGxvYWRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPEltYWdlVXBsb2FkZXJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCJIb21lIG1vYmlsZSBiYW5uZXIgaW1hZ2VcIlxuICAgICAgICAgICAgICAgICAgICBoaW50PVwiU2hvd24gb24gcGhvbmVzLiBJZiBlbXB0eSwgdGhlIGRlc2t0b3AgYmFubmVyIGlzIHVzZWQgaW5zdGVhZC5cIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17bW9iaWxlQmFubmVySW1hZ2VVcmx9XG4gICAgICAgICAgICAgICAgICAgIHByZXZpZXdVcmw9e21vYmlsZUJhbm5lclByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZGluZz17bW9iaWxlQmFubmVyVXBsb2FkaW5nfVxuICAgICAgICAgICAgICAgICAgICBmaWxlUmVmPXttb2JpbGVCYW5uZXJGaWxlUmVmfVxuICAgICAgICAgICAgICAgICAgICBvblVwbG9hZD17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIHVwbG9hZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaG9tZU1vYmlsZUJhbm5lckltYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldE1vYmlsZUJhbm5lclByZXZpZXcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRNb2JpbGVCYW5uZXJVcGxvYWRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2JpbGVCYW5uZXJGaWxlUmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ01vYmlsZSBiYW5uZXIgaW1hZ2UgdXBsb2FkZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDxJbWFnZVVwbG9hZGVyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPVwiRnJ1aXQgaGlnaGxpZ2h0IGltYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgaGludD1cIlJlcGxhY2VzIHRoZSBraXdpIGltYWdlIGluIOKAnFRoZSBTbWFsbCBGcnVpdCB3aXRoIGEgQmlnIFB1bmNo4oCdIG9uIHRoZSB3ZWJzaXRlLlwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtoaWdobGlnaHRJbWFnZVVybH1cbiAgICAgICAgICAgICAgICAgICAgcHJldmlld1VybD17aGlnaGxpZ2h0UHJldmlld31cbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkaW5nPXtoaWdobGlnaHRVcGxvYWRpbmd9XG4gICAgICAgICAgICAgICAgICAgIGZpbGVSZWY9e2hpZ2hsaWdodEZpbGVSZWZ9XG4gICAgICAgICAgICAgICAgICAgIG9uVXBsb2FkPXsoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgdXBsb2FkSW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdob21lSGlnaGxpZ2h0SW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0SGlnaGxpZ2h0UHJldmlldyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEhpZ2hsaWdodFVwbG9hZGluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodEZpbGVSZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAnSGlnaGxpZ2h0IGltYWdlIHVwbG9hZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIEhvbWVwYWdlIGNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgICAgICAgPFNlYXJjaGFibGVNdWx0aVNlbGVjdFxuICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e2NhdGVnb3JpZXMubWFwKChpdGVtKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uc2x1ZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBpdGVtLmxhYmVsIHx8IGl0ZW0udGl0bGUgfHwgaXRlbS5zbHVnLFxuICAgICAgICAgICAgICAgICAgICAgIH0pKX1cbiAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0ZWRDYXRlZ29yeVNsdWdzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoc2x1Z3MpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVDaGFuZ2UoJ2hvbWVGZWF0dXJlZENhdGVnb3J5U2x1Z3MnLCBKU09OLnN0cmluZ2lmeShzbHVncykpXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoIGFuZCBzZWxlY3QgY2F0ZWdvcmllc1wiXG4gICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggY2F0ZWdvcmllc1wiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICBUaGVzZSBjYXRlZ29yaWVzIGxvYWQgb24gdGhlIHdlYnNpdGUgYWZ0ZXIgdGhlIGZydWl0IGhpZ2hsaWdodCBzZWN0aW9uLCBvbmUgYXRcbiAgICAgICAgICAgICAgICAgICAgICBhIHRpbWUgYXMgdGhlIHZpc2l0b3Igc2Nyb2xscy5cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKSA6IHRhYi5pZCA9PT0gJ25vdGlmaWNhdGlvbnMnID8gKFxuICAgICAgICAgICAgICAgIDxOb3RpZmljYXRpb25zRmllbGRzIHBhcmFtcz17cGFyYW1zfSBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlfSAvPlxuICAgICAgICAgICAgICApIDogdGFiLmlkID09PSAnc29jaWFsJyA/IChcbiAgICAgICAgICAgICAgICA8U29jaWFsRmllbGRzIHZhbHVlPXtwYXJhbXMuc29jaWFsTGlua3N9IG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2V9IC8+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5tYXAoKHByb3BlcnR5KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8QmFzZVByb3BlcnR5Q29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgIGtleT17cHJvcGVydHkucHJvcGVydHlQYXRofVxuICAgICAgICAgICAgICAgICAgICB3aGVyZT1cImVkaXRcIlxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eT17cHJvcGVydHl9XG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgICAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgPC9EcmF3ZXJDb250ZW50PlxuXG4gICAgICA8RHJhd2VyRm9vdGVyPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIFNhdmUgY2hhbmdlc1xuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvRHJhd2VyRm9vdGVyPlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNldHRpbmdzRWRpdFxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IFN0YXR1c1N3aXRjaCwgaXNGbGFnT24gfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5mdW5jdGlvbiBGaWVsZEVycm9yKHsgZXJyb3IgfSkge1xuICBpZiAoIWVycm9yPy5tZXNzYWdlKSByZXR1cm4gbnVsbFxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3IubWVzc2FnZX08L3NwYW4+XG59XG5cbmNvbnN0IEFwcFJlbGVhc2VFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChpbml0aWFsUmVjb3JkLCByZXNvdXJjZS5pZClcbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgZXJyb3JzID0gcmVjb3JkPy5lcnJvcnMgfHwge31cbiAgY29uc3QgcGxhdGZvcm0gPSBwYXJhbXMucGxhdGZvcm0gfHwgcmVjb3JkPy5pZCB8fCAnYXBwJ1xuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2UpIGFkZE5vdGljZShub3RpY2UpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSB0aGUgYXBwIHVwZGF0ZSBydWxlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntwbGF0Zm9ybSA9PT0gJ2lvcycgPyAnaVBob25lJyA6ICdBbmRyb2lkJ30gdXBkYXRlPC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIExlYXZlIHRoaXMgb2ZmIHVudGlsIHRoZSBuZXcgYXBwIGlzIGFjdHVhbGx5IGF2YWlsYWJsZSBpbiB0aGUgc3RvcmUuIFJhaXNpbmcgdGhlIG1pbmltdW1cbiAgICAgICAgICBiZWZvcmUgdGhhdCBzZW5kcyBwZW9wbGUgdG8gYSBzdG9yZSBwYWdlIHdpdGggbm90aGluZyB0byBkb3dubG9hZC5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5UdXJuIHRoaXMgcGxhdGZvcm0gb248L2g0PlxuICAgICAgICA8cD5PZmYgbWVhbnMgdGhlIGFwcCBvcGVucyBub3JtYWxseSwgZXZlbiBpZiB0aGUgbnVtYmVycyBiZWxvdyBhcmUgZmlsbGVkIGluLjwvcD5cbiAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgIGNoZWNrZWQ9e2lzRmxhZ09uKHBhcmFtcy5lbmFibGVkKX1cbiAgICAgICAgICBvbkxhYmVsPVwiT25cIlxuICAgICAgICAgIG9mZkxhYmVsPVwiT2ZmXCJcbiAgICAgICAgICB0aXRsZT17aXNGbGFnT24ocGFyYW1zLmVuYWJsZWQpID8gJ0NoZWNraW5nIHZlcnNpb25zJyA6ICdOb3QgY2hlY2tpbmcnfVxuICAgICAgICAgIGhpbnQ9e2lzRmxhZ09uKHBhcmFtcy5lbmFibGVkKSA/ICdUaGUgYXBwIHdpbGwgcmVhZCB0aGVzZSBydWxlcycgOiAnTm8gdXBkYXRlIHNjcmVlbiBpcyBzaG93bid9XG4gICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnZW5hYmxlZCcsIG5leHQpfVxuICAgICAgICAvPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+QnVpbGQgbnVtYmVyczwvaDQ+XG4gICAgICAgIDxwPlVzZSB0aGUgYnVpbGQgbnVtYmVyLCBub3QgdGhlIG5hbWUgMS4wLjMuIEFuZHJvaWQgY2FsbHMgaXQgdmVyc2lvbiBjb2RlLiBpUGhvbmUgdXNlcyB0aGUgYnVpbGQgbnVtYmVyLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgTGF0ZXN0IGJ1aWxkXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubGF0ZXN0QnVpbGQgPz8gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2xhdGVzdEJ1aWxkJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+T2xkZXIgYnVpbGRzIHNlZSBVcGRhdGUgYW5kIE5vdCBub3cuPC9zcGFuPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5sYXRlc3RCdWlsZH0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIE1pbmltdW0gYnVpbGRcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5taW5pbXVtQnVpbGQgPz8gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ21pbmltdW1CdWlsZCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkFueXRoaW5nIG9sZGVyIG11c3QgdXBkYXRlLiBVc2UgMCB3aGlsZSB5b3UgYXJlIG5vdCBmb3JjaW5nIGFueW9uZS48L3NwYW4+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLm1pbmltdW1CdWlsZH0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIEJsb2NrZWQgYnVpbGRzXG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5ibG9ja2VkQnVpbGRzIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2Jsb2NrZWRCdWlsZHMnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCI3LCA5XCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5Pbmx5IHRoZXNlIGV4YWN0IGJ1aWxkcyBhcmUgc3RvcHBlZC4gT3RoZXIgb2xkZXIgYnVpbGRzIGNhbiBrZWVwIHdvcmtpbmcuPC9zcGFuPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgQXNrIGFnYWluIGFmdGVyIChob3VycylcbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucmVtaW5kQWZ0ZXJIb3VycyA/PyAyNH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdyZW1pbmRBZnRlckhvdXJzJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5BZnRlciBOb3Qgbm93LCB0aGUgc29mdCBwcm9tcHQgc3RheXMgcXVpZXQgZm9yIHRoaXMgbG9uZy48L3NwYW4+XG4gICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5yZW1pbmRBZnRlckhvdXJzfSAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+VXBkYXRlIG1lc3NhZ2U8L2g0PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgVGl0bGVcbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnRpdGxlIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3RpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgTWVzc2FnZVxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHJvd3M9ezN9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm1lc3NhZ2UgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbWVzc2FnZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlBhdXNlIHRoZSBhcHA8L2g0PlxuICAgICAgICA8cD5Vc2UgdGhpcyBmb3IgYW4gb3V0YWdlLiBJdCBkb2VzIG5vdCBzZW5kIGFueW9uZSB0byB0aGUgc3RvcmUuPC9wPlxuICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgY2hlY2tlZD17aXNGbGFnT24ocGFyYW1zLm1haW50ZW5hbmNlKX1cbiAgICAgICAgICBvbkxhYmVsPVwiUGF1c2VkXCJcbiAgICAgICAgICBvZmZMYWJlbD1cIk9wZW5cIlxuICAgICAgICAgIHRpdGxlPXtpc0ZsYWdPbihwYXJhbXMubWFpbnRlbmFuY2UpID8gJ0FwcCBpcyBwYXVzZWQnIDogJ0FwcCBpcyBvcGVuJ31cbiAgICAgICAgICBoaW50PXtpc0ZsYWdPbihwYXJhbXMubWFpbnRlbmFuY2UpID8gJ1Blb3BsZSBzZWUgdGhpcyBtZXNzYWdlIGluc3RlYWQgb2YgdGhlIHNob3AnIDogJ01haW50ZW5hbmNlIHNjcmVlbiBpcyBoaWRkZW4nfVxuICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ21haW50ZW5hbmNlJywgbmV4dCl9XG4gICAgICAgIC8+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBQYXVzZSB0aXRsZVxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubWFpbnRlbmFuY2VUaXRsZSB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdtYWludGVuYW5jZVRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgUGF1c2UgbWVzc2FnZVxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHJvd3M9ezN9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm1haW50ZW5hbmNlTWVzc2FnZSB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdtYWludGVuYW5jZU1lc3NhZ2UnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICBTYXZlIHJ1bGVcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBSZWxlYXNlRWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEJhc2VQcm9wZXJ0eUNvbXBvbmVudCwgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuXG5jb25zdCB3aXRob3V0VHJhaWxpbmdTbGFzaCA9ICh2YWx1ZSkgPT4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9cXC8rJC8sICcnKVxuXG5mdW5jdGlvbiBwYXJzZVNsdWdzKHJhdykge1xuICBpZiAoIXJhdykgcmV0dXJuIFtdXG4gIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbSkudHJpbSgpKS5maWx0ZXIoQm9vbGVhbilcbiAgaWYgKHR5cGVvZiByYXcgPT09ICdzdHJpbmcnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyc2VkKSkgcmV0dXJuIHBhcnNlU2x1Z3MocGFyc2VkKVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gaWdub3JlXG4gICAgfVxuICAgIHJldHVybiByYXdcbiAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAubWFwKChpdGVtKSA9PiBpdGVtLnRyaW0oKSlcbiAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgfVxuICByZXR1cm4gW11cbn1cblxuZnVuY3Rpb24gcGFkKG51bSkge1xuICByZXR1cm4gU3RyaW5nKG51bSkucGFkU3RhcnQoMiwgJzAnKVxufVxuXG5mdW5jdGlvbiB0b0RhdGV0aW1lVmFsdWUodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcbiAgaWYgKE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiAnJ1xuICByZXR1cm4gYCR7ZGF0ZS5nZXRGdWxsWWVhcigpfS0ke3BhZChkYXRlLmdldE1vbnRoKCkgKyAxKX0tJHtwYWQoZGF0ZS5nZXREYXRlKCkpfVQke3BhZChkYXRlLmdldEhvdXJzKCkpfToke3BhZChkYXRlLmdldE1pbnV0ZXMoKSl9YFxufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRldGltZUxhYmVsKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gJydcbiAgcmV0dXJuIGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2VuLUlOJywge1xuICAgIGRheTogJzItZGlnaXQnLFxuICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgbWludXRlOiAnMi1kaWdpdCcsXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHVzZUFuY2hvcmVkTWVudShvcGVuKSB7XG4gIGNvbnN0IHdyYXBSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgW29wZW5VcCwgc2V0T3BlblVwXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBub2RlID0gd3JhcFJlZi5jdXJyZW50XG4gICAgICBpZiAoIW5vZGUpIHJldHVyblxuICAgICAgY29uc3QgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IHNwYWNlQmVsb3cgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSByZWN0LmJvdHRvbVxuICAgICAgc2V0T3BlblVwKHNwYWNlQmVsb3cgPCAyNDAgJiYgcmVjdC50b3AgPiBzcGFjZUJlbG93KVxuICAgIH1cblxuICAgIHVwZGF0ZSgpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdXBkYXRlLCB0cnVlKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHVwZGF0ZSwgdHJ1ZSlcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICByZXR1cm4geyB3cmFwUmVmLCBvcGVuVXAgfVxufVxuXG5mdW5jdGlvbiBDaG9pY2VDYXJkKHsgc2VsZWN0ZWQsIHRpdGxlLCBoaW50LCBvbkNsaWNrIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YHRva3JpLWNob2ljZS1jYXJkJHtzZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgPlxuICAgICAgPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+XG4gICAgICA8c3Bhbj57aGludH08L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gQW5jaG9yZWRTZWxlY3QoeyB2YWx1ZSwgb3B0aW9ucywgb25DaGFuZ2UsIHBsYWNlaG9sZGVyIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHsgd3JhcFJlZiwgb3BlblVwIH0gPSB1c2VBbmNob3JlZE1lbnUob3BlbilcbiAgY29uc3Qgc2VsZWN0ZWQgPSBvcHRpb25zLmZpbmQoKGl0ZW0pID0+IGl0ZW0udmFsdWUgPT09IHZhbHVlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gIH0sIFt3cmFwUmVmXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3RcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY29udHJvbFwiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KX0+XG4gICAgICAgIDxzcGFuPntzZWxlY3RlZD8ubGFiZWwgfHwgcGxhY2Vob2xkZXJ9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jYXJldFwiPntvcGVuID8gJ+KWtCcgOiAn4pa+J308L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW1lbnUke29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAge29wdGlvbnMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZX1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW9wdGlvbiR7aXRlbS52YWx1ZSA9PT0gdmFsdWUgPyAnIGlzLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gU2VhcmNoYWJsZU11bHRpU2VsZWN0KHsgb3B0aW9ucywgc2VsZWN0ZWQsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciwgc2VhcmNoUGxhY2Vob2xkZXIgfSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gIH0sIFt3cmFwUmVmXSlcblxuICBjb25zdCBzZWxlY3RlZFNldCA9IHVzZU1lbW8oKCkgPT4gbmV3IFNldChzZWxlY3RlZCksIFtzZWxlY3RlZF0pXG4gIGNvbnN0IHNlbGVjdGVkT3B0aW9ucyA9IG9wdGlvbnMuZmlsdGVyKChpdGVtKSA9PiBzZWxlY3RlZFNldC5oYXMoaXRlbS52YWx1ZSkpXG4gIGNvbnN0IGZpbHRlcmVkID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+XG4gICAgYCR7aXRlbS5sYWJlbH0gJHtpdGVtLnZhbHVlfWAudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKSksXG4gIClcblxuICBjb25zdCB0b2dnbGUgPSAodmFsdWUpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRTZXQuaGFzKHZhbHVlKSkgb25DaGFuZ2Uoc2VsZWN0ZWQuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSB2YWx1ZSkpXG4gICAgZWxzZSBvbkNoYW5nZShbLi4uc2VsZWN0ZWQsIHZhbHVlXSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdFwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jb250cm9sXCIgb25DbGljaz17KCkgPT4gc2V0T3BlbigodmFsdWUpID0+ICF2YWx1ZSl9PlxuICAgICAgICB7c2VsZWN0ZWRPcHRpb25zLmxlbmd0aCA/IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jaGlwc1wiPlxuICAgICAgICAgICAge3NlbGVjdGVkT3B0aW9ucy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgPHNwYW4ga2V5PXtpdGVtLnZhbHVlfSBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jaGlwXCI+XG4gICAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgIHJvbGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9ezB9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlKGl0ZW0udmFsdWUpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIMOXXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtcGxhY2Vob2xkZXJcIj57cGxhY2Vob2xkZXJ9PC9zcGFuPlxuICAgICAgICApfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jYXJldFwiPntvcGVuID8gJ+KWtCcgOiAn4pa+J308L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW1lbnUke29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdmFsdWU9e3F1ZXJ5fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0UXVlcnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtzZWFyY2hQbGFjZWhvbGRlcn1cbiAgICAgICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1saXN0XCI+XG4gICAgICAgICAgICB7ZmlsdGVyZWQubGVuZ3RoID8gKFxuICAgICAgICAgICAgICBmaWx0ZXJlZC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGVja2VkID0gc2VsZWN0ZWRTZXQuaGFzKGl0ZW0udmFsdWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBrZXk9e2l0ZW0udmFsdWV9IGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW9wdGlvbiR7Y2hlY2tlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXtjaGVja2VkfSBvbkNoYW5nZT17KCkgPT4gdG9nZ2xlKGl0ZW0udmFsdWUpfSAvPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtZW1wdHlcIj5ObyBtYXRjaGVzPC9kaXY+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIERhdGVUaW1lUGlja2VyKHsgdmFsdWUsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciB9KSB7XG4gIGNvbnN0IHBhcnNlZCA9IHZhbHVlID8gbmV3IERhdGUodmFsdWUpIDogbnVsbFxuICBjb25zdCB2YWxpZCA9IHBhcnNlZCAmJiAhTnVtYmVyLmlzTmFOKHBhcnNlZC5nZXRUaW1lKCkpID8gcGFyc2VkIDogbnVsbFxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW21vbnRoRGF0ZSwgc2V0TW9udGhEYXRlXSA9IHVzZVN0YXRlKHZhbGlkIHx8IG5ldyBEYXRlKCkpXG4gIGNvbnN0IFtob3Vycywgc2V0SG91cnNdID0gdXNlU3RhdGUodmFsaWQgPyBwYWQodmFsaWQuZ2V0SG91cnMoKSkgOiAnMDAnKVxuICBjb25zdCBbbWludXRlcywgc2V0TWludXRlc10gPSB1c2VTdGF0ZSh2YWxpZCA/IHBhZCh2YWxpZC5nZXRNaW51dGVzKCkpIDogJzAwJylcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gIH0sIFt3cmFwUmVmXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghdmFsaWQpIHJldHVyblxuICAgIHNldE1vbnRoRGF0ZSh2YWxpZClcbiAgICBzZXRIb3VycyhwYWQodmFsaWQuZ2V0SG91cnMoKSkpXG4gICAgc2V0TWludXRlcyhwYWQodmFsaWQuZ2V0TWludXRlcygpKSlcbiAgfSwgW3ZhbHVlXSlcblxuICBjb25zdCB5ZWFyID0gbW9udGhEYXRlLmdldEZ1bGxZZWFyKClcbiAgY29uc3QgbW9udGggPSBtb250aERhdGUuZ2V0TW9udGgoKVxuICBjb25zdCBmaXJzdERheSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxKS5nZXREYXkoKVxuICBjb25zdCB0b3RhbERheXMgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLmdldERhdGUoKVxuICBjb25zdCBjZWxscyA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZmlyc3REYXk7IGkgKz0gMSkgY2VsbHMucHVzaChudWxsKVxuICBmb3IgKGxldCBkYXkgPSAxOyBkYXkgPD0gdG90YWxEYXlzOyBkYXkgKz0gMSkgY2VsbHMucHVzaChkYXkpXG5cbiAgY29uc3QgYXBwbHkgPSAoZGF5LCBuZXh0SG91cnMgPSBob3VycywgbmV4dE1pbnV0ZXMgPSBtaW51dGVzKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IGAke3llYXJ9LSR7cGFkKG1vbnRoICsgMSl9LSR7cGFkKGRheSl9VCR7cGFkKE51bWJlcihuZXh0SG91cnMpIHx8IDApfToke3BhZChOdW1iZXIobmV4dE1pbnV0ZXMpIHx8IDApfWBcbiAgICBvbkNoYW5nZShuZXh0KVxuICB9XG5cbiAgY29uc3Qgc2VsZWN0ZWREYXkgPVxuICAgIHZhbGlkICYmIHZhbGlkLmdldEZ1bGxZZWFyKCkgPT09IHllYXIgJiYgdmFsaWQuZ2V0TW9udGgoKSA9PT0gbW9udGggPyB2YWxpZC5nZXREYXRlKCkgOiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXJcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1jb250cm9sXCIgb25DbGljaz17KCkgPT4gc2V0T3BlbigoY3VycmVudCkgPT4gIWN1cnJlbnQpfT5cbiAgICAgICAgPHNwYW4+e3ZhbGlkID8gZm9ybWF0RGF0ZXRpbWVMYWJlbCh2YWxpZCkgOiBwbGFjZWhvbGRlcn08L3NwYW4+XG4gICAgICAgIDxzcGFuPvCfk4U8L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLWRhdGVwaWNrZXItcG9wJHtvcGVuVXAgPyAnIGlzLXVwJyA6ICcnfWB9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1uYXZcIj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE1vbnRoRGF0ZShuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpKX0+XG4gICAgICAgICAgICAgIOKAuVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8c3Ryb25nPlxuICAgICAgICAgICAgICB7bW9udGhEYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgbW9udGg6ICdsb25nJywgeWVhcjogJ251bWVyaWMnIH0pfVxuICAgICAgICAgICAgPC9zdHJvbmc+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb250aERhdGUobmV3IERhdGUoeWVhciwgbW9udGggKyAxLCAxKSl9PlxuICAgICAgICAgICAgICDigLpcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci13ZWVrXCI+XG4gICAgICAgICAgICB7WydTdScsICdNbycsICdUdScsICdXZScsICdUaCcsICdGcicsICdTYSddLm1hcCgobGFiZWwpID0+IChcbiAgICAgICAgICAgICAgPHNwYW4ga2V5PXtsYWJlbH0+e2xhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1ncmlkXCI+XG4gICAgICAgICAgICB7Y2VsbHMubWFwKChkYXksIGluZGV4KSA9PlxuICAgICAgICAgICAgICBkYXkgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAga2V5PXtgJHt5ZWFyfS0ke21vbnRofS0ke2RheX1gfVxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NlbGVjdGVkRGF5ID09PSBkYXkgPyAnaXMtc2VsZWN0ZWQnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBhcHBseShkYXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtkYXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPHNwYW4ga2V5PXtgZW1wdHktJHtpbmRleH1gfSAvPlxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItdGltZVwiPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICBIb3VyXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIG1heD1cIjIzXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17aG91cnN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHBhZChNYXRoLm1pbigyMywgTWF0aC5tYXgoMCwgTnVtYmVyKGV2ZW50LnRhcmdldC52YWx1ZSkgfHwgMCkpKVxuICAgICAgICAgICAgICAgICAgc2V0SG91cnMobmV4dClcbiAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZERheSkgYXBwbHkoc2VsZWN0ZWREYXksIG5leHQsIG1pbnV0ZXMpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgIE1pbnV0ZVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICBtYXg9XCI1OVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e21pbnV0ZXN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHBhZChNYXRoLm1pbig1OSwgTWF0aC5tYXgoMCwgTnVtYmVyKGV2ZW50LnRhcmdldC52YWx1ZSkgfHwgMCkpKVxuICAgICAgICAgICAgICAgICAgc2V0TWludXRlcyhuZXh0KVxuICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkRGF5KSBhcHBseShzZWxlY3RlZERheSwgaG91cnMsIG5leHQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWNsZWFyXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKCcnKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIENsZWFyXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBDb3Vwb25FZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGN1c3RvbSA9IHJlc291cmNlPy5vcHRpb25zPy5jdXN0b20gfHwge31cbiAgY29uc3QgYXBpQmFzZVVybCA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcGlCYXNlVXJsIHx8ICcvYXBpL3YxJylcblxuICBjb25zdCBbcHJvZHVjdHMsIHNldFByb2R1Y3RzXSA9IHVzZVN0YXRlKFtdKVxuICBjb25zdCBbY2F0ZWdvcmllcywgc2V0Q2F0ZWdvcmllc10gPSB1c2VTdGF0ZShbXSlcblxuICBjb25zdCBzZWxlY3RlZFNsdWdzID0gcGFyc2VTbHVncyhwYXJhbXMudGFyZ2V0U2x1Z3MpXG4gIGNvbnN0IHRhcmdldFR5cGUgPSBwYXJhbXMudGFyZ2V0VHlwZSB8fCAnYWxsJ1xuICBjb25zdCBhcHBseU9uID0gcGFyYW1zLmFwcGx5T24gfHwgJ2NhcnQnXG4gIGNvbnN0IHVzYWdlVHlwZSA9IHBhcmFtcy51c2FnZVR5cGUgfHwgJ3VubGltaXRlZCdcbiAgY29uc3QgY291cG9uVHlwZSA9IHBhcmFtcy50eXBlIHx8ICdwZXJjZW50J1xuICBjb25zdCBpc0FjdGl2ZSA9IHBhcmFtcy5pc0FjdGl2ZSAhPT0gZmFsc2UgJiYgcGFyYW1zLmlzQWN0aXZlICE9PSAnZmFsc2UnXG4gIGNvbnN0IGtub3dNb3JlUHJvcGVydHkgPSByZXNvdXJjZS5lZGl0UHJvcGVydGllcy5maW5kKFxuICAgIChwcm9wZXJ0eSkgPT4gcHJvcGVydHkucHJvcGVydHlQYXRoID09PSAna25vd01vcmVIdG1sJyxcbiAgKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGlnbm9yZSA9IGZhbHNlXG5cbiAgICBhc3luYyBmdW5jdGlvbiBsb2FkQ2F0YWxvZygpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5RGF0YSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L2NhdGVnb3JpZXNgKS50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICBjb25zdCBhbGxQcm9kdWN0cyA9IFtdXG4gICAgICAgIGxldCBwYWdlID0gMVxuICAgICAgICBsZXQgaGFzTW9yZSA9IHRydWVcbiAgICAgICAgd2hpbGUgKGhhc01vcmUgJiYgcGFnZSA8PSAyMCkge1xuICAgICAgICAgIGNvbnN0IHByb2R1Y3REYXRhID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vcHJvZHVjdHM/cGFnZT0ke3BhZ2V9JmxpbWl0PTEwMGApLnRoZW4oKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgcmVzcG9uc2UuanNvbigpLFxuICAgICAgICAgIClcbiAgICAgICAgICBhbGxQcm9kdWN0cy5wdXNoKC4uLihwcm9kdWN0RGF0YS5wcm9kdWN0cyB8fCBbXSkpXG4gICAgICAgICAgaGFzTW9yZSA9IEJvb2xlYW4ocHJvZHVjdERhdGEuaGFzTW9yZSlcbiAgICAgICAgICBwYWdlICs9IDFcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWdub3JlKSByZXR1cm5cbiAgICAgICAgc2V0UHJvZHVjdHMoYWxsUHJvZHVjdHMpXG4gICAgICAgIHNldENhdGVnb3JpZXMoQXJyYXkuaXNBcnJheShjYXRlZ29yeURhdGEpID8gY2F0ZWdvcnlEYXRhIDogW10pXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgaWYgKCFpZ25vcmUpIHtcbiAgICAgICAgICBzZXRQcm9kdWN0cyhbXSlcbiAgICAgICAgICBzZXRDYXRlZ29yaWVzKFtdKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbG9hZENhdGFsb2coKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbYXBpQmFzZVVybF0pXG5cbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgc2V0U2VsZWN0ZWRTbHVncyA9IChuZXh0KSA9PiBzZXRGaWVsZCgndGFyZ2V0U2x1Z3MnLCBKU09OLnN0cmluZ2lmeShuZXh0KSlcblxuICBjb25zdCBwcm9kdWN0T3B0aW9ucyA9IHVzZU1lbW8oXG4gICAgKCkgPT4gcHJvZHVjdHMubWFwKChpdGVtKSA9PiAoeyB2YWx1ZTogaXRlbS5zbHVnLCBsYWJlbDogaXRlbS5uYW1lIH0pKSxcbiAgICBbcHJvZHVjdHNdLFxuICApXG4gIGNvbnN0IGNhdGVnb3J5T3B0aW9ucyA9IHVzZU1lbW8oXG4gICAgKCkgPT4gY2F0ZWdvcmllcy5tYXAoKGl0ZW0pID0+ICh7IHZhbHVlOiBpdGVtLnNsdWcsIGxhYmVsOiBpdGVtLmxhYmVsIH0pKSxcbiAgICBbY2F0ZWdvcmllc10sXG4gIClcblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgY291cG9uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3Vwb24gc2F2ZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgY291cG9uLiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj5DcmVhdGUgYSBzdG9yZSBjb3Vwb248L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgU2V0IHdobyBnZXRzIHRoZSBkaXNjb3VudCwgd2hlcmUgaXQgYXBwbGllcywgYW5kIGhvdyBtYW55IHRpbWVzIGl0IGNhbiBiZSB1c2VkLlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Db3Vwb24gY29kZTwvaDQ+XG4gICAgICAgICAgPHA+Q3VzdG9tZXJzIHdpbGwgdHlwZSB0aGlzIGF0IGNoZWNrb3V0IG9uIHRoZSB3ZWJzaXRlIGFuZCBhcHAuPC9wPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0IHRva3JpLWNvdXBvbi1jb2RlXCJcbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY29kZSB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdjb2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCkpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJXRUxDT01FMTBcIlxuICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdG9nZ2xlXCI+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17aXNBY3RpdmV9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdpc0FjdGl2ZScsIGV2ZW50LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICBDb3Vwb24gaXMgYWN0aXZlXG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkRpc2NvdW50PC9oND5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXRvZ2dsZVwiPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BhcmFtcy5zaG93QXRDaGVja291dCA9PT0gdHJ1ZSB8fCBwYXJhbXMuc2hvd0F0Q2hlY2tvdXQgPT09ICd0cnVlJ30gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3Nob3dBdENoZWNrb3V0JywgZXZlbnQudGFyZ2V0LmNoZWNrZWQpfSAvPlxuICAgICAgICAgICAgU2hvdyBwdWJsaWNseSBpbiBjaGVja291dCBBdmFpbGFibGUgQ291cG9uc1xuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaG9pY2Utcm93XCI+XG4gICAgICAgICAgICA8Q2hvaWNlQ2FyZFxuICAgICAgICAgICAgICBzZWxlY3RlZD17Y291cG9uVHlwZSA9PT0gJ3BlcmNlbnQnfVxuICAgICAgICAgICAgICB0aXRsZT1cIlBlcmNlbnQgb2ZmXCJcbiAgICAgICAgICAgICAgaGludD1cImUuZy4gMTAlIG9mZlwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCd0eXBlJywgJ3BlcmNlbnQnKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Q2hvaWNlQ2FyZFxuICAgICAgICAgICAgICBzZWxlY3RlZD17Y291cG9uVHlwZSA9PT0gJ2ZsYXQnfVxuICAgICAgICAgICAgICB0aXRsZT1cIkZsYXQgYW1vdW50XCJcbiAgICAgICAgICAgICAgaGludD1cImUuZy4g4oK5NTAgb2ZmXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ3R5cGUnLCAnZmxhdCcpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICB7Y291cG9uVHlwZSA9PT0gJ3BlcmNlbnQnID8gJ1BlcmNlbnQgdmFsdWUnIDogJ0Ftb3VudCAo4oK5KSd9XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudmFsdWUgPz8gJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd2YWx1ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIE1pbiBjYXJ0ICjigrkpXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubWluQ2FydCA/PyAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbWluQ2FydCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIwXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIE1heCBkaXNjb3VudCAo4oK5KVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm1heERpc2NvdW50ID8/ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdtYXhEaXNjb3VudCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJObyBjYXBcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5BcHBseSBkaXNjb3VudCBvbjwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hvaWNlLXJvd1wiPlxuICAgICAgICAgIDxDaG9pY2VDYXJkXG4gICAgICAgICAgICBzZWxlY3RlZD17YXBwbHlPbiA9PT0gJ2NhcnQnfVxuICAgICAgICAgICAgdGl0bGU9XCJDYXJ0IHRvdGFsXCJcbiAgICAgICAgICAgIGhpbnQ9XCJSZWR1Y2UgdGhlIGl0ZW1zIHN1YnRvdGFsXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCdhcHBseU9uJywgJ2NhcnQnKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxDaG9pY2VDYXJkXG4gICAgICAgICAgICBzZWxlY3RlZD17YXBwbHlPbiA9PT0gJ3NoaXBwaW5nJ31cbiAgICAgICAgICAgIHRpdGxlPVwiU2hpcHBpbmcgZmVlXCJcbiAgICAgICAgICAgIGhpbnQ9XCJSZWR1Y2UgZGVsaXZlcnkgY2hhcmdlc1wiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgnYXBwbHlPbicsICdzaGlwcGluZycpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+V2hvIGNhbiBnZXQgdGhpcyBkaXNjb3VudDwvaDQ+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBBcHBseSB0b1xuICAgICAgICAgIDxBbmNob3JlZFNlbGVjdFxuICAgICAgICAgICAgdmFsdWU9e3RhcmdldFR5cGV9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkNob29zZSB3aG8gdGhpcyBjb3Vwb24gYXBwbGllcyB0b1wiXG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHtcbiAgICAgICAgICAgICAgc2V0RmllbGQoJ3RhcmdldFR5cGUnLCBuZXh0KVxuICAgICAgICAgICAgICBzZXRTZWxlY3RlZFNsdWdzKFtdKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9wdGlvbnM9e1tcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsIHByb2R1Y3RzJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAncHJvZHVjdHMnLCBsYWJlbDogJ1NlbGVjdGVkIHByb2R1Y3RzJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAnY2F0ZWdvcmllcycsIGxhYmVsOiAnU2VsZWN0ZWQgY2F0ZWdvcmllcycgfSxcbiAgICAgICAgICAgIF19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cblxuICAgICAgICB7dGFyZ2V0VHlwZSA9PT0gJ3Byb2R1Y3RzJyA/IChcbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQcm9kdWN0c1xuICAgICAgICAgICAgPFNlYXJjaGFibGVNdWx0aVNlbGVjdFxuICAgICAgICAgICAgICBvcHRpb25zPXtwcm9kdWN0T3B0aW9uc31cbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkU2x1Z3N9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTZWxlY3RlZFNsdWdzfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlbGVjdCBwcm9kdWN0c1wiXG4gICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIHByb2R1Y3RzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAge3RhcmdldFR5cGUgPT09ICdjYXRlZ29yaWVzJyA/IChcbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDYXRlZ29yaWVzXG4gICAgICAgICAgICA8U2VhcmNoYWJsZU11bHRpU2VsZWN0XG4gICAgICAgICAgICAgIG9wdGlvbnM9e2NhdGVnb3J5T3B0aW9uc31cbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkU2x1Z3N9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTZWxlY3RlZFNsdWdzfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlbGVjdCBjYXRlZ29yaWVzXCJcbiAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggY2F0ZWdvcmllc1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlVzYWdlPC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNob2ljZS1yb3dcIj5cbiAgICAgICAgICAgIDxDaG9pY2VDYXJkXG4gICAgICAgICAgICAgIHNlbGVjdGVkPXt1c2FnZVR5cGUgPT09ICd1bmxpbWl0ZWQnfVxuICAgICAgICAgICAgICB0aXRsZT1cIlVubGltaXRlZFwiXG4gICAgICAgICAgICAgIGhpbnQ9XCJDdXN0b21lcnMgY2FuIHJldXNlIGl0XCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ3VzYWdlVHlwZScsICd1bmxpbWl0ZWQnKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Q2hvaWNlQ2FyZFxuICAgICAgICAgICAgICBzZWxlY3RlZD17dXNhZ2VUeXBlID09PSAnc2luZ2xlJ31cbiAgICAgICAgICAgICAgdGl0bGU9XCJTaW5nbGUgdXNlXCJcbiAgICAgICAgICAgICAgaGludD1cIk9uZSB1c2UgcGVyIGN1c3RvbWVyXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ3VzYWdlVHlwZScsICdzaW5nbGUnKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3VzYWdlVHlwZSA9PT0gJ3VubGltaXRlZCcgPyAoXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIE9wdGlvbmFsIGdsb2JhbCBjYXBcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIxXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnVzYWdlTGltaXQgPz8gJyd9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3VzYWdlTGltaXQnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTGVhdmUgYmxhbmsgZm9yIHVubGltaXRlZFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8VGV4dD5FYWNoIGxvZ2dlZC1pbiBjdXN0b21lciBjYW4gdXNlIHRoaXMgY291cG9uIG9uY2UuPC9UZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgICAge3BhcmFtcy51c2VkQ291bnQgPyA8VGV4dCBtdD1cImRlZmF1bHRcIj5Vc2VkIHtwYXJhbXMudXNlZENvdW50fSB0aW1lKHMpIHNvIGZhci48L1RleHQ+IDogbnVsbH1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlNjaGVkdWxlPC9oND5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBTdGFydHMgYXRcbiAgICAgICAgICAgIDxEYXRlVGltZVBpY2tlclxuICAgICAgICAgICAgICB2YWx1ZT17dG9EYXRldGltZVZhbHVlKHBhcmFtcy5zdGFydHNBdCl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ3N0YXJ0c0F0JywgbmV4dCB8fCBudWxsKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3Qgc3RhcnQgZGF0ZSBhbmQgdGltZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgRXhwaXJlcyBhdFxuICAgICAgICAgICAgPERhdGVUaW1lUGlja2VyXG4gICAgICAgICAgICAgIHZhbHVlPXt0b0RhdGV0aW1lVmFsdWUocGFyYW1zLmV4cGlyZXNBdCl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2V4cGlyZXNBdCcsIG5leHQgfHwgbnVsbCl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VsZWN0IGV4cGlyeSBkYXRlIGFuZCB0aW1lXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5Lbm93IG1vcmU8L2g0PlxuICAgICAgICA8cD5cbiAgICAgICAgICBPcHRpb25hbCBIVE1MIHNob3duIHVuZGVyIEtub3cgbW9yZSBpbiBDb3Vwb25zICZhbXA7IG9mZmVycyBvbiB0aGUgd2Vic2l0ZS4gTGVhdmUgZW1wdHkgdG9cbiAgICAgICAgICBoaWRlIEtub3cgbW9yZSBmb3IgdGhpcyBjb3Vwb24uXG4gICAgICAgIDwvcD5cbiAgICAgICAge2tub3dNb3JlUHJvcGVydHkgPyAoXG4gICAgICAgICAgPEJveCBzdHlsZT17eyBtaW5IZWlnaHQ6IDIyMCB9fT5cbiAgICAgICAgICAgIDxCYXNlUHJvcGVydHlDb21wb25lbnRcbiAgICAgICAgICAgICAgd2hlcmU9XCJlZGl0XCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZX1cbiAgICAgICAgICAgICAgcHJvcGVydHk9e2tub3dNb3JlUHJvcGVydHl9XG4gICAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIFNhdmUgY291cG9uXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ291cG9uRWRpdFxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5jb25zdCBGVUxGSUxMTUVOVCA9IHtcbiAgcGVuZGluZzogeyBsYWJlbDogJ1dhaXRpbmcgZm9yIGZ1bGZpbGxtZW50JywgdG9uZTogJ3BlbmRpbmcnIH0sXG4gIHBhaWQ6IHsgbGFiZWw6ICdQcm9jZXNzaW5nJywgdG9uZTogJ3Byb2Nlc3NpbmcnIH0sXG4gIHBhY2tlZDogeyBsYWJlbDogJ1BhY2tlZCcsIHRvbmU6ICdwYWNrZWQnIH0sXG4gIHNoaXBwZWQ6IHsgbGFiZWw6ICdTaGlwcGVkJywgdG9uZTogJ3NoaXBwZWQnIH0sXG4gIGRlbGl2ZXJlZDogeyBsYWJlbDogJ0RlbGl2ZXJlZCcsIHRvbmU6ICdkZWxpdmVyZWQnIH0sXG4gIGNhbmNlbGxlZDogeyBsYWJlbDogJ0NhbmNlbGxlZCcsIHRvbmU6ICdjYW5jZWxsZWQnIH0sXG59XG5cbmZ1bmN0aW9uIGlzT25saW5lT3JkZXIocGFyYW1zID0ge30pIHtcbiAgY29uc3QgbW9kZSA9IFN0cmluZyhwYXJhbXMucGF5bWVudE1vZGUgfHwgJycpLnRvTG93ZXJDYXNlKClcbiAgaWYgKG1vZGUgPT09ICdvbmxpbmUnKSByZXR1cm4gdHJ1ZVxuICBpZiAobW9kZSA9PT0gJ2NvZCcpIHJldHVybiBmYWxzZVxuICByZXR1cm4gQm9vbGVhbihwYXJhbXMucmF6b3JwYXlQYXltZW50SWQgfHwgcGFyYW1zLnJhem9ycGF5T3JkZXJJZClcbn1cblxuZnVuY3Rpb24gcGF5bWVudEJhZGdlKHBhcmFtcyA9IHt9KSB7XG4gIGNvbnN0IG9ubGluZSA9IGlzT25saW5lT3JkZXIocGFyYW1zKVxuICBjb25zdCBtZXRob2QgPSBvbmxpbmUgPyAnT25saW5lJyA6ICdDT0QnXG4gIGNvbnN0IHN0YXR1cyA9IFN0cmluZyhwYXJhbXMucGF5bWVudFN0YXR1cyB8fCAncGVuZGluZycpLnRvTG93ZXJDYXNlKClcblxuICBpZiAoc3RhdHVzID09PSAncGFpZCcpIHJldHVybiB7IGxhYmVsOiBgJHttZXRob2R9IMK3IFBhaWRgLCB0b25lOiAncGFpZCcgfVxuICBpZiAoc3RhdHVzID09PSAnZmFpbGVkJykgcmV0dXJuIHsgbGFiZWw6IGAke21ldGhvZH0gwrcgRmFpbGVkYCwgdG9uZTogJ2ZhaWxlZCcgfVxuICBpZiAoc3RhdHVzID09PSAncmVmdW5kZWQnKSByZXR1cm4geyBsYWJlbDogYCR7bWV0aG9kfSDCtyBSZWZ1bmRlZGAsIHRvbmU6ICdyZWZ1bmRlZCcgfVxuICBpZiAob25saW5lKSByZXR1cm4geyBsYWJlbDogJ09ubGluZSDCtyBXYWl0aW5nJywgdG9uZTogJ3dhaXRpbmcnIH1cbiAgcmV0dXJuIHsgbGFiZWw6ICdDT0QgwrcgVW5wYWlkJywgdG9uZTogJ3BlbmRpbmcnIH1cbn1cblxuZnVuY3Rpb24gUGlsbCh7IGxhYmVsLCB0b25lIH0pIHtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YHRva3JpLW9yZGVyLXBpbGwgdG9rcmktbGlzdC1waWxsIGlzLSR7dG9uZX1gfT57bGFiZWx9PC9zcGFuPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnVsZmlsbG1lbnRCYWRnZShzdGF0dXMpIHtcbiAgY29uc3Qga2V5ID0gU3RyaW5nKHN0YXR1cyB8fCAncGVuZGluZycpLnRvTG93ZXJDYXNlKClcbiAgcmV0dXJuIEZVTEZJTExNRU5UW2tleV0gfHwgRlVMRklMTE1FTlQucGVuZGluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF5bWVudEJhZGdlKHBhcmFtcykge1xuICByZXR1cm4gcGF5bWVudEJhZGdlKHBhcmFtcylcbn1cblxuZnVuY3Rpb24gRnVsZmlsbG1lbnRCYWRnZSh7IHJlY29yZCB9KSB7XG4gIGNvbnN0IGJhZGdlID0gZ2V0RnVsZmlsbG1lbnRCYWRnZShyZWNvcmQ/LnBhcmFtcz8uc3RhdHVzKVxuICByZXR1cm4gPFBpbGwgbGFiZWw9e2JhZGdlLmxhYmVsfSB0b25lPXtiYWRnZS50b25lfSAvPlxufVxuXG5mdW5jdGlvbiBQYXltZW50QmFkZ2UoeyByZWNvcmQgfSkge1xuICBjb25zdCBiYWRnZSA9IGdldFBheW1lbnRCYWRnZShyZWNvcmQ/LnBhcmFtcylcbiAgcmV0dXJuIDxQaWxsIGxhYmVsPXtiYWRnZS5sYWJlbH0gdG9uZT17YmFkZ2UudG9uZX0gLz5cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gT3JkZXJMaXN0QmFkZ2UoeyByZWNvcmQsIHByb3BlcnR5IH0pIHtcbiAgY29uc3QgcGF0aCA9IHByb3BlcnR5Py5wYXRoIHx8IHByb3BlcnR5Py5wcm9wZXJ0eVBhdGggfHwgJydcbiAgaWYgKHBhdGggPT09ICdzdGF0dXMnKSByZXR1cm4gPEZ1bGZpbGxtZW50QmFkZ2UgcmVjb3JkPXtyZWNvcmR9IC8+XG4gIHJldHVybiA8UGF5bWVudEJhZGdlIHJlY29yZD17cmVjb3JkfSAvPlxufVxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEFwaUNsaWVudCwgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgTG9jYWxTZWxlY3QsIFNlYXJjaGFibGVTZWxlY3QsIHVzZUFuY2hvcmVkTWVudSB9IGZyb20gJy4vZm9ybS1jb250cm9scydcbmltcG9ydCB7IGdldEZ1bGZpbGxtZW50QmFkZ2UsIGdldFBheW1lbnRCYWRnZSB9IGZyb20gJy4vb3JkZXItbGlzdC1iYWRnZXMuanN4J1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuY29uc3QgRlVMRklMTE1FTlQgPSBbXG4gIHsgdmFsdWU6ICdwZW5kaW5nJywgbGFiZWw6ICdXYWl0aW5nIGZvciBmdWxmaWxsbWVudCcgfSxcbiAgeyB2YWx1ZTogJ3BhaWQnLCBsYWJlbDogJ1Byb2Nlc3NpbmcnIH0sXG4gIHsgdmFsdWU6ICdwYWNrZWQnLCBsYWJlbDogJ1BhY2tlZCcgfSxcbiAgeyB2YWx1ZTogJ3NoaXBwZWQnLCBsYWJlbDogJ1NoaXBwZWQnIH0sXG4gIHsgdmFsdWU6ICdkZWxpdmVyZWQnLCBsYWJlbDogJ0RlbGl2ZXJlZCcgfSxcbiAgeyB2YWx1ZTogJ2NhbmNlbGxlZCcsIGxhYmVsOiAnQ2FuY2VsbGVkJyB9LFxuXVxuXG5jb25zdCBQQVlNRU5UX09QVElPTlMgPSBbXG4gIHsgdmFsdWU6ICdwZW5kaW5nJywgbGFiZWw6ICdQZW5kaW5nJyB9LFxuICB7IHZhbHVlOiAncGFpZCcsIGxhYmVsOiAnUGFpZCcgfSxcbiAgeyB2YWx1ZTogJ2ZhaWxlZCcsIGxhYmVsOiAnRmFpbGVkJyB9LFxuICB7IHZhbHVlOiAncmVmdW5kZWQnLCBsYWJlbDogJ1JlZnVuZGVkJyB9LFxuXVxuXG5mdW5jdGlvbiBDb3B5SWQoeyBsYWJlbCwgdmFsdWUsIGhyZWYgfSkge1xuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGlmICghdmFsdWUpIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1yenAtcm93XCI+XG4gICAgICA8c3Bhbj57bGFiZWx9PC9zcGFuPlxuICAgICAgPGNvZGU+e3ZhbHVlfTwvY29kZT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQodmFsdWUpPy50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gc2V0Q29waWVkKGZhbHNlKSwgMTIwMClcbiAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7fSlcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2NvcGllZCA/ICdDb3BpZWQnIDogJ0NvcHknfVxuICAgICAgPC9idXR0b24+XG4gICAgICB7aHJlZiA/IChcbiAgICAgICAgPGEgaHJlZj17aHJlZn0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiPlxuICAgICAgICAgIE9wZW4gaW4gUmF6b3JwYXlcbiAgICAgICAgPC9hPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gZGVsaXZlcnlDaG9pY2VMYWJlbChvcHRpb24pIHtcbiAgaWYgKG9wdGlvbiA9PT0gJ2V4cHJlc3MnKSByZXR1cm4gJ0V4cHJlc3MnXG4gIGlmIChvcHRpb24gPT09ICdtb3JuaW5nJykgcmV0dXJuICdNb3JuaW5nJ1xuICByZXR1cm4gJydcbn1cblxuZnVuY3Rpb24gZm9ybWF0RXhwZWN0ZWREYXRlKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gJydcbiAgcmV0dXJuIGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1HQicsIHtcbiAgICBkYXk6ICdudW1lcmljJyxcbiAgICBtb250aDogJ3Nob3J0JyxcbiAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgdGltZVpvbmU6ICdBc2lhL0tvbGthdGEnLFxuICB9KVxufVxuXG5jb25zdCBmb3JtYXRNb25leSA9ICh2YWx1ZSkgPT4ge1xuICBjb25zdCBhbW91bnQgPSBOdW1iZXIodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oYW1vdW50KSkgcmV0dXJuICfigrkwJ1xuICByZXR1cm4gYOKCuSR7YW1vdW50LnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pfWBcbn1cblxuY29uc3QgZm9ybWF0RGF0ZVRpbWUgPSAodmFsdWUpID0+IHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICfigJQnXG4gIHJldHVybiBuZXcgRGF0ZSh2YWx1ZSkudG9Mb2NhbGVTdHJpbmcoJ2VuLUlOJywge1xuICAgIGRhdGVTdHlsZTogJ21lZGl1bScsXG4gICAgdGltZVN0eWxlOiAnc2hvcnQnLFxuICB9KVxufVxuXG5jb25zdCByZXNvbHZlSW1hZ2UgPSAodmFsdWUpID0+IHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdCh2YWx1ZSkpIHJldHVybiB2YWx1ZVxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnLycpKSByZXR1cm4gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke3ZhbHVlfWBcbiAgcmV0dXJuIHZhbHVlXG59XG5cbmZ1bmN0aW9uIE1vcmVNZW51KHsgdW5wYWlkLCBjYW5TeW5jUmF6b3JwYXksIGJ1c3ksIG9uQ2FzaCwgb25Rciwgb25TeW5jUmF6b3JwYXksIG9uUmVzZW5kUGFydG5lciB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1tb3JlXCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHZhbHVlKSA9PiAhdmFsdWUpfT5cbiAgICAgICAgTW9yZSBhY3Rpb25zXG4gICAgICAgIDxzcGFuPntvcGVuID8gJ+KWtCcgOiAn4pa+J308L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLW9yZGVyLW1vcmUtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtCb29sZWFuKGJ1c3kpfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICBvblJlc2VuZFBhcnRuZXIoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7YnVzeSA9PT0gJ3Jlc2VuZFBhcnRuZXJXaGF0c2FwcCcgPyAnU2VuZGluZ+KApicgOiAnUmVzZW5kIG1lc3NhZ2UgdG8gZGVsaXZlcnkgcGFydG5lcid9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAge3VucGFpZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgb25DYXNoKClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2J1c3kgPT09ICdjb2xsZWN0Q2FzaCcgPyAnU2F2aW5n4oCmJyA6ICdNYXJrIGNhc2ggY29sbGVjdGVkJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgb25RcigpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtidXN5ID09PSAnZ2VuZXJhdGVRcicgPyAnQ3JlYXRpbmfigKYnIDogJ0dlbmVyYXRlIHBheW1lbnQgUVInfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtjYW5TeW5jUmF6b3JwYXkgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgb25TeW5jUmF6b3JwYXkoKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7YnVzeSA9PT0gJ3N5bmNSYXpvcnBheScgPyAnQ2hlY2tpbmcgUmF6b3JwYXnigKYnIDogJ1N5bmMgUmF6b3JwYXkgcGF5bWVudCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBzbmFwc2hvdChwYXJhbXMgPSB7fSkge1xuICByZXR1cm4ge1xuICAgIHN0YXR1czogcGFyYW1zLnN0YXR1cyB8fCAnJyxcbiAgICBwYXltZW50U3RhdHVzOiBwYXJhbXMucGF5bWVudFN0YXR1cyB8fCAnJyxcbiAgICBkZWxpdmVyeVBhcnRuZXJJZDogcGFyYW1zLmRlbGl2ZXJ5UGFydG5lcklkIHx8ICcnLFxuICAgIGNvbnRhY3ROYW1lOiBwYXJhbXMuY29udGFjdE5hbWUgfHwgJycsXG4gICAgY29udGFjdFBob25lOiBwYXJhbXMuY29udGFjdFBob25lIHx8ICcnLFxuICAgIGFkZHJlc3NMaW5lMTogcGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJyxcbiAgICBhZGRyZXNzTGluZTI6IHBhcmFtcy5hZGRyZXNzTGluZTIgfHwgJycsXG4gICAgYWRkcmVzc0NpdHk6IHBhcmFtcy5hZGRyZXNzQ2l0eSB8fCAnJyxcbiAgICBhZGRyZXNzU3RhdGU6IHBhcmFtcy5hZGRyZXNzU3RhdGUgfHwgJycsXG4gICAgYWRkcmVzc1BpbmNvZGU6IHBhcmFtcy5hZGRyZXNzUGluY29kZSB8fCAnJyxcbiAgICBhZGRyZXNzTGFuZG1hcms6IHBhcmFtcy5hZGRyZXNzTGFuZG1hcmsgfHwgJycsXG4gIH1cbn1cblxuY29uc3QgT3JkZXJEZXRhaWwgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlLCBhY3Rpb24gfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdCwgbG9hZGluZywgc2V0UmVjb3JkIH0gPSB1c2VSZWNvcmQoaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UuaWQpXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2FjdGlvbkJ1c3ksIHNldEFjdGlvbkJ1c3ldID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtwYXJ0bmVycywgc2V0UGFydG5lcnNdID0gdXNlU3RhdGUoW3sgdmFsdWU6ICcnLCBsYWJlbDogJ1VuYXNzaWduZWQnIH1dKVxuICBjb25zdCBbYmFzZWxpbmUsIHNldEJhc2VsaW5lXSA9IHVzZVN0YXRlKCgpID0+IHNuYXBzaG90KGluaXRpYWxSZWNvcmQ/LnBhcmFtcykpXG4gIGNvbnN0IFtlZGl0Q29udGFjdCwgc2V0RWRpdENvbnRhY3RdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtlZGl0QWRkcmVzcywgc2V0RWRpdEFkZHJlc3NdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWN0aW9uPy5uYW1lICE9PSAnc2hvdycpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBuZXh0ID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL3Nob3dcXC8/JC8sICcvZWRpdCcpXG4gICAgaWYgKG5leHQgIT09IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSkgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UobmV4dClcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH0sIFthY3Rpb24/Lm5hbWVdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGlnbm9yZSA9IGZhbHNlXG4gICAgYXBpXG4gICAgICAucmVzb3VyY2VBY3Rpb24oeyByZXNvdXJjZUlkOiAnRGVsaXZlcnlQYXJ0bmVyJywgYWN0aW9uTmFtZTogJ2xpc3QnLCBwYXJhbXM6IHsgcGVyUGFnZTogMjAwIH0gfSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAoaWdub3JlKSByZXR1cm5cbiAgICAgICAgY29uc3QgcmVjb3JkcyA9IHJlc3BvbnNlLmRhdGE/LnJlY29yZHMgfHwgW11cbiAgICAgICAgc2V0UGFydG5lcnMoW1xuICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ1VuYXNzaWduZWQnIH0sXG4gICAgICAgICAgLi4ucmVjb3Jkcy5tYXAoKGl0ZW0pID0+ICh7XG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5pZCB8fCBpdGVtLnBhcmFtcz8uaWQsXG4gICAgICAgICAgICBsYWJlbDogaXRlbS5wYXJhbXM/LmlzQWN0aXZlID09PSBmYWxzZVxuICAgICAgICAgICAgICA/IGAke2l0ZW0ucGFyYW1zPy5uYW1lIHx8ICdQYXJ0bmVyJ30gKGluYWN0aXZlKWBcbiAgICAgICAgICAgICAgOiBpdGVtLnBhcmFtcz8ubmFtZSB8fCAnUGFydG5lcicsXG4gICAgICAgICAgfSkpLFxuICAgICAgICBdKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGlmICghaWdub3JlKSBzZXRQYXJ0bmVycyhbeyB2YWx1ZTogJycsIGxhYmVsOiAnVW5hc3NpZ25lZCcgfV0pXG4gICAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBpdGVtcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHBhcmFtcy5pdGVtc0pzb24gfHwgJ1tdJylcbiAgICAgIHJldHVybiBwYXJzZWQubWFwKChpdGVtKSA9PiAoeyAuLi5pdGVtLCBpbWFnZTogcmVzb2x2ZUltYWdlKGl0ZW0uaW1hZ2UpIH0pKVxuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICB9LCBbcGFyYW1zLml0ZW1zSnNvbl0pXG5cbiAgY29uc3QgY3VycmVudCA9IHNuYXBzaG90KHBhcmFtcylcbiAgY29uc3QgZGlydHkgPSBPYmplY3Qua2V5cyhjdXJyZW50KS5zb21lKChrZXkpID0+IGN1cnJlbnRba2V5XSAhPT0gYmFzZWxpbmVba2V5XSlcbiAgY29uc3QgbGlzdFVybCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9yZWNvcmRzXFwvLiokLywgJycpXG4gIGNvbnN0IHVucGFpZCA9IHBhcmFtcy5wYXltZW50U3RhdHVzICE9PSAncGFpZCdcbiAgY29uc3QgY2FuU3luY1Jhem9ycGF5ID0gdW5wYWlkICYmIHBhcmFtcy5wYXltZW50TW9kZSA9PT0gJ29ubGluZSdcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY2FuU3luY1Jhem9ycGF5IHx8ICFyZWNvcmQ/LmlkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgbGV0IGlnbm9yZSA9IGZhbHNlXG4gICAgYXBpXG4gICAgICAucmVjb3JkQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIHJlY29yZElkOiByZWNvcmQuaWQsXG4gICAgICAgIGFjdGlvbk5hbWU6ICdzeW5jUmF6b3JwYXknLFxuICAgICAgfSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAoaWdub3JlKSByZXR1cm5cbiAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGE/LnJlY29yZCkge1xuICAgICAgICAgIHNldFJlY29yZChyZXNwb25zZS5kYXRhLnJlY29yZClcbiAgICAgICAgICBzZXRCYXNlbGluZShzbmFwc2hvdChyZXNwb25zZS5kYXRhLnJlY29yZC5wYXJhbXMpKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlLmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnc3VjY2VzcycpIGFkZE5vdGljZShub3RpY2UpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHt9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbY2FuU3luY1Jhem9ycGF5LCByZWNvcmQ/LmlkLCByZXNvdXJjZS5pZCwgc2V0UmVjb3JkXSlcblxuICBjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNvbnN0IHBob25lID0gU3RyaW5nKHBhcmFtcy5jb250YWN0UGhvbmUgfHwgJycpLnJlcGxhY2UoL1xcRC9nLCAnJylcbiAgICBjb25zdCBwaW4gPSBTdHJpbmcocGFyYW1zLmFkZHJlc3NQaW5jb2RlIHx8ICcnKS5yZXBsYWNlKC9cXEQvZywgJycpXG4gICAgaWYgKCFTdHJpbmcocGFyYW1zLmNvbnRhY3ROYW1lIHx8ICcnKS50cmltKCkgfHwgcGhvbmUubGVuZ3RoIDwgMTApIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdFbnRlciB0aGUgY3VzdG9tZXIgbmFtZSBhbmQgYSAxMC1kaWdpdCBjb250YWN0IG51bWJlci4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFTdHJpbmcocGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJykudHJpbSgpIHx8ICFTdHJpbmcocGFyYW1zLmFkZHJlc3NDaXR5IHx8ICcnKS50cmltKCkgfHwgIVN0cmluZyhwYXJhbXMuYWRkcmVzc1N0YXRlIHx8ICcnKS50cmltKCkgfHwgcGluLmxlbmd0aCAhPT0gNikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0VudGVyIHRoZSBob3VzZSwgY2l0eSwgc3RhdGUsIGFuZCBhIDYtZGlnaXQgcGluY29kZS4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc2V0U2F2aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc3VibWl0KClcbiAgICAgIGNvbnN0IG5leHQgPSByZXNwb25zZT8uZGF0YT8ucmVjb3JkPy5wYXJhbXNcbiAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgIHNldEJhc2VsaW5lKHNuYXBzaG90KG5leHQpKVxuICAgICAgICBzZXRFZGl0Q29udGFjdChmYWxzZSlcbiAgICAgICAgc2V0RWRpdEFkZHJlc3MoZmFsc2UpXG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFNhdmluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBydW5QYXltZW50QWN0aW9uID0gYXN5bmMgKGFjdGlvbk5hbWUpID0+IHtcbiAgICBpZiAoYWN0aW9uTmFtZSA9PT0gJ2NvbGxlY3RDYXNoJyAmJiAhd2luZG93LmNvbmZpcm0oJ01hcmsgdGhpcyBvcmRlciBhcyBwYWlkIGluIGNhc2g/JykpIHJldHVyblxuICAgIHNldEFjdGlvbkJ1c3koYWN0aW9uTmFtZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIHJlY29yZElkOiByZWNvcmQuaWQsXG4gICAgICAgIGFjdGlvbk5hbWUsXG4gICAgICB9KVxuICAgICAgaWYgKHJlc3BvbnNlLmRhdGE/LnJlY29yZCkge1xuICAgICAgICBzZXRSZWNvcmQocmVzcG9uc2UuZGF0YS5yZWNvcmQpXG4gICAgICAgIHNldEJhc2VsaW5lKHNuYXBzaG90KHJlc3BvbnNlLmRhdGEucmVjb3JkLnBhcmFtcykpXG4gICAgICB9XG4gICAgICBhZGROb3RpY2UocmVzcG9uc2UuZGF0YT8ubm90aWNlIHx8IHsgbWVzc2FnZTogJ1VwZGF0ZWQuJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBjb21wbGV0ZSB0aGlzIGFjdGlvbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEFjdGlvbkJ1c3koJycpXG4gICAgfVxuICB9XG5cbiAgaWYgKGFjdGlvbj8ubmFtZSA9PT0gJ3Nob3cnKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGZ1bGZpbGxtZW50ID0gZ2V0RnVsZmlsbG1lbnRCYWRnZShwYXJhbXMuc3RhdHVzKVxuICBjb25zdCBwYXltZW50ID0gZ2V0UGF5bWVudEJhZGdlKHBhcmFtcylcbiAgY29uc3Qgc3RhdHVzTGFiZWwgPSBmdWxmaWxsbWVudC5sYWJlbFxuICBjb25zdCByZXN0b3JlRmllbGRzID0gKGtleXMsIGNsb3NlKSA9PiB7XG4gICAga2V5cy5mb3JFYWNoKChrZXkpID0+IGhhbmRsZUNoYW5nZShrZXksIGJhc2VsaW5lW2tleV0gfHwgJycpKVxuICAgIGNsb3NlKGZhbHNlKVxuICB9XG4gIGNvbnN0IGFkZHJlc3NUZXh0ID0gW1xuICAgIHBhcmFtcy5hZGRyZXNzTGluZTEsXG4gICAgcGFyYW1zLmFkZHJlc3NMaW5lMixcbiAgICBbcGFyYW1zLmFkZHJlc3NDaXR5LCBwYXJhbXMuYWRkcmVzc1N0YXRlLCBwYXJhbXMuYWRkcmVzc1BpbmNvZGVdLmZpbHRlcihCb29sZWFuKS5qb2luKCcsICcpLFxuICAgIHBhcmFtcy5hZGRyZXNzTGFuZG1hcmsgPyBgTGFuZG1hcms6ICR7cGFyYW1zLmFkZHJlc3NMYW5kbWFya31gIDogJycsXG4gIF0uZmlsdGVyKEJvb2xlYW4pXG4gIGNvbnN0IHBheW1lbnRMYWJlbCA9IHBheW1lbnQubGFiZWxcbiAgY29uc3QgcGFydG5lck5hbWUgPSBwYXJhbXMuZGVsaXZlcnlQYXJ0bmVyTmFtZVxuICAgID8gYCR7cGFyYW1zLmRlbGl2ZXJ5UGFydG5lck5hbWV9JHtwYXJhbXMuZGVsaXZlcnlQYXJ0bmVyUGhvbmUgPyBgIMK3ICR7cGFyYW1zLmRlbGl2ZXJ5UGFydG5lclBob25lfWAgOiAnJ31gXG4gICAgOiAnTm8gZGVsaXZlcnkgcGFydG5lciB5ZXQnXG4gIGNvbnN0IGl0ZW1Db3VudCA9IGl0ZW1zLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiBzdW0gKyBOdW1iZXIoaXRlbS5xdWFudGl0eSB8fCAwKSwgMClcbiAgY29uc3QgZGVsaXZlcnlOYW1lID0gZGVsaXZlcnlDaG9pY2VMYWJlbChwYXJhbXMuZGVsaXZlcnlPcHRpb24pXG4gIGNvbnN0IGV4cGVjdGVkRGVsaXZlcnkgPSBmb3JtYXRFeHBlY3RlZERhdGUocGFyYW1zLmV4cGVjdGVkRGVsaXZlcnlEYXRlKVxuXG4gIHJldHVybiAoXG4gICAgPGZvcm0gY2xhc3NOYW1lPVwidG9rcmktb3JkZXJcIiBvblN1Ym1pdD17aGFuZGxlU2F2ZX0+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXRpdGxlXCI+XG4gICAgICAgICAgPGEgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItYmFja1wiIGhyZWY9e2xpc3RVcmx9IGFyaWEtbGFiZWw9XCJCYWNrIHRvIG9yZGVyc1wiPuKGkDwvYT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10aXRsZS1yb3dcIj5cbiAgICAgICAgICAgICAgPGgyPiN7cGFyYW1zLm9yZGVyTm99PC9oMj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktb3JkZXItcGlsbCBpcy0ke3BheW1lbnQudG9uZX1gfT57cGF5bWVudExhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktb3JkZXItcGlsbCBpcy0ke2Z1bGZpbGxtZW50LnRvbmV9YH0+e3N0YXR1c0xhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHA+e2Zvcm1hdERhdGVUaW1lKHBhcmFtcy5jcmVhdGVkQXQpfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItYWN0aW9uc1wiPlxuICAgICAgICAgIDxhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnZvaWNlXCJcbiAgICAgICAgICAgIGhyZWY9e2AvdG9rcmktYmFja29mZmljZS9vcmRlcnMvJHtyZWNvcmQuaWR9L2ludm9pY2U/ZG93bmxvYWQ9MWB9XG4gICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICB0aXRsZT1cIkRvd25sb2FkIFBERiBpbnZvaWNlXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBEb3dubG9hZCBJbnZvaWNlXG4gICAgICAgICAgPC9hPlxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItc2F2ZVwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17IWRpcnR5IHx8IGxvYWRpbmcgfHwgc2F2aW5nfT5cbiAgICAgICAgICAgIHtzYXZpbmcgPyAnU2F2aW5n4oCmJyA6ICdTYXZlJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8TW9yZU1lbnVcbiAgICAgICAgICAgIHVucGFpZD17dW5wYWlkfVxuICAgICAgICAgICAgY2FuU3luY1Jhem9ycGF5PXtjYW5TeW5jUmF6b3JwYXl9XG4gICAgICAgICAgICBidXN5PXthY3Rpb25CdXN5fVxuICAgICAgICAgICAgb25DYXNoPXsoKSA9PiBydW5QYXltZW50QWN0aW9uKCdjb2xsZWN0Q2FzaCcpfVxuICAgICAgICAgICAgb25Rcj17KCkgPT4gcnVuUGF5bWVudEFjdGlvbignZ2VuZXJhdGVRcicpfVxuICAgICAgICAgICAgb25TeW5jUmF6b3JwYXk9eygpID0+IHJ1blBheW1lbnRBY3Rpb24oJ3N5bmNSYXpvcnBheScpfVxuICAgICAgICAgICAgb25SZXNlbmRQYXJ0bmVyPXsoKSA9PiBydW5QYXltZW50QWN0aW9uKCdyZXNlbmRQYXJ0bmVyV2hhdHNhcHAnKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWxheW91dFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLW1haW5cIj5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWNhcmQtaGVhZFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0b2tyaS1vcmRlci1tYXJrIGlzLSR7ZnVsZmlsbG1lbnQudG9uZX1gfSAvPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e3N0YXR1c0xhYmVsfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxzcGFuPntpdGVtQ291bnR9IHtpdGVtQ291bnQgPT09IDEgPyAnaXRlbScgOiAnaXRlbXMnfSDCtyB7cGFydG5lck5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWxlY3RcIj5cbiAgICAgICAgICAgICAgICA8TG9jYWxTZWxlY3RcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc3RhdHVzIHx8ICdwZW5kaW5nJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e0ZVTEZJTExNRU5UfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKCdzdGF0dXMnLCB2YWx1ZSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtpdGVtcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVtcHR5XCI+Tm8gaXRlbXMgb24gdGhpcyBvcmRlci48L3A+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWl0ZW1zXCI+XG4gICAgICAgICAgICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGFydGljbGUga2V5PXtpdGVtLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10aHVtYi13cmFwXCI+XG4gICAgICAgICAgICAgICAgICAgICAge2l0ZW0uaW1hZ2UgPyA8aW1nIHNyYz17aXRlbS5pbWFnZX0gYWx0PVwiXCIgLz4gOiA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10aHVtYlwiIC8+fVxuICAgICAgICAgICAgICAgICAgICAgIDxlbT57aXRlbS5xdWFudGl0eX08L2VtPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgICAge2l0ZW0ud2VpZ2h0ID8gPHNwYW4+e2l0ZW0ud2VpZ2h0fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcXR5XCI+e2Zvcm1hdE1vbmV5KGl0ZW0ucHJpY2VWYWx1ZSl9IMOXIHtpdGVtLnF1YW50aXR5fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGI+e2Zvcm1hdE1vbmV5KGl0ZW0ubGluZVRvdGFsKX08L2I+XG4gICAgICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWNhcmQtaGVhZFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0b2tyaS1vcmRlci1tYXJrIGlzLSR7cGF5bWVudC50b25lfWB9IC8+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz57cGF5bWVudExhYmVsfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxzcGFuPntwYXJhbXMucGF5bWVudE1ldGhvZCB8fCAnQ2FzaCBvbiBkZWxpdmVyeSd9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWxlY3RcIj5cbiAgICAgICAgICAgICAgICA8TG9jYWxTZWxlY3RcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucGF5bWVudFN0YXR1cyB8fCAncGVuZGluZyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXtQQVlNRU5UX09QVElPTlN9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2UoJ3BheW1lbnRTdGF0dXMnLCB2YWx1ZSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10b3RhbHNcIj5cbiAgICAgICAgICAgICAgPGRpdj48ZHQ+U3VidG90YWw8L2R0PjxkZD57aXRlbUNvdW50fSB7aXRlbUNvdW50ID09PSAxID8gJ2l0ZW0nIDogJ2l0ZW1zJ308L2RkPjxkZD57Zm9ybWF0TW9uZXkocGFyYW1zLml0ZW1zVG90YWwpfTwvZGQ+PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGR0PkRlbGl2ZXJ5e2RlbGl2ZXJ5TmFtZSA/IGAgLSAke2RlbGl2ZXJ5TmFtZX1gIDogJyd9PC9kdD5cbiAgICAgICAgICAgICAgICA8ZGQ+e2V4cGVjdGVkRGVsaXZlcnkgPyBgRXhwZWN0ZWQgJHtleHBlY3RlZERlbGl2ZXJ5fWAgOiAnJ308L2RkPlxuICAgICAgICAgICAgICAgIDxkZD57cGFyYW1zLmZyZWVEZWxpdmVyeUFwcGxpZWQgfHwgTnVtYmVyKHBhcmFtcy5kZWxpdmVyeUNoYXJnZSkgPT09IDAgPyAnRnJlZSAoV2VsY29tZSBvZmZlciknIDogZm9ybWF0TW9uZXkocGFyYW1zLmRlbGl2ZXJ5Q2hhcmdlKX08L2RkPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj48ZHQ+SGFuZGxpbmc8L2R0PjxkZCAvPjxkZD57Zm9ybWF0TW9uZXkocGFyYW1zLmhhbmRsaW5nQ2hhcmdlKX08L2RkPjwvZGl2PlxuICAgICAgICAgICAgICB7TnVtYmVyKHBhcmFtcy50YXhUb3RhbCkgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8ZHQ+VGF4ZXMgKEdTVCl7cGFyYW1zLmlzSW50ZXJTdGF0ZSA/ICcgwrcgSUdTVCcgOiAnIMK3IENHU1QrU0dTVCd9PC9kdD5cbiAgICAgICAgICAgICAgICAgIDxkZCAvPlxuICAgICAgICAgICAgICAgICAgPGRkPntmb3JtYXRNb25leShwYXJhbXMudGF4VG90YWwpfTwvZGQ+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7TnVtYmVyKHBhcmFtcy5zbWFsbENhcnRDaGFyZ2UpID4gMCA/IChcbiAgICAgICAgICAgICAgICA8ZGl2PjxkdD5TbWFsbCBjYXJ0PC9kdD48ZGQgLz48ZGQ+e2Zvcm1hdE1vbmV5KHBhcmFtcy5zbWFsbENhcnRDaGFyZ2UpfTwvZGQ+PC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7TnVtYmVyKHBhcmFtcy5kaXNjb3VudCkgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxkaXY+PGR0PntwYXJhbXMuYXV0b21hdGljRGlzY291bnRQZXJjZW50YWdlID8gYEF1dG9tYXRpYyBkaXNjb3VudCAoJHtwYXJhbXMuYXV0b21hdGljRGlzY291bnRQZXJjZW50YWdlfSUpYCA6ICdEaXNjb3VudCd9e3BhcmFtcy5jb3Vwb25Db2RlID8gYCDCtyAke3BhcmFtcy5jb3Vwb25Db2RlfWAgOiAnJ308L2R0PjxkZCAvPjxkZD4te2Zvcm1hdE1vbmV5KHBhcmFtcy5kaXNjb3VudCl9PC9kZD48L2Rpdj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaXMtdG90YWxcIj48ZHQ+VG90YWw8L2R0PjxkZCAvPjxkZD57Zm9ybWF0TW9uZXkocGFyYW1zLmdyYW5kVG90YWwpfTwvZGQ+PC9kaXY+XG4gICAgICAgICAgICA8L2RsPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jb2xsZWN0ZWRcIj5cbiAgICAgICAgICAgICAgPHNwYW4+e3BhcmFtcy5wYXltZW50U3RhdHVzID09PSAncGFpZCcgPyAnUGFpZCBieSBjdXN0b21lcicgOiAnU3RpbGwgdG8gY29sbGVjdCd9PC9zcGFuPlxuICAgICAgICAgICAgICA8Yj57Zm9ybWF0TW9uZXkocGFyYW1zLmdyYW5kVG90YWwpfTwvYj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge3BhcmFtcy5wYXltZW50Q29sbGVjdGVkQXMgPyA8cCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1tZXRhXCI+Q29sbGVjdGVkIGFzIHtwYXJhbXMucGF5bWVudENvbGxlY3RlZEFzfTwvcD4gOiBudWxsfVxuICAgICAgICAgICAge3BhcmFtcy5wYXltZW50TW9kZSA9PT0gJ29ubGluZScgfHwgcGFyYW1zLnJhem9ycGF5UGF5bWVudElkIHx8IHBhcmFtcy5yYXpvcnBheU9yZGVySWQgPyAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcnpwXCI+XG4gICAgICAgICAgICAgICAgPENvcHlJZFxuICAgICAgICAgICAgICAgICAgbGFiZWw9XCJQYXltZW50IElEXCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucmF6b3JwYXlQYXltZW50SWR9XG4gICAgICAgICAgICAgICAgICBocmVmPXtwYXJhbXMucmF6b3JwYXlQYXltZW50SWRcbiAgICAgICAgICAgICAgICAgICAgPyBgaHR0cHM6Ly9kYXNoYm9hcmQucmF6b3JwYXkuY29tL2FwcC9wYXltZW50cy8ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXMucmF6b3JwYXlQYXltZW50SWQpfWBcbiAgICAgICAgICAgICAgICAgICAgOiAnJ31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxDb3B5SWRcbiAgICAgICAgICAgICAgICAgIGxhYmVsPVwiUmF6b3JwYXkgb3JkZXJcIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5yYXpvcnBheU9yZGVySWR9XG4gICAgICAgICAgICAgICAgICBocmVmPXtwYXJhbXMucmF6b3JwYXlPcmRlcklkXG4gICAgICAgICAgICAgICAgICAgID8gYGh0dHBzOi8vZGFzaGJvYXJkLnJhem9ycGF5LmNvbS9hcHAvb3JkZXJzLyR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5yYXpvcnBheU9yZGVySWQpfWBcbiAgICAgICAgICAgICAgICAgICAgOiAnJ31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHshcGFyYW1zLnJhem9ycGF5UGF5bWVudElkID8gKFxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItbWV0YVwiPk5vIFJhem9ycGF5IHBheW1lbnQgSUQgeWV0LiBVc2UgU3luYyBSYXpvcnBheSBwYXltZW50IGlmIG1vbmV5IHdhcyBjYXB0dXJlZC48L3A+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICB7cGFyYW1zLnJhem9ycGF5UXJVcmwgPyAoXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcXJcIiBzcmM9e3BhcmFtcy5yYXpvcnBheVFyVXJsfSBhbHQ9XCJEb29yc3RlcCBwYXltZW50IFFSXCIgLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGFzaWRlIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNpZGVcIj5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNlY3Rpb24taGVhZFwiPlxuICAgICAgICAgICAgICA8aDM+Q3VzdG9tZXI8L2gzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNlY3Rpb24taGVhZFwiPlxuICAgICAgICAgICAgICA8aDQ+Q29udGFjdDwvaDQ+XG4gICAgICAgICAgICAgIHtlZGl0Q29udGFjdCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXRcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gcmVzdG9yZUZpZWxkcyhbJ2NvbnRhY3ROYW1lJywgJ2NvbnRhY3RQaG9uZSddLCBzZXRFZGl0Q29udGFjdCl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZWRpdFwiIG9uQ2xpY2s9eygpID0+IHNldEVkaXRDb250YWN0KHRydWUpfT5cbiAgICAgICAgICAgICAgICAgIEVkaXRcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge2VkaXRDb250YWN0ID8gKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXQtZmllbGRzXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICBOYW1lXG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNvbnRhY3ROYW1lIHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2NvbnRhY3ROYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZmllbGRcIj5cbiAgICAgICAgICAgICAgICAgIFBob25lIG51bWJlclxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY29udGFjdFBob25lIHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2NvbnRhY3RQaG9uZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1yZWFkXCI+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz57cGFyYW1zLmNvbnRhY3ROYW1lIHx8ICfigJQnfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxwPntwYXJhbXMuY29udGFjdFBob25lID8gYCs5MSAke3BhcmFtcy5jb250YWN0UGhvbmV9YCA6ICfigJQnfTwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApfVxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNlY3Rpb24taGVhZFwiPlxuICAgICAgICAgICAgICA8aDQ+U2hpcHBpbmcgYWRkcmVzczwvaDQ+XG4gICAgICAgICAgICAgIHtlZGl0QWRkcmVzcyA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXRcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gcmVzdG9yZUZpZWxkcyhcbiAgICAgICAgICAgICAgICAgICAgWydhZGRyZXNzTGluZTEnLCAnYWRkcmVzc0xpbmUyJywgJ2FkZHJlc3NDaXR5JywgJ2FkZHJlc3NTdGF0ZScsICdhZGRyZXNzUGluY29kZScsICdhZGRyZXNzTGFuZG1hcmsnXSxcbiAgICAgICAgICAgICAgICAgICAgc2V0RWRpdEFkZHJlc3MsXG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXRcIiBvbkNsaWNrPXsoKSA9PiBzZXRFZGl0QWRkcmVzcyh0cnVlKX0+XG4gICAgICAgICAgICAgICAgICBFZGl0XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtlZGl0QWRkcmVzcyA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0LWZpZWxkc1wiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgSG91c2UgLyBmbGF0XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzTGluZTEnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgU3RyZWV0IC8gYXJlYVxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzTGluZTIgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnYWRkcmVzc0xpbmUyJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWFkZHJlc3MtZ3JpZFwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIENpdHlcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWRkcmVzc0NpdHkgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzQ2l0eScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIFN0YXRlXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NTdGF0ZSB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2FkZHJlc3NTdGF0ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIFBpbmNvZGVcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWRkcmVzc1BpbmNvZGUgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzUGluY29kZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIExhbmRtYXJrXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NMYW5kbWFyayB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2FkZHJlc3NMYW5kbWFyaycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcmVhZFwiPlxuICAgICAgICAgICAgICAgIHthZGRyZXNzVGV4dC5sZW5ndGggPyBhZGRyZXNzVGV4dC5tYXAoKGxpbmUpID0+IDxwIGtleT17bGluZX0+e2xpbmV9PC9wPikgOiA8cD7igJQ8L3A+fVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8aDQ+RGVsaXZlcnkgcGFydG5lcjwvaDQ+XG4gICAgICAgICAgICA8U2VhcmNoYWJsZVNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmRlbGl2ZXJ5UGFydG5lcklkIHx8ICcnfVxuICAgICAgICAgICAgICBvcHRpb25zPXtwYXJ0bmVyc31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKCdkZWxpdmVyeVBhcnRuZXJJZCcsIHZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJVbmFzc2lnbmVkXCJcbiAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggcGFydG5lcnNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Zvcm0+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgT3JkZXJEZXRhaWxcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJbnB1dCwgTGFiZWwsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB1c2VOb3RpY2UgfSBmcm9tICdhZG1pbmpzJ1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuY29uc3QgRXllSWNvbiA9ICh7IGhpZGRlbiB9KSA9PlxuICBoaWRkZW4gPyAoXG4gICAgPHN2ZyB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTMgM2wxOCAxOFwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTEwLjYgMTAuNkEyIDIgMCAwIDAgMTMuNCAxMy40XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOS45IDQuMkExMC43IDEwLjcgMCAwIDEgMTIgNGM1IDAgOSA0LjUgMTAgOGExMi44IDEyLjggMCAwIDEtMi4xIDMuNlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTYuNiA2LjZDNC4zIDggMi43IDEwLjIgMiAxMmMxIDMuNSA1IDggMTAgOCAxLjUgMCAyLjktLjQgNC4xLTFcIiAvPlxuICAgIDwvc3ZnPlxuICApIDogKFxuICAgIDxzdmcgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yIDEyczQtNyAxMC03IDEwIDcgMTAgNy00IDctMTAgN1MyIDEyIDIgMTJ6XCIgLz5cbiAgICAgIDxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiIC8+XG4gICAgPC9zdmc+XG4gIClcblxuZnVuY3Rpb24gUGFzc3dvcmRGaWVsZCh7IGlkLCBsYWJlbCwgdmFsdWUsIG9uQ2hhbmdlLCB2aXNpYmxlLCBvblRvZ2dsZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPEJveCBtYj1cImxnXCI+XG4gICAgICA8TGFiZWwgaHRtbEZvcj17aWR9IHJlcXVpcmVkPntsYWJlbH08L0xhYmVsPlxuICAgICAgPEJveCBwb3NpdGlvbj1cInJlbGF0aXZlXCIgd2lkdGg9XCIxMDAlXCI+XG4gICAgICAgIDxJbnB1dFxuICAgICAgICAgIGlkPXtpZH1cbiAgICAgICAgICB0eXBlPXt2aXNpYmxlID8gJ3RleHQnIDogJ3Bhc3N3b3JkJ31cbiAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICBhdXRvQ29tcGxldGU9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmdSaWdodDogNDIgfX1cbiAgICAgICAgLz5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGFyaWEtbGFiZWw9e3Zpc2libGUgPyAnSGlkZSBwYXNzd29yZCcgOiAnU2hvdyBwYXNzd29yZCd9XG4gICAgICAgICAgb25DbGljaz17b25Ub2dnbGV9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgcmlnaHQ6IDgsXG4gICAgICAgICAgICB0b3A6ICc1MCUnLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgtNTAlKScsXG4gICAgICAgICAgICBib3JkZXI6IDAsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgY29sb3I6ICcjMDQ3ODU3JyxcbiAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1mbGV4JyxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDI2LFxuICAgICAgICAgICAgaGVpZ2h0OiAyNixcbiAgICAgICAgICAgIHBhZGRpbmc6IDAsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxFeWVJY29uIGhpZGRlbj17dmlzaWJsZX0gLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5jb25zdCBDaGFuZ2VQYXNzd29yZCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IFtwYXNzd29yZCwgc2V0UGFzc3dvcmRdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtjb25maXJtUGFzc3dvcmQsIHNldENvbmZpcm1QYXNzd29yZF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW3Nob3dQYXNzd29yZCwgc2V0U2hvd1Bhc3N3b3JkXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2hvd0NvbmZpcm0sIHNldFNob3dDb25maXJtXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUoJycpXG5cbiAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG4gIH1cblxuICBjb25zdCBzYXZlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIHNldEVycm9yKCcnKVxuICAgIGlmICghcGFzc3dvcmQgfHwgcGFzc3dvcmQubGVuZ3RoIDwgNikge1xuICAgICAgc2V0RXJyb3IoJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzLicpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHBhc3N3b3JkICE9PSBjb25maXJtUGFzc3dvcmQpIHtcbiAgICAgIHNldEVycm9yKCdOZXcgcGFzc3dvcmQgYW5kIGNvbmZpcm0gcGFzc3dvcmQgbXVzdCBiZSB0aGUgc2FtZS4nKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgc2V0U2F2aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnJlY29yZEFjdGlvbih7XG4gICAgICAgIHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuICAgICAgICByZWNvcmRJZDogcmVjb3JkLmlkLFxuICAgICAgICBhY3Rpb25OYW1lOiAnY2hhbmdlUGFzc3dvcmQnLFxuICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgZGF0YTogeyBwYXNzd29yZCwgY29uZmlybVBhc3N3b3JkIH0sXG4gICAgICB9KVxuICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2UuZGF0YT8ubm90aWNlXG4gICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgIHNldEVycm9yKG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBwYXNzd29yZC4nKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChub3RpY2UpIGFkZE5vdGljZShub3RpY2UpXG4gICAgICBjb25zdCByZWRpcmVjdFVybCA9IHJlc3BvbnNlLmRhdGE/LnJlZGlyZWN0VXJsXG4gICAgICBpZiAocmVkaXJlY3RVcmwpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSByZWRpcmVjdFVybFxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNsb3NlKClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHNldEVycm9yKGVyci5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBwYXNzd29yZC4nKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRTYXZpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgICAgaW5zZXQ6IDAsXG4gICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDIsIDEyLCA4LCAwLjYyKScsXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgekluZGV4OiA4MCxcbiAgICAgICAgcGFkZGluZzogMTYsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxCb3hcbiAgICAgICAgYXM9XCJmb3JtXCJcbiAgICAgICAgb25TdWJtaXQ9e3NhdmV9XG4gICAgICAgIGJnPVwid2hpdGVcIlxuICAgICAgICB3aWR0aD17WycxMDAlJywgJzQyMHB4J119XG4gICAgICAgIHA9XCJ4bFwiXG4gICAgICAgIHN0eWxlPXt7IGJvcmRlclJhZGl1czogMTYsIGJveFNoYWRvdzogJzAgMjRweCA3MHB4IHJnYmEoMiwgNDQsIDM0LCAwLjI4KScgfX1cbiAgICAgID5cbiAgICAgICAgPEgzIG1iPVwic21cIj5DaGFuZ2UgcGFzc3dvcmQ8L0gzPlxuICAgICAgICA8VGV4dCBtYj1cInhsXCIgY29sb3I9XCIjNjQ3NDhiXCI+XG4gICAgICAgICAgU2V0IGEgbmV3IHBhc3N3b3JkIGZvciB7cmVjb3JkPy5wYXJhbXM/Lm5hbWUgfHwgcmVjb3JkPy5wYXJhbXM/LmVtYWlsIHx8ICd0aGlzIHVzZXInfS5cbiAgICAgICAgPC9UZXh0PlxuXG4gICAgICAgIDxQYXNzd29yZEZpZWxkXG4gICAgICAgICAgaWQ9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAgIGxhYmVsPVwiTmV3IHBhc3N3b3JkXCJcbiAgICAgICAgICB2YWx1ZT17cGFzc3dvcmR9XG4gICAgICAgICAgb25DaGFuZ2U9e3NldFBhc3N3b3JkfVxuICAgICAgICAgIHZpc2libGU9e3Nob3dQYXNzd29yZH1cbiAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0U2hvd1Bhc3N3b3JkKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgLz5cbiAgICAgICAgPFBhc3N3b3JkRmllbGRcbiAgICAgICAgICBpZD1cImNvbmZpcm0tcGFzc3dvcmRcIlxuICAgICAgICAgIGxhYmVsPVwiQ29uZmlybSBwYXNzd29yZFwiXG4gICAgICAgICAgdmFsdWU9e2NvbmZpcm1QYXNzd29yZH1cbiAgICAgICAgICBvbkNoYW5nZT17c2V0Q29uZmlybVBhc3N3b3JkfVxuICAgICAgICAgIHZpc2libGU9e3Nob3dDb25maXJtfVxuICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRTaG93Q29uZmlybSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgIC8+XG5cbiAgICAgICAge2Vycm9yID8gKFxuICAgICAgICAgIDxUZXh0IG1iPVwibGdcIiBjb2xvcj1cIiNkYzI2MjZcIj57ZXJyb3J9PC9UZXh0PlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIganVzdGlmeUNvbnRlbnQ9XCJmbGV4LWVuZFwiIHN0eWxlPXt7IGdhcDogMTAgfX0+XG4gICAgICAgICAgPEJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgdmFyaWFudD1cInRleHRcIiBvbkNsaWNrPXtjbG9zZX0gZGlzYWJsZWQ9e3NhdmluZ30+XG4gICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uIHR5cGU9XCJzdWJtaXRcIiB2YXJpYW50PVwiY29udGFpbmVkXCIgZGlzYWJsZWQ9e3NhdmluZ30+XG4gICAgICAgICAgICB7c2F2aW5nID8gJ1NhdmluZ+KApicgOiAnU2F2ZSBwYXNzd29yZCd9XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvQm94PlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlUGFzc3dvcmRcbiIsIi8qKiBJU08gMzE2Ni0yOklOIGNvZGVzLiBLZXB0IG5leHQgdG8gdGhlIEFkbWluSlMgZm9ybSBzbyB0aGUgZHJvcGRvd24gYWx3YXlzIGhhcyBldmVyeSBzdGF0ZS4gKi9cbmV4cG9ydCBjb25zdCBJTkRJQV9TVEFURVMgPSBbXG4gIHsgY29kZTogJ0FOJywgbmFtZTogJ0FuZGFtYW4gYW5kIE5pY29iYXIgSXNsYW5kcycgfSxcbiAgeyBjb2RlOiAnQVAnLCBuYW1lOiAnQW5kaHJhIFByYWRlc2gnIH0sXG4gIHsgY29kZTogJ0FSJywgbmFtZTogJ0FydW5hY2hhbCBQcmFkZXNoJyB9LFxuICB7IGNvZGU6ICdBUycsIG5hbWU6ICdBc3NhbScgfSxcbiAgeyBjb2RlOiAnQlInLCBuYW1lOiAnQmloYXInIH0sXG4gIHsgY29kZTogJ0NIJywgbmFtZTogJ0NoYW5kaWdhcmgnIH0sXG4gIHsgY29kZTogJ0NUJywgbmFtZTogJ0NoaGF0dGlzZ2FyaCcgfSxcbiAgeyBjb2RlOiAnREgnLCBuYW1lOiAnRGFkcmEgYW5kIE5hZ2FyIEhhdmVsaSBhbmQgRGFtYW4gYW5kIERpdScgfSxcbiAgeyBjb2RlOiAnREwnLCBuYW1lOiAnRGVsaGknIH0sXG4gIHsgY29kZTogJ0dBJywgbmFtZTogJ0dvYScgfSxcbiAgeyBjb2RlOiAnR0onLCBuYW1lOiAnR3VqYXJhdCcgfSxcbiAgeyBjb2RlOiAnSFInLCBuYW1lOiAnSGFyeWFuYScgfSxcbiAgeyBjb2RlOiAnSFAnLCBuYW1lOiAnSGltYWNoYWwgUHJhZGVzaCcgfSxcbiAgeyBjb2RlOiAnSksnLCBuYW1lOiAnSmFtbXUgYW5kIEthc2htaXInIH0sXG4gIHsgY29kZTogJ0pIJywgbmFtZTogJ0poYXJraGFuZCcgfSxcbiAgeyBjb2RlOiAnS0EnLCBuYW1lOiAnS2FybmF0YWthJyB9LFxuICB7IGNvZGU6ICdLTCcsIG5hbWU6ICdLZXJhbGEnIH0sXG4gIHsgY29kZTogJ0xBJywgbmFtZTogJ0xhZGFraCcgfSxcbiAgeyBjb2RlOiAnTEQnLCBuYW1lOiAnTGFrc2hhZHdlZXAnIH0sXG4gIHsgY29kZTogJ01QJywgbmFtZTogJ01hZGh5YSBQcmFkZXNoJyB9LFxuICB7IGNvZGU6ICdNSCcsIG5hbWU6ICdNYWhhcmFzaHRyYScgfSxcbiAgeyBjb2RlOiAnTU4nLCBuYW1lOiAnTWFuaXB1cicgfSxcbiAgeyBjb2RlOiAnTUwnLCBuYW1lOiAnTWVnaGFsYXlhJyB9LFxuICB7IGNvZGU6ICdNWicsIG5hbWU6ICdNaXpvcmFtJyB9LFxuICB7IGNvZGU6ICdOTCcsIG5hbWU6ICdOYWdhbGFuZCcgfSxcbiAgeyBjb2RlOiAnT1InLCBuYW1lOiAnT2Rpc2hhJyB9LFxuICB7IGNvZGU6ICdQWScsIG5hbWU6ICdQdWR1Y2hlcnJ5JyB9LFxuICB7IGNvZGU6ICdQQicsIG5hbWU6ICdQdW5qYWInIH0sXG4gIHsgY29kZTogJ1JKJywgbmFtZTogJ1JhamFzdGhhbicgfSxcbiAgeyBjb2RlOiAnU0snLCBuYW1lOiAnU2lra2ltJyB9LFxuICB7IGNvZGU6ICdUTicsIG5hbWU6ICdUYW1pbCBOYWR1JyB9LFxuICB7IGNvZGU6ICdURycsIG5hbWU6ICdUZWxhbmdhbmEnIH0sXG4gIHsgY29kZTogJ1RSJywgbmFtZTogJ1RyaXB1cmEnIH0sXG4gIHsgY29kZTogJ1VQJywgbmFtZTogJ1V0dGFyIFByYWRlc2gnIH0sXG4gIHsgY29kZTogJ1VUJywgbmFtZTogJ1V0dGFyYWtoYW5kJyB9LFxuICB7IGNvZGU6ICdXQicsIG5hbWU6ICdXZXN0IEJlbmdhbCcgfSxcbl1cbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBMb2NhbFNlbGVjdCwgU2VhcmNoYWJsZVNlbGVjdCwgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5pbXBvcnQgeyBJTkRJQV9TVEFURVMgfSBmcm9tICcuL2luZGlhLXN0YXRlcy5qcydcblxuY29uc3QgVkVISUNMRV9UWVBFUyA9IFtcbiAgeyB2YWx1ZTogJ0Jpa2UnLCBsYWJlbDogJ0Jpa2UnIH0sXG4gIHsgdmFsdWU6ICdTY29vdGVyJywgbGFiZWw6ICdTY29vdGVyJyB9LFxuICB7IHZhbHVlOiAnRWxlY3RyaWMgYmlrZScsIGxhYmVsOiAnRWxlY3RyaWMgYmlrZScgfSxcbiAgeyB2YWx1ZTogJ0N5Y2xlJywgbGFiZWw6ICdDeWNsZScgfSxcbiAgeyB2YWx1ZTogJ1ZhbicsIGxhYmVsOiAnVmFuJyB9LFxuICB7IHZhbHVlOiAnT3RoZXInLCBsYWJlbDogJ090aGVyJyB9LFxuXVxuXG5jb25zdCBTVEFURV9PUFRJT05TID0gSU5ESUFfU1RBVEVTLm1hcCgoaXRlbSkgPT4gKHtcbiAgdmFsdWU6IGl0ZW0ubmFtZSxcbiAgbGFiZWw6IGl0ZW0ubmFtZSxcbn0pKVxuXG5mdW5jdGlvbiBGaWVsZEVycm9yKHsgZXJyb3IgfSkge1xuICBpZiAoIWVycm9yPy5tZXNzYWdlKSByZXR1cm4gbnVsbFxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3IubWVzc2FnZX08L3NwYW4+XG59XG5cbmNvbnN0IFBhcnRuZXJFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSwgYWN0aW9uIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgaXNOZXcgPSBhY3Rpb24/Lm5hbWUgPT09ICduZXcnIHx8ICFyZWNvcmQ/LmlkXG4gIGNvbnN0IHJlYWRPbmx5ID0gYWN0aW9uPy5uYW1lID09PSAnc2hvdydcbiAgY29uc3QgaGFzUGFzc3dvcmQgPSBCb29sZWFuKHBhcmFtcy5oYXNQYXNzd29yZClcbiAgY29uc3QgaXNBY3RpdmUgPSBpc05ldyAmJiAocGFyYW1zLmlzQWN0aXZlID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQWN0aXZlID09PSAnJylcbiAgICA/IHRydWVcbiAgICA6IGlzRmxhZ09uKHBhcmFtcy5pc0FjdGl2ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLmlzQWN0aXZlID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQWN0aXZlID09PSAnJykpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnaXNBY3RpdmUnLCB0cnVlKVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtpc05ld10pXG5cbiAgY29uc3QgZXJyb3JzID0gdXNlTWVtbygoKSA9PiByZWNvcmQ/LmVycm9ycyB8fCB7fSwgW3JlY29yZD8uZXJyb3JzXSlcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIHBhcnRuZXInLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgICBtZXNzYWdlOiBpc05ld1xuICAgICAgICAgICAgPyAnUGFydG5lciBzYXZlZC4gQSBwYXNzd29yZCBlbWFpbCB3aWxsIGJlIHNlbnQgaWYgdGhleSBkbyBub3QgaGF2ZSBhIHBhc3N3b3JkIHlldC4nXG4gICAgICAgICAgICA6ICdQYXJ0bmVyIHVwZGF0ZWQnLFxuICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgcGFydG5lci4gUGxlYXNlIHRyeSBhZ2Fpbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e2lzTmV3ID8gJ0FkZCBkZWxpdmVyeSBwYXJ0bmVyJyA6IHBhcmFtcy5uYW1lIHx8ICdEZWxpdmVyeSBwYXJ0bmVyJ308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgQ29sbGVjdCBmdWxsIEtZQyBhbmQgY29udGFjdCBkZXRhaWxzLiBUaGV5IGxvZyBpbiB0byB0aGUgVG9rcmlpaSBQYXJ0bmVyIGFwcCB3aXRoIHRoaXMgZW1haWxcbiAgICAgICAgICBhZnRlciBzZXR0aW5nIGEgcGFzc3dvcmQgZnJvbSB0aGUgaW52aXRlIG1haWwuXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkFjY291bnQgc3RhdHVzPC9oND5cbiAgICAgICAgICA8cD5JbmFjdGl2ZSBwYXJ0bmVycyBjYW5ub3QgbG9nIGluLCBldmVuIGlmIHRoZXkgYWxyZWFkeSBzZXQgYSBwYXNzd29yZC48L3A+XG4gICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgY2hlY2tlZD17aXNBY3RpdmV9XG4gICAgICAgICAgICBkaXNhYmxlZD17cmVhZE9ubHl9XG4gICAgICAgICAgICB0aXRsZT17aXNBY3RpdmUgPyAnQWN0aXZlJyA6ICdJbmFjdGl2ZSd9XG4gICAgICAgICAgICBoaW50PXtpc0FjdGl2ZSA/ICdDYW4gc2lnbiBpbiB0byB0aGUgcGFydG5lciBhcHAnIDogJ0xvZ2luIGlzIGJsb2NrZWQgdW50aWwgeW91IHR1cm4gdGhpcyBvbid9XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdpc0FjdGl2ZScsIG5leHQpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgeyFpc05ldyA/IChcbiAgICAgICAgICAgIDxUZXh0IG10PVwibGdcIiBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgICB7aGFzUGFzc3dvcmQgPyAnUGFzc3dvcmQgaXMgYWxyZWFkeSBzZXQuJyA6ICdObyBwYXNzd29yZCB5ZXQg4oCUIHNlbmQgdGhlIGludml0ZSBlbWFpbCBhZnRlciBzYXZpbmcuJ31cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkxvZ2luIGRldGFpbHM8L2g0PlxuICAgICAgICAgIDxwPkVtYWlsIGlzIHVzZWQgdG8gY3JlYXRlIGFuZCByZXNldCB0aGUgcGFydG5lciBwYXNzd29yZC4gTm8gU01TIGlzIHNlbnQuPC9wPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEVtYWlsXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmVtYWlsIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZW1haWwnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cInBhcnRuZXJAZXhhbXBsZS5jb21cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMuZW1haWwgPyA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmVtYWlsfSAvPiA6IChcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPlBhc3N3b3JkIGxpbmsgaXMgc2VudCB0byB0aGlzIGluYm94PC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIE1vYmlsZSBudW1iZXJcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMH1cbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBob25lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgncGhvbmUnLCBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKS5zbGljZSgwLCAxMCkpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjEwLWRpZ2l0IG51bWJlclwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5waG9uZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlBlcnNvbmFsIGRldGFpbHM8L2g0PlxuICAgICAgICA8cD5OYW1lIGlzIHNob3duIG9uIG9yZGVycy4gRmF0aGVyJmFwb3M7cyBuYW1lIGFuZCBET0IgaGVscCB3aXRoIEtZQyByZWNvcmRzLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgRnVsbCBuYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm5hbWUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCduYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJQYXJ0bmVyIGZ1bGwgbmFtZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5uYW1lfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgRmF0aGVyJmFwb3M7cyAvIGd1YXJkaWFuIG5hbWUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5mYXRoZXJOYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZmF0aGVyTmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQXMgb24gQWFkaGFhciAvIGRvY3VtZW50c1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgRGF0ZSBvZiBiaXJ0aCA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5kYXRlT2ZCaXJ0aCB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdkYXRlT2ZCaXJ0aCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PktZQyBkb2N1bWVudHM8L2g0PlxuICAgICAgICA8cD5QQU4gYW5kIEFhZGhhYXIgYXJlIHJlcXVpcmVkIGZvciBwYXJ0bmVyIG9uYm9hcmRpbmcuPC9wPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQQU4gbnVtYmVyXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICBtYXhMZW5ndGg9ezEwfVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBhbk51bWJlciB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICBzZXRGaWVsZCgncGFuTnVtYmVyJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvW15BLVowLTldL2csICcnKS5zbGljZSgwLCAxMCkpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBQkNERTEyMzRGXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnBhbk51bWJlcn0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFhZGhhYXIgbnVtYmVyXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMn1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hYWRoYWFyTnVtYmVyIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdhYWRoYWFyTnVtYmVyJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgMTIpKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMTItZGlnaXQgQWFkaGFhclwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5hYWRoYWFyTnVtYmVyfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+Q3VycmVudCBhZGRyZXNzPC9oND5cbiAgICAgICAgPHA+V2hlcmUgdGhlIHBhcnRuZXIgY3VycmVudGx5IGxpdmVzIC8gb3BlcmF0ZXMgZnJvbS48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFkZHJlc3MgbGluZSAxXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2FkZHJlc3NMaW5lMScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiSG91c2UgLyBzdHJlZXQgLyBhcmVhXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmFkZHJlc3NMaW5lMX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFkZHJlc3MgbGluZSAyIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWRkcmVzc0xpbmUyIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnYWRkcmVzc0xpbmUyJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJMYW5kbWFyaywgY29sb255XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIENpdHlcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY2l0eSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2NpdHknLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkNpdHlcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuY2l0eX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFBpbmNvZGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICBtYXhMZW5ndGg9ezZ9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucGluY29kZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3BpbmNvZGUnLCBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKS5zbGljZSgwLCA2KSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiNi1kaWdpdCBwaW5jb2RlXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnBpbmNvZGV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBTdGF0ZVxuICAgICAgICAgIDxTZWFyY2hhYmxlU2VsZWN0XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnN0YXRlIHx8ICcnfVxuICAgICAgICAgICAgb3B0aW9ucz17W3sgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCBzdGF0ZScgfSwgLi4uU1RBVEVfT1BUSU9OU119XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdzdGF0ZScsIG5leHQpfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3Qgc3RhdGVcIlxuICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggc3RhdGVzXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuc3RhdGV9IC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBQZXJtYW5lbnQgYWRkcmVzcyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXQgdG9rcmktdGV4dGFyZWFcIlxuICAgICAgICAgICAgcm93cz17M31cbiAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucGVybWFuZW50QWRkcmVzcyB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdwZXJtYW5lbnRBZGRyZXNzJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiSWYgZGlmZmVyZW50IGZyb20gY3VycmVudCBhZGRyZXNzXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkVtZXJnZW5jeSBjb250YWN0PC9oND5cbiAgICAgICAgICA8cD5Tb21lb25lIHdlIGNhbiBjYWxsIGlmIHRoZSBwYXJ0bmVyIGlzIHVucmVhY2hhYmxlLjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDb250YWN0IG5hbWUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5lbWVyZ2VuY3lOYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZW1lcmdlbmN5TmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUmVsYXRpdmUgLyBmcmllbmQgbmFtZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQ29udGFjdCBtb2JpbGUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICBtYXhMZW5ndGg9ezEwfVxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZW1lcmdlbmN5UGhvbmUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ2VtZXJnZW5jeVBob25lJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgMTApKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMTAtZGlnaXQgbnVtYmVyXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmVtZXJnZW5jeVBob25lfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5WZWhpY2xlIGRldGFpbHM8L2g0PlxuICAgICAgICAgIDxwPlVzZWQgZm9yIGRlbGl2ZXJ5IGFzc2lnbm1lbnQgYW5kIHN1cHBvcnQuPC9wPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFZlaGljbGUgdHlwZSA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogNiB9fT5cbiAgICAgICAgICAgICAgPExvY2FsU2VsZWN0XG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy52ZWhpY2xlVHlwZSB8fCAnJ31cbiAgICAgICAgICAgICAgICBvcHRpb25zPXtbeyB2YWx1ZTogJycsIGxhYmVsOiAnU2VsZWN0IHZlaGljbGUnIH0sIC4uLlZFSElDTEVfVFlQRVNdfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ3ZlaGljbGVUeXBlJywgbmV4dCl9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBWZWhpY2xlIG51bWJlciA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnZlaGljbGVOdW1iZXIgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3ZlaGljbGVOdW1iZXInLCBldmVudC50YXJnZXQudmFsdWUudG9VcHBlckNhc2UoKS5zbGljZSgwLCAyMCkpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJlLmcuIE1IMTJBQjEyMzRcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkJhbmsgZGV0YWlsczwvaDQ+XG4gICAgICAgIDxwPkZvciBwYXlvdXRzIGFuZCByZWltYnVyc2VtZW50cy4gT3B0aW9uYWwgZm9yIG5vdywgYnV0IHJlY29tbWVuZGVkLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQWNjb3VudCBob2xkZXIgbmFtZSA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFjY291bnRIb2xkZXJOYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnYWNjb3VudEhvbGRlck5hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFzIHBlciBiYW5rIGFjY291bnRcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFjY291bnQgbnVtYmVyIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWNjb3VudE51bWJlciB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2FjY291bnROdW1iZXInLCBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnJykpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkJhbmsgYWNjb3VudCBudW1iZXJcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIElGU0MgY29kZSA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMX1cbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuaWZzY0NvZGUgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICBzZXRGaWVsZCgnaWZzY0NvZGUnLCBldmVudC50YXJnZXQudmFsdWUudG9VcHBlckNhc2UoKS5yZXBsYWNlKC9bXkEtWjAtOV0vZywgJycpLnNsaWNlKDAsIDExKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU0JJTjAwMDEyMzRcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5pZnNjQ29kZX0gLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkludGVybmFsIG5vdGVzPC9oND5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIE5vdGVzIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dCB0b2tyaS10ZXh0YXJlYVwiXG4gICAgICAgICAgICByb3dzPXs0fVxuICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5ub3RlcyB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdub3RlcycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNoaWZ0IHRpbWluZywgaHViLCBvciBhbnl0aGluZyB5b3VyIHRlYW0gc2hvdWxkIHJlbWVtYmVyXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7cmVhZE9ubHkgPyBudWxsIDogKFxuICAgICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgICAge2lzTmV3ID8gJ0NyZWF0ZSBwYXJ0bmVyJyA6ICdTYXZlIHBhcnRuZXInfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFydG5lckVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24gfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBTZWFyY2hhYmxlU2VsZWN0LCBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcbmltcG9ydCB7IElORElBX1NUQVRFUyB9IGZyb20gJy4vaW5kaWEtc3RhdGVzLmpzJ1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuY29uc3QgU1RBVEVfT1BUSU9OUyA9IElORElBX1NUQVRFUy5tYXAoKGl0ZW0pID0+ICh7XG4gIHZhbHVlOiBpdGVtLmNvZGUsXG4gIGxhYmVsOiBgJHtpdGVtLm5hbWV9ICgke2l0ZW0uY29kZX0pYCxcbn0pKVxuXG5jb25zdCBQaW5jb2RlRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzTmV3ID0gYWN0aW9uPy5uYW1lID09PSAnbmV3JyB8fCAhcmVjb3JkPy5pZFxuICBjb25zdCByZWFkT25seSA9IGFjdGlvbj8ubmFtZSA9PT0gJ3Nob3cnXG4gIGNvbnN0IGlzQWN0aXZlID0gaXNOZXcgJiYgKHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJycpXG4gICAgPyB0cnVlXG4gICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNBY3RpdmUpXG4gIGNvbnN0IG1vcm5pbmdFbmFibGVkID0gaXNOZXcgJiYgKHBhcmFtcy5tb3JuaW5nRW5hYmxlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5tb3JuaW5nRW5hYmxlZCA9PT0gJycpXG4gICAgPyB0cnVlXG4gICAgOiBpc0ZsYWdPbihwYXJhbXMubW9ybmluZ0VuYWJsZWQpXG4gIGNvbnN0IGV4cHJlc3NFbmFibGVkID0gaXNOZXcgJiYgKHBhcmFtcy5leHByZXNzRW5hYmxlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5leHByZXNzRW5hYmxlZCA9PT0gJycpXG4gICAgPyBmYWxzZVxuICAgIDogaXNGbGFnT24ocGFyYW1zLmV4cHJlc3NFbmFibGVkKVxuICBjb25zdCBbcGFydG5lcnMsIHNldFBhcnRuZXJzXSA9IHVzZVN0YXRlKFtdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTmV3ICYmIChwYXJhbXMuaXNBY3RpdmUgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBY3RpdmUgPT09ICcnKSkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdpc0FjdGl2ZScsIHRydWUpXG4gICAgfVxuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLm1vcm5pbmdFbmFibGVkID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLm1vcm5pbmdFbmFibGVkID09PSAnJykpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnbW9ybmluZ0VuYWJsZWQnLCB0cnVlKVxuICAgIH1cbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5leHByZXNzRW5hYmxlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5leHByZXNzRW5hYmxlZCA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ2V4cHJlc3NFbmFibGVkJywgZmFsc2UpXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW2lzTmV3XSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBpZ25vcmUgPSBmYWxzZVxuICAgIGFwaVxuICAgICAgLnJlc291cmNlQWN0aW9uKHsgcmVzb3VyY2VJZDogJ0RlbGl2ZXJ5UGFydG5lcicsIGFjdGlvbk5hbWU6ICdsaXN0JywgcGFyYW1zOiB7IHBlclBhZ2U6IDIwMCB9IH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKGlnbm9yZSkgcmV0dXJuXG4gICAgICAgIGNvbnN0IHJlY29yZHMgPSByZXNwb25zZS5kYXRhPy5yZWNvcmRzIHx8IFtdXG4gICAgICAgIHNldFBhcnRuZXJzKFxuICAgICAgICAgIHJlY29yZHMubWFwKChpdGVtKSA9PiAoe1xuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uaWQgfHwgaXRlbS5wYXJhbXM/LmlkLFxuICAgICAgICAgICAgbGFiZWw6IGlzRmxhZ09uKGl0ZW0ucGFyYW1zPy5pc0FjdGl2ZSlcbiAgICAgICAgICAgICAgPyBpdGVtLnBhcmFtcz8ubmFtZSB8fCAnUGFydG5lcidcbiAgICAgICAgICAgICAgOiBgJHtpdGVtLnBhcmFtcz8ubmFtZSB8fCAnUGFydG5lcid9IChpbmFjdGl2ZSlgLFxuICAgICAgICAgIH0pKSxcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGlmICghaWdub3JlKSBzZXRQYXJ0bmVycyhbXSlcbiAgICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlnbm9yZSA9IHRydWVcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IHBhcnRuZXJJZCA9IHBhcmFtcy5wYXJ0bmVySWQgfHwgcGFyYW1zLnBhcnRuZXIgfHwgJydcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIHBpbmNvZGUnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogaXNOZXcgPyAnUGluY29kZSBhZGRlZCcgOiAnUGluY29kZSB1cGRhdGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHBpbmNvZGUuIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntpc05ldyA/ICdBZGQgc2VydmljZWFibGUgcGluY29kZScgOiBgUElOICR7cGFyYW1zLnBpbmNvZGUgfHwgJyd9YH08L0gzPlxuICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46IDAsIGNvbG9yOiAnI2ZmZicsIG9wYWNpdHk6IDAuOSB9fT5cbiAgICAgICAgICBDdXN0b21lcnMgY2FuIHNhdmUgYW4gYWRkcmVzcyBhbmQgY2hlY2sgb3V0IG9ubHkgd2hlbiB0aGlzIHBpbmNvZGUgaXMgYWN0aXZlLlxuICAgICAgICA8L3A+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5EZWxpdmVyeSBjb3ZlcmFnZTwvaDQ+XG4gICAgICAgICAgPHA+VHVybiB0aGlzIG9mZiB0byBzdG9wIHRha2luZyBvcmRlcnMgZm9yIHRoaXMgUElOIHdpdGhvdXQgZGVsZXRpbmcgaXQuPC9wPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2lzQWN0aXZlfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgdGl0bGU9e2lzQWN0aXZlID8gJ1dlIGRlbGl2ZXIgaGVyZScgOiAnTm90IGRlbGl2ZXJpbmcnfVxuICAgICAgICAgICAgaGludD17aXNBY3RpdmUgPyAnQWRkcmVzcyBzYXZlIGFuZCBjaGVja291dCBhcmUgYWxsb3dlZCcgOiAnQ3VzdG9tZXJzIHdpbGwgc2VlIHRoYXQgdGhpcyBQSU4gaXMgbm90IHNlcnZpY2VhYmxlJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzQWN0aXZlJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkRlbGl2ZXJ5IG9wdGlvbnM8L2g0PlxuICAgICAgICAgIDxwPlR1cm4gYW4gb3B0aW9uIG9mZiB0byBzaG93IGl0IGFzIGNvbWluZyBzb29uIGF0IGNoZWNrb3V0LiBJZiBib3RoIGFyZSBvZmYsIHRoaXMgUElOIGlzIG5vdCBkZWxpdmVyYWJsZS48L3A+XG4gICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgY2hlY2tlZD17bW9ybmluZ0VuYWJsZWR9XG4gICAgICAgICAgICBkaXNhYmxlZD17cmVhZE9ubHl9XG4gICAgICAgICAgICBvbkxhYmVsPVwiT25cIlxuICAgICAgICAgICAgb2ZmTGFiZWw9XCJPZmZcIlxuICAgICAgICAgICAgdGl0bGU9XCJNb3JuaW5nIGRlbGl2ZXJ5XCJcbiAgICAgICAgICAgIGhpbnQ9e21vcm5pbmdFbmFibGVkID8gJ1Nob3BwZXJzIGNhbiBjaG9vc2UgbW9ybmluZyBkZWxpdmVyeScgOiAnU2hvd24gYXMgY29taW5nIHNvb24nfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnbW9ybmluZ0VuYWJsZWQnLCBuZXh0KX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiAxMiB9fSAvPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2V4cHJlc3NFbmFibGVkfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgb25MYWJlbD1cIk9uXCJcbiAgICAgICAgICAgIG9mZkxhYmVsPVwiT2ZmXCJcbiAgICAgICAgICAgIHRpdGxlPVwiRXhwcmVzcyBkZWxpdmVyeVwiXG4gICAgICAgICAgICBoaW50PXtleHByZXNzRW5hYmxlZCA/ICdTaG9wcGVycyBjYW4gY2hvb3NlIEV4cHJlc3MgZGVsaXZlcnknIDogJ1Nob3duIGFzIGNvbWluZyBzb29uJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2V4cHJlc3NFbmFibGVkJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkFzc2lnbmVkIHBhcnRuZXI8L2g0PlxuICAgICAgICAgIDxwPk5ldyBvcmRlcnMgaW4gdGhpcyBQSU4gYXJlIGF1dG8tYXNzaWduZWQgdG8gdGhpcyBwYXJ0bmVyLiBZb3UgY2FuIHJlYXNzaWduIGxhdGVyIG9uIHRoZSBvcmRlci48L3A+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgRGVsaXZlcnkgcGFydG5lciA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8U2VhcmNoYWJsZVNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17cGFydG5lcklkfVxuICAgICAgICAgICAgICBvcHRpb25zPXtbeyB2YWx1ZTogJycsIGxhYmVsOiAnTm8gcGFydG5lciBhc3NpZ25lZCcgfSwgLi4ucGFydG5lcnNdfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdwYXJ0bmVySWQnLCBuZXh0KVxuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdwYXJ0bmVyJywgbmV4dClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3QgYSBwYXJ0bmVyXCJcbiAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggcGFydG5lcnNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkxvY2F0aW9uPC9oND5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUGluY29kZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICBtYXhMZW5ndGg9ezZ9XG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seSB8fCAhaXNOZXd9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucGluY29kZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3BpbmNvZGUnLCBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKS5zbGljZSgwLCA2KSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiNi1kaWdpdCBQSU5cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMucGluY29kZSA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9ycy5waW5jb2RlLm1lc3NhZ2V9PC9zcGFuPiA6IChcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkluZGlhIFBJTiBjb2RlLCA2IGRpZ2l0czwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBcmVhIG5hbWUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hcmVhTGFiZWwgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdhcmVhTGFiZWwnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFuZGhlcmkgV2VzdCwgQmFuZHJhLCDigKZcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQ2l0eVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jaXR5IHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnY2l0eScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTXVtYmFpXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7ZXJyb3JzLmNpdHkgPyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPntlcnJvcnMuY2l0eS5tZXNzYWdlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgU3RhdGVcbiAgICAgICAgICAgIDxTZWFyY2hhYmxlU2VsZWN0XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc3RhdGVDb2RlIHx8IHBhcmFtcy5zdGF0ZSB8fCAnJ31cbiAgICAgICAgICAgICAgb3B0aW9ucz17W3sgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCBzdGF0ZScgfSwgLi4uU1RBVEVfT1BUSU9OU119XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3N0YXRlQ29kZScsIG5leHQpXG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3N0YXRlJywgbmV4dClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3Qgc3RhdGVcIlxuICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcj1cIlNlYXJjaCBzdGF0ZXNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMuc3RhdGUgfHwgZXJyb3JzLnN0YXRlQ29kZSA/IChcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj5cbiAgICAgICAgICAgICAgICB7KGVycm9ycy5zdGF0ZSB8fCBlcnJvcnMuc3RhdGVDb2RlKS5tZXNzYWdlfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+QWxsIEluZGlhbiBzdGF0ZXMgYW5kIHVuaW9uIHRlcnJpdG9yaWVzPC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAge3JlYWRPbmx5ID8gbnVsbCA6IChcbiAgICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICAgIHtpc05ldyA/ICdBZGQgcGluY29kZScgOiAnU2F2ZSBwaW5jb2RlJ31cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBpbmNvZGVFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB1c2VOb3RpY2UgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKVxuXG5jb25zdCBTdGF0dXNUb2dnbGUgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQsIHJlc291cmNlLCBwcm9wZXJ0eSwgd2hlcmUsIG9uQ2hhbmdlIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCBmaWVsZCA9IHByb3BlcnR5Py5wYXRoIHx8ICdpc0FjdGl2ZSdcbiAgY29uc3QgYWN0aW9uTmFtZSA9IHByb3BlcnR5Py5jdXN0b20/LmFjdGlvbk5hbWUgfHwgJ3RvZ2dsZUFjdGl2ZSdcbiAgY29uc3Qgb25MYWJlbCA9IHByb3BlcnR5Py5jdXN0b20/Lm9uTGFiZWwgfHwgJ0FjdGl2ZSdcbiAgY29uc3Qgb2ZmTGFiZWwgPSBwcm9wZXJ0eT8uY3VzdG9tPy5vZmZMYWJlbCB8fCAnSW5hY3RpdmUnXG4gIGNvbnN0IHJhdyA9IHJlY29yZD8ucGFyYW1zPy5bZmllbGRdXG4gIGNvbnN0IFtjaGVja2VkLCBzZXRDaGVja2VkXSA9IHVzZVN0YXRlKGlzRmxhZ09uKHJhdykpXG4gIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0Q2hlY2tlZChpc0ZsYWdPbihyYXcpKVxuICB9LCBbcmF3LCByZWNvcmQ/LmlkXSlcblxuICBjb25zdCBwZXJzaXN0ID0gYXN5bmMgKG5leHQpID0+IHtcbiAgICBpZiAoIXJlY29yZD8uaWQpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIHJlY29yZElkOiByZWNvcmQuaWQsXG4gICAgICAgIGFjdGlvbk5hbWUsXG4gICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICBkYXRhOiB7IFtmaWVsZF06IG5leHQgfSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBzYXZlZCA9IHJlc3BvbnNlLmRhdGE/LnJlY29yZD8ucGFyYW1zPy5bZmllbGRdXG4gICAgICBzZXRDaGVja2VkKHNhdmVkID09PSB1bmRlZmluZWQgPyBuZXh0IDogaXNGbGFnT24oc2F2ZWQpKVxuICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2UuZGF0YT8ubm90aWNlXG4gICAgICBhZGROb3RpY2Uoe1xuICAgICAgICBtZXNzYWdlOiBub3RpY2U/Lm1lc3NhZ2UgfHwgKG5leHQgPyBgTWFya2VkICR7b25MYWJlbC50b0xvd2VyQ2FzZSgpfWAgOiBgTWFya2VkICR7b2ZmTGFiZWwudG9Mb3dlckNhc2UoKX1gKSxcbiAgICAgICAgdHlwZTogbm90aWNlPy50eXBlIHx8ICdzdWNjZXNzJyxcbiAgICAgIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCB1cGRhdGUgc3RhdHVzLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAobmV4dCkgPT4ge1xuICAgIGlmICh3aGVyZSA9PT0gJ2VkaXQnICYmIHR5cGVvZiBvbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgc2V0Q2hlY2tlZChuZXh0KVxuICAgICAgb25DaGFuZ2UoZmllbGQsIG5leHQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgcGVyc2lzdChuZXh0KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8U3RhdHVzU3dpdGNoXG4gICAgICBjb21wYWN0PXt3aGVyZSAhPT0gJ2VkaXQnfVxuICAgICAgY2hlY2tlZD17Y2hlY2tlZH1cbiAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgb25MYWJlbD17b25MYWJlbH1cbiAgICAgIG9mZkxhYmVsPXtvZmZMYWJlbH1cbiAgICAgIHRpdGxlPXt3aGVyZSA9PT0gJ2VkaXQnID8gKGNoZWNrZWQgPyBvbkxhYmVsIDogb2ZmTGFiZWwpIDogdW5kZWZpbmVkfVxuICAgICAgaGludD17d2hlcmUgPT09ICdlZGl0JyA/IHByb3BlcnR5Py5kZXNjcmlwdGlvbiA6IHVuZGVmaW5lZH1cbiAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2V9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBTdGF0dXNUb2dnbGVcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmZ1bmN0aW9uIHBhZCh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5wYWRTdGFydCgyLCAnMCcpXG59XG5cbmZ1bmN0aW9uIHRvRGF0ZUlucHV0KHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCB0ZXh0ID0gU3RyaW5nKHZhbHVlKVxuICBpZiAoL15cXGR7NH0tXFxkezJ9LVxcZHsyfS8udGVzdCh0ZXh0KSkgcmV0dXJuIHRleHQuc2xpY2UoMCwgMTApXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcbiAgaWYgKE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiAnJ1xuICByZXR1cm4gYCR7ZGF0ZS5nZXRGdWxsWWVhcigpfS0ke3BhZChkYXRlLmdldE1vbnRoKCkgKyAxKX0tJHtwYWQoZGF0ZS5nZXREYXRlKCkpfWBcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2hlbih2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJ+KAlCdcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxuICBpZiAoTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuICfigJQnXG4gIHJldHVybiBkYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgZGF0ZVN0eWxlOiAnbWVkaXVtJywgdGltZVN0eWxlOiAnc2hvcnQnIH0pXG59XG5cbmZ1bmN0aW9uIHBhcnNlQWRkcmVzc2VzKHBhcmFtcykge1xuICBjb25zdCByYXcgPSBwYXJhbXMuYWRkcmVzc2VzXG4gIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcuZmlsdGVyKEJvb2xlYW4pXG4gIGlmIChyYXcgJiYgdHlwZW9mIHJhdyA9PT0gJ29iamVjdCcpIHJldHVybiBbcmF3XVxuICBpZiAodHlwZW9mIHJhdyA9PT0gJ3N0cmluZycgJiYgcmF3LnRyaW0oKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdylcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcnNlZCkpIHJldHVybiBwYXJzZWQuZmlsdGVyKEJvb2xlYW4pXG4gICAgICBpZiAocGFyc2VkICYmIHR5cGVvZiBwYXJzZWQgPT09ICdvYmplY3QnKSByZXR1cm4gW3BhcnNlZF1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGZsYXR0ZW5lZCBBZG1pbkpTIHBhcmFtcyBiZWxvd1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGdyb3VwZWQgPSB7fVxuICBPYmplY3QuZW50cmllcyhwYXJhbXMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgIGNvbnN0IG1hdGNoID0ga2V5Lm1hdGNoKC9eYWRkcmVzc2VzXFwuKFxcZCspXFwuKC4rKSQvKVxuICAgIGlmICghbWF0Y2ggfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHJldHVyblxuICAgIGNvbnN0IFssIGluZGV4LCBmaWVsZF0gPSBtYXRjaFxuICAgIGdyb3VwZWRbaW5kZXhdID0gZ3JvdXBlZFtpbmRleF0gfHwge31cbiAgICBncm91cGVkW2luZGV4XVtmaWVsZF0gPSB2YWx1ZVxuICB9KVxuICByZXR1cm4gT2JqZWN0LmtleXMoZ3JvdXBlZClcbiAgICAuc29ydCgoYSwgYikgPT4gTnVtYmVyKGEpIC0gTnVtYmVyKGIpKVxuICAgIC5tYXAoKGtleSkgPT4gZ3JvdXBlZFtrZXldKVxufVxuXG5mdW5jdGlvbiBhZGRyZXNzTGluZXMoYWRkcmVzcykge1xuICByZXR1cm4gW1xuICAgIGFkZHJlc3MubGluZTEsXG4gICAgYWRkcmVzcy5saW5lMixcbiAgICBbYWRkcmVzcy5jaXR5LCBhZGRyZXNzLnN0YXRlLCBhZGRyZXNzLnBpbmNvZGVdLmZpbHRlcihCb29sZWFuKS5qb2luKCcsICcpLFxuICAgIGFkZHJlc3MubGFuZG1hcmsgPyBgTGFuZG1hcms6ICR7YWRkcmVzcy5sYW5kbWFya31gIDogJycsXG4gIF0uZmlsdGVyKEJvb2xlYW4pXG59XG5cbmNvbnN0IEN1c3RvbWVyRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBpc0FjdGl2ZSA9IHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJydcbiAgICA/IHRydWVcbiAgICA6IGlzRmxhZ09uKHBhcmFtcy5pc0FjdGl2ZSlcbiAgY29uc3QgYWRkcmVzc2VzID0gdXNlTWVtbygoKSA9PiBwYXJzZUFkZHJlc3NlcyhwYXJhbXMpLCBbcGFyYW1zXSlcbiAgY29uc3QgZXJyb3JzID0gdXNlTWVtbygoKSA9PiByZWNvcmQ/LmVycm9ycyB8fCB7fSwgW3JlY29yZD8uZXJyb3JzXSlcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIGN1c3RvbWVyJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDdXN0b21lciB1cGRhdGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIGN1c3RvbWVyLiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57cGFyYW1zLm5hbWUgfHwgJ0N1c3RvbWVyJ308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgKzkxIHtwYXJhbXMucGhvbmUgfHwgJ+KAlCd9IMK3IGpvaW5lZCB7Zm9ybWF0V2hlbihwYXJhbXMuY3JlYXRlZEF0KX1cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+QWNjb3VudCBzdGF0dXM8L2g0PlxuICAgICAgICAgIDxwPkluYWN0aXZlIGN1c3RvbWVycyBjYW5ub3Qgc2lnbiBpbiB3aXRoIHRoaXMgbW9iaWxlIG51bWJlci48L3A+XG4gICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgY2hlY2tlZD17aXNBY3RpdmV9XG4gICAgICAgICAgICB0aXRsZT17aXNBY3RpdmUgPyAnQWN0aXZlJyA6ICdJbmFjdGl2ZSd9XG4gICAgICAgICAgICBoaW50PXtpc0FjdGl2ZSA/ICdDYW4gbG9nIGluIG9uIHRoZSB3ZWJzaXRlIGFuZCBhcHAnIDogJ0xvZ2luIGlzIGJsb2NrZWQgdW50aWwgeW91IHR1cm4gdGhpcyBvbid9XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdpc0FjdGl2ZScsIG5leHQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Qcm9maWxlPC9oND5cbiAgICAgICAgICA8cD5QaG9uZSBjb21lcyBmcm9tIE9UUCBsb2dpbiBhbmQgc3RheXMgYXMgdGhlIGN1c3RvbWVy4oCZcyBsb2dpbiBpZC48L3A+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgTmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ25hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkN1c3RvbWVyIG5hbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMubmFtZSA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9ycy5uYW1lLm1lc3NhZ2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgTW9iaWxlXG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIiB2YWx1ZT17cGFyYW1zLnBob25lIHx8ICcnfSByZWFkT25seSAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgRGF0ZSBvZiBiaXJ0aFxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17dG9EYXRlSW5wdXQocGFyYW1zLmRhdGVPZkJpcnRoKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZGF0ZU9mQmlydGgnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7ZXJyb3JzLmRhdGVPZkJpcnRoID8gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3JzLmRhdGVPZkJpcnRoLm1lc3NhZ2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlNhdmVkIGFkZHJlc3NlczwvaDQ+XG4gICAgICAgIDxwPlxuICAgICAgICAgIHthZGRyZXNzZXMubGVuZ3RoXG4gICAgICAgICAgICA/IGAke2FkZHJlc3Nlcy5sZW5ndGh9IGFkZHJlc3Mke2FkZHJlc3Nlcy5sZW5ndGggPT09IDEgPyAnJyA6ICdlcyd9IHNhdmVkIGluIHRoZSBjdXN0b21lciBhY2NvdW50LmBcbiAgICAgICAgICAgIDogJ1RoaXMgY3VzdG9tZXIgaGFzIG5vdCBzYXZlZCBhIGRlbGl2ZXJ5IGFkZHJlc3MgeWV0Lid9XG4gICAgICAgIDwvcD5cbiAgICAgICAge2FkZHJlc3Nlcy5sZW5ndGggPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1hZGRyZXNzLWdyaWRcIj5cbiAgICAgICAgICAgIHthZGRyZXNzZXMubWFwKChhZGRyZXNzLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICA8YXJ0aWNsZSBrZXk9e2FkZHJlc3MuaWQgfHwgYCR7YWRkcmVzcy5waW5jb2RlfS0ke2luZGV4fWB9IGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtY2FyZFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktYWRkcmVzcy10b3BcIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtbGFiZWxcIj57YWRkcmVzcy5sYWJlbCB8fCAnQWRkcmVzcyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAge2FkZHJlc3MucGluY29kZSA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtcGluXCI+e2FkZHJlc3MucGluY29kZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPnthZGRyZXNzLm5hbWUgfHwgcGFyYW1zLm5hbWUgfHwgJ0N1c3RvbWVyJ308L3N0cm9uZz5cbiAgICAgICAgICAgICAgICB7YWRkcmVzcy5waG9uZSA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtcGhvbmVcIj4rOTEge2FkZHJlc3MucGhvbmV9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAge2FkZHJlc3NMaW5lcyhhZGRyZXNzKS5tYXAoKGxpbmUpID0+IChcbiAgICAgICAgICAgICAgICAgIDxwIGtleT17bGluZX0+e2xpbmV9PC9wPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICBTYXZlIGN1c3RvbWVyXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ3VzdG9tZXJFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IEZsYWdDYXJkLCBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3QgUk9MRVMgPSBbXG4gIHsgdmFsdWU6ICdzdGFmZicsIHRpdGxlOiAnU3RhZmYnLCBoaW50OiAnQWNjZXNzIG9ubHkgdGhlIGFyZWFzIHlvdSB0aWNrIGJlbG93JyB9LFxuICB7IHZhbHVlOiAnYWRtaW4nLCB0aXRsZTogJ0FkbWluJywgaGludDogJ0Z1bGwgYWNjZXNzIHRvIHRoZSBDTVMnIH0sXG4gIHsgdmFsdWU6ICdzdXBlcl9hZG1pbicsIHRpdGxlOiAnU3VwZXIgYWRtaW4nLCBoaW50OiAnRnVsbCBhY2Nlc3MsIHNhbWUgYXMgYWRtaW4nIH0sXG5dXG5cbmNvbnN0IFBFUk1JU1NJT05TID0gW1xuICB7IGtleTogJ21hbmFnZVByb2R1Y3RzJywgbGFiZWw6ICdQcm9kdWN0cycsIGhpbnQ6ICdBZGQgYW5kIGVkaXQgcHJvZHVjdHMnIH0sXG4gIHsga2V5OiAnbWFuYWdlQ2F0YWxvZycsIGxhYmVsOiAnQ2F0YWxvZycsIGhpbnQ6ICdDYXRlZ29yaWVzIGFuZCBjb2xsZWN0aW9ucycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VNZWRpYScsIGxhYmVsOiAnTWVkaWEnLCBoaW50OiAnVXBsb2FkIGFuZCByZXBsYWNlIGltYWdlcycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VPcmRlcnMnLCBsYWJlbDogJ09yZGVycycsIGhpbnQ6ICdWaWV3IGFuZCB1cGRhdGUgb3JkZXJzJyB9LFxuICB7IGtleTogJ21hbmFnZUNvdXBvbnMnLCBsYWJlbDogJ0NvdXBvbnMnLCBoaW50OiAnQ3JlYXRlIGRpc2NvdW50IGNvZGVzJyB9LFxuICB7IGtleTogJ21hbmFnZUNvbnRlbnQnLCBsYWJlbDogJ0NvbnRlbnQnLCBoaW50OiAnUGFnZXMgYW5kIHJldmlld3MnIH0sXG4gIHsga2V5OiAnbWFuYWdlU2V0dGluZ3MnLCBsYWJlbDogJ1NldHRpbmdzJywgaGludDogJ1N0b3JlIGFuZCBob21lcGFnZSBzZXR0aW5ncycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VVc2VycycsIGxhYmVsOiAnVGVhbScsIGhpbnQ6ICdDcmVhdGUgdXNlcnMgYW5kIGNoYW5nZSBhY2Nlc3MnIH0sXG5dXG5cbmZ1bmN0aW9uIEZpZWxkRXJyb3IoeyBlcnJvciB9KSB7XG4gIGlmICghZXJyb3I/Lm1lc3NhZ2UpIHJldHVybiBudWxsXG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPntlcnJvci5tZXNzYWdlfTwvc3Bhbj5cbn1cblxuZnVuY3Rpb24gUGFzc3dvcmRGaWVsZCh7IGxhYmVsLCB2YWx1ZSwgb25DaGFuZ2UsIGVycm9yLCBwbGFjZWhvbGRlciB9KSB7XG4gIGNvbnN0IFt2aXNpYmxlLCBzZXRWaXNpYmxlXSA9IHVzZVN0YXRlKGZhbHNlKVxuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgIHtsYWJlbH1cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXBhc3N3b3JkLXdyYXBcIj5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICB0eXBlPXt2aXNpYmxlID8gJ3RleHQnIDogJ3Bhc3N3b3JkJ31cbiAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICBwbGFjZWhvbGRlcj17cGxhY2Vob2xkZXJ9XG4gICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLXBhc3N3b3JkLXRvZ2dsZVwiXG4gICAgICAgICAgYXJpYS1sYWJlbD17dmlzaWJsZSA/ICdIaWRlIHBhc3N3b3JkJyA6ICdTaG93IHBhc3N3b3JkJ31cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaXNpYmxlKChjdXJyZW50KSA9PiAhY3VycmVudCl9XG4gICAgICAgID5cbiAgICAgICAgICB7dmlzaWJsZSA/ICdIaWRlJyA6ICdTaG93J31cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L3NwYW4+XG4gICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3J9IC8+XG4gICAgPC9sYWJlbD5cbiAgKVxufVxuXG5jb25zdCBUZWFtRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzTmV3ID0gYWN0aW9uPy5uYW1lID09PSAnbmV3JyB8fCAhcmVjb3JkPy5pZFxuICBjb25zdCByb2xlID0gcGFyYW1zLnJvbGUgfHwgJ3N0YWZmJ1xuICBjb25zdCBpc0FjdGl2ZSA9XG4gICAgaXNOZXcgJiYgKHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJycpXG4gICAgICA/IHRydWVcbiAgICAgIDogaXNGbGFnT24ocGFyYW1zLmlzQWN0aXZlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTmV3ICYmIChwYXJhbXMuaXNBY3RpdmUgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBY3RpdmUgPT09ICcnKSkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdpc0FjdGl2ZScsIHRydWUpXG4gICAgfVxuICAgIGlmIChpc05ldyAmJiAhcGFyYW1zLnJvbGUpIGhhbmRsZUNoYW5nZSgncm9sZScsICdzdGFmZicpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbaXNOZXddKVxuXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuICBjb25zdCBwZXJtaXNzaW9uT24gPSAoa2V5KSA9PiBpc0ZsYWdPbihwYXJhbXNbYHBlcm1pc3Npb25zLiR7a2V5fWBdKVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSB0ZWFtIG1lbWJlcicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpY2Uoe1xuICAgICAgICAgIG1lc3NhZ2U6IGlzTmV3ID8gJ1RlYW0gbWVtYmVyIGNyZWF0ZWQnIDogJ1RlYW0gbWVtYmVyIHVwZGF0ZWQnLFxuICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgdGVhbSBtZW1iZXIuIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntpc05ldyA/ICdBZGQgdGVhbSBtZW1iZXInIDogcGFyYW1zLm5hbWUgfHwgJ1RlYW0gbWVtYmVyJ308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgVGhleSBzaWduIGluIHRvIFRva3JpaWkgQ01TIHdpdGggdXNlcm5hbWUgb3IgZW1haWwuIEluYWN0aXZlIHVzZXJzIGNhbm5vdCBsb2cgaW4uXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkFjY291bnQgc3RhdHVzPC9oND5cbiAgICAgICAgICA8cD5UdXJuIHRoaXMgb2ZmIHRvIGJsb2NrIENNUyBsb2dpbiB3aXRob3V0IGRlbGV0aW5nIHRoZSBhY2NvdW50LjwvcD5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgIHRpdGxlPXtpc0FjdGl2ZSA/ICdBY3RpdmUnIDogJ0luYWN0aXZlJ31cbiAgICAgICAgICAgIGhpbnQ9e2lzQWN0aXZlID8gJ0NhbiBzaWduIGluIHRvIHRoZSBhZG1pbiBwYW5lbCcgOiAnTG9naW4gaXMgYmxvY2tlZCB1bnRpbCB5b3UgdHVybiB0aGlzIG9uJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzQWN0aXZlJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlJvbGU8L2g0PlxuICAgICAgICAgIDxwPkFkbWluIGFuZCBzdXBlciBhZG1pbiBnZXQgZnVsbCBhY2Nlc3MuIFN0YWZmIG9ubHkgZ2V0cyB0aGUgcGVybWlzc2lvbnMgeW91IGVuYWJsZS48L3A+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaG9pY2Utcm93XCI+XG4gICAgICAgICAgICB7Uk9MRVMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICAgIDxGbGFnQ2FyZFxuICAgICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZX1cbiAgICAgICAgICAgICAgICBzZWxlY3RlZD17cm9sZSA9PT0gaXRlbS52YWx1ZX1cbiAgICAgICAgICAgICAgICB0aXRsZT17aXRlbS50aXRsZX1cbiAgICAgICAgICAgICAgICBoaW50PXtpdGVtLmhpbnR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ3JvbGUnLCBpdGVtLnZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkxvZ2luIGRldGFpbHM8L2g0PlxuICAgICAgICA8cD5Vc2VybmFtZSBvciBlbWFpbCBjYW4gYmUgdXNlZCBvbiB0aGUgQ01TIGxvZ2luIHNjcmVlbi48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEZ1bGwgbmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ25hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlRlYW0gbWVtYmVyIG5hbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMubmFtZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFVzZXJuYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy51c2VybmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3VzZXJuYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRyaW0oKSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiZS5nLiByYXZpLmNtc1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy51c2VybmFtZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIEVtYWlsXG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmVtYWlsIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2VtYWlsJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwibmFtZUB0b2tyaWlpLmNvbVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmVtYWlsfSAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICB7aXNOZXcgPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8UGFzc3dvcmRGaWVsZFxuICAgICAgICAgICAgICBsYWJlbD1cIlBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5wYXNzd29yZCB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gc2V0RmllbGQoJ3Bhc3N3b3JkJywgdmFsdWUpfVxuICAgICAgICAgICAgICBlcnJvcj17ZXJyb3JzLnBhc3N3b3JkfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkF0IGxlYXN0IDYgY2hhcmFjdGVyc1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPFBhc3N3b3JkRmllbGRcbiAgICAgICAgICAgICAgbGFiZWw9XCJDb25maXJtIHBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jb25maXJtUGFzc3dvcmQgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHNldEZpZWxkKCdjb25maXJtUGFzc3dvcmQnLCB2YWx1ZSl9XG4gICAgICAgICAgICAgIGVycm9yPXtlcnJvcnMuY29uZmlybVBhc3N3b3JkfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlR5cGUgcGFzc3dvcmQgYWdhaW5cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+VXNlIENoYW5nZSBwYXNzd29yZCBmcm9tIHRoZSB0ZWFtIGxpc3QgdG8gcmVzZXQgbG9naW4uPC9zcGFuPlxuICAgICAgICApfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7cm9sZSA9PT0gJ3N0YWZmJyA/IChcbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+UGVybWlzc2lvbnM8L2g0PlxuICAgICAgICAgIDxwPk9ubHkgdXNlZCBmb3Igc3RhZmYuIFRvZ2dsZSB3aGF0IHRoaXMgcGVyc29uIGNhbiBvcGVuIGluIHRoZSBDTVMuPC9wPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktcGVybS1saXN0XCI+XG4gICAgICAgICAgICB7UEVSTUlTU0lPTlMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtpdGVtLmtleX0gY2xhc3NOYW1lPVwidG9rcmktcGVybS1yb3dcIj5cbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzdHJvbmc+e2l0ZW0ubGFiZWx9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8c3Bhbj57aXRlbS5oaW50fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgICAgICAgY29tcGFjdFxuICAgICAgICAgICAgICAgICAgY2hlY2tlZD17cGVybWlzc2lvbk9uKGl0ZW0ua2V5KX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoYHBlcm1pc3Npb25zLiR7aXRlbS5rZXl9YCwgbmV4dCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICB7aXNOZXcgPyAnQ3JlYXRlIHRlYW0gbWVtYmVyJyA6ICdTYXZlIHRlYW0gbWVtYmVyJ31cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZWFtRWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUXVlcnlQYXJhbXMsIHVzZVJlY29yZHMgfSBmcm9tICdhZG1pbmpzJ1xuY29uc3QgRk9MREVSUyA9IFsnYWxsJywgJ3Byb2R1Y3RzJywgJ2NhdGVnb3JpZXMnLCAncmV2aWV3cycsICdwYWdlcycsICdnZW5lcmFsJ11cblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuZnVuY3Rpb24gZm9ybWF0U2l6ZShieXRlcykge1xuICBjb25zdCBzaXplID0gTnVtYmVyKGJ5dGVzKSB8fCAwXG4gIGlmIChzaXplIDwgMTAyNCkgcmV0dXJuIGAke3NpemV9IEJgXG4gIGlmIChzaXplIDwgMTAyNCAqIDEwMjQpIHJldHVybiBgJHtNYXRoLnJvdW5kKHNpemUgLyAxMDI0KX0gS0JgXG4gIHJldHVybiBgJHsoc2l6ZSAvICgxMDI0ICogMTAyNCkpLnRvRml4ZWQoMSl9IE1CYFxufVxuXG5mdW5jdGlvbiBmb3JtYXRXaGVuKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gJydcbiAgcmV0dXJuIGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1JTicsIHsgZGF5OiAnbnVtZXJpYycsIG1vbnRoOiAnc2hvcnQnLCB5ZWFyOiAnbnVtZXJpYycgfSlcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVVybChwYXRoLCBhcHBVcmwpIHtcbiAgaWYgKCFwYXRoKSByZXR1cm4gJydcbiAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhdGgpKSByZXR1cm4gcGF0aFxuICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGF0aH1gXG59XG5cbmNvbnN0IE1lZGlhTGlicmFyeSA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlc291cmNlLCBzZXRUYWcgfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgc3RvcmVQYXJhbXMsIGZpbHRlcnMgfSA9IHVzZVF1ZXJ5UGFyYW1zKClcbiAgY29uc3QgeyByZWNvcmRzLCBsb2FkaW5nLCBmZXRjaERhdGEsIHRvdGFsLCBwZXJQYWdlIH0gPSB1c2VSZWNvcmRzKHJlc291cmNlLmlkKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFt1cGxvYWRpbmcsIHNldFVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2J1c3lJZCwgc2V0QnVzeUlkXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBmb2xkZXIgPSBTdHJpbmcoZmlsdGVycz8uZm9sZGVyIHx8ICdhbGwnKVxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG4gIGNvbnN0IGFwcFVybCA9IGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICBjb25zdCB1cGxvYWRGb2xkZXIgPSBmb2xkZXIgPT09ICdhbGwnID8gJ2dlbmVyYWwnIDogZm9sZGVyXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2V0VGFnKSBzZXRUYWcoU3RyaW5nKHRvdGFsIHx8IDApKVxuICB9LCBbdG90YWwsIHNldFRhZ10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoTnVtYmVyKHBlclBhZ2UpIDwgNTApIHN0b3JlUGFyYW1zKHsgcGVyUGFnZTogJzUwJyB9KVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW10pXG5cbiAgY29uc3QgaXRlbXMgPSB1c2VNZW1vKFxuICAgICgpID0+XG4gICAgICAocmVjb3JkcyB8fCBbXSkubWFwKChpdGVtKSA9PiAoe1xuICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgbmFtZTogaXRlbS5wYXJhbXM/Lm9yaWdpbmFsTmFtZSB8fCBpdGVtLnBhcmFtcz8uZmlsZW5hbWUgfHwgJ0ltYWdlJyxcbiAgICAgICAgZm9sZGVyOiBpdGVtLnBhcmFtcz8uZm9sZGVyIHx8ICdnZW5lcmFsJyxcbiAgICAgICAgcGF0aDogaXRlbS5wYXJhbXM/LnBhdGggfHwgJycsXG4gICAgICAgIHNpemU6IGl0ZW0ucGFyYW1zPy5zaXplLFxuICAgICAgICBjcmVhdGVkQXQ6IGl0ZW0ucGFyYW1zPy5jcmVhdGVkQXQsXG4gICAgICAgIHVybDogcmVzb2x2ZVVybChpdGVtLnBhcmFtcz8ucGF0aCwgYXBwVXJsKSxcbiAgICAgIH0pKSxcbiAgICBbYXBwVXJsLCByZWNvcmRzXSxcbiAgKVxuXG4gIGNvbnN0IHNldEZvbGRlciA9IChuZXh0KSA9PiB7XG4gICAgc3RvcmVQYXJhbXMoe1xuICAgICAgcGFnZTogJzEnLFxuICAgICAgZmlsdGVyczogbmV4dCA9PT0gJ2FsbCcgPyB7fSA6IHsgZm9sZGVyOiBuZXh0IH0sXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHVwbG9hZEZpbGVzID0gYXN5bmMgKGZpbGVzKSA9PiB7XG4gICAgY29uc3QgbGlzdCA9IFsuLi5maWxlc10uZmlsdGVyKChmaWxlKSA9PiBmaWxlLnR5cGUuc3RhcnRzV2l0aCgnaW1hZ2UvJykpXG4gICAgaWYgKCFsaXN0Lmxlbmd0aCkgcmV0dXJuXG4gICAgc2V0VXBsb2FkaW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBsaXN0KSB7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdmb2xkZXInLCB1cGxvYWRGb2xkZXIpXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vbWVkaWEvdXBsb2FkYCwge1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgICB9KVxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSB8fCBgQ291bGQgbm90IHVwbG9hZCAke2ZpbGUubmFtZX1gKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhZGROb3RpY2Uoe1xuICAgICAgICBtZXNzYWdlOiBsaXN0Lmxlbmd0aCA9PT0gMSA/ICdJbWFnZSB1cGxvYWRlZCcgOiBgJHtsaXN0Lmxlbmd0aH0gaW1hZ2VzIHVwbG9hZGVkYCxcbiAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgfSlcbiAgICAgIGZldGNoRGF0YSgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ1VwbG9hZCBmYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFVwbG9hZGluZyhmYWxzZSlcbiAgICAgIGlmIChmaWxlUmVmLmN1cnJlbnQpIGZpbGVSZWYuY3VycmVudC52YWx1ZSA9ICcnXG4gICAgfVxuICB9XG5cbiAgY29uc3QgY29weVBhdGggPSBhc3luYyAocGF0aCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChwYXRoKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0ZpbGUgcGF0aCBjb3BpZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICB9IGNhdGNoIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IHBhdGgsIHR5cGU6ICdpbmZvJyB9KVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlbW92ZSA9IGFzeW5jIChpZCwgbmFtZSkgPT4ge1xuICAgIGlmICghd2luZG93LmNvbmZpcm0oYERlbGV0ZSDigJwke25hbWV94oCdPyBUaGlzIGNhbm5vdCBiZSB1bmRvbmUuYCkpIHJldHVyblxuICAgIHNldEJ1c3lJZChpZClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS8ke2lkfWAsIHsgbWV0aG9kOiAnREVMRVRFJyB9KVxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKVxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5tZXNzYWdlIHx8ICdDb3VsZCBub3QgZGVsZXRlIGltYWdlJylcbiAgICAgIH1cbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGRhdGEubWVzc2FnZSB8fCAnSW1hZ2UgZGVsZXRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgZmV0Y2hEYXRhKClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IGRlbGV0ZSBpbWFnZScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeUlkKCcnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPk1lZGlhIGxpYnJhcnk8L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgVXBsb2FkIGltYWdlcyB1c2VkIG9uIHByb2R1Y3RzLCBjYXRlZ29yaWVzLCByZXZpZXdzLCBhbmQgdGhlIGhvbWVwYWdlLiBGaWxlcyBzdGF5IG9uIHRoaXMgc2VydmVyLlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlVwbG9hZDwvaDQ+XG4gICAgICAgIDxwPlxuICAgICAgICAgIEZpbGVzIGdvIGludG8gdGhlIDxzdHJvbmc+e3VwbG9hZEZvbGRlcn08L3N0cm9uZz4gZm9sZGVyXG4gICAgICAgICAge2ZvbGRlciA9PT0gJ2FsbCcgPyAnIChzZWxlY3QgYSBmb2xkZXIgYmVsb3cgdG8gY2hhbmdlIHRoaXMpLicgOiAnLid9XG4gICAgICAgIDwvcD5cbiAgICAgICAgPGxhYmVsXG4gICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktdXBsb2FkLWRyb3BcIlxuICAgICAgICAgIG9uRHJhZ092ZXI9eyhldmVudCkgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKX1cbiAgICAgICAgICBvbkRyb3A9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgdXBsb2FkRmlsZXMoZXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8c3Bhbj57dXBsb2FkaW5nID8gJ1VwbG9hZGluZ+KApicgOiAnQ2xpY2sgb3IgZHJvcCBpbWFnZXMgaGVyZSd9PC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgcmVmPXtmaWxlUmVmfVxuICAgICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgICAgYWNjZXB0PVwiaW1hZ2UvKlwiXG4gICAgICAgICAgICBtdWx0aXBsZVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3VwbG9hZGluZ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHVwbG9hZEZpbGVzKGV2ZW50LnRhcmdldC5maWxlcyl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkpQRywgUE5HLCBHSUYsIG9yIFdlYlAgdXAgdG8gNU1CIGVhY2g8L3NwYW4+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5MaWJyYXJ5PC9oND5cbiAgICAgICAgPHA+e3RvdGFsIHx8IDB9IGZpbGV7KHRvdGFsIHx8IDApID09PSAxID8gJycgOiAncyd9e2ZvbGRlciAhPT0gJ2FsbCcgPyBgIGluICR7Zm9sZGVyfWAgOiAnJ30uPC9wPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWZvbGRlci1jaGlwc1wiPlxuICAgICAgICAgIHtGT0xERVJTLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e2l0ZW19XG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1mb2xkZXItY2hpcCR7Zm9sZGVyID09PSBpdGVtID8gJyBpcy1vbicgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGb2xkZXIoaXRlbSl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpdGVtID09PSAnYWxsJyA/ICdBbGwgZm9sZGVycycgOiBpdGVtfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHtsb2FkaW5nID8gKFxuICAgICAgICAgIDxUZXh0IG10PVwieGxcIj5Mb2FkaW5nIGltYWdlc+KApjwvVGV4dD5cbiAgICAgICAgKSA6IGl0ZW1zLmxlbmd0aCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW1lZGlhLWdyaWRcIj5cbiAgICAgICAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgPGFydGljbGUga2V5PXtpdGVtLmlkfSBjbGFzc05hbWU9XCJ0b2tyaS1tZWRpYS1jYXJkXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tZWRpYS10aHVtYlwiPlxuICAgICAgICAgICAgICAgICAge2l0ZW0udXJsID8gPGltZyBzcmM9e2l0ZW0udXJsfSBhbHQ9e2l0ZW0ubmFtZX0gLz4gOiA8c3Bhbj5ObyBwcmV2aWV3PC9zcGFuPn1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nIHRpdGxlPXtpdGVtLm5hbWV9PntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICB7aXRlbS5mb2xkZXJ9IMK3IHtmb3JtYXRTaXplKGl0ZW0uc2l6ZSl9XG4gICAgICAgICAgICAgICAgICB7aXRlbS5jcmVhdGVkQXQgPyBgIMK3ICR7Zm9ybWF0V2hlbihpdGVtLmNyZWF0ZWRBdCl9YCA6ICcnfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW1lZGlhLWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b24gc2l6ZT1cInNtXCIgdmFyaWFudD1cInRleHRcIiBvbkNsaWNrPXsoKSA9PiBjb3B5UGF0aChpdGVtLnBhdGgpfT5cbiAgICAgICAgICAgICAgICAgICAgQ29weSBwYXRoXG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5SWQgPT09IGl0ZW0uaWR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHJlbW92ZShpdGVtLmlkLCBpdGVtLm5hbWUpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7YnVzeUlkID09PSBpdGVtLmlkID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICBEZWxldGVcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8VGV4dCBtdD1cInhsXCI+Tm8gaW1hZ2VzIGluIHRoaXMgZm9sZGVyIHlldC48L1RleHQ+XG4gICAgICAgICl9XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVkaWFMaWJyYXJ5XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgaXNGbGFnT24sIFN0YXR1c1N3aXRjaCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IFRheEVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wc1xuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cblxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCBpc1RheGFibGVCb29sID0gaXNGbGFnT24ocGFyYW1zLmlzVGF4YWJsZSlcblxuICBjb25zdCBoYW5kbGVUYXhhYmxlVG9nZ2xlID0gKHZhbHVlKSA9PiB7XG4gICAgc2V0RmllbGQoJ2lzVGF4YWJsZScsIHZhbHVlKVxuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHNldEZpZWxkKCdnc3RSYXRlJywgMClcbiAgICB9IGVsc2UgaWYgKE51bWJlcihwYXJhbXMuZ3N0UmF0ZSB8fCAwKSA9PT0gMCkge1xuICAgICAgc2V0RmllbGQoJ2dzdFJhdGUnLCA1KVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uU3VibWl0ID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQ/LnByZXZlbnREZWZhdWx0Py4oKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBoYW5kbGVTdWJtaXQoKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ1RheCBjb25maWd1cmF0aW9uIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5LicsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gdXBkYXRlIHRheCBjb25maWd1cmF0aW9uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17b25TdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZWFkXCI+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPEgzPntwYXJhbXMucHJvZHVjdE5hbWUgfHwgJ0VkaXQgUHJvZHVjdCBUYXgnfTwvSDM+XG4gICAgICAgICAgPFRleHQgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgIENvbmZpZ3VyZSBIU04gY29kZSBhbmQgR1NUIHBlcmNlbnRhZ2UgZm9yIHRoaXMgcHJvZHVjdC5cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5Qcm9kdWN0IGRldGFpbHM8L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUHJvZHVjdCBuYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5wcm9kdWN0TmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgZGlzYWJsZWRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgb3BhY2l0eTogMC43LCBjdXJzb3I6ICdub3QtYWxsb3dlZCcgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDYXRlZ29yeVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY2F0ZWdvcnlOYW1lIHx8ICdHZW5lcmFsJ31cbiAgICAgICAgICAgICAgZGlzYWJsZWRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgb3BhY2l0eTogMC43LCBjdXJzb3I6ICdub3QtYWxsb3dlZCcgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5UYXhhYmlsaXR5IHN0YXR1czwvaDQ+XG4gICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICBjaGVja2VkPXtpc1RheGFibGVCb29sfVxuICAgICAgICAgIHRpdGxlPVwiVGF4YWJsZVwiXG4gICAgICAgICAgaGludD17aXNUYXhhYmxlQm9vbCA/ICdHU1Qgd2lsbCBiZSBjaGFyZ2VkIGF0IGNoZWNrb3V0JyA6ICcwJSBHU1QgKGZyZXNoIGZydWl0cyAvIGV4ZW1wdCknfVxuICAgICAgICAgIG9uTGFiZWw9XCJZZXNcIlxuICAgICAgICAgIG9mZkxhYmVsPVwiTm9cIlxuICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVUYXhhYmxlVG9nZ2xlfVxuICAgICAgICAvPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+R1NUICYgSFNOIGRldGFpbHM8L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgSFNOIGNvZGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmhzbkNvZGUgfHwgJzA4MDgnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnaHNuQ29kZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiZS5nLiAwODAyIGZvciBkcnkgZnJ1aXRzLCAwODA4IGZvciBmcmVzaCBmcnVpdHNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEdTVCAlIHJhdGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgbWF4PVwiMTAwXCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5nc3RSYXRlID8/IChpc1RheGFibGVCb29sID8gNSA6IDApfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZ3N0UmF0ZScsIE51bWJlcihldmVudC50YXJnZXQudmFsdWUpIHx8IDApfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImUuZy4gNSBmb3IgZHJ5IGZydWl0c1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8VGV4dCBtdD1cInNtXCIgb3BhY2l0eT17MC43fSBmb250U2l6ZT1cIjEycHhcIj5cbiAgICAgICAgICB7aXNUYXhhYmxlQm9vbFxuICAgICAgICAgICAgPyBgQXQgY2hlY2tvdXQsIGludHJhLXN0YXRlIG9yZGVycyBzcGxpdCBpbnRvICR7KE51bWJlcihwYXJhbXMuZ3N0UmF0ZSB8fCA1KSAvIDIpLnRvRml4ZWQoMSl9JSBDR1NUICsgJHsoTnVtYmVyKHBhcmFtcy5nc3RSYXRlIHx8IDUpIC8gMikudG9GaXhlZCgxKX0lIFNHU1Q7IGludGVyLXN0YXRlIG9yZGVycyBjaGFyZ2UgJHtOdW1iZXIocGFyYW1zLmdzdFJhdGUgfHwgNSl9JSBJR1NULmBcbiAgICAgICAgICAgIDogJ1Byb2R1Y3QgaXMgZXhlbXB0L25vbi10YXhhYmxlICgwJSBHU1QpLid9XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIFNhdmUgdGF4IHNldHRpbmdzXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgVGF4RWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5cbmZ1bmN0aW9uIGNvcHlUZXh0KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgfHwgIW5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCkgcmV0dXJuIFByb21pc2UucmVqZWN0KClcbiAgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHZhbHVlKVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSYXpvcnBheVBheW1lbnRJZCh7IHJlY29yZCB9KSB7XG4gIGNvbnN0IHBheW1lbnRJZCA9IFN0cmluZyhyZWNvcmQ/LnBhcmFtcz8ucmF6b3JwYXlQYXltZW50SWQgfHwgJycpLnRyaW0oKVxuICBjb25zdCBwYWlkID0gcmVjb3JkPy5wYXJhbXM/LnBheW1lbnRTdGF0dXMgPT09ICdwYWlkJ1xuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgaWYgKCFwYWlkIHx8ICFwYXltZW50SWQpIHtcbiAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktcnpwLWVtcHR5XCI+4oCUPC9zcGFuPlxuICB9XG5cbiAgY29uc3QgaGFuZGxlQ29weSA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGNvcHlUZXh0KHBheW1lbnRJZClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgc2V0Q29waWVkKHRydWUpXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDEyMDApXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHt9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXJ6cC1jZWxsXCIgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX0+XG4gICAgICA8YVxuICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1yenAtaWRcIlxuICAgICAgICBocmVmPXtgaHR0cHM6Ly9kYXNoYm9hcmQucmF6b3JwYXkuY29tL2FwcC9wYXltZW50cy8ke2VuY29kZVVSSUNvbXBvbmVudChwYXltZW50SWQpfWB9XG4gICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICB0aXRsZT1cIk9wZW4gdGhpcyBwYXltZW50IGluIFJhem9ycGF5XCJcbiAgICAgID5cbiAgICAgICAge3BheW1lbnRJZH1cbiAgICAgIDwvYT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLXJ6cC1jb3B5XCIgb25DbGljaz17aGFuZGxlQ29weX0+XG4gICAgICAgIHtjb3BpZWQgPyAnQ29waWVkJyA6ICdDb3B5J31cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgQm94LFxuICBCdXR0b24sXG4gIEZvcm1Hcm91cCxcbiAgSDIsXG4gIElucHV0LFxuICBMYWJlbCxcbiAgTWVzc2FnZUJveCxcbiAgVGV4dCxcbn0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcydcblxuY29uc3QgUkVNRU1CRVJFRF9MT0dJTl9LRVkgPSAndG9rcmlfYWRtaW5fbG9naW4nXG5cbmNvbnN0IExvZ2luID0gKCkgPT4ge1xuICBjb25zdCB7IGFjdGlvbiwgZXJyb3JNZXNzYWdlIH0gPSB3aW5kb3cuX19BUFBfU1RBVEVfXyB8fCB7fVxuICBjb25zdCB7IHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKClcbiAgY29uc3QgYWRtaW5Sb290ID0gYWN0aW9uPy5yZXBsYWNlKC9cXC9sb2dpbiQvLCAnJykgfHwgJydcbiAgY29uc3QgZm9yZ290UGFzc3dvcmRVcmwgPSBgJHthZG1pblJvb3R9L2ZvcmdvdC1wYXNzd29yZGBcbiAgY29uc3QgW2lkZW50aWZpZXIsIHNldElkZW50aWZpZXJdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtyZW1lbWJlckxvZ2luLCBzZXRSZW1lbWJlckxvZ2luXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2hvd1Bhc3N3b3JkLCBzZXRTaG93UGFzc3dvcmRdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByZW1lbWJlcmVkTG9naW4gPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oUkVNRU1CRVJFRF9MT0dJTl9LRVkpXG4gICAgaWYgKHJlbWVtYmVyZWRMb2dpbikge1xuICAgICAgc2V0SWRlbnRpZmllcihyZW1lbWJlcmVkTG9naW4pXG4gICAgICBzZXRSZW1lbWJlckxvZ2luKHRydWUpXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBmb3JtID0gZXZlbnQuY3VycmVudFRhcmdldFxuICAgIGNvbnN0IGVtYWlsSW5wdXQgPSBmb3JtLmVsZW1lbnRzLm5hbWVkSXRlbSgnZW1haWwnKVxuICAgIGNvbnN0IHZhbHVlID1cbiAgICAgIChlbWFpbElucHV0ICYmICd2YWx1ZScgaW4gZW1haWxJbnB1dCA/IFN0cmluZyhlbWFpbElucHV0LnZhbHVlKSA6IGlkZW50aWZpZXIpLnRyaW0oKVxuXG4gICAgaWYgKGVtYWlsSW5wdXQgJiYgJ3ZhbHVlJyBpbiBlbWFpbElucHV0KSB7XG4gICAgICBlbWFpbElucHV0LnZhbHVlID0gdmFsdWVcbiAgICB9XG5cbiAgICBpZiAocmVtZW1iZXJMb2dpbiAmJiB2YWx1ZSkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFJFTUVNQkVSRURfTE9HSU5fS0VZLCB2YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFJFTUVNQkVSRURfTE9HSU5fS0VZKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgZmxleFxuICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiXG4gICAgICBtaW5IZWlnaHQ9XCIxMDB2aFwiXG4gICAgICBiZz1cImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMwMjJjMjIsICMwNDc4NTcpXCJcbiAgICAgIHA9XCJ4bFwiXG4gICAgPlxuICAgICAgPEJveFxuICAgICAgICBiZz1cIndoaXRlXCJcbiAgICAgICAgd2lkdGg9e1snMTAwJScsICc0NDBweCddfVxuICAgICAgICBib3JkZXJSYWRpdXM9XCIxOHB4XCJcbiAgICAgICAgYm94U2hhZG93PVwiMCAyNHB4IDcwcHggcmdiYSgyLCA0NCwgMzQsIDAuMzUpXCJcbiAgICAgICAgcD1cIngzXCJcbiAgICAgID5cbiAgICAgICAgPEgyIGNvbG9yPVwiIzAyMmMyMlwiIG1iPVwic21cIj5Ub2tyaWlpIENNUzwvSDI+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwiIzY0NzQ4YlwiIG1iPVwieGxcIj5cbiAgICAgICAgICBTaWduIGluIHdpdGggeW91ciBhZG1pbiBlbWFpbCBvciB1c2VybmFtZSB0byBtYW5hZ2UgcHJvZHVjdHMsIG9yZGVycywgYW5kIGNvbnRlbnQuXG4gICAgICAgIDwvVGV4dD5cblxuICAgICAgICB7ZXJyb3JNZXNzYWdlID8gKFxuICAgICAgICAgIDxNZXNzYWdlQm94XG4gICAgICAgICAgICBtYj1cImxnXCJcbiAgICAgICAgICAgIG1lc3NhZ2U9e2Vycm9yTWVzc2FnZS5zcGxpdCgnICcpLmxlbmd0aCA+IDEgPyBlcnJvck1lc3NhZ2UgOiB0cmFuc2xhdGVNZXNzYWdlKGVycm9yTWVzc2FnZSl9XG4gICAgICAgICAgICB2YXJpYW50PVwiZGFuZ2VyXCJcbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICA8Qm94IGFzPVwiZm9ybVwiIGFjdGlvbj17YWN0aW9ufSBtZXRob2Q9XCJQT1NUXCIgb25TdWJtaXQ9e2hhbmRsZVN1Ym1pdH0+XG4gICAgICAgICAgPEZvcm1Hcm91cD5cbiAgICAgICAgICAgIDxMYWJlbCByZXF1aXJlZD5FbWFpbCBvciB1c2VybmFtZTwvTGFiZWw+XG4gICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgbmFtZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciBlbWFpbCBvciB1c2VybmFtZVwiXG4gICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cInVzZXJuYW1lXCJcbiAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXtpZGVudGlmaWVyfVxuICAgICAgICAgICAgICBrZXk9e2lkZW50aWZpZXIgfHwgJ2xvZ2luLWVtYWlsJ31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9Gb3JtR3JvdXA+XG5cbiAgICAgICAgICA8Rm9ybUdyb3VwPlxuICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPlBhc3N3b3JkPC9MYWJlbD5cbiAgICAgICAgICAgIDxCb3ggcG9zaXRpb249XCJyZWxhdGl2ZVwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPXtzaG93UGFzc3dvcmQgPyAndGV4dCcgOiAncGFzc3dvcmQnfVxuICAgICAgICAgICAgICAgIG5hbWU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciBwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwiY3VycmVudC1wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZ1JpZ2h0OiA0MiB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17c2hvd1Bhc3N3b3JkID8gJ0hpZGUgcGFzc3dvcmQnIDogJ1Nob3cgcGFzc3dvcmQnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNob3dQYXNzd29yZCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgcmlnaHQ6IDgsXG4gICAgICAgICAgICAgICAgICB0b3A6ICc1MCUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgtNTAlKScsXG4gICAgICAgICAgICAgICAgICBib3JkZXI6IDAsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMDQ3ODU3JyxcbiAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1mbGV4JyxcbiAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgd2lkdGg6IDI2LFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyNixcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDAsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtzaG93UGFzc3dvcmQgPyAoXG4gICAgICAgICAgICAgICAgICA8c3ZnXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMjBcIlxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIyMFwiXG4gICAgICAgICAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPVwiMlwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTMgM2wxOCAxOFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTAuNiAxMC42QTIgMiAwIDAgMCAxMy40IDEzLjRcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTkuOSA0LjJBMTAuNyAxMC43IDAgMCAxIDEyIDRjNSAwIDkgNC41IDEwIDhhMTIuOCAxMi44IDAgMCAxLTIuMSAzLjZcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTYuNiA2LjZDNC4zIDggMi43IDEwLjIgMiAxMmMxIDMuNSA1IDggMTAgOCAxLjUgMCAyLjktLjQgNC4xLTFcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9XCIyMFwiXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjIwXCJcbiAgICAgICAgICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9XCIyXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMiAxMnM0LTcgMTAtNyAxMCA3IDEwIDctNCA3LTEwIDdTMiAxMiAyIDEyelwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiIC8+XG4gICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgIDwvRm9ybUdyb3VwPlxuXG4gICAgICAgICAgPEJveCBkaXNwbGF5PVwiZmxleFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBtYj1cImxnXCI+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJyZW1lbWJlci1sb2dpblwiXG4gICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgIGNoZWNrZWQ9e3JlbWVtYmVyTG9naW59XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFJlbWVtYmVyTG9naW4oZXZlbnQudGFyZ2V0LmNoZWNrZWQpfVxuICAgICAgICAgICAgICBzdHlsZT17eyBtYXJnaW5SaWdodDogOCB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwicmVtZW1iZXItbG9naW5cIiBzdHlsZT17eyBjb2xvcjogJyM0NzU1NjknLCBmb250U2l6ZTogMTQgfX0+XG4gICAgICAgICAgICAgIFJlbWVtYmVyIG15IGVtYWlsIG9yIHVzZXJuYW1lIG9uIHRoaXMgZGV2aWNlXG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAgPEJ1dHRvbiB0eXBlPVwic3VibWl0XCIgdmFyaWFudD1cImNvbnRhaW5lZFwiIHdpZHRoPVwiMTAwJVwiIG10PVwibGdcIj5cbiAgICAgICAgICAgIFNpZ24gaW5cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgPFRleHQgbXQ9XCJ4bFwiIHRleHRBbGlnbj1cImNlbnRlclwiPlxuICAgICAgICAgIDxhIGhyZWY9e2ZvcmdvdFBhc3N3b3JkVXJsfSBzdHlsZT17eyBjb2xvcjogJyMwNDc4NTcnLCBmb250V2VpZ2h0OiA3MDAgfX0+XG4gICAgICAgICAgICBGb3Jnb3QgcGFzc3dvcmQ/XG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb2dpblxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uR3JvdXAsIE1lc3NhZ2VCb3ggfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlRmlsdGVyRHJhd2VyLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnXG5cbmZ1bmN0aW9uIGFkbWluUm9vdFBhdGgoKSB7XG4gIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC9eKC4qKVxcL3Jlc291cmNlc1xcLy8pXG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcLyQvLCAnJylcbn1cblxuZnVuY3Rpb24gY2F0YWxvZ0NvbmZpZyhyZXNvdXJjZUlkKSB7XG4gIGlmIChyZXNvdXJjZUlkID09PSAnQ2F0ZWdvcnknKSB7XG4gICAgcmV0dXJuIHsgZXhwb3J0VXJsOiAnY2F0ZWdvcmllcy9leHBvcnQnLCBpbXBvcnRVcmw6ICdjYXRlZ29yaWVzL2ltcG9ydCcgfVxuICB9XG4gIGlmIChyZXNvdXJjZUlkID09PSAnUHJvZHVjdCcpIHtcbiAgICByZXR1cm4geyBleHBvcnRVcmw6ICdwcm9kdWN0cy9leHBvcnQnLCBpbXBvcnRVcmw6ICdwcm9kdWN0cy9pbXBvcnQnIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDYXRhbG9nTGlzdEhlYWRlckFjdGlvbnMoeyByZXNvdXJjZSwgb25JbXBvcnRlZCB9KSB7XG4gIGNvbnN0IHsgdHJhbnNsYXRlQnV0dG9uLCB0cmFuc2xhdGVBY3Rpb24gfSA9IHVzZVRyYW5zbGF0aW9uKClcbiAgY29uc3QgeyB0b2dnbGVGaWx0ZXIsIGZpbHRlcnNDb3VudCB9ID0gdXNlRmlsdGVyRHJhd2VyKClcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFttZXNzYWdlLCBzZXRNZXNzYWdlXSA9IHVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGZpbGVSZWYgPSB1c2VSZWYobnVsbClcblxuICBjb25zdCByZXNvdXJjZUlkID0gcmVzb3VyY2UuaWRcbiAgY29uc3QgY29uZmlnID0gY2F0YWxvZ0NvbmZpZyhyZXNvdXJjZUlkKVxuICBjb25zdCByb290ID0gYWRtaW5Sb290UGF0aCgpXG5cbiAgY29uc3QgaGFuZGxlSW1wb3J0ID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJydcbiAgICBpZiAoIWZpbGUgfHwgIWNvbmZpZykgcmV0dXJuXG5cbiAgICBzZXRMb2FkaW5nKHRydWUpXG4gICAgc2V0TWVzc2FnZShudWxsKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpXG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7cm9vdH0vY2F0YWxvZy8ke2NvbmZpZy5pbXBvcnRVcmx9YCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogZm9ybURhdGEsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLm1lc3NhZ2UgfHwgJ0ltcG9ydCBmYWlsZWQuJylcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXJyb3JDb3VudCA9IGRhdGEuZXJyb3JzPy5sZW5ndGggfHwgMFxuICAgICAgc2V0TWVzc2FnZSh7XG4gICAgICAgIHR5cGU6IGVycm9yQ291bnQgPyAnaW5mbycgOiAnc3VjY2VzcycsXG4gICAgICAgIHRleHQ6XG4gICAgICAgICAgZXJyb3JDb3VudCA+IDBcbiAgICAgICAgICAgID8gYEltcG9ydCBmaW5pc2hlZC4gJHtkYXRhLmNyZWF0ZWR9IGFkZGVkLCAke2RhdGEudXBkYXRlZH0gdXBkYXRlZC4gJHtlcnJvckNvdW50fSByb3cocykgY291bGQgbm90IGJlIGltcG9ydGVkLiBFeGlzdGluZyByb3dzIGFyZSBtYXRjaGVkIGJ5IHNsdWcuYFxuICAgICAgICAgICAgOiBgSW1wb3J0IGZpbmlzaGVkLiAke2RhdGEuY3JlYXRlZH0gYWRkZWQsICR7ZGF0YS51cGRhdGVkfSB1cGRhdGVkLiBFeGlzdGluZyByb3dzIGFyZSBtYXRjaGVkIGJ5IHNsdWcg4oCUIGtlZXAgc2x1ZyB0aGUgc2FtZSB0byB1cGRhdGUgcHJpY2UuYCxcbiAgICAgIH0pXG4gICAgICBvbkltcG9ydGVkPy4oKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2RhbmdlcicsIHRleHQ6IGVycm9yLm1lc3NhZ2UgfHwgJ0ltcG9ydCBmYWlsZWQuJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGJ1dHRvbnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIWNvbmZpZykgcmV0dXJuIFtdXG5cbiAgICBjb25zdCBpdGVtcyA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdFeHBvcnQgQ1NWJyxcbiAgICAgICAgdmFyaWFudDogJ3RleHQnLFxuICAgICAgICBocmVmOiBgJHtyb290fS9jYXRhbG9nLyR7Y29uZmlnLmV4cG9ydFVybH1gLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdFeHBvcnQgRXhjZWwnLFxuICAgICAgICB2YXJpYW50OiAndGV4dCcsXG4gICAgICAgIGhyZWY6IGAke3Jvb3R9L2NhdGFsb2cvJHtjb25maWcuZXhwb3J0VXJsfT9mb3JtYXQ9eGxzeGAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogbG9hZGluZyA/ICdJbXBvcnRpbmcuLi4nIDogJ0ltcG9ydCcsXG4gICAgICAgIHZhcmlhbnQ6ICd0ZXh0JyxcbiAgICAgICAgb25DbGljazogbG9hZGluZyA/IHVuZGVmaW5lZCA6ICgpID0+IGZpbGVSZWYuY3VycmVudD8uY2xpY2soKSxcbiAgICAgIH0sXG4gICAgXVxuXG4gICAgY29uc3QgbmV3QWN0aW9uID0gcmVzb3VyY2UucmVzb3VyY2VBY3Rpb25zPy5maW5kKChhY3Rpb24pID0+IGFjdGlvbi5uYW1lID09PSAnbmV3JylcbiAgICBpZiAobmV3QWN0aW9uKSB7XG4gICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgaWNvbjogbmV3QWN0aW9uLmljb24sXG4gICAgICAgIGxhYmVsOiB0cmFuc2xhdGVBY3Rpb24obmV3QWN0aW9uLmxhYmVsLCByZXNvdXJjZUlkKSxcbiAgICAgICAgdmFyaWFudDogbmV3QWN0aW9uLnZhcmlhbnQsXG4gICAgICAgIGhyZWY6IGAke3Jvb3R9L3Jlc291cmNlcy8ke3Jlc291cmNlSWR9L2FjdGlvbnMvbmV3YCxcbiAgICAgICAgJ2RhdGEtY3NzJzogYCR7cmVzb3VyY2VJZH0tbmV3LWJ1dHRvbmAsXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IGZpbHRlcktleSA9IGZpbHRlcnNDb3VudCA+IDAgPyAnZmlsdGVyQWN0aXZlJyA6ICdmaWx0ZXInXG4gICAgaXRlbXMucHVzaCh7XG4gICAgICBsYWJlbDogdHJhbnNsYXRlQnV0dG9uKGZpbHRlcktleSwgcmVzb3VyY2VJZCwgeyBjb3VudDogZmlsdGVyc0NvdW50IH0pLFxuICAgICAgb25DbGljazogdG9nZ2xlRmlsdGVyLFxuICAgICAgaWNvbjogJ0ZpbHRlcicsXG4gICAgICAnZGF0YS1jc3MnOiBgJHtyZXNvdXJjZUlkfS1maWx0ZXItYnV0dG9uYCxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGl0ZW1zXG4gIH0sIFtcbiAgICBjb25maWcsXG4gICAgcm9vdCxcbiAgICBsb2FkaW5nLFxuICAgIHJlc291cmNlLnJlc291cmNlQWN0aW9ucyxcbiAgICByZXNvdXJjZUlkLFxuICAgIHRyYW5zbGF0ZUFjdGlvbixcbiAgICB0cmFuc2xhdGVCdXR0b24sXG4gICAgZmlsdGVyc0NvdW50LFxuICAgIHRvZ2dsZUZpbHRlcixcbiAgXSlcblxuICBpZiAoIWNvbmZpZykgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8Qm94XG4gICAgICAgIG10PVwieGxcIlxuICAgICAgICBtYj1cImRlZmF1bHRcIlxuICAgICAgICBkaXNwbGF5PVwiZmxleFwiXG4gICAgICAgIGp1c3RpZnlDb250ZW50PVwiZmxleC1lbmRcIlxuICAgICAgICBmbGV4U2hyaW5rPXswfVxuICAgICAgICBweD17WydkZWZhdWx0JywgMF19XG4gICAgICAgIHN0eWxlPXt7IG1hcmdpblRvcDogJy01MnB4JyB9fVxuICAgICAgPlxuICAgICAgICA8QnV0dG9uR3JvdXAgYnV0dG9ucz17YnV0dG9uc30gLz5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgcmVmPXtmaWxlUmVmfVxuICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICBhY2NlcHQ9XCIuY3N2LC54bHN4LHRleHQvY3N2LGFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0XCJcbiAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX1cbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlSW1wb3J0fVxuICAgICAgICAvPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIHttZXNzYWdlICYmIChcbiAgICAgICAgPEJveCBtYj1cImRlZmF1bHRcIiBweD17WydkZWZhdWx0JywgMF19PlxuICAgICAgICAgIDxNZXNzYWdlQm94XG4gICAgICAgICAgICB2YXJpYW50PXttZXNzYWdlLnR5cGV9XG4gICAgICAgICAgICBtZXNzYWdlPXttZXNzYWdlLnRleHR9XG4gICAgICAgICAgICBvbkNsb3NlQ2xpY2s9eygpID0+IHNldE1lc3NhZ2UobnVsbCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuICAgIDwvPlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3ggfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgT3JpZ2luYWxBY3Rpb25IZWFkZXIgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IENhdGFsb2dMaXN0SGVhZGVyQWN0aW9ucyBmcm9tICcuL2NhdGFsb2ctbGlzdC1oZWFkZXItYWN0aW9ucy5qc3gnXG5cbmNvbnN0IENBVEFMT0dfUkVTT1VSQ0VTID0gbmV3IFNldChbJ1Byb2R1Y3QnLCAnQ2F0ZWdvcnknXSlcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQWN0aW9uSGVhZGVyKHByb3BzKSB7XG4gIGNvbnN0IHsgT3JpZ2luYWxDb21wb25lbnQsIGFjdGlvbiwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IEJhc2VIZWFkZXIgPSBPcmlnaW5hbENvbXBvbmVudCB8fCBPcmlnaW5hbEFjdGlvbkhlYWRlclxuICBjb25zdCBpc0NhdGFsb2dMaXN0ID0gYWN0aW9uPy5uYW1lID09PSAnbGlzdCcgJiYgQ0FUQUxPR19SRVNPVVJDRVMuaGFzKHJlc291cmNlPy5pZClcblxuICBpZiAoIWlzQ2F0YWxvZ0xpc3QpIHtcbiAgICByZXR1cm4gPEJhc2VIZWFkZXIgey4uLnByb3BzfSAvPlxuICB9XG5cbiAgY29uc3QgeyBPcmlnaW5hbENvbXBvbmVudDogX2lnbm9yZWQsIC4uLmhlYWRlclByb3BzIH0gPSBwcm9wc1xuXG4gIHJldHVybiAoXG4gICAgPEJveD5cbiAgICAgIDxCYXNlSGVhZGVyIHsuLi5oZWFkZXJQcm9wc30gb21pdEFjdGlvbnMgLz5cbiAgICAgIDxDYXRhbG9nTGlzdEhlYWRlckFjdGlvbnNcbiAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICBvbkltcG9ydGVkPXtwcm9wcy5hY3Rpb25QZXJmb3JtZWR9XG4gICAgICAvPlxuICAgIDwvQm94PlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QsIHsgbWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEZvcm1Hcm91cCwgRm9ybU1lc3NhZ2UsIExhYmVsLCBUaW55TUNFIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcblxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBwbHVnaW5zOiBbXG4gICAgJ2NvZGUnLFxuICAgICdsaW5rJyxcbiAgICAnbGlzdHMnLFxuICAgICdpbWFnZScsXG4gICAgJ3RhYmxlJyxcbiAgICAnYXV0b2xpbmsnLFxuICAgICdwcmV2aWV3JyxcbiAgICAnc2VhcmNocmVwbGFjZScsXG4gICAgJ3dvcmRjb3VudCcsXG4gICAgJ21lZGlhJyxcbiAgICAnY29kZXNhbXBsZScsXG4gIF0sXG4gIHRvb2xiYXI6XG4gICAgJ3VuZG8gcmVkbyB8IGJsb2NrcyB8IGJvbGQgaXRhbGljIHVuZGVybGluZSBzdHJpa2V0aHJvdWdoIHwgYWxpZ25sZWZ0IGFsaWduY2VudGVyIGFsaWducmlnaHQgYWxpZ25qdXN0aWZ5IHwgYnVsbGlzdCBudW1saXN0IG91dGRlbnQgaW5kZW50IHwgbGluayBpbWFnZSB0YWJsZSBjb2Rlc2FtcGxlIHwgY29kZSB8IHJlbW92ZWZvcm1hdCcsXG4gIGhlaWdodDogNDAwLFxufVxuXG5jb25zdCBSaWNodGV4dEVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyBwcm9wZXJ0eSwgcmVjb3JkLCBvbkNoYW5nZSB9ID0gcHJvcHNcbiAgY29uc3QgdmFsdWUgPSByZWNvcmQucGFyYW1zPy5bcHJvcGVydHkucGF0aF0gPz8gJydcbiAgY29uc3QgZXJyb3IgPSByZWNvcmQuZXJyb3JzPy5bcHJvcGVydHkucGF0aF1cblxuICBjb25zdCBoYW5kbGVVcGRhdGUgPSB1c2VDYWxsYmFjayhcbiAgICAobmV3VmFsdWUpID0+IHtcbiAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIG5ld1ZhbHVlKVxuICAgIH0sXG4gICAgW29uQ2hhbmdlLCBwcm9wZXJ0eS5wYXRoXSxcbiAgKVxuXG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgLi4uREVGQVVMVF9PUFRJT05TLFxuICAgIC4uLihwcm9wZXJ0eS5wcm9wcyB8fCB7fSksXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxGb3JtR3JvdXAgZXJyb3I9e0Jvb2xlYW4oZXJyb3IpfT5cbiAgICAgIDxMYWJlbCByZXF1aXJlZD17cHJvcGVydHkuaXNSZXF1aXJlZH0+e3Byb3BlcnR5LmxhYmVsfTwvTGFiZWw+XG4gICAgICA8VGlueU1DRSB2YWx1ZT17dmFsdWV9IG9uQ2hhbmdlPXtoYW5kbGVVcGRhdGV9IG9wdGlvbnM9e29wdGlvbnN9IC8+XG4gICAgICA8Rm9ybU1lc3NhZ2U+e2Vycm9yPy5tZXNzYWdlfTwvRm9ybU1lc3NhZ2U+XG4gICAgPC9Gb3JtR3JvdXA+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWVtbyhSaWNodGV4dEVkaXQpXG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBJY29uIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZUxvY2F0aW9uLCB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlcidcblxuZnVuY3Rpb24gYWRtaW5Sb290KHBhdGhuYW1lKSB7XG4gIGNvbnN0IGN1dCA9IHBhdGhuYW1lLnNlYXJjaCgvXFwvKHJlc291cmNlc3xwYWdlcykoXFwvfCQpLylcbiAgY29uc3Qgcm9vdCA9IGN1dCA9PT0gLTEgPyBwYXRobmFtZSA6IHBhdGhuYW1lLnNsaWNlKDAsIGN1dClcbiAgcmV0dXJuIHJvb3QucmVwbGFjZSgvXFwvJC8sICcnKSB8fCAnLydcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2lkZWJhclJlc291cmNlU2VjdGlvbihwcm9wcykge1xuICBjb25zdCBPcmlnaW5hbCA9IHByb3BzLk9yaWdpbmFsQ29tcG9uZW50XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKClcbiAgY29uc3QgaHJlZiA9IGFkbWluUm9vdChsb2NhdGlvbi5wYXRobmFtZSlcbiAgY29uc3Qgc2VsZWN0ZWQgPSBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC8kLywgJycpID09PSBocmVmLnJlcGxhY2UoL1xcLyQvLCAnJykgfHwgbG9jYXRpb24ucGF0aG5hbWUgPT09IGAke2hyZWZ9L2BcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8YVxuICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1zaWRlYmFyLWRhc2hib2FyZCR7c2VsZWN0ZWQgPyAnIGlzLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICBocmVmPXtocmVmfVxuICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgbmF2aWdhdGUoaHJlZilcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPEljb24gaWNvbj1cIkhvbWVcIiAvPlxuICAgICAgICA8c3Bhbj5EYXNoYm9hcmQ8L3NwYW4+XG4gICAgICA8L2E+XG4gICAgICB7T3JpZ2luYWwgPyA8T3JpZ2luYWwgcmVzb3VyY2VzPXtwcm9wcy5yZXNvdXJjZXN9IC8+IDogbnVsbH1cbiAgICA8Lz5cbiAgKVxufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgTG9hZGVyLCBUYWJsZSwgVGFibGVCb2R5IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7XG4gIE5vUmVjb3JkcyxcbiAgUmVjb3JkSW5MaXN0LFxuICBSZWNvcmRzVGFibGVIZWFkZXIsXG4gIFNlbGVjdGVkUmVjb3Jkcyxcbn0gZnJvbSAnYWRtaW5qcydcblxuY29uc3QgZ2V0UmVzb3VyY2VFbGVtZW50Q3NzID0gKHJlc291cmNlSWQsIHN1ZmZpeCkgPT4gYCR7cmVzb3VyY2VJZH0tJHtzdWZmaXh9YFxuXG4vKipcbiAqIEFkbWluSlMgbWFya3MgdGhlIGhlYWRlciBjaGVja2JveCBjaGVja2VkIHdoZW4gQU5ZIHJvdyBpcyBzZWxlY3RlZC5cbiAqIE92ZXJyaWRlIHNvOiBub25lID0gdW5jaGVja2VkLCBzb21lID0gaW5kZXRlcm1pbmF0ZSwgYWxsID0gY2hlY2tlZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUmVjb3Jkc1RhYmxlKHByb3BzKSB7XG4gIGNvbnN0IHtcbiAgICByZXNvdXJjZSxcbiAgICByZWNvcmRzLFxuICAgIGFjdGlvblBlcmZvcm1lZCxcbiAgICBzb3J0QnksXG4gICAgZGlyZWN0aW9uLFxuICAgIGlzTG9hZGluZyxcbiAgICBvblNlbGVjdCxcbiAgICBzZWxlY3RlZFJlY29yZHMsXG4gICAgb25TZWxlY3RBbGwsXG4gIH0gPSBwcm9wc1xuXG4gIGlmICghcmVjb3Jkcy5sZW5ndGgpIHtcbiAgICBpZiAoaXNMb2FkaW5nKSByZXR1cm4gPExvYWRlciAvPlxuICAgIHJldHVybiA8Tm9SZWNvcmRzIHJlc291cmNlPXtyZXNvdXJjZX0gLz5cbiAgfVxuXG4gIGNvbnN0IHNlbGVjdGVkQ291bnQgPSBzZWxlY3RlZFJlY29yZHNcbiAgICA/IHJlY29yZHMuZmlsdGVyKChyZWNvcmQpID0+IHNlbGVjdGVkUmVjb3Jkcy5zb21lKChzZWxlY3RlZCkgPT4gc2VsZWN0ZWQuaWQgPT09IHJlY29yZC5pZCkpLmxlbmd0aFxuICAgIDogMFxuICBjb25zdCBzZWxlY3RlZEFsbCA9IHNlbGVjdGVkQ291bnQgPiAwICYmIHNlbGVjdGVkQ291bnQgPT09IHJlY29yZHMubGVuZ3RoXG4gIGNvbnN0IGluZGV0ZXJtaW5hdGUgPSBzZWxlY3RlZENvdW50ID4gMCAmJiBzZWxlY3RlZENvdW50IDwgcmVjb3Jkcy5sZW5ndGhcbiAgY29uc3QgcmVjb3Jkc0hhdmVCdWxrQWN0aW9uID0gISFyZWNvcmRzLmZpbmQoKHJlY29yZCkgPT4gcmVjb3JkLmJ1bGtBY3Rpb25zLmxlbmd0aClcblxuICBjb25zdCBjb250ZW50VGFnID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHJlc291cmNlLmlkLCAndGFibGUnKVxuICBjb25zdCBzZWxlY3RlZFRhZyA9IGdldFJlc291cmNlRWxlbWVudENzcyhyZXNvdXJjZS5pZCwgJ3RhYmxlLXNlbGVjdGVkLXJlY29yZHMnKVxuICBjb25zdCBib2R5VGFnID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHJlc291cmNlLmlkLCAndGFibGUtYm9keScpXG5cbiAgcmV0dXJuIChcbiAgICA8VGFibGUgZGF0YS1jc3M9e2NvbnRlbnRUYWd9PlxuICAgICAgPFNlbGVjdGVkUmVjb3Jkc1xuICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgIHNlbGVjdGVkUmVjb3Jkcz17c2VsZWN0ZWRSZWNvcmRzfVxuICAgICAgICBkYXRhLWNzcz17c2VsZWN0ZWRUYWd9XG4gICAgICAvPlxuICAgICAgPFJlY29yZHNUYWJsZUhlYWRlclxuICAgICAgICBwcm9wZXJ0aWVzPXtyZXNvdXJjZS5saXN0UHJvcGVydGllc31cbiAgICAgICAgdGl0bGVQcm9wZXJ0eT17cmVzb3VyY2UudGl0bGVQcm9wZXJ0eX1cbiAgICAgICAgZGlyZWN0aW9uPXtkaXJlY3Rpb259XG4gICAgICAgIHNvcnRCeT17c29ydEJ5fVxuICAgICAgICBvblNlbGVjdEFsbD17cmVjb3Jkc0hhdmVCdWxrQWN0aW9uID8gb25TZWxlY3RBbGwgOiB1bmRlZmluZWR9XG4gICAgICAgIHNlbGVjdGVkQWxsPXtzZWxlY3RlZEFsbH1cbiAgICAgICAgaW5kZXRlcm1pbmF0ZT17aW5kZXRlcm1pbmF0ZX1cbiAgICAgIC8+XG4gICAgICA8VGFibGVCb2R5IGRhdGEtY3NzPXtib2R5VGFnfT5cbiAgICAgICAge3JlY29yZHMubWFwKChyZWNvcmQpID0+IChcbiAgICAgICAgICA8UmVjb3JkSW5MaXN0XG4gICAgICAgICAgICByZWNvcmQ9e3JlY29yZH1cbiAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgIGtleT17cmVjb3JkLmlkfVxuICAgICAgICAgICAgYWN0aW9uUGVyZm9ybWVkPXthY3Rpb25QZXJmb3JtZWR9XG4gICAgICAgICAgICBpc0xvYWRpbmc9e2lzTG9hZGluZ31cbiAgICAgICAgICAgIG9uU2VsZWN0PXtvblNlbGVjdH1cbiAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e1xuICAgICAgICAgICAgICBzZWxlY3RlZFJlY29yZHMgJiYgISFzZWxlY3RlZFJlY29yZHMuZmluZCgoc2VsZWN0ZWQpID0+IHNlbGVjdGVkLmlkID09PSByZWNvcmQuaWQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L1RhYmxlQm9keT5cbiAgICA8L1RhYmxlPlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFRhYmxlQ2VsbCwgVGFibGVIZWFkLCBUYWJsZVJvdyB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBQcm9wZXJ0eUhlYWRlciB9IGZyb20gJ2FkbWluanMnXG5cbmNvbnN0IGdldFJlc291cmNlRWxlbWVudENzcyA9IChyZXNvdXJjZUlkLCBzdWZmaXgpID0+IGAke3Jlc291cmNlSWR9LSR7c3VmZml4fWBcblxuY29uc3QgZGlzcGxheSA9IChpc1RpdGxlKSA9PiBbXG4gIGlzVGl0bGUgPyAndGFibGUtY2VsbCcgOiAnbm9uZScsXG4gIGlzVGl0bGUgPyAndGFibGUtY2VsbCcgOiAnbm9uZScsXG4gICd0YWJsZS1jZWxsJyxcbiAgJ3RhYmxlLWNlbGwnLFxuXVxuXG5mdW5jdGlvbiBTZWxlY3RBbGxDaGVja0JveCh7IGNoZWNrZWQsIGluZGV0ZXJtaW5hdGUsIG9uQ2hhbmdlIH0pIHtcbiAgY29uc3QgaW5wdXRSZWYgPSB1c2VSZWYobnVsbClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpbnB1dFJlZi5jdXJyZW50KSB7XG4gICAgICBpbnB1dFJlZi5jdXJyZW50LmluZGV0ZXJtaW5hdGUgPSBCb29sZWFuKGluZGV0ZXJtaW5hdGUpXG4gICAgfVxuICB9LCBbaW5kZXRlcm1pbmF0ZSwgY2hlY2tlZF0pXG5cbiAgcmV0dXJuIChcbiAgICA8bGFiZWxcbiAgICAgIGNsYXNzTmFtZT17YHRva3JpLXNlbGVjdC1hbGwke2luZGV0ZXJtaW5hdGUgPyAnIGlzLWluZGV0ZXJtaW5hdGUnIDogJyd9JHtjaGVja2VkID8gJyBpcy1jaGVja2VkJyA6ICcnfWB9XG4gICAgICBzdHlsZT17eyBtYXJnaW5MZWZ0OiA1IH19XG4gICAgPlxuICAgICAgPGlucHV0XG4gICAgICAgIHJlZj17aW5wdXRSZWZ9XG4gICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgIGNoZWNrZWQ9e0Jvb2xlYW4oY2hlY2tlZCl9XG4gICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZX1cbiAgICAgICAgYXJpYS1jaGVja2VkPXtpbmRldGVybWluYXRlID8gJ21peGVkJyA6IGNoZWNrZWQgPyAndHJ1ZScgOiAnZmFsc2UnfVxuICAgICAgLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXNlbGVjdC1hbGwtYm94XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgIHtpbmRldGVybWluYXRlID8gKFxuICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIGNsYXNzTmFtZT1cInRva3JpLXNlbGVjdC1hbGwtaWNvblwiPlxuICAgICAgICAgICAgPGxpbmUgeDE9XCI2XCIgeTE9XCIxMlwiIHgyPVwiMThcIiB5Mj1cIjEyXCIgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgKSA6IGNoZWNrZWQgPyAoXG4gICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgY2xhc3NOYW1lPVwidG9rcmktc2VsZWN0LWFsbC1pY29uXCI+XG4gICAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPVwiMjAgNiA5IDE3IDQgMTJcIiAvPlxuICAgICAgICAgIDwvc3ZnPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlY29yZHNUYWJsZUhlYWRlcihwcm9wcykge1xuICBjb25zdCB7XG4gICAgdGl0bGVQcm9wZXJ0eSxcbiAgICBwcm9wZXJ0aWVzLFxuICAgIHNvcnRCeSxcbiAgICBkaXJlY3Rpb24sXG4gICAgb25TZWxlY3RBbGwsXG4gICAgc2VsZWN0ZWRBbGwsXG4gICAgaW5kZXRlcm1pbmF0ZSxcbiAgfSA9IHByb3BzXG5cbiAgY29uc3QgY29udGVudFRhZyA9IGdldFJlc291cmNlRWxlbWVudENzcyh0aXRsZVByb3BlcnR5LnJlc291cmNlSWQsICd0YWJsZS1oZWFkJylcbiAgY29uc3Qgcm93VGFnID0gYCR7dGl0bGVQcm9wZXJ0eS5yZXNvdXJjZUlkfS10YWJsZS1oZWFkLXJvd2BcbiAgY29uc3QgY2hlY2tib3hDc3MgPSBgJHt0aXRsZVByb3BlcnR5LnJlc291cmNlSWR9LWNoZWNrYm94LXRhYmxlLWNlbGxgXG5cbiAgcmV0dXJuIChcbiAgICA8VGFibGVIZWFkIGRhdGEtY3NzPXtjb250ZW50VGFnfT5cbiAgICAgIDxUYWJsZVJvdyBkYXRhLWNzcz17cm93VGFnfT5cbiAgICAgICAgPFRhYmxlQ2VsbCBkYXRhLWNzcz17Y2hlY2tib3hDc3N9PlxuICAgICAgICAgIHtvblNlbGVjdEFsbCA/IChcbiAgICAgICAgICAgIDxTZWxlY3RBbGxDaGVja0JveFxuICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gb25TZWxlY3RBbGwoKX1cbiAgICAgICAgICAgICAgY2hlY2tlZD17Qm9vbGVhbihzZWxlY3RlZEFsbCl9XG4gICAgICAgICAgICAgIGluZGV0ZXJtaW5hdGU9e0Jvb2xlYW4oaW5kZXRlcm1pbmF0ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L1RhYmxlQ2VsbD5cbiAgICAgICAge3Byb3BlcnRpZXMubWFwKChwcm9wZXJ0eSkgPT4gKFxuICAgICAgICAgIDxQcm9wZXJ0eUhlYWRlclxuICAgICAgICAgICAgZGlzcGxheT17ZGlzcGxheShwcm9wZXJ0eS5pc1RpdGxlKX1cbiAgICAgICAgICAgIGtleT17cHJvcGVydHkucHJvcGVydHlQYXRofVxuICAgICAgICAgICAgdGl0bGVQcm9wZXJ0eT17dGl0bGVQcm9wZXJ0eX1cbiAgICAgICAgICAgIHByb3BlcnR5PXtwcm9wZXJ0eX1cbiAgICAgICAgICAgIHNvcnRCeT17c29ydEJ5fVxuICAgICAgICAgICAgZGlyZWN0aW9uPXtkaXJlY3Rpb259XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICAgIDxUYWJsZUNlbGwga2V5PVwiYWN0aW9uc1wiIHN0eWxlPXt7IHdpZHRoOiA4MCB9fSAvPlxuICAgICAgPC9UYWJsZVJvdz5cbiAgICA8L1RhYmxlSGVhZD5cbiAgKVxufVxuIiwiQWRtaW5KUy5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgUHJvZHVjdEVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcHJvZHVjdC1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0RWRpdCA9IFByb2R1Y3RFZGl0XG5pbXBvcnQgQ2F0ZWdvcnlFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2NhdGVnb3J5LWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkNhdGVnb3J5RWRpdCA9IENhdGVnb3J5RWRpdFxuaW1wb3J0IENtc0xpc3QgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY21zLWxpc3QnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkNtc0xpc3QgPSBDbXNMaXN0XG5pbXBvcnQgUmV2aWV3RWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZXZpZXctZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUmV2aWV3RWRpdCA9IFJldmlld0VkaXRcbmltcG9ydCBCbG9nRWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9ibG9nLWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkJsb2dFZGl0ID0gQmxvZ0VkaXRcbmltcG9ydCBTZXR0aW5nc0VkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvc2V0dGluZ3MtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2V0dGluZ3NFZGl0ID0gU2V0dGluZ3NFZGl0XG5pbXBvcnQgQXBwUmVsZWFzZUVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvYXBwLXJlbGVhc2UtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQXBwUmVsZWFzZUVkaXQgPSBBcHBSZWxlYXNlRWRpdFxuaW1wb3J0IENvdXBvbkVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY291cG9uLWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkNvdXBvbkVkaXQgPSBDb3Vwb25FZGl0XG5pbXBvcnQgT3JkZXJEZXRhaWwgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvb3JkZXItZGV0YWlsJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlckRldGFpbCA9IE9yZGVyRGV0YWlsXG5pbXBvcnQgQ2hhbmdlUGFzc3dvcmQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY2hhbmdlLXBhc3N3b3JkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5DaGFuZ2VQYXNzd29yZCA9IENoYW5nZVBhc3N3b3JkXG5pbXBvcnQgUGFydG5lckVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcGFydG5lci1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5QYXJ0bmVyRWRpdCA9IFBhcnRuZXJFZGl0XG5pbXBvcnQgUGluY29kZUVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcGluY29kZS1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5QaW5jb2RlRWRpdCA9IFBpbmNvZGVFZGl0XG5pbXBvcnQgU3RhdHVzVG9nZ2xlIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3N0YXR1cy10b2dnbGUnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlN0YXR1c1RvZ2dsZSA9IFN0YXR1c1RvZ2dsZVxuaW1wb3J0IEN1c3RvbWVyRWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jdXN0b21lci1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5DdXN0b21lckVkaXQgPSBDdXN0b21lckVkaXRcbmltcG9ydCBUZWFtRWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy90ZWFtLWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlRlYW1FZGl0ID0gVGVhbUVkaXRcbmltcG9ydCBNZWRpYUxpYnJhcnkgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvbWVkaWEtbGlicmFyeSdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTWVkaWFMaWJyYXJ5ID0gTWVkaWFMaWJyYXJ5XG5pbXBvcnQgVGF4RWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy90YXgtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuVGF4RWRpdCA9IFRheEVkaXRcbmltcG9ydCBSYXpvcnBheVBheW1lbnRJZCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yYXpvcnBheS1wYXltZW50LWlkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5SYXpvcnBheVBheW1lbnRJZCA9IFJhem9ycGF5UGF5bWVudElkXG5pbXBvcnQgT3JkZXJMaXN0QmFkZ2UgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvb3JkZXItbGlzdC1iYWRnZXMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk9yZGVyTGlzdEJhZGdlID0gT3JkZXJMaXN0QmFkZ2VcbmltcG9ydCBMb2dpbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9sb2dpbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTG9naW4gPSBMb2dpblxuaW1wb3J0IEFjdGlvbkhlYWRlciBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9hY3Rpb24taGVhZGVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5BY3Rpb25IZWFkZXIgPSBBY3Rpb25IZWFkZXJcbmltcG9ydCBEZWZhdWx0UmljaHRleHRFZGl0UHJvcGVydHkgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmljaHRleHQtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGVmYXVsdFJpY2h0ZXh0RWRpdFByb3BlcnR5ID0gRGVmYXVsdFJpY2h0ZXh0RWRpdFByb3BlcnR5XG5pbXBvcnQgU2lkZWJhclJlc291cmNlU2VjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9zaWRlYmFyLWRhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2lkZWJhclJlc291cmNlU2VjdGlvbiA9IFNpZGViYXJSZXNvdXJjZVNlY3Rpb25cbmltcG9ydCBSZWNvcmRzVGFibGUgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmVjb3Jkcy10YWJsZSdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUmVjb3Jkc1RhYmxlID0gUmVjb3Jkc1RhYmxlXG5pbXBvcnQgUmVjb3Jkc1RhYmxlSGVhZGVyIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JlY29yZHMtdGFibGUtaGVhZGVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5SZWNvcmRzVGFibGVIZWFkZXIgPSBSZWNvcmRzVGFibGVIZWFkZXIiXSwibmFtZXMiOlsidXNlQW5jaG9yZWRNZW51Iiwib3BlbiIsIndyYXBSZWYiLCJ1c2VSZWYiLCJvcGVuVXAiLCJzZXRPcGVuVXAiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVuZGVmaW5lZCIsInVwZGF0ZSIsIm5vZGUiLCJjdXJyZW50IiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInNwYWNlQmVsb3ciLCJ3aW5kb3ciLCJpbm5lckhlaWdodCIsImJvdHRvbSIsInRvcCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiU2VhcmNoYWJsZU11bHRpU2VsZWN0Iiwib3B0aW9ucyIsInNlbGVjdGVkIiwib25DaGFuZ2UiLCJwbGFjZWhvbGRlciIsInNlYXJjaFBsYWNlaG9sZGVyIiwic2V0T3BlbiIsInF1ZXJ5Iiwic2V0UXVlcnkiLCJvbkRvY0NsaWNrIiwiZXZlbnQiLCJjb250YWlucyIsInRhcmdldCIsImRvY3VtZW50Iiwic2VsZWN0ZWRTZXQiLCJ1c2VNZW1vIiwiU2V0Iiwic2VsZWN0ZWRPcHRpb25zIiwiZmlsdGVyIiwiaXRlbSIsImhhcyIsInZhbHVlIiwiZmlsdGVyZWQiLCJsYWJlbCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJ0cmltIiwidG9nZ2xlIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwicmVmIiwidHlwZSIsIm9uQ2xpY2siLCJsZW5ndGgiLCJtYXAiLCJrZXkiLCJyb2xlIiwidGFiSW5kZXgiLCJzdG9wUHJvcGFnYXRpb24iLCJhdXRvRm9jdXMiLCJjaGVja2VkIiwiRmxhZ0NhcmQiLCJ0aXRsZSIsImhpbnQiLCJpc0ZsYWdPbiIsIlN0YXR1c1N3aXRjaCIsImRpc2FibGVkIiwiY29tcGFjdCIsIm9uTGFiZWwiLCJvZmZMYWJlbCIsInByZXZlbnREZWZhdWx0IiwiU2VhcmNoYWJsZVNlbGVjdCIsImp1c3RQaWNrZWQiLCJmaW5kIiwiYWN0aXZlIiwib25Nb3VzZURvd24iLCJzZXRUaW1lb3V0IiwiTG9jYWxTZWxlY3QiLCJTdHJpbmciLCJhcGkiLCJBcGlDbGllbnQiLCJSQU5HRVMiLCJXSURHRVRTIiwiaW5yIiwiTnVtYmVyIiwidG9Mb2NhbGVTdHJpbmciLCJtYXhpbXVtRnJhY3Rpb25EaWdpdHMiLCJSYW5nZVNlbGVjdCIsImF4aXNNYXgiLCJwYWRkZWQiLCJtYWduaXR1ZGUiLCJNYXRoIiwiZmxvb3IiLCJsb2cxMCIsIm5vcm1hbGl6ZWQiLCJuaWNlIiwiTGluZUNoYXJ0Iiwic2VyaWVzIiwiaG92ZXIiLCJzZXRIb3ZlciIsIndpZHRoIiwiaGVpZ2h0IiwicGFkTGVmdCIsInBhZFJpZ2h0IiwicGFkVG9wIiwicGFkQm90dG9tIiwibWF4IiwicG9pbnQiLCJvcmRlclZhbHVlIiwicGxvdFdpZHRoIiwicGxvdEhlaWdodCIsImJhc2VsaW5lIiwieUZvciIsInN0ZXAiLCJjb29yZHMiLCJpbmRleCIsIngiLCJ5IiwibGluZSIsImpvaW4iLCJhcmVhIiwibGFiZWxFdmVyeSIsImNlaWwiLCJ0aWNrcyIsInJhdGlvIiwicm91bmQiLCJvbk1vdXNlTGVhdmUiLCJ2aWV3Qm94IiwidGljayIsIngxIiwieDIiLCJ5MSIsInkyIiwidGV4dEFuY2hvciIsImQiLCJmaWxsIiwib3BhY2l0eSIsInN0cm9rZSIsInN0cm9rZVdpZHRoIiwic3Ryb2tlTGluZWpvaW4iLCJzdHJva2VMaW5lY2FwIiwiZGF0ZSIsImN4IiwiY3kiLCJyIiwib25Nb3VzZUVudGVyIiwicG9pbnRlckV2ZW50cyIsInN0eWxlIiwibGVmdCIsIlBhZ2VyIiwicGFnZSIsInBhZ2VTaXplIiwidG90YWwiLCJwYWdlcyIsIm51bWJlcnMiLCJudW1iZXIiLCJwdXNoIiwiRGFzaGJvYXJkIiwicmVxdWVzdHMiLCJyYW5nZXMiLCJzZXRSYW5nZXMiLCJvcmRlcnMiLCJjdXN0b21lcnMiLCJwcm9kdWN0cyIsImRhdGEiLCJzZXREYXRhIiwic2V0UGFnZXMiLCJidXN5Iiwic2V0QnVzeSIsImxvYWRXaWRnZXQiLCJ3aWRnZXQiLCJyYW5nZSIsInRpY2tldCIsImdldERhc2hib2FyZCIsInBhcmFtcyIsInRoZW4iLCJyZXNwb25zZSIsImZpbmFsbHkiLCJmb3JFYWNoIiwiY2hhbmdlUmFuZ2UiLCJjaGFuZ2VQYWdlIiwiQm94IiwidmFyaWFudCIsIkgyIiwibWIiLCJINSIsIlRleHQiLCJvcmRlckNvdW50Iiwicm93cyIsInJvdyIsImlkIiwib3JkZXJObyIsIm5hbWUiLCJhbW91bnQiLCJwbGFjZWRBdCIsInBob25lIiwiZGF0ZU9mQmlydGgiLCJyZWdpc3RlcmVkQXQiLCJub3JtYWxpemVTbHVnSW5wdXQiLCJyZXBsYWNlIiwid2l0aG91dFRyYWlsaW5nU2xhc2giLCJQUk9EVUNUX0RFVEFJTFNfSFRNTCIsInBhcnNlU2x1Z3MiLCJyYXciLCJBcnJheSIsImlzQXJyYXkiLCJCb29sZWFuIiwicGFyc2VkIiwiSlNPTiIsInBhcnNlIiwic3BsaXQiLCJQcm9kdWN0RWRpdCIsInByb3BzIiwicmVjb3JkIiwiaW5pdGlhbFJlY29yZCIsInJlc291cmNlIiwiaGFuZGxlQ2hhbmdlIiwic3VibWl0IiwiaGFuZGxlU3VibWl0IiwibG9hZGluZyIsInVzZVJlY29yZCIsImFkZE5vdGljZSIsInVzZU5vdGljZSIsImZpbGVSZWYiLCJ1cGxvYWRpbmciLCJzZXRVcGxvYWRpbmciLCJzbHVnRWRpdGVkIiwic2V0U2x1Z0VkaXRlZCIsInNsdWciLCJwcmV2aWV3VXJsIiwic2V0UHJldmlld1VybCIsImNhdGVnb3JpZXMiLCJzZXRDYXRlZ29yaWVzIiwiY3VzdG9tIiwiYXBpQmFzZVVybCIsInByb2R1Y3RVcmxCYXNlIiwibG9jYXRpb24iLCJvcmlnaW4iLCJzbHVnSW5wdXQiLCJwcmV2aWV3U2x1ZyIsInByb2R1Y3RVcmwiLCJzZWxlY3RlZENhdGVnb3J5U2x1Z3MiLCJjYXRlZ29yeUlkcyIsImlzQWN0aXZlIiwiaW1hZ2VVcmwiLCJpbWFnZSIsInRlc3QiLCJhcHBVcmwiLCJkaXNwbGF5ZWRJbWFnZVVybCIsInN0YXJ0c1dpdGgiLCJVUkwiLCJyZXZva2VPYmplY3RVUkwiLCJpZ25vcmUiLCJmZXRjaCIsImpzb24iLCJjYXRjaCIsInNldEZpZWxkIiwib25Qcm9wZXJ0eUNoYW5nZSIsInByb3BlcnR5UGF0aCIsInJlc3QiLCJzZXRTZWxlY3RlZENhdGVnb3JpZXMiLCJzbHVncyIsInN0cmluZ2lmeSIsInVwbG9hZEltYWdlIiwiZmlsZSIsImZpbGVzIiwiZm9ybURhdGEiLCJGb3JtRGF0YSIsImFwcGVuZCIsImxvY2FsUHJldmlld1VybCIsImNyZWF0ZU9iamVjdFVSTCIsIm1ldGhvZCIsImJvZHkiLCJvayIsImVycm9yIiwiRXJyb3IiLCJtZXNzYWdlIiwibWVkaWEiLCJwYXRoIiwibm90aWNlIiwiZGVzY3JpcHRpb25Qcm9wZXJ0eSIsImVkaXRQcm9wZXJ0aWVzIiwicHJvcGVydHkiLCJhcyIsIm9uU3VibWl0IiwiSDMiLCJjb2xvciIsInJlcXVpcmVkIiwibXQiLCJocmVmIiwicmVsIiwibWluIiwicHJpY2VWYWx1ZSIsIm9sZFByaWNlVmFsdWUiLCJ3ZWlnaHQiLCJiYWRnZSIsInN0b2NrIiwic29ydE9yZGVyIiwibWFyZ2luQm90dG9tIiwiaXNUYXhhYmxlIiwibmV4dCIsImdzdFJhdGUiLCJoc25Db2RlIiwic3JjIiwiYWx0IiwiYWNjZXB0IiwiaXNCZXN0U2VsbGVyIiwiaXNJbXBvcnRlZCIsImlzRmVhdHVyZWQiLCJCdXR0b24iLCJtaW5IZWlnaHQiLCJCYXNlUHJvcGVydHlDb21wb25lbnQiLCJ3aGVyZSIsIkljb24iLCJpY29uIiwic3BpbiIsIkNhdGVnb3J5RWRpdCIsImJhbm5lckZpbGVSZWYiLCJiYW5uZXJVcGxvYWRpbmciLCJzZXRCYW5uZXJVcGxvYWRpbmciLCJiYW5uZXJQcmV2aWV3VXJsIiwic2V0QmFubmVyUHJldmlld1VybCIsImNhdGVnb3J5VXJsQmFzZSIsImNhdGVnb3J5VXJsIiwiYmFubmVySW1hZ2VVcmwiLCJiYW5uZXJJbWFnZSIsImRpc3BsYXllZEJhbm5lclVybCIsInVwbG9hZFRvIiwiZmllbGQiLCJzZXRMb2NhbFByZXZpZXciLCJzdWNjZXNzTWVzc2FnZSIsInN1YnRpdGxlIiwibWFyZ2luVG9wIiwiZGlzcGxheSIsIlBFUl9QQUdFX09QVElPTlMiLCJDbXNMaXN0Iiwic2V0VGFnIiwidGl0bGVQcm9wIiwidGl0bGVQcm9wZXJ0eSIsInN0b3JlUGFyYW1zIiwiZmlsdGVycyIsInBhcnNlZFF1ZXJ5IiwidXNlUXVlcnlQYXJhbXMiLCJyZWNvcmRzIiwiZGlyZWN0aW9uIiwic29ydEJ5IiwiZmV0Y2hEYXRhIiwicGVyUGFnZSIsInVzZVJlY29yZHMiLCJzZWxlY3RlZFJlY29yZHMiLCJoYW5kbGVTZWxlY3QiLCJoYW5kbGVTZWxlY3RBbGwiLCJzZXRTZWxlY3RlZFJlY29yZHMiLCJ1c2VTZWxlY3RlZFJlY29yZHMiLCJxIiwiZGVib3VuY2VSZWYiLCJzdG9yZVBhcmFtc1JlZiIsInRvU3RyaW5nIiwiaGFuZGxlUXVlcnlDaGFuZ2UiLCJjbGVhclRpbWVvdXQiLCJ0cmltbWVkIiwiaGFuZGxlQWN0aW9uUGVyZm9ybWVkIiwiY3VycmVudFBhZ2UiLCJyb3dzUGVyUGFnZSIsInRvdGFsUm93cyIsInRvdGFsUGFnZXMiLCJmcm9tIiwidG8iLCJnb1RvUGFnZSIsIm5leHRQYWdlIiwic2FmZSIsImNoYW5nZVBlclBhZ2UiLCJwYWdlTnVtYmVycyIsIndpbmRvd1NpemUiLCJzdGFydCIsImVuZCIsInBvc2l0aW9uIiwibWF4V2lkdGgiLCJ0cmFuc2Zvcm0iLCJJbnB1dCIsInBhZGRpbmdMZWZ0IiwiUmVjb3Jkc1RhYmxlIiwiYWN0aW9uUGVyZm9ybWVkIiwib25TZWxlY3QiLCJvblNlbGVjdEFsbCIsImlzTG9hZGluZyIsIm9wdGlvbiIsInJlc29sdmVJbWFnZVVybCIsIkZpZWxkRXJyb3IiLCJSZXZpZXdFZGl0IiwiYWN0aW9uIiwiaXNOZXciLCJlcnJvcnMiLCJyYXRpbmciLCJpc0FwcHJvdmVkIiwiY29udGVudCIsIkVESVRPUl9PUFRJT05TIiwicGx1Z2lucyIsInRvb2xiYXIiLCJkYXRlSW5wdXRWYWx1ZSIsIkRhdGUiLCJpc05hTiIsImdldFRpbWUiLCJzbGljZSIsInllYXIiLCJnZXRGdWxsWWVhciIsIm1vbnRoIiwiZ2V0TW9udGgiLCJwYWRTdGFydCIsImRheSIsImdldERhdGUiLCJwYWQiLCJwYXJzZURhdGVWYWx1ZSIsInRleHQiLCJtYXRjaCIsInRvRGF0ZVZhbHVlIiwiRGF0ZUZpZWxkIiwibW9udGhEYXRlIiwic2V0TW9udGhEYXRlIiwiZmlyc3REYXkiLCJnZXREYXkiLCJ0b3RhbERheXMiLCJjZWxscyIsInNlbGVjdGVkRGF5IiwiY2hvb3NlIiwidG9Mb2NhbGVEYXRlU3RyaW5nIiwidG9kYXkiLCJCbG9nRWRpdCIsImlzUHVibGlzaGVkIiwiYXV0aG9yIiwiY292ZXJJbWFnZSIsImNhdGVnb3J5IiwicHVibGlzaGVkQXQiLCJleGNlcnB0IiwiVGlueU1DRSIsIlRBQlMiLCJmaWVsZHMiLCJJbWFnZVVwbG9hZGVyIiwib25VcGxvYWQiLCJ3aWRlIiwiZGlzcGxheWVkIiwiTk9USUZJQ0FUSU9OX1NFQ1RJT05TIiwiaW50cm8iLCJGaWVsZFRpcCIsIm9uUG9pbnRlckRvd24iLCJ0aW1lciIsIk5vdGlmeUlucHV0IiwiaXNXaGF0c2FwcE51bWJlciIsImxvY2tlZCIsInNldExvY2tlZCIsInJlYWRPbmx5IiwiaW5wdXRNb2RlIiwibWF4TGVuZ3RoIiwiYXV0b0NvbXBsZXRlIiwiYXV0b0NvcnJlY3QiLCJzcGVsbENoZWNrIiwib25Gb2N1cyIsIlNPQ0lBTF9GSUVMRFMiLCJyZWFkU29jaWFsTGlua3MiLCJsaW5rcyIsIk9iamVjdCIsImZyb21FbnRyaWVzIiwiU29jaWFsRmllbGRzIiwiTm90aWZpY2F0aW9uc0ZpZWxkcyIsInNlY3Rpb24iLCJTZXR0aW5nc0VkaXQiLCJhY3RpdmVUYWIiLCJzZXRBY3RpdmVUYWIiLCJtb2JpbGVCYW5uZXJGaWxlUmVmIiwiaGlnaGxpZ2h0RmlsZVJlZiIsImJhbm5lclByZXZpZXciLCJzZXRCYW5uZXJQcmV2aWV3IiwibW9iaWxlQmFubmVyUHJldmlldyIsInNldE1vYmlsZUJhbm5lclByZXZpZXciLCJoaWdobGlnaHRQcmV2aWV3Iiwic2V0SGlnaGxpZ2h0UHJldmlldyIsIm1vYmlsZUJhbm5lclVwbG9hZGluZyIsInNldE1vYmlsZUJhbm5lclVwbG9hZGluZyIsImhpZ2hsaWdodFVwbG9hZGluZyIsInNldEhpZ2hsaWdodFVwbG9hZGluZyIsImhvbWVGZWF0dXJlZENhdGVnb3J5U2x1Z3MiLCJob21lQmFubmVySW1hZ2UiLCJtb2JpbGVCYW5uZXJJbWFnZVVybCIsImhvbWVNb2JpbGVCYW5uZXJJbWFnZSIsImhpZ2hsaWdodEltYWdlVXJsIiwiaG9tZUhpZ2hsaWdodEltYWdlIiwiaGFzaCIsInNvbWUiLCJ0YWIiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwic2V0UHJldmlldyIsImZsZXgiLCJmbGV4RGlyZWN0aW9uIiwiRHJhd2VyQ29udGVudCIsInByb3BlcnRpZXMiLCJwIiwiSDQiLCJtb3JuaW5nRGVsaXZlcnlUaXRsZSIsIm1vcm5pbmdEZWxpdmVyeVN1YnRpdGxlIiwibW9ybmluZ1NoaXBwaW5nRmVlIiwibW9ybmluZ0ZyZWVBYm92ZSIsImV4cHJlc3NEZWxpdmVyeVRpdGxlIiwiZXhwcmVzc0RlbGl2ZXJ5U3VidGl0bGUiLCJleHByZXNzU2hpcHBpbmdGZWUiLCJleHByZXNzRnJlZUFib3ZlIiwiZXhwcmVzc01pbmltdW1PcmRlclZhbHVlIiwiZmlyc3RUaHJlZU1vcm5pbmdFbmFibGVkIiwiaGFuZGxpbmdGZWUiLCJzb2NpYWxMaW5rcyIsIkRyYXdlckZvb3RlciIsIkFwcFJlbGVhc2VFZGl0IiwicGxhdGZvcm0iLCJlbmFibGVkIiwibGF0ZXN0QnVpbGQiLCJtaW5pbXVtQnVpbGQiLCJibG9ja2VkQnVpbGRzIiwicmVtaW5kQWZ0ZXJIb3VycyIsIm1haW50ZW5hbmNlIiwibWFpbnRlbmFuY2VUaXRsZSIsIm1haW50ZW5hbmNlTWVzc2FnZSIsIm51bSIsInRvRGF0ZXRpbWVWYWx1ZSIsImdldEhvdXJzIiwiZ2V0TWludXRlcyIsImZvcm1hdERhdGV0aW1lTGFiZWwiLCJob3VyIiwibWludXRlIiwiQ2hvaWNlQ2FyZCIsIkFuY2hvcmVkU2VsZWN0IiwiRGF0ZVRpbWVQaWNrZXIiLCJ2YWxpZCIsImhvdXJzIiwic2V0SG91cnMiLCJtaW51dGVzIiwic2V0TWludXRlcyIsImkiLCJhcHBseSIsIm5leHRIb3VycyIsIm5leHRNaW51dGVzIiwiQ291cG9uRWRpdCIsInNldFByb2R1Y3RzIiwic2VsZWN0ZWRTbHVncyIsInRhcmdldFNsdWdzIiwidGFyZ2V0VHlwZSIsImFwcGx5T24iLCJ1c2FnZVR5cGUiLCJjb3Vwb25UeXBlIiwia25vd01vcmVQcm9wZXJ0eSIsImxvYWRDYXRhbG9nIiwiY2F0ZWdvcnlEYXRhIiwiYWxsUHJvZHVjdHMiLCJoYXNNb3JlIiwicHJvZHVjdERhdGEiLCJzZXRTZWxlY3RlZFNsdWdzIiwicHJvZHVjdE9wdGlvbnMiLCJjYXRlZ29yeU9wdGlvbnMiLCJjb2RlIiwidG9VcHBlckNhc2UiLCJzaG93QXRDaGVja291dCIsIm1pbkNhcnQiLCJtYXhEaXNjb3VudCIsInVzYWdlTGltaXQiLCJ1c2VkQ291bnQiLCJzdGFydHNBdCIsImV4cGlyZXNBdCIsIkZVTEZJTExNRU5UIiwicGVuZGluZyIsInRvbmUiLCJwYWlkIiwicGFja2VkIiwic2hpcHBlZCIsImRlbGl2ZXJlZCIsImNhbmNlbGxlZCIsImlzT25saW5lT3JkZXIiLCJtb2RlIiwicGF5bWVudE1vZGUiLCJyYXpvcnBheVBheW1lbnRJZCIsInJhem9ycGF5T3JkZXJJZCIsInBheW1lbnRCYWRnZSIsIm9ubGluZSIsInN0YXR1cyIsInBheW1lbnRTdGF0dXMiLCJQaWxsIiwiZ2V0RnVsZmlsbG1lbnRCYWRnZSIsImdldFBheW1lbnRCYWRnZSIsIkZ1bGZpbGxtZW50QmFkZ2UiLCJQYXltZW50QmFkZ2UiLCJPcmRlckxpc3RCYWRnZSIsIlBBWU1FTlRfT1BUSU9OUyIsIkNvcHlJZCIsImNvcGllZCIsInNldENvcGllZCIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsImRlbGl2ZXJ5Q2hvaWNlTGFiZWwiLCJmb3JtYXRFeHBlY3RlZERhdGUiLCJ0aW1lWm9uZSIsImZvcm1hdE1vbmV5IiwiZm9ybWF0RGF0ZVRpbWUiLCJkYXRlU3R5bGUiLCJ0aW1lU3R5bGUiLCJyZXNvbHZlSW1hZ2UiLCJNb3JlTWVudSIsInVucGFpZCIsImNhblN5bmNSYXpvcnBheSIsIm9uQ2FzaCIsIm9uUXIiLCJvblN5bmNSYXpvcnBheSIsIm9uUmVzZW5kUGFydG5lciIsIkZyYWdtZW50Iiwic25hcHNob3QiLCJkZWxpdmVyeVBhcnRuZXJJZCIsImNvbnRhY3ROYW1lIiwiY29udGFjdFBob25lIiwiYWRkcmVzc0xpbmUxIiwiYWRkcmVzc0xpbmUyIiwiYWRkcmVzc0NpdHkiLCJhZGRyZXNzU3RhdGUiLCJhZGRyZXNzUGluY29kZSIsImFkZHJlc3NMYW5kbWFyayIsIk9yZGVyRGV0YWlsIiwic2V0UmVjb3JkIiwic2F2aW5nIiwic2V0U2F2aW5nIiwiYWN0aW9uQnVzeSIsInNldEFjdGlvbkJ1c3kiLCJwYXJ0bmVycyIsInNldFBhcnRuZXJzIiwic2V0QmFzZWxpbmUiLCJlZGl0Q29udGFjdCIsInNldEVkaXRDb250YWN0IiwiZWRpdEFkZHJlc3MiLCJzZXRFZGl0QWRkcmVzcyIsInBhdGhuYW1lIiwicmVzb3VyY2VBY3Rpb24iLCJyZXNvdXJjZUlkIiwiYWN0aW9uTmFtZSIsIml0ZW1zIiwiaXRlbXNKc29uIiwiZGlydHkiLCJrZXlzIiwibGlzdFVybCIsInJlY29yZEFjdGlvbiIsInJlY29yZElkIiwiaGFuZGxlU2F2ZSIsInBpbiIsInJ1blBheW1lbnRBY3Rpb24iLCJjb25maXJtIiwiZnVsZmlsbG1lbnQiLCJwYXltZW50Iiwic3RhdHVzTGFiZWwiLCJyZXN0b3JlRmllbGRzIiwiY2xvc2UiLCJhZGRyZXNzVGV4dCIsInBheW1lbnRMYWJlbCIsInBhcnRuZXJOYW1lIiwiZGVsaXZlcnlQYXJ0bmVyTmFtZSIsImRlbGl2ZXJ5UGFydG5lclBob25lIiwiaXRlbUNvdW50IiwicmVkdWNlIiwic3VtIiwicXVhbnRpdHkiLCJkZWxpdmVyeU5hbWUiLCJkZWxpdmVyeU9wdGlvbiIsImV4cGVjdGVkRGVsaXZlcnkiLCJleHBlY3RlZERlbGl2ZXJ5RGF0ZSIsImNyZWF0ZWRBdCIsImxpbmVUb3RhbCIsInBheW1lbnRNZXRob2QiLCJpdGVtc1RvdGFsIiwiZnJlZURlbGl2ZXJ5QXBwbGllZCIsImRlbGl2ZXJ5Q2hhcmdlIiwiaGFuZGxpbmdDaGFyZ2UiLCJ0YXhUb3RhbCIsImlzSW50ZXJTdGF0ZSIsInNtYWxsQ2FydENoYXJnZSIsImRpc2NvdW50IiwiYXV0b21hdGljRGlzY291bnRQZXJjZW50YWdlIiwiY291cG9uQ29kZSIsImdyYW5kVG90YWwiLCJwYXltZW50Q29sbGVjdGVkQXMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJyYXpvcnBheVFyVXJsIiwiRXllSWNvbiIsImhpZGRlbiIsIlBhc3N3b3JkRmllbGQiLCJ2aXNpYmxlIiwib25Ub2dnbGUiLCJMYWJlbCIsImh0bWxGb3IiLCJwYWRkaW5nUmlnaHQiLCJyaWdodCIsImJvcmRlciIsImJhY2tncm91bmQiLCJjdXJzb3IiLCJhbGlnbkl0ZW1zIiwianVzdGlmeUNvbnRlbnQiLCJwYWRkaW5nIiwiQ2hhbmdlUGFzc3dvcmQiLCJwYXNzd29yZCIsInNldFBhc3N3b3JkIiwiY29uZmlybVBhc3N3b3JkIiwic2V0Q29uZmlybVBhc3N3b3JkIiwic2hvd1Bhc3N3b3JkIiwic2V0U2hvd1Bhc3N3b3JkIiwic2hvd0NvbmZpcm0iLCJzZXRTaG93Q29uZmlybSIsInNldEVycm9yIiwiYmFjayIsInNhdmUiLCJyZWRpcmVjdFVybCIsImVyciIsImluc2V0IiwiekluZGV4IiwiYmciLCJib3JkZXJSYWRpdXMiLCJib3hTaGFkb3ciLCJlbWFpbCIsImdhcCIsIklORElBX1NUQVRFUyIsIlZFSElDTEVfVFlQRVMiLCJTVEFURV9PUFRJT05TIiwiUGFydG5lckVkaXQiLCJoYXNQYXNzd29yZCIsImZhdGhlck5hbWUiLCJwYW5OdW1iZXIiLCJhYWRoYWFyTnVtYmVyIiwiY2l0eSIsInBpbmNvZGUiLCJzdGF0ZSIsInBlcm1hbmVudEFkZHJlc3MiLCJlbWVyZ2VuY3lOYW1lIiwiZW1lcmdlbmN5UGhvbmUiLCJ2ZWhpY2xlVHlwZSIsInZlaGljbGVOdW1iZXIiLCJhY2NvdW50SG9sZGVyTmFtZSIsImFjY291bnROdW1iZXIiLCJpZnNjQ29kZSIsIm5vdGVzIiwiUGluY29kZUVkaXQiLCJtb3JuaW5nRW5hYmxlZCIsImV4cHJlc3NFbmFibGVkIiwicGFydG5lcklkIiwicGFydG5lciIsIm1hcmdpbiIsImFyZWFMYWJlbCIsInN0YXRlQ29kZSIsIlN0YXR1c1RvZ2dsZSIsInNldENoZWNrZWQiLCJwZXJzaXN0Iiwic2F2ZWQiLCJkZXNjcmlwdGlvbiIsInRvRGF0ZUlucHV0IiwiZm9ybWF0V2hlbiIsInBhcnNlQWRkcmVzc2VzIiwiYWRkcmVzc2VzIiwiZ3JvdXBlZCIsImVudHJpZXMiLCJzb3J0IiwiYSIsImIiLCJhZGRyZXNzTGluZXMiLCJhZGRyZXNzIiwibGluZTEiLCJsaW5lMiIsImxhbmRtYXJrIiwiQ3VzdG9tZXJFZGl0IiwiUk9MRVMiLCJQRVJNSVNTSU9OUyIsInNldFZpc2libGUiLCJUZWFtRWRpdCIsInBlcm1pc3Npb25PbiIsInVzZXJuYW1lIiwiRk9MREVSUyIsImZvcm1hdFNpemUiLCJieXRlcyIsInNpemUiLCJ0b0ZpeGVkIiwicmVzb2x2ZVVybCIsIk1lZGlhTGlicmFyeSIsImJ1c3lJZCIsInNldEJ1c3lJZCIsImZvbGRlciIsInVwbG9hZEZvbGRlciIsIm9yaWdpbmFsTmFtZSIsImZpbGVuYW1lIiwidXJsIiwic2V0Rm9sZGVyIiwidXBsb2FkRmlsZXMiLCJsaXN0IiwiY29weVBhdGgiLCJyZW1vdmUiLCJvbkRyYWdPdmVyIiwib25Ecm9wIiwiZGF0YVRyYW5zZmVyIiwibXVsdGlwbGUiLCJUYXhFZGl0IiwiaXNUYXhhYmxlQm9vbCIsImhhbmRsZVRheGFibGVUb2dnbGUiLCJwcm9kdWN0TmFtZSIsImNhdGVnb3J5TmFtZSIsImZvbnRTaXplIiwiY29weVRleHQiLCJQcm9taXNlIiwicmVqZWN0IiwiUmF6b3JwYXlQYXltZW50SWQiLCJwYXltZW50SWQiLCJoYW5kbGVDb3B5IiwiUkVNRU1CRVJFRF9MT0dJTl9LRVkiLCJMb2dpbiIsImVycm9yTWVzc2FnZSIsIl9fQVBQX1NUQVRFX18iLCJ0cmFuc2xhdGVNZXNzYWdlIiwidXNlVHJhbnNsYXRpb24iLCJhZG1pblJvb3QiLCJmb3Jnb3RQYXNzd29yZFVybCIsImlkZW50aWZpZXIiLCJzZXRJZGVudGlmaWVyIiwicmVtZW1iZXJMb2dpbiIsInNldFJlbWVtYmVyTG9naW4iLCJyZW1lbWJlcmVkTG9naW4iLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiZm9ybSIsImN1cnJlbnRUYXJnZXQiLCJlbWFpbElucHV0IiwiZWxlbWVudHMiLCJuYW1lZEl0ZW0iLCJzZXRJdGVtIiwicmVtb3ZlSXRlbSIsIk1lc3NhZ2VCb3giLCJGb3JtR3JvdXAiLCJkZWZhdWx0VmFsdWUiLCJtYXJnaW5SaWdodCIsInRleHRBbGlnbiIsImZvbnRXZWlnaHQiLCJhZG1pblJvb3RQYXRoIiwiY2F0YWxvZ0NvbmZpZyIsImV4cG9ydFVybCIsImltcG9ydFVybCIsIkNhdGFsb2dMaXN0SGVhZGVyQWN0aW9ucyIsIm9uSW1wb3J0ZWQiLCJ0cmFuc2xhdGVCdXR0b24iLCJ0cmFuc2xhdGVBY3Rpb24iLCJ0b2dnbGVGaWx0ZXIiLCJmaWx0ZXJzQ291bnQiLCJ1c2VGaWx0ZXJEcmF3ZXIiLCJzZXRMb2FkaW5nIiwic2V0TWVzc2FnZSIsImNvbmZpZyIsInJvb3QiLCJoYW5kbGVJbXBvcnQiLCJjcmVkZW50aWFscyIsImVycm9yQ291bnQiLCJjcmVhdGVkIiwidXBkYXRlZCIsImJ1dHRvbnMiLCJjbGljayIsIm5ld0FjdGlvbiIsInJlc291cmNlQWN0aW9ucyIsImZpbHRlcktleSIsImNvdW50IiwiZmxleFNocmluayIsInB4IiwiQnV0dG9uR3JvdXAiLCJvbkNsb3NlQ2xpY2siLCJDQVRBTE9HX1JFU09VUkNFUyIsIkFjdGlvbkhlYWRlciIsIk9yaWdpbmFsQ29tcG9uZW50IiwiQmFzZUhlYWRlciIsIk9yaWdpbmFsQWN0aW9uSGVhZGVyIiwiaXNDYXRhbG9nTGlzdCIsIl9pZ25vcmVkIiwiaGVhZGVyUHJvcHMiLCJfZXh0ZW5kcyIsIm9taXRBY3Rpb25zIiwiREVGQVVMVF9PUFRJT05TIiwiUmljaHRleHRFZGl0IiwiaGFuZGxlVXBkYXRlIiwidXNlQ2FsbGJhY2siLCJuZXdWYWx1ZSIsImlzUmVxdWlyZWQiLCJGb3JtTWVzc2FnZSIsIm1lbW8iLCJjdXQiLCJzZWFyY2giLCJTaWRlYmFyUmVzb3VyY2VTZWN0aW9uIiwiT3JpZ2luYWwiLCJ1c2VMb2NhdGlvbiIsIm5hdmlnYXRlIiwidXNlTmF2aWdhdGUiLCJyZXNvdXJjZXMiLCJnZXRSZXNvdXJjZUVsZW1lbnRDc3MiLCJzdWZmaXgiLCJMb2FkZXIiLCJOb1JlY29yZHMiLCJzZWxlY3RlZENvdW50Iiwic2VsZWN0ZWRBbGwiLCJpbmRldGVybWluYXRlIiwicmVjb3Jkc0hhdmVCdWxrQWN0aW9uIiwiYnVsa0FjdGlvbnMiLCJjb250ZW50VGFnIiwic2VsZWN0ZWRUYWciLCJib2R5VGFnIiwiVGFibGUiLCJTZWxlY3RlZFJlY29yZHMiLCJSZWNvcmRzVGFibGVIZWFkZXIiLCJsaXN0UHJvcGVydGllcyIsIlRhYmxlQm9keSIsIlJlY29yZEluTGlzdCIsImlzU2VsZWN0ZWQiLCJpc1RpdGxlIiwiU2VsZWN0QWxsQ2hlY2tCb3giLCJpbnB1dFJlZiIsIm1hcmdpbkxlZnQiLCJwb2ludHMiLCJyb3dUYWciLCJjaGVja2JveENzcyIsIlRhYmxlSGVhZCIsIlRhYmxlUm93IiwiVGFibGVDZWxsIiwiUHJvcGVydHlIZWFkZXIiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiLCJEZWZhdWx0UmljaHRleHRFZGl0UHJvcGVydHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFFTyxTQUFTQSxpQkFBZUEsQ0FBQ0MsSUFBSSxFQUFFO0VBQ3BDLEVBQUEsTUFBTUMsT0FBTyxHQUFHQyxZQUFNLENBQUMsSUFBSSxDQUFDO0lBQzVCLE1BQU0sQ0FBQ0MsTUFBTSxFQUFFQyxTQUFTLENBQUMsR0FBR0MsY0FBUSxDQUFDLEtBQUssQ0FBQztFQUUzQ0MsRUFBQUEsZUFBUyxDQUFDLE1BQU07RUFDZCxJQUFBLElBQUksQ0FBQ04sSUFBSSxFQUFFLE9BQU9PLFNBQVM7TUFFM0IsTUFBTUMsTUFBTSxHQUFHQSxNQUFNO0VBQ25CLE1BQUEsTUFBTUMsSUFBSSxHQUFHUixPQUFPLENBQUNTLE9BQU87UUFDNUIsSUFBSSxDQUFDRCxJQUFJLEVBQUU7RUFDWCxNQUFBLE1BQU1FLElBQUksR0FBR0YsSUFBSSxDQUFDRyxxQkFBcUIsRUFBRTtRQUN6QyxNQUFN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
