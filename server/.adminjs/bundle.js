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
    }), /*#__PURE__*/React__default.default.createElement(FlagCard, {
      selected: params.isActive !== false && params.isActive !== 'false',
      title: "Active",
      hint: "Visible to customers",
      onClick: () => setField('isActive', !(params.isActive !== false && params.isActive !== 'false'))
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
          q: trimmed,
          filters: trimmed ? {
            [titleProp]: trimmed
          } : {}
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
    id: 'charges',
    label: 'Charges',
    fields: ['morningDeliveryTitle', 'morningDeliverySubtitle', 'morningShippingFee', 'morningFreeAbove', 'expressDeliveryTitle', 'expressDeliverySubtitle', 'expressShippingFee', 'expressFreeAbove', 'handlingFee']
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
      }, tab.id === 'charges' ? 'Set copy and prices for Morning and Express delivery. Handling fee is added to every order.' : tab.id === 'homepage' ? 'These images and categories appear on the website homepage. Click Save changes after uploading.' : tab.id === 'notifications' ? 'Auth key, WhatsApp number, and namespace are shared. Each template has its own name and on/off toggle. Order and partner messages send only after COD is placed or the online payment is confirmed.' : 'Update your store settings and click Save changes below.'), tab.id === 'charges' ? /*#__PURE__*/React__default.default.createElement("div", {
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
      }, "0 means no free delivery")))), /*#__PURE__*/React__default.default.createElement("label", {
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
    }, /*#__PURE__*/React__default.default.createElement("h4", null, "Discount"), /*#__PURE__*/React__default.default.createElement("div", {
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
    })))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
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
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Subtotal"), /*#__PURE__*/React__default.default.createElement("dd", null, itemCount, " ", itemCount === 1 ? 'item' : 'items'), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.itemsTotal))), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Delivery", deliveryName ? ` - ${deliveryName}` : ''), /*#__PURE__*/React__default.default.createElement("dd", null, expectedDelivery ? `Expected ${expectedDelivery}` : ''), /*#__PURE__*/React__default.default.createElement("dd", null, params.freeDeliveryApplied || Number(params.deliveryCharge) === 0 ? 'Free (Welcome offer)' : formatMoney(params.deliveryCharge))), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Handling"), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.handlingCharge))), Number(params.taxTotal) > 0 ? /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Taxes (GST)", params.isInterState ? ' · IGST' : ' · CGST+SGST'), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.taxTotal))) : null, Number(params.smallCartCharge) > 0 ? /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Small cart"), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.smallCartCharge))) : null, Number(params.discount) > 0 ? /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Discount", params.couponCode ? ` · ${params.couponCode}` : ''), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, "-", formatMoney(params.discount))) : null, /*#__PURE__*/React__default.default.createElement("div", {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9mb3JtLWNvbnRyb2xzLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9wcm9kdWN0LWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY2F0ZWdvcnktZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jbXMtbGlzdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZXZpZXctZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9ibG9nLWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvc2V0dGluZ3MtZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9hcHAtcmVsZWFzZS1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2NvdXBvbi1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWxpc3QtYmFkZ2VzLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWRldGFpbC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jaGFuZ2UtcGFzc3dvcmQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvaW5kaWEtc3RhdGVzLmpzIiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcGFydG5lci1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3BpbmNvZGUtZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9zdGF0dXMtdG9nZ2xlLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2N1c3RvbWVyLWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGVhbS1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL21lZGlhLWxpYnJhcnkuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGF4LWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmF6b3JwYXktcGF5bWVudC1pZC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9sb2dpbi5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jYXRhbG9nLWxpc3QtaGVhZGVyLWFjdGlvbnMuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvYWN0aW9uLWhlYWRlci5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yaWNodGV4dC1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3NpZGViYXItZGFzaGJvYXJkLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JlY29yZHMtdGFibGUuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmVjb3Jkcy10YWJsZS1oZWFkZXIuanN4IiwiZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlQW5jaG9yZWRNZW51KG9wZW4pIHtcbiAgY29uc3Qgd3JhcFJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbb3BlblVwLCBzZXRPcGVuVXBdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSB3cmFwUmVmLmN1cnJlbnRcbiAgICAgIGlmICghbm9kZSkgcmV0dXJuXG4gICAgICBjb25zdCByZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3Qgc3BhY2VCZWxvdyA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3QuYm90dG9tXG4gICAgICBzZXRPcGVuVXAoc3BhY2VCZWxvdyA8IDI0MCAmJiByZWN0LnRvcCA+IHNwYWNlQmVsb3cpXG4gICAgfVxuXG4gICAgdXBkYXRlKClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB1cGRhdGUsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdXBkYXRlLCB0cnVlKVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHJldHVybiB7IHdyYXBSZWYsIG9wZW5VcCB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hhYmxlTXVsdGlTZWxlY3QoeyBvcHRpb25zLCBzZWxlY3RlZCwgb25DaGFuZ2UsIHBsYWNlaG9sZGVyLCBzZWFyY2hQbGFjZWhvbGRlciB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIGNvbnN0IHNlbGVjdGVkU2V0ID0gdXNlTWVtbygoKSA9PiBuZXcgU2V0KHNlbGVjdGVkKSwgW3NlbGVjdGVkXSlcbiAgY29uc3Qgc2VsZWN0ZWRPcHRpb25zID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+IHNlbGVjdGVkU2V0LmhhcyhpdGVtLnZhbHVlKSlcbiAgY29uc3QgZmlsdGVyZWQgPSBvcHRpb25zLmZpbHRlcigoaXRlbSkgPT5cbiAgICBgJHtpdGVtLmxhYmVsfSAke2l0ZW0udmFsdWV9YC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpKSxcbiAgKVxuXG4gIGNvbnN0IHRvZ2dsZSA9ICh2YWx1ZSkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFNldC5oYXModmFsdWUpKSBvbkNoYW5nZShzZWxlY3RlZC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IHZhbHVlKSlcbiAgICBlbHNlIG9uQ2hhbmdlKFsuLi5zZWxlY3RlZCwgdmFsdWVdKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0XCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNvbnRyb2xcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKCh2YWx1ZSkgPT4gIXZhbHVlKX0+XG4gICAgICAgIHtzZWxlY3RlZE9wdGlvbnMubGVuZ3RoID8gKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNoaXBzXCI+XG4gICAgICAgICAgICB7c2VsZWN0ZWRPcHRpb25zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8c3BhbiBrZXk9e2l0ZW0udmFsdWV9IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNoaXBcIj5cbiAgICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgcm9sZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICB0b2dnbGUoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgw5dcbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1wbGFjZWhvbGRlclwiPntwbGFjZWhvbGRlcn08L3NwYW4+XG4gICAgICAgICl9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNhcmV0XCI+e29wZW4gPyAn4pa0JyA6ICfilr4nfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cXVlcnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRRdWVyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3NlYXJjaFBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICAgIHtmaWx0ZXJlZC5sZW5ndGggPyAoXG4gICAgICAgICAgICAgIGZpbHRlcmVkLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSBzZWxlY3RlZFNldC5oYXMoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGtleT17aXRlbS52YWx1ZX0gY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3Qtb3B0aW9uJHtjaGVja2VkID8gJyBpcy1zZWxlY3RlZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e2NoZWNrZWR9IG9uQ2hhbmdlPXsoKSA9PiB0b2dnbGUoaXRlbS52YWx1ZSl9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1lbXB0eVwiPk5vIG1hdGNoZXM8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZsYWdDYXJkKHsgc2VsZWN0ZWQsIHRpdGxlLCBoaW50LCBvbkNsaWNrIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YHRva3JpLWNob2ljZS1jYXJkJHtzZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgPlxuICAgICAgPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+XG4gICAgICA8c3Bhbj57aGludH08L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmxhZ09uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gJ3RydWUnIHx8IHZhbHVlID09PSAnb24nIHx8IHZhbHVlID09PSAxIHx8IHZhbHVlID09PSAnMSdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0YXR1c1N3aXRjaCh7XG4gIGNoZWNrZWQsXG4gIG9uQ2hhbmdlLFxuICBkaXNhYmxlZCxcbiAgdGl0bGUsXG4gIGhpbnQsXG4gIGNvbXBhY3QgPSBmYWxzZSxcbiAgb25MYWJlbCA9ICdBY3RpdmUnLFxuICBvZmZMYWJlbCA9ICdJbmFjdGl2ZScsXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B0b2tyaS1zd2l0Y2gke2NoZWNrZWQgPyAnIGlzLW9uJyA6ICcnfSR7Y29tcGFjdCA/ICcgaXMtY29tcGFjdCcgOiAnJ31gfVxuICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgYXJpYS1wcmVzc2VkPXtjaGVja2VkfVxuICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgaWYgKCFkaXNhYmxlZCkgb25DaGFuZ2UoIWNoZWNrZWQpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXN3aXRjaC10cmFja1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1zd2l0Y2gtdGh1bWJcIiAvPlxuICAgICAgPC9zcGFuPlxuICAgICAge3RpdGxlIHx8IGhpbnQgPyAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXN3aXRjaC1jb3B5XCI+XG4gICAgICAgICAge3RpdGxlID8gPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+IDogbnVsbH1cbiAgICAgICAgICB7aGludCA/IDxzcGFuPntoaW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApIDogKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0b2tyaS1zdGF0dXMtcGlsbCR7Y2hlY2tlZCA/ICcgaXMtb24nIDogJyd9YH0+XG4gICAgICAgICAge2NoZWNrZWQgPyBvbkxhYmVsIDogb2ZmTGFiZWx9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICl9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNlYXJjaGFibGVTZWxlY3QoeyB2YWx1ZSwgb3B0aW9ucywgb25DaGFuZ2UsIHBsYWNlaG9sZGVyLCBzZWFyY2hQbGFjZWhvbGRlciwgZGlzYWJsZWQgfSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuICBjb25zdCBqdXN0UGlja2VkID0gdXNlUmVmKGZhbHNlKVxuICBjb25zdCBzZWxlY3RlZCA9IG9wdGlvbnMuZmluZCgoaXRlbSkgPT4gaXRlbS52YWx1ZSA9PT0gdmFsdWUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIGNvbnN0IGZpbHRlcmVkID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+XG4gICAgYCR7aXRlbS5sYWJlbH0gJHtpdGVtLnZhbHVlfWAudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKSksXG4gIClcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3RcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY29udHJvbFwiXG4gICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGlmIChqdXN0UGlja2VkLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGp1c3RQaWNrZWQuY3VycmVudCA9IGZhbHNlXG4gICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghZGlzYWJsZWQpIHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3NlbGVjdGVkID8gJycgOiAndG9rcmktbXVsdGlzZWxlY3QtcGxhY2Vob2xkZXInfT5cbiAgICAgICAgICB7c2VsZWN0ZWQ/LmxhYmVsIHx8IHBsYWNlaG9sZGVyfVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNhcmV0XCI+e29wZW4gPyAn4pa0JyA6ICfilr4nfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cXVlcnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRRdWVyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3NlYXJjaFBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICAgIHtmaWx0ZXJlZC5sZW5ndGggPyAoXG4gICAgICAgICAgICAgIGZpbHRlcmVkLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2ZSA9IGl0ZW0udmFsdWUgPT09IHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZSB8fCAnZW1wdHknfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1tdWx0aXNlbGVjdC1vcHRpb24ke2FjdGl2ZSA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgIGp1c3RQaWNrZWQuY3VycmVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZShpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgc2V0UXVlcnkoJycpXG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAganVzdFBpY2tlZC5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICB9LCAwKVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWVtcHR5XCI+Tm8gbWF0Y2hlczwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTG9jYWxTZWxlY3QoeyB2YWx1ZSwgb3B0aW9ucywgb25DaGFuZ2UsIGRpc2FibGVkIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHsgd3JhcFJlZiwgb3BlblVwIH0gPSB1c2VBbmNob3JlZE1lbnUob3BlbilcbiAgY29uc3Qgc2VsZWN0ZWQgPSBvcHRpb25zLmZpbmQoKGl0ZW0pID0+IFN0cmluZyhpdGVtLnZhbHVlKSA9PT0gU3RyaW5nKHZhbHVlKSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9uRG9jQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghd3JhcFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICB9LCBbd3JhcFJlZl0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxvY2FsLXNlbGVjdFwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1sb2NhbC1zZWxlY3QtY29udHJvbFwiXG4gICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGlmICghZGlzYWJsZWQpIHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3Bhbj57c2VsZWN0ZWQ/LmxhYmVsIHx8IHZhbHVlfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY2FyZXRcIj57b3BlbiA/ICfilrQnIDogJ+KWvid9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b2tyaS1sb2NhbC1zZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICB7b3B0aW9ucy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3Qtb3B0aW9uJHtTdHJpbmcoaXRlbS52YWx1ZSkgPT09IFN0cmluZyh2YWx1ZSkgPyAnIGlzLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEFwaUNsaWVudCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBCb3gsIEgyLCBINSwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBMb2NhbFNlbGVjdCB9IGZyb20gJy4vZm9ybS1jb250cm9scydcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5jb25zdCBSQU5HRVMgPSBbXG4gIHsgdmFsdWU6ICc3ZCcsIGxhYmVsOiAnNyBkYXlzJyB9LFxuICB7IHZhbHVlOiAndGhpc01vbnRoJywgbGFiZWw6ICdUaGlzIG1vbnRoJyB9LFxuICB7IHZhbHVlOiAnbGFzdE1vbnRoJywgbGFiZWw6ICdMYXN0IG1vbnRoJyB9LFxuICB7IHZhbHVlOiAnOTBkJywgbGFiZWw6ICczIG1vbnRocycgfSxcbl1cbmNvbnN0IFdJREdFVFMgPSBbJ29yZGVyVmFsdWUnLCAnb3JkZXJzJywgJ2N1c3RvbWVycycsICdwcm9kdWN0cyddXG5cbmNvbnN0IGluciA9ICh2YWx1ZSkgPT5cbiAgYOKCuSR7TnVtYmVyKHZhbHVlIHx8IDApLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAwIH0pfWBcblxuZnVuY3Rpb24gUmFuZ2VTZWxlY3QoeyB2YWx1ZSwgb25DaGFuZ2UgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktcmFuZ2Utc2VsZWN0XCI+XG4gICAgICA8TG9jYWxTZWxlY3QgdmFsdWU9e3ZhbHVlfSBvcHRpb25zPXtSQU5HRVN9IG9uQ2hhbmdlPXtvbkNoYW5nZX0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBheGlzTWF4KHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA8PSAwKSByZXR1cm4gMTAwMFxuICBjb25zdCBwYWRkZWQgPSB2YWx1ZSAqIDEuMVxuICBjb25zdCBtYWduaXR1ZGUgPSAxMCAqKiBNYXRoLmZsb29yKE1hdGgubG9nMTAocGFkZGVkKSlcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHBhZGRlZCAvIG1hZ25pdHVkZVxuICBjb25zdCBuaWNlID0gbm9ybWFsaXplZCA8PSAxID8gMSA6IG5vcm1hbGl6ZWQgPD0gMiA/IDIgOiBub3JtYWxpemVkIDw9IDUgPyA1IDogMTBcbiAgcmV0dXJuIG5pY2UgKiBtYWduaXR1ZGVcbn1cblxuZnVuY3Rpb24gTGluZUNoYXJ0KHsgc2VyaWVzIH0pIHtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZShudWxsKVxuICBjb25zdCB3aWR0aCA9IDEyMDBcbiAgY29uc3QgaGVpZ2h0ID0gMzIwXG4gIGNvbnN0IHBhZExlZnQgPSA4NlxuICBjb25zdCBwYWRSaWdodCA9IDE4XG4gIGNvbnN0IHBhZFRvcCA9IDE4XG4gIGNvbnN0IHBhZEJvdHRvbSA9IDM2XG4gIGNvbnN0IG1heCA9IGF4aXNNYXgoTWF0aC5tYXgoLi4uc2VyaWVzLm1hcCgocG9pbnQpID0+IHBvaW50Lm9yZGVyVmFsdWUpLCAwKSlcbiAgY29uc3QgcGxvdFdpZHRoID0gd2lkdGggLSBwYWRMZWZ0IC0gcGFkUmlnaHRcbiAgY29uc3QgcGxvdEhlaWdodCA9IGhlaWdodCAtIHBhZFRvcCAtIHBhZEJvdHRvbVxuICBjb25zdCBiYXNlbGluZSA9IHBhZFRvcCArIHBsb3RIZWlnaHRcbiAgY29uc3QgeUZvciA9ICh2YWx1ZSkgPT4gYmFzZWxpbmUgLSAodmFsdWUgLyBtYXgpICogcGxvdEhlaWdodFxuICBjb25zdCBzdGVwID0gc2VyaWVzLmxlbmd0aCA+IDEgPyBwbG90V2lkdGggLyAoc2VyaWVzLmxlbmd0aCAtIDEpIDogcGxvdFdpZHRoXG4gIGNvbnN0IGNvb3JkcyA9IHNlcmllcy5tYXAoKHBvaW50LCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHggPSBzZXJpZXMubGVuZ3RoID09PSAxID8gcGFkTGVmdCArIHBsb3RXaWR0aCAvIDIgOiBwYWRMZWZ0ICsgaW5kZXggKiBzdGVwXG4gICAgcmV0dXJuIHsgeCwgeTogeUZvcihwb2ludC5vcmRlclZhbHVlKSwgcG9pbnQgfVxuICB9KVxuICBjb25zdCBsaW5lID0gY29vcmRzLm1hcCgoaXRlbSwgaW5kZXgpID0+IGAke2luZGV4ID8gJ0wnIDogJ00nfSR7aXRlbS54fSwke2l0ZW0ueX1gKS5qb2luKCcgJylcbiAgY29uc3QgYXJlYSA9IGNvb3Jkcy5sZW5ndGhcbiAgICA/IGAke2xpbmV9IEwke2Nvb3Jkc1tjb29yZHMubGVuZ3RoIC0gMV0ueH0sJHtiYXNlbGluZX0gTCR7Y29vcmRzWzBdLnh9LCR7YmFzZWxpbmV9IFpgXG4gICAgOiAnJ1xuICBjb25zdCBsYWJlbEV2ZXJ5ID0gc2VyaWVzLmxlbmd0aCA+IDIwID8gTWF0aC5jZWlsKHNlcmllcy5sZW5ndGggLyA4KSA6IHNlcmllcy5sZW5ndGggPiAxMCA/IDQgOiAxXG4gIGNvbnN0IHRpY2tzID0gWzAsIDAuMjUsIDAuNSwgMC43NSwgMV0ubWFwKChyYXRpbykgPT4gKHtcbiAgICB2YWx1ZTogTWF0aC5yb3VuZChtYXggKiByYXRpbyksXG4gICAgeTogeUZvcihtYXggKiByYXRpbyksXG4gIH0pKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1wbG90XCIgb25Nb3VzZUxlYXZlPXsoKSA9PiBzZXRIb3ZlcihudWxsKX0+XG4gICAgICA8c3ZnIHZpZXdCb3g9e2AwIDAgJHt3aWR0aH0gJHtoZWlnaHR9YH0gY2xhc3NOYW1lPVwidG9rcmktY2hhcnRcIiByb2xlPVwiaW1nXCI+XG4gICAgICAgIHt0aWNrcy5tYXAoKHRpY2spID0+IChcbiAgICAgICAgICA8ZyBrZXk9e3RpY2sudmFsdWV9PlxuICAgICAgICAgICAgPGxpbmUgeDE9e3BhZExlZnR9IHgyPXt3aWR0aCAtIHBhZFJpZ2h0fSB5MT17dGljay55fSB5Mj17dGljay55fSBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1ncmlkbGluZVwiIC8+XG4gICAgICAgICAgICA8dGV4dCB4PXtwYWRMZWZ0IC0gMTB9IHk9e3RpY2sueSArIDR9IHRleHRBbmNob3I9XCJlbmRcIiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1heGlzXCI+XG4gICAgICAgICAgICAgIHtpbnIodGljay52YWx1ZSl9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9nPlxuICAgICAgICApKX1cbiAgICAgICAgPHBhdGggZD17YXJlYX0gZmlsbD1cIiMwNDc4NTdcIiBvcGFjaXR5PVwiMC4xNlwiIC8+XG4gICAgICAgIDxwYXRoIGQ9e2xpbmV9IGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiIzA0Nzg1N1wiIHN0cm9rZVdpZHRoPVwiM1wiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiAvPlxuICAgICAgICB7Y29vcmRzLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgIDxnIGtleT17aXRlbS5wb2ludC5kYXRlfT5cbiAgICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgICAgY3g9e2l0ZW0ueH1cbiAgICAgICAgICAgICAgY3k9e2l0ZW0ueX1cbiAgICAgICAgICAgICAgcj1cIjE0XCJcbiAgICAgICAgICAgICAgZmlsbD1cInRyYW5zcGFyZW50XCJcbiAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiBzZXRIb3ZlcihpdGVtKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Y2lyY2xlIGN4PXtpdGVtLnh9IGN5PXtpdGVtLnl9IHI9XCI0LjVcIiBmaWxsPVwiI2ZmZlwiIHN0cm9rZT1cIiMwNDc4NTdcIiBzdHJva2VXaWR0aD1cIjJcIiBwb2ludGVyRXZlbnRzPVwibm9uZVwiIC8+XG4gICAgICAgICAgPC9nPlxuICAgICAgICApKX1cbiAgICAgICAge2Nvb3Jkcy5tYXAoKGl0ZW0sIGluZGV4KSA9PlxuICAgICAgICAgIGluZGV4ICUgbGFiZWxFdmVyeSA9PT0gMCA/IChcbiAgICAgICAgICAgIDx0ZXh0IGtleT17YCR7aXRlbS5wb2ludC5kYXRlfS1sYWJlbGB9IHg9e2l0ZW0ueH0geT17aGVpZ2h0IC0gOH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWxhYmVsXCI+XG4gICAgICAgICAgICAgIHtpdGVtLnBvaW50LmxhYmVsfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICkgOiBudWxsLFxuICAgICAgICApfVxuICAgICAgPC9zdmc+XG4gICAgICB7aG92ZXIgPyAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1jaGFydC10aXAke2hvdmVyLnkgPCA5MCA/ICcgaXMtYmVsb3cnIDogJyd9YH1cbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBgJHsoaG92ZXIueCAvIHdpZHRoKSAqIDEwMH0lYCwgdG9wOiBgJHsoaG92ZXIueSAvIGhlaWdodCkgKiAxMDB9JWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuPntob3Zlci5wb2ludC5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgPHN0cm9uZz57aW5yKGhvdmVyLnBvaW50Lm9yZGVyVmFsdWUpfTwvc3Ryb25nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIFBhZ2VyKHsgcGFnZSwgcGFnZVNpemUsIHRvdGFsLCBvbkNoYW5nZSB9KSB7XG4gIGNvbnN0IHBhZ2VzID0gTWF0aC5tYXgoMSwgTWF0aC5jZWlsKCh0b3RhbCB8fCAwKSAvIHBhZ2VTaXplKSlcbiAgaWYgKHBhZ2VzIDw9IDEpIHJldHVybiBudWxsXG4gIGNvbnN0IG51bWJlcnMgPSBbXVxuICBmb3IgKGxldCBudW1iZXIgPSAxOyBudW1iZXIgPD0gcGFnZXM7IG51bWJlciArPSAxKSBudW1iZXJzLnB1c2gobnVtYmVyKVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktd2lkZ2V0LXBhZ2VzXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxpc3QtcGFnaW5hdGlvbi1wYWdlc1wiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17cGFnZSA8PSAxfSBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZShwYWdlIC0gMSl9PlxuICAgICAgICAgIFByZXZcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIHtudW1iZXJzLm1hcCgobnVtYmVyKSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBrZXk9e251bWJlcn1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17bnVtYmVyID09PSBwYWdlID8gJ2lzLWN1cnJlbnQnIDogJyd9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZShudW1iZXIpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtudW1iZXJ9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17cGFnZSA+PSBwYWdlc30gb25DbGljaz17KCkgPT4gb25DaGFuZ2UocGFnZSArIDEpfT5cbiAgICAgICAgICBOZXh0XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgRGFzaGJvYXJkID0gKCkgPT4ge1xuICBjb25zdCByZXF1ZXN0cyA9IHVzZVJlZih7fSlcbiAgY29uc3QgW3Jhbmdlcywgc2V0UmFuZ2VzXSA9IHVzZVN0YXRlKHtcbiAgICBvcmRlclZhbHVlOiAnN2QnLFxuICAgIG9yZGVyczogJzdkJyxcbiAgICBjdXN0b21lcnM6ICc3ZCcsXG4gICAgcHJvZHVjdHM6ICc3ZCcsXG4gIH0pXG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKHt9KVxuICBjb25zdCBbcGFnZXMsIHNldFBhZ2VzXSA9IHVzZVN0YXRlKHsgb3JkZXJzOiAxLCBjdXN0b21lcnM6IDEgfSlcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoe1xuICAgIG9yZGVyVmFsdWU6IHRydWUsXG4gICAgb3JkZXJzOiB0cnVlLFxuICAgIGN1c3RvbWVyczogdHJ1ZSxcbiAgICBwcm9kdWN0czogdHJ1ZSxcbiAgfSlcblxuICBjb25zdCBsb2FkV2lkZ2V0ID0gKHdpZGdldCwgcmFuZ2UsIHBhZ2UgPSAxKSA9PiB7XG4gICAgY29uc3QgdGlja2V0ID0gKHJlcXVlc3RzLmN1cnJlbnRbd2lkZ2V0XSB8fCAwKSArIDFcbiAgICByZXF1ZXN0cy5jdXJyZW50W3dpZGdldF0gPSB0aWNrZXRcbiAgICBzZXRCdXN5KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBbd2lkZ2V0XTogdHJ1ZSB9KSlcbiAgICBhcGlcbiAgICAgIC5nZXREYXNoYm9hcmQoeyBwYXJhbXM6IHsgd2lkZ2V0LCByYW5nZSwgcGFnZSB9IH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlcXVlc3RzLmN1cnJlbnRbd2lkZ2V0XSAhPT0gdGlja2V0KSByZXR1cm5cbiAgICAgICAgc2V0RGF0YSgoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgLi4ucmVzcG9uc2UuZGF0YSB9KSlcbiAgICAgIH0pXG4gICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgIGlmIChyZXF1ZXN0cy5jdXJyZW50W3dpZGdldF0gIT09IHRpY2tldCkgcmV0dXJuXG4gICAgICAgIHNldEJ1c3koKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiBmYWxzZSB9KSlcbiAgICAgIH0pXG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIFdJREdFVFMuZm9yRWFjaCgod2lkZ2V0KSA9PiBsb2FkV2lkZ2V0KHdpZGdldCwgJzdkJykpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGNoYW5nZVJhbmdlID0gKHdpZGdldCwgcmFuZ2UpID0+IHtcbiAgICBzZXRSYW5nZXMoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiByYW5nZSB9KSlcbiAgICBpZiAod2lkZ2V0ID09PSAnb3JkZXJzJyB8fCB3aWRnZXQgPT09ICdjdXN0b21lcnMnKSB7XG4gICAgICBzZXRQYWdlcygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgW3dpZGdldF06IDEgfSkpXG4gICAgfVxuICAgIGxvYWRXaWRnZXQod2lkZ2V0LCByYW5nZSwgMSlcbiAgfVxuXG4gIGNvbnN0IGNoYW5nZVBhZ2UgPSAod2lkZ2V0LCBwYWdlKSA9PiB7XG4gICAgc2V0UGFnZXMoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiBwYWdlIH0pKVxuICAgIGxvYWRXaWRnZXQod2lkZ2V0LCByYW5nZXNbd2lkZ2V0XSwgcGFnZSlcbiAgfVxuXG4gIGNvbnN0IG9yZGVyVmFsdWUgPSBkYXRhLm9yZGVyVmFsdWVcbiAgY29uc3Qgb3JkZXJzID0gZGF0YS5vcmRlcnNcbiAgY29uc3QgY3VzdG9tZXJzID0gZGF0YS5jdXN0b21lcnNcbiAgY29uc3QgcHJvZHVjdHMgPSBkYXRhLnByb2R1Y3RzXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHZhcmlhbnQ9XCJ0cmFuc3BhcmVudFwiIGNsYXNzTmFtZT1cInRva3JpLWFuYWx5dGljc1wiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1hbmFseXRpY3MtaGVhZFwiPlxuICAgICAgICA8SDIgbWI9XCJzbVwiPkRhc2hib2FyZDwvSDI+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY2hhcnQtY2FyZCB0b2tyaS1jaGFydC1jYXJkLXdpZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS13aWRnZXQtaGVhZFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8SDUgbWI9XCJzbVwiPk9yZGVyIFZhbHVlPC9INT5cbiAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgIHtidXN5Lm9yZGVyVmFsdWUgJiYgIW9yZGVyVmFsdWVcbiAgICAgICAgICAgICAgICA/ICdMb2FkaW5n4oCmJ1xuICAgICAgICAgICAgICAgIDogYCR7aW5yKG9yZGVyVmFsdWU/LnRvdGFsKX0gZnJvbSAke29yZGVyVmFsdWU/Lm9yZGVyQ291bnQgfHwgMH0gb3JkZXJzYH1cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8UmFuZ2VTZWxlY3QgdmFsdWU9e3Jhbmdlcy5vcmRlclZhbHVlfSBvbkNoYW5nZT17KHZhbHVlKSA9PiBjaGFuZ2VSYW5nZSgnb3JkZXJWYWx1ZScsIHZhbHVlKX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtvcmRlclZhbHVlPy5zZXJpZXM/Lmxlbmd0aCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWZyYW1lXCI+XG4gICAgICAgICAgICA8TGluZUNoYXJ0IHNlcmllcz17b3JkZXJWYWx1ZS5zZXJpZXN9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXNwbGl0XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWNhcmRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXdpZGdldC1oZWFkXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8SDUgbWI9XCJzbVwiPk9yZGVyIEFtb3VudDwvSDU+XG4gICAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgICAge2J1c3kub3JkZXJzICYmICFvcmRlcnMgPyAnTG9hZGluZ+KApicgOiBgJHtvcmRlcnM/LnRvdGFsIHx8IDB9IG9yZGVyc2B9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPFJhbmdlU2VsZWN0IHZhbHVlPXtyYW5nZXMub3JkZXJzfSBvbkNoYW5nZT17KHZhbHVlKSA9PiBjaGFuZ2VSYW5nZSgnb3JkZXJzJywgdmFsdWUpfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtvcmRlcnM/LnJvd3M/Lmxlbmd0aCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktdGFibGUtd3JhcFwiPlxuICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidG9rcmktZGF0YS10YWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPk9yZGVyIG51bWJlcjwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkFtb3VudDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5QbGFjZWQ8L3RoPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgIHtvcmRlcnMucm93cy5tYXAoKHJvdykgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtyb3cuaWR9PlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57cm93Lm9yZGVyTm99PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntpbnIocm93LmFtb3VudCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5wbGFjZWRBdH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8VGV4dCBvcGFjaXR5PXswLjd9PntidXN5Lm9yZGVycyA/ICdMb2FkaW5n4oCmJyA6ICdObyBvcmRlcnMgaW4gdGhpcyBwZXJpb2QuJ308L1RleHQ+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8UGFnZXJcbiAgICAgICAgICAgIHBhZ2U9e29yZGVycz8ucGFnZSB8fCBwYWdlcy5vcmRlcnN9XG4gICAgICAgICAgICBwYWdlU2l6ZT17b3JkZXJzPy5wYWdlU2l6ZSB8fCAxMH1cbiAgICAgICAgICAgIHRvdGFsPXtvcmRlcnM/LnRvdGFsIHx8IDB9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHBhZ2UpID0+IGNoYW5nZVBhZ2UoJ29yZGVycycsIHBhZ2UpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1jYXJkXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS13aWRnZXQtaGVhZFwiPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPEg1IG1iPVwic21cIj5OZXcgQ3VzdG9tZXJzPC9INT5cbiAgICAgICAgICAgICAgPFRleHQgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgICAgICB7YnVzeS5jdXN0b21lcnMgJiYgIWN1c3RvbWVycyA/ICdMb2FkaW5n4oCmJyA6IGAke2N1c3RvbWVycz8udG90YWwgfHwgMH0gcGVvcGxlIHJlZ2lzdGVyZWRgfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxSYW5nZVNlbGVjdCB2YWx1ZT17cmFuZ2VzLmN1c3RvbWVyc30gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gY2hhbmdlUmFuZ2UoJ2N1c3RvbWVycycsIHZhbHVlKX0gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7Y3VzdG9tZXJzPy5yb3dzPy5sZW5ndGggPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInRva3JpLWRhdGEtdGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlBob25lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkRhdGUgb2YgYmlydGg8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+Q3JlYXRlZDwvdGg+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAge2N1c3RvbWVycy5yb3dzLm1hcCgocm93KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e3Jvdy5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cubmFtZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD4rOTEge3Jvdy5waG9uZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57cm93LmRhdGVPZkJpcnRofTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cucmVnaXN0ZXJlZEF0fTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+e2J1c3kuY3VzdG9tZXJzID8gJ0xvYWRpbmfigKYnIDogJ05vIG5ldyBjdXN0b21lcnMgaW4gdGhpcyBwZXJpb2QuJ308L1RleHQ+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8UGFnZXJcbiAgICAgICAgICAgIHBhZ2U9e2N1c3RvbWVycz8ucGFnZSB8fCBwYWdlcy5jdXN0b21lcnN9XG4gICAgICAgICAgICBwYWdlU2l6ZT17Y3VzdG9tZXJzPy5wYWdlU2l6ZSB8fCAxMH1cbiAgICAgICAgICAgIHRvdGFsPXtjdXN0b21lcnM/LnRvdGFsIHx8IDB9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHBhZ2UpID0+IGNoYW5nZVBhZ2UoJ2N1c3RvbWVycycsIHBhZ2UpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXNwbGl0XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWNhcmRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXdpZGdldC1oZWFkXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8SDUgbWI9XCJzbVwiPkJlc3QgU2VsbGluZyBQcm9kdWN0czwvSDU+XG4gICAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgICAge2J1c3kucHJvZHVjdHMgJiYgIXByb2R1Y3RzID8gJ0xvYWRpbmfigKYnIDogJ1RvcCA1IGJ5IG51bWJlciBvZiBvcmRlcnMnfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxSYW5nZVNlbGVjdCB2YWx1ZT17cmFuZ2VzLnByb2R1Y3RzfSBvbkNoYW5nZT17KHZhbHVlKSA9PiBjaGFuZ2VSYW5nZSgncHJvZHVjdHMnLCB2YWx1ZSl9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Byb2R1Y3RzPy5yb3dzPy5sZW5ndGggPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInRva3JpLWRhdGEtdGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5Qcm9kdWN0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPk9yZGVyczwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5BbW91bnQ8L3RoPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgIHtwcm9kdWN0cy5yb3dzLm1hcCgocm93KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e3Jvdy5uYW1lfT5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cub3JkZXJzfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntpbnIocm93LmFtb3VudCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPFRleHQgb3BhY2l0eT17MC43fT57YnVzeS5wcm9kdWN0cyA/ICdMb2FkaW5n4oCmJyA6ICdObyBwcm9kdWN0cyBzb2xkIGluIHRoaXMgcGVyaW9kLid9PC9UZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IERhc2hib2FyZFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEJhc2VQcm9wZXJ0eUNvbXBvbmVudCwgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgRmxhZ0NhcmQsIGlzRmxhZ09uLCBTZWFyY2hhYmxlTXVsdGlTZWxlY3QsIFN0YXR1c1N3aXRjaCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IG5vcm1hbGl6ZVNsdWdJbnB1dCA9ICh2YWx1ZSkgPT5cbiAgU3RyaW5nKHZhbHVlIHx8ICcnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnRyaW0oKVxuICAgIC5yZXBsYWNlKC9bJ1wiXS9nLCAnJylcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tK3wtKyQvZywgJycpXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmZ1bmN0aW9uIHBhcnNlU2x1Z3MocmF3KSB7XG4gIGlmICghcmF3KSByZXR1cm4gW11cbiAgaWYgKEFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIHJhdy5tYXAoKGl0ZW0pID0+IFN0cmluZyhpdGVtKS50cmltKCkpLmZpbHRlcihCb29sZWFuKVxuICBpZiAodHlwZW9mIHJhdyA9PT0gJ3N0cmluZycpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJzZWQpKSByZXR1cm4gcGFyc2VTbHVncyhwYXJzZWQpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmVcbiAgICB9XG4gICAgcmV0dXJuIHJhd1xuICAgICAgLnNwbGl0KCcsJylcbiAgICAgIC5tYXAoKGl0ZW0pID0+IGl0ZW0udHJpbSgpKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICB9XG4gIHJldHVybiBbXVxufVxuXG5jb25zdCBQcm9kdWN0RWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFt1cGxvYWRpbmcsIHNldFVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NsdWdFZGl0ZWQsIHNldFNsdWdFZGl0ZWRdID0gdXNlU3RhdGUoQm9vbGVhbihpbml0aWFsUmVjb3JkPy5wYXJhbXM/LnNsdWcpKVxuICBjb25zdCBbcHJldmlld1VybCwgc2V0UHJldmlld1VybF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2NhdGVnb3JpZXMsIHNldENhdGVnb3JpZXNdID0gdXNlU3RhdGUoW10pXG5cbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgY3VzdG9tID0gcmVzb3VyY2U/Lm9wdGlvbnM/LmN1c3RvbSB8fCB7fVxuICBjb25zdCBhcGlCYXNlVXJsID0gd2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwaUJhc2VVcmwgfHwgJy9hcGkvdjEnKVxuICBjb25zdCBwcm9kdWN0VXJsQmFzZSA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKFxuICAgIGN1c3RvbS5wcm9kdWN0VXJsQmFzZSB8fCBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9wcm9kdWN0YCxcbiAgKVxuICBjb25zdCBzbHVnSW5wdXQgPSBwYXJhbXMuc2x1ZyA/PyAnJ1xuICBjb25zdCBwcmV2aWV3U2x1ZyA9IG5vcm1hbGl6ZVNsdWdJbnB1dChzbHVnSW5wdXQpIHx8IG5vcm1hbGl6ZVNsdWdJbnB1dChwYXJhbXMubmFtZSlcbiAgY29uc3QgcHJvZHVjdFVybCA9IHByZXZpZXdTbHVnID8gYCR7cHJvZHVjdFVybEJhc2V9LyR7cHJldmlld1NsdWd9YCA6IG51bGxcbiAgY29uc3Qgc2VsZWN0ZWRDYXRlZ29yeVNsdWdzID0gcGFyc2VTbHVncyhwYXJhbXMuY2F0ZWdvcnlJZHMpXG5cbiAgY29uc3QgaW1hZ2VVcmwgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIXBhcmFtcy5pbWFnZSkgcmV0dXJuICcnXG4gICAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhcmFtcy5pbWFnZSkpIHJldHVybiBwYXJhbXMuaW1hZ2VcbiAgICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke3BhcmFtcy5pbWFnZX1gXG4gIH0sIFtjdXN0b20uYXBwVXJsLCBwYXJhbXMuaW1hZ2VdKVxuXG4gIGNvbnN0IGRpc3BsYXllZEltYWdlVXJsID0gcHJldmlld1VybCB8fCBpbWFnZVVybFxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChwcmV2aWV3VXJsPy5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKHByZXZpZXdVcmwpXG4gICAgfVxuICB9LCBbcHJldmlld1VybF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgaWdub3JlID0gZmFsc2VcbiAgICBmZXRjaChgJHthcGlCYXNlVXJsfS9jYXRlZ29yaWVzYClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgaWYgKCFpZ25vcmUpIHNldENhdGVnb3JpZXMoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbXSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0Q2F0ZWdvcmllcyhbXSlcbiAgICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlnbm9yZSA9IHRydWVcbiAgICB9XG4gIH0sIFthcGlCYXNlVXJsXSlcblxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCBvblByb3BlcnR5Q2hhbmdlID0gKHByb3BlcnR5UGF0aCwgdmFsdWUsIC4uLnJlc3QpID0+IHtcbiAgICBpZiAocHJvcGVydHlQYXRoID09PSAnc2x1ZycpIHtcbiAgICAgIHNldFNsdWdFZGl0ZWQodHJ1ZSlcbiAgICAgIGhhbmRsZUNoYW5nZShwcm9wZXJ0eVBhdGgsIG5vcm1hbGl6ZVNsdWdJbnB1dCh2YWx1ZSksIC4uLnJlc3QpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaGFuZGxlQ2hhbmdlKHByb3BlcnR5UGF0aCwgdmFsdWUsIC4uLnJlc3QpXG4gICAgaWYgKHByb3BlcnR5UGF0aCA9PT0gJ25hbWUnICYmICFzbHVnRWRpdGVkKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ3NsdWcnLCBub3JtYWxpemVTbHVnSW5wdXQodmFsdWUpKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNldFNlbGVjdGVkQ2F0ZWdvcmllcyA9IChzbHVncykgPT4gc2V0RmllbGQoJ2NhdGVnb3J5SWRzJywgSlNPTi5zdHJpbmdpZnkoc2x1Z3MpKVxuXG4gIGNvbnN0IHVwbG9hZEltYWdlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgaWYgKCFmaWxlKSByZXR1cm5cblxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZvbGRlcicsICdwcm9kdWN0cycpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSlcbiAgICBjb25zdCBsb2NhbFByZXZpZXdVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpXG4gICAgc2V0UHJldmlld1VybChsb2NhbFByZXZpZXdVcmwpXG4gICAgc2V0VXBsb2FkaW5nKHRydWUpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS91cGxvYWRgLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIH0pXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdJbWFnZSB1cGxvYWQgZmFpbGVkJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1lZGlhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICBoYW5kbGVDaGFuZ2UoJ2ltYWdlJywgbWVkaWEucGF0aClcbiAgICAgIGhhbmRsZUNoYW5nZSgnbWVkaWFJZCcsIG1lZGlhLmlkKVxuICAgICAgc2V0UHJldmlld1VybChcbiAgICAgICAgL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QobWVkaWEucGF0aClcbiAgICAgICAgICA/IG1lZGlhLnBhdGhcbiAgICAgICAgICA6IGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHttZWRpYS5wYXRofWAsXG4gICAgICApXG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnSW1hZ2UgdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5JywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCB1cGxvYWQgaW1hZ2UnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFVwbG9hZGluZyhmYWxzZSlcbiAgICAgIGlmIChmaWxlUmVmLmN1cnJlbnQpIGZpbGVSZWYuY3VycmVudC52YWx1ZSA9ICcnXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIHByb2R1Y3QnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ1Byb2R1Y3Qgc2F2ZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgcHJvZHVjdCcsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gIH1cblxuICBjb25zdCBkZXNjcmlwdGlvblByb3BlcnR5ID0gcmVzb3VyY2UuZWRpdFByb3BlcnRpZXMuZmluZChcbiAgICAocHJvcGVydHkpID0+IHByb3BlcnR5LnByb3BlcnR5UGF0aCA9PT0gJ2Rlc2NyaXB0aW9uJyxcbiAgKVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntwYXJhbXMubmFtZSB8fCAnTmV3IHByb2R1Y3QnfTwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5BZGQgcGhvdG9zLCBwcmljZXMsIGFuZCBvbmUgb3IgbW9yZSBjYXRlZ29yaWVzIGZvciB0aGUgd2Vic2l0ZSBhbmQgYXBwLjwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlByb2R1Y3QgZGV0YWlsczwvaDQ+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgTmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25Qcm9wZXJ0eUNoYW5nZSgnbmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQWxwaG9uc28gTWFuZ29cIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFNsdWdcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17c2x1Z0lucHV0fVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblByb3BlcnR5Q2hhbmdlKCdzbHVnJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJhdXRvLWdlbmVyYXRlZCBmcm9tIG5hbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxUZXh0IG10PVwic21cIiBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgUHJldmlldzp7JyAnfVxuICAgICAgICAgICAge3Byb2R1Y3RVcmwgPyAoXG4gICAgICAgICAgICAgIDxhIGhyZWY9e3Byb2R1Y3RVcmx9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXJcIj5cbiAgICAgICAgICAgICAgICB7cHJvZHVjdFVybH1cbiAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgJ0dlbmVyYXRlZCBmcm9tIHByb2R1Y3QgbmFtZSB3aGVuIHNhdmVkJ1xuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIFByaWNlICjigrkpXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucHJpY2VWYWx1ZSA/PyAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgncHJpY2VWYWx1ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIE9sZCBwcmljZSAo4oK5KVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm9sZFByaWNlVmFsdWUgPz8gJyd9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ29sZFByaWNlVmFsdWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiT3B0aW9uYWxcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgV2VpZ2h0XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy53ZWlnaHQgfHwgJyd9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3dlaWdodCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIxIGtnXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIEJhZGdlXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5iYWRnZSB8fCAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnYmFkZ2UnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRnJlc2hcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgU3RvY2tcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnN0b2NrID8/IDEwMH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnc3RvY2snLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgU29ydCBvcmRlclxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc29ydE9yZGVyID8/IDB9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3NvcnRPcmRlcicsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+VGF4ICYgR1NUPC9oND5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogMTIgfX0+XG4gICAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICAgIGNoZWNrZWQ9e2lzRmxhZ09uKHBhcmFtcy5pc1RheGFibGUpfVxuICAgICAgICAgICAgICB0aXRsZT1cIlRheGFibGVcIlxuICAgICAgICAgICAgICBoaW50PXtpc0ZsYWdPbihwYXJhbXMuaXNUYXhhYmxlKSA/ICdHU1Qgd2lsbCBiZSBjaGFyZ2VkIGF0IGNoZWNrb3V0JyA6ICdObyBHU1Qgb24gdGhpcyBwcm9kdWN0J31cbiAgICAgICAgICAgICAgb25MYWJlbD1cIlllc1wiXG4gICAgICAgICAgICAgIG9mZkxhYmVsPVwiTm9cIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRGaWVsZCgnaXNUYXhhYmxlJywgbmV4dClcbiAgICAgICAgICAgICAgICBpZiAobmV4dCAmJiBOdW1iZXIocGFyYW1zLmdzdFJhdGUgfHwgMCkgPT09IDApIHNldEZpZWxkKCdnc3RSYXRlJywgNSlcbiAgICAgICAgICAgICAgICBpZiAoIW5leHQpIHNldEZpZWxkKCdnc3RSYXRlJywgMClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIEhTTiBDb2RlXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5oc25Db2RlID8/ICcwODA4J31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnaHNuQ29kZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIwODAyIG9yIDA4MDhcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgR1NUICVcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5nc3RSYXRlID8/IDB9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2dzdFJhdGUnLCBOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKSB8fCAwKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjVcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlByb2R1Y3QgaW1hZ2U8L2g0PlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS11cGxvYWQtZHJvcFwiPlxuICAgICAgICAgICAge2Rpc3BsYXllZEltYWdlVXJsID8gKFxuICAgICAgICAgICAgICA8aW1nIHNyYz17ZGlzcGxheWVkSW1hZ2VVcmx9IGFsdD17cGFyYW1zLm5hbWUgfHwgJ1Byb2R1Y3QgcHJldmlldyd9IC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8c3Bhbj5DbGljayB0byB1cGxvYWQgYSBzcXVhcmUgcHJvZHVjdCBwaG90bzwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8aW5wdXQgcmVmPXtmaWxlUmVmfSB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiBvbkNoYW5nZT17dXBsb2FkSW1hZ2V9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8VGV4dCBtdD1cInNtXCIgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgIEpQRywgUE5HLCBHSUYsIG9yIFdlYlAgdXAgdG8gNU1CLlxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5DYXRlZ29yaWVzPC9oND5cbiAgICAgICAgPHA+QSBwcm9kdWN0IGNhbiBhcHBlYXIgaW4gbW9yZSB0aGFuIG9uZSBjYXRlZ29yeSBvbiB0aGUgd2Vic2l0ZSBhbmQgYXBwLjwvcD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIFNlbGVjdCBjYXRlZ29yaWVzXG4gICAgICAgICAgPFNlYXJjaGFibGVNdWx0aVNlbGVjdFxuICAgICAgICAgICAgb3B0aW9ucz17Y2F0ZWdvcmllcy5tYXAoKGl0ZW0pID0+ICh7IHZhbHVlOiBpdGVtLnNsdWcsIGxhYmVsOiBpdGVtLmxhYmVsIH0pKX1cbiAgICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZENhdGVnb3J5U2x1Z3N9XG4gICAgICAgICAgICBvbkNoYW5nZT17c2V0U2VsZWN0ZWRDYXRlZ29yaWVzfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggYW5kIHNlbGVjdCBjYXRlZ29yaWVzXCJcbiAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIGNhdGVnb3JpZXNcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5TdG9yZSBwbGFjZW1lbnQ8L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNob2ljZS1yb3dcIj5cbiAgICAgICAgICA8RmxhZ0NhcmRcbiAgICAgICAgICAgIHNlbGVjdGVkPXtwYXJhbXMuaXNCZXN0U2VsbGVyID09PSB0cnVlIHx8IHBhcmFtcy5pc0Jlc3RTZWxsZXIgPT09ICd0cnVlJ31cbiAgICAgICAgICAgIHRpdGxlPVwiQmVzdHNlbGxlclwiXG4gICAgICAgICAgICBoaW50PVwiU2hvdyBpbiBiZXN0c2VsbGVyc1wiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgnaXNCZXN0U2VsbGVyJywgIShwYXJhbXMuaXNCZXN0U2VsbGVyID09PSB0cnVlIHx8IHBhcmFtcy5pc0Jlc3RTZWxsZXIgPT09ICd0cnVlJykpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEZsYWdDYXJkXG4gICAgICAgICAgICBzZWxlY3RlZD17cGFyYW1zLmlzSW1wb3J0ZWQgPT09IHRydWUgfHwgcGFyYW1zLmlzSW1wb3J0ZWQgPT09ICd0cnVlJ31cbiAgICAgICAgICAgIHRpdGxlPVwiSW1wb3J0ZWRcIlxuICAgICAgICAgICAgaGludD1cIlNob3cgaW4gaW1wb3J0ZWQgZnJ1aXRzXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCdpc0ltcG9ydGVkJywgIShwYXJhbXMuaXNJbXBvcnRlZCA9PT0gdHJ1ZSB8fCBwYXJhbXMuaXNJbXBvcnRlZCA9PT0gJ3RydWUnKSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8RmxhZ0NhcmRcbiAgICAgICAgICAgIHNlbGVjdGVkPXtwYXJhbXMuaXNGZWF0dXJlZCA9PT0gdHJ1ZSB8fCBwYXJhbXMuaXNGZWF0dXJlZCA9PT0gJ3RydWUnfVxuICAgICAgICAgICAgdGl0bGU9XCJGZWF0dXJlZFwiXG4gICAgICAgICAgICBoaW50PVwiSGlnaGxpZ2h0IHRoaXMgZnJ1aXRcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ2lzRmVhdHVyZWQnLCAhKHBhcmFtcy5pc0ZlYXR1cmVkID09PSB0cnVlIHx8IHBhcmFtcy5pc0ZlYXR1cmVkID09PSAndHJ1ZScpKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGbGFnQ2FyZFxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3BhcmFtcy5pc0FjdGl2ZSAhPT0gZmFsc2UgJiYgcGFyYW1zLmlzQWN0aXZlICE9PSAnZmFsc2UnfVxuICAgICAgICAgICAgdGl0bGU9XCJBY3RpdmVcIlxuICAgICAgICAgICAgaGludD1cIlZpc2libGUgdG8gY3VzdG9tZXJzXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+XG4gICAgICAgICAgICAgIHNldEZpZWxkKCdpc0FjdGl2ZScsICEocGFyYW1zLmlzQWN0aXZlICE9PSBmYWxzZSAmJiBwYXJhbXMuaXNBY3RpdmUgIT09ICdmYWxzZScpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+RGVzY3JpcHRpb248L2g0PlxuICAgICAgICB7ZGVzY3JpcHRpb25Qcm9wZXJ0eSA/IChcbiAgICAgICAgICA8Qm94IHN0eWxlPXt7IG1pbkhlaWdodDogMjIwIH19PlxuICAgICAgICAgICAgPEJhc2VQcm9wZXJ0eUNvbXBvbmVudFxuICAgICAgICAgICAgICB3aGVyZT1cImVkaXRcIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17b25Qcm9wZXJ0eUNoYW5nZX1cbiAgICAgICAgICAgICAgcHJvcGVydHk9e2Rlc2NyaXB0aW9uUHJvcGVydHl9XG4gICAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmcgfHwgdXBsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyB8fCB1cGxvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgU2F2ZSBwcm9kdWN0XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJvZHVjdEVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBCYXNlUHJvcGVydHlDb21wb25lbnQsIHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IEZsYWdDYXJkIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3Qgbm9ybWFsaXplU2x1Z0lucHV0ID0gKHZhbHVlKSA9PlxuICBTdHJpbmcodmFsdWUgfHwgJycpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAudHJpbSgpXG4gICAgLnJlcGxhY2UoL1snXCJdL2csICcnKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi0rfC0rJC9nLCAnJylcblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuY29uc3QgQ2F0ZWdvcnlFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IGZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgYmFubmVyRmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbdXBsb2FkaW5nLCBzZXRVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtiYW5uZXJVcGxvYWRpbmcsIHNldEJhbm5lclVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NsdWdFZGl0ZWQsIHNldFNsdWdFZGl0ZWRdID0gdXNlU3RhdGUoQm9vbGVhbihpbml0aWFsUmVjb3JkPy5wYXJhbXM/LnNsdWcpKVxuICBjb25zdCBbcHJldmlld1VybCwgc2V0UHJldmlld1VybF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2Jhbm5lclByZXZpZXdVcmwsIHNldEJhbm5lclByZXZpZXdVcmxdID0gdXNlU3RhdGUoJycpXG5cbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgY3VzdG9tID0gcmVzb3VyY2U/Lm9wdGlvbnM/LmN1c3RvbSB8fCB7fVxuICBjb25zdCBhcGlCYXNlVXJsID0gd2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwaUJhc2VVcmwgfHwgJy9hcGkvdjEnKVxuICBjb25zdCBjYXRlZ29yeVVybEJhc2UgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChcbiAgICBjdXN0b20uY2F0ZWdvcnlVcmxCYXNlIHx8IGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59L2NhdGVnb3J5YCxcbiAgKVxuICBjb25zdCBzbHVnSW5wdXQgPSBwYXJhbXMuc2x1ZyA/PyAnJ1xuICBjb25zdCBwcmV2aWV3U2x1ZyA9IG5vcm1hbGl6ZVNsdWdJbnB1dChzbHVnSW5wdXQpIHx8IG5vcm1hbGl6ZVNsdWdJbnB1dChwYXJhbXMubGFiZWwpXG4gIGNvbnN0IGNhdGVnb3J5VXJsID0gcHJldmlld1NsdWcgPyBgJHtjYXRlZ29yeVVybEJhc2V9LyR7cHJldmlld1NsdWd9YCA6IG51bGxcblxuICBjb25zdCBpbWFnZVVybCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghcGFyYW1zLmltYWdlKSByZXR1cm4gJydcbiAgICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGFyYW1zLmltYWdlKSkgcmV0dXJuIHBhcmFtcy5pbWFnZVxuICAgIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGFyYW1zLmltYWdlfWBcbiAgfSwgW2N1c3RvbS5hcHBVcmwsIHBhcmFtcy5pbWFnZV0pXG5cbiAgY29uc3QgZGlzcGxheWVkSW1hZ2VVcmwgPSBwcmV2aWV3VXJsIHx8IGltYWdlVXJsXG5cbiAgY29uc3QgYmFubmVySW1hZ2VVcmwgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIXBhcmFtcy5iYW5uZXJJbWFnZSkgcmV0dXJuICcnXG4gICAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhcmFtcy5iYW5uZXJJbWFnZSkpIHJldHVybiBwYXJhbXMuYmFubmVySW1hZ2VcbiAgICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke3BhcmFtcy5iYW5uZXJJbWFnZX1gXG4gIH0sIFtjdXN0b20uYXBwVXJsLCBwYXJhbXMuYmFubmVySW1hZ2VdKVxuXG4gIGNvbnN0IGRpc3BsYXllZEJhbm5lclVybCA9IGJhbm5lclByZXZpZXdVcmwgfHwgYmFubmVySW1hZ2VVcmxcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAocHJldmlld1VybD8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChwcmV2aWV3VXJsKVxuICAgIH1cbiAgfSwgW3ByZXZpZXdVcmxdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChiYW5uZXJQcmV2aWV3VXJsPy5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKGJhbm5lclByZXZpZXdVcmwpXG4gICAgfVxuICB9LCBbYmFubmVyUHJldmlld1VybF0pXG5cbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgb25Qcm9wZXJ0eUNoYW5nZSA9IChwcm9wZXJ0eVBhdGgsIHZhbHVlLCAuLi5yZXN0KSA9PiB7XG4gICAgaWYgKHByb3BlcnR5UGF0aCA9PT0gJ3NsdWcnKSB7XG4gICAgICBzZXRTbHVnRWRpdGVkKHRydWUpXG4gICAgICBoYW5kbGVDaGFuZ2UocHJvcGVydHlQYXRoLCBub3JtYWxpemVTbHVnSW5wdXQodmFsdWUpLCAuLi5yZXN0KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGhhbmRsZUNoYW5nZShwcm9wZXJ0eVBhdGgsIHZhbHVlLCAuLi5yZXN0KVxuICAgIGlmIChwcm9wZXJ0eVBhdGggPT09ICdsYWJlbCcgJiYgIXNsdWdFZGl0ZWQpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnc2x1ZycsIG5vcm1hbGl6ZVNsdWdJbnB1dCh2YWx1ZSkpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgdXBsb2FkVG8gPSBhc3luYyAoZmlsZSwgZmllbGQsIHNldExvY2FsUHJldmlldywgc2V0QnVzeSwgc3VjY2Vzc01lc3NhZ2UpID0+IHtcbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmb2xkZXInLCAnY2F0ZWdvcmllcycpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSlcbiAgICBzZXRMb2NhbFByZXZpZXcoVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKSlcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vbWVkaWEvdXBsb2FkYCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogZm9ybURhdGEsXG4gICAgICB9KVxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJvciA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSB8fCAnSW1hZ2UgdXBsb2FkIGZhaWxlZCcpXG4gICAgICB9XG4gICAgICBjb25zdCBtZWRpYSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgICAgb25Qcm9wZXJ0eUNoYW5nZShmaWVsZCwgbWVkaWEucGF0aClcbiAgICAgIHNldExvY2FsUHJldmlldyhcbiAgICAgICAgL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QobWVkaWEucGF0aClcbiAgICAgICAgICA/IG1lZGlhLnBhdGhcbiAgICAgICAgICA6IGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHttZWRpYS5wYXRofWAsXG4gICAgICApXG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBzdWNjZXNzTWVzc2FnZSwgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCB1cGxvYWQgaW1hZ2UnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIGNhdGVnb3J5JywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDYXRlZ29yeSBzYXZlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSBjYXRlZ29yeScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gIH1cblxuICBjb25zdCBkZXNjcmlwdGlvblByb3BlcnR5ID0gcmVzb3VyY2UuZWRpdFByb3BlcnRpZXMuZmluZChcbiAgICAocHJvcGVydHkpID0+IHByb3BlcnR5LnByb3BlcnR5UGF0aCA9PT0gJ2Rlc2NyaXB0aW9uJyxcbiAgKVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntwYXJhbXMubGFiZWwgfHwgJ05ldyBjYXRlZ29yeSd9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPkNyZWF0ZSBhIHNob3Agc2VjdGlvbiB3aXRoIGEgdGh1bWJuYWlsLCBiYW5uZXIsIGFuZCBwYWdlIGNvcHkuPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+Q2F0ZWdvcnkgZGV0YWlsczwvaDQ+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgTGFiZWxcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmxhYmVsIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblByb3BlcnR5Q2hhbmdlKCdsYWJlbCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRnJlc2ggRnJ1aXRzXCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQYWdlIGhlYWRpbmdcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnRpdGxlIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgndGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNhbWUgYXMgbGFiZWwgaWYgZW1wdHlcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFN1YnRpdGxlXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zdWJ0aXRsZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3N1YnRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTaG9ydCBsaW5lIHVuZGVyIHRoZSBoZWFkaW5nXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBTbHVnXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3NsdWdJbnB1dH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25Qcm9wZXJ0eUNoYW5nZSgnc2x1ZycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiYXV0by1nZW5lcmF0ZWQgZnJvbSBsYWJlbFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPFRleHQgbXQ9XCJzbVwiIG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICBQcmV2aWV3OnsnICd9XG4gICAgICAgICAgICB7Y2F0ZWdvcnlVcmwgPyAoXG4gICAgICAgICAgICAgIDxhIGhyZWY9e2NhdGVnb3J5VXJsfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyXCI+XG4gICAgICAgICAgICAgICAge2NhdGVnb3J5VXJsfVxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAnR2VuZXJhdGVkIGZyb20gY2F0ZWdvcnkgbGFiZWwgd2hlbiBzYXZlZCdcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBTb3J0IG9yZGVyXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zb3J0T3JkZXIgPz8gMH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnc29ydE9yZGVyJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIFN0YXR1c1xuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNob2ljZS1yb3dcIiBzdHlsZT17eyBtYXJnaW5Ub3A6IDYgfX0+XG4gICAgICAgICAgICAgICAgPEZsYWdDYXJkXG4gICAgICAgICAgICAgICAgICBzZWxlY3RlZD17cGFyYW1zLmlzQWN0aXZlICE9PSBmYWxzZSAmJiBwYXJhbXMuaXNBY3RpdmUgIT09ICdmYWxzZSd9XG4gICAgICAgICAgICAgICAgICB0aXRsZT1cIkFjdGl2ZVwiXG4gICAgICAgICAgICAgICAgICBoaW50PVwiU2hvd24gb24gd2Vic2l0ZSBhbmQgYXBwXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+XG4gICAgICAgICAgICAgICAgICAgIHNldEZpZWxkKCdpc0FjdGl2ZScsICEocGFyYW1zLmlzQWN0aXZlICE9PSBmYWxzZSAmJiBwYXJhbXMuaXNBY3RpdmUgIT09ICdmYWxzZScpKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkNhdGVnb3J5IGltYWdlPC9oND5cbiAgICAgICAgICA8cD5TcXVhcmUgdGh1bWJuYWlsIHVzZWQgaW4gdGhlIGhvbWUgY2F0ZWdvcnkgZ3JpZC48L3A+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLXVwbG9hZC1kcm9wXCI+XG4gICAgICAgICAgICB7ZGlzcGxheWVkSW1hZ2VVcmwgPyAoXG4gICAgICAgICAgICAgIDxpbWcgc3JjPXtkaXNwbGF5ZWRJbWFnZVVybH0gYWx0PXtwYXJhbXMubGFiZWwgfHwgJ0NhdGVnb3J5IHByZXZpZXcnfSAvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPHNwYW4+Q2xpY2sgdG8gdXBsb2FkIGNhdGVnb3J5IGltYWdlPC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICByZWY9e2ZpbGVSZWZ9XG4gICAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICAgICAgYWNjZXB0PVwiaW1hZ2UvKlwiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICAgICAgICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgICAgICAgdXBsb2FkVG8oZmlsZSwgJ2ltYWdlJywgc2V0UHJldmlld1VybCwgc2V0VXBsb2FkaW5nLCAnSW1hZ2UgdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5JylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJydcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5DYXRlZ29yeSBiYW5uZXI8L2g0PlxuICAgICAgICA8cD5XaWRlIGltYWdlIHNob3duIGF0IHRoZSB0b3Agb2YgdGhlIGNhdGVnb3J5IHBhZ2UuPC9wPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktdXBsb2FkLWRyb3AgdG9rcmktdXBsb2FkLWRyb3Atd2lkZVwiPlxuICAgICAgICAgIHtkaXNwbGF5ZWRCYW5uZXJVcmwgPyAoXG4gICAgICAgICAgICA8aW1nIHNyYz17ZGlzcGxheWVkQmFubmVyVXJsfSBhbHQ9e3BhcmFtcy5sYWJlbCB8fCAnQ2F0ZWdvcnkgYmFubmVyJ30gLz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPHNwYW4+Q2xpY2sgdG8gdXBsb2FkIGEgd2lkZSBiYW5uZXIgKDE2MDDDlzQwMCByZWNvbW1lbmRlZCk8L3NwYW4+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHJlZj17YmFubmVyRmlsZVJlZn1cbiAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICAgIGFjY2VwdD1cImltYWdlLypcIlxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICAgICAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgICAgICB1cGxvYWRUbyhcbiAgICAgICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgICAgICAnYmFubmVySW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgc2V0QmFubmVyUHJldmlld1VybCxcbiAgICAgICAgICAgICAgICAgIHNldEJhbm5lclVwbG9hZGluZyxcbiAgICAgICAgICAgICAgICAgICdCYW5uZXIgdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJydcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkRlc2NyaXB0aW9uPC9oND5cbiAgICAgICAge2Rlc2NyaXB0aW9uUHJvcGVydHkgPyAoXG4gICAgICAgICAgPEJveCBzdHlsZT17eyBtaW5IZWlnaHQ6IDIyMCB9fT5cbiAgICAgICAgICAgIDxCYXNlUHJvcGVydHlDb21wb25lbnRcbiAgICAgICAgICAgICAgd2hlcmU9XCJlZGl0XCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9e29uUHJvcGVydHlDaGFuZ2V9XG4gICAgICAgICAgICAgIHByb3BlcnR5PXtkZXNjcmlwdGlvblByb3BlcnR5fVxuICAgICAgICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgICAgICAgIHJlY29yZD17cmVjb3JkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ25vbmUnIH19IGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICB7cmVzb3VyY2UuZWRpdFByb3BlcnRpZXNcbiAgICAgICAgICAuZmlsdGVyKChwcm9wZXJ0eSkgPT4gWydpbWFnZScsICdiYW5uZXJJbWFnZSddLmluY2x1ZGVzKHByb3BlcnR5LnByb3BlcnR5UGF0aCkpXG4gICAgICAgICAgLm1hcCgocHJvcGVydHkpID0+IChcbiAgICAgICAgICAgIDxCYXNlUHJvcGVydHlDb21wb25lbnRcbiAgICAgICAgICAgICAga2V5PXtwcm9wZXJ0eS5wcm9wZXJ0eVBhdGh9XG4gICAgICAgICAgICAgIHdoZXJlPVwiZWRpdFwiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtvblByb3BlcnR5Q2hhbmdlfVxuICAgICAgICAgICAgICBwcm9wZXJ0eT17cHJvcGVydHl9XG4gICAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpfVxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nIHx8IHVwbG9hZGluZyB8fCBiYW5uZXJVcGxvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nIHx8IHVwbG9hZGluZyB8fCBiYW5uZXJVcGxvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgU2F2ZSBjYXRlZ29yeVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IENhdGVnb3J5RWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBJY29uLCBJbnB1dCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQge1xuICBSZWNvcmRzVGFibGUsXG4gIHVzZVF1ZXJ5UGFyYW1zLFxuICB1c2VSZWNvcmRzLFxuICB1c2VTZWxlY3RlZFJlY29yZHMsXG59IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBMb2NhbFNlbGVjdCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IFBFUl9QQUdFX09QVElPTlMgPSBbMTAsIDI1LCA1MF1cblxuY29uc3QgQ21zTGlzdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlc291cmNlLCBzZXRUYWcgfSA9IHByb3BzXG4gIGNvbnN0IHRpdGxlUHJvcCA9IHJlc291cmNlLnRpdGxlUHJvcGVydHk/Lm5hbWUgfHwgcmVzb3VyY2UudGl0bGVQcm9wZXJ0eT8ucHJvcGVydHlQYXRoIHx8ICdpZCdcblxuICBjb25zdCB7IHN0b3JlUGFyYW1zLCBmaWx0ZXJzLCBwYXJzZWRRdWVyeSB9ID0gdXNlUXVlcnlQYXJhbXMoKVxuICBjb25zdCB7XG4gICAgcmVjb3JkcyxcbiAgICBsb2FkaW5nLFxuICAgIGRpcmVjdGlvbixcbiAgICBzb3J0QnksXG4gICAgcGFnZSxcbiAgICB0b3RhbCxcbiAgICBmZXRjaERhdGEsXG4gICAgcGVyUGFnZSxcbiAgfSA9IHVzZVJlY29yZHMocmVzb3VyY2UuaWQpXG4gIGNvbnN0IHtcbiAgICBzZWxlY3RlZFJlY29yZHMsXG4gICAgaGFuZGxlU2VsZWN0LFxuICAgIGhhbmRsZVNlbGVjdEFsbCxcbiAgICBzZXRTZWxlY3RlZFJlY29yZHMsXG4gIH0gPSB1c2VTZWxlY3RlZFJlY29yZHMocmVjb3JkcylcblxuICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9IHVzZVN0YXRlKCgpID0+IFN0cmluZyhwYXJzZWRRdWVyeT8ucSB8fCBmaWx0ZXJzPy5bdGl0bGVQcm9wXSB8fCAnJykpXG4gIGNvbnN0IGRlYm91bmNlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0b3JlUGFyYW1zUmVmID0gdXNlUmVmKHN0b3JlUGFyYW1zKVxuICBzdG9yZVBhcmFtc1JlZi5jdXJyZW50ID0gc3RvcmVQYXJhbXNcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFF1ZXJ5KFN0cmluZyhwYXJzZWRRdWVyeT8ucSB8fCBmaWx0ZXJzPy5bdGl0bGVQcm9wXSB8fCAnJykpXG4gICAgc2V0U2VsZWN0ZWRSZWNvcmRzKFtdKVxuICB9LCBbcmVzb3VyY2UuaWQsIHRpdGxlUHJvcCwgc2V0U2VsZWN0ZWRSZWNvcmRzXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZXRUYWcpIHNldFRhZyh0b3RhbC50b1N0cmluZygpKVxuICB9LCBbdG90YWwsIHNldFRhZ10pXG5cbiAgY29uc3QgaGFuZGxlUXVlcnlDaGFuZ2UgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgIHNldFF1ZXJ5KHZhbHVlKVxuXG4gICAgaWYgKGRlYm91bmNlUmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChkZWJvdW5jZVJlZi5jdXJyZW50KVxuICAgIGRlYm91bmNlUmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnN0IHRyaW1tZWQgPSB2YWx1ZS50cmltKClcbiAgICAgIHN0b3JlUGFyYW1zUmVmLmN1cnJlbnQoe1xuICAgICAgICBwYWdlOiAnMScsXG4gICAgICAgIHE6IHRyaW1tZWQsXG4gICAgICAgIGZpbHRlcnM6IHRyaW1tZWQgPyB7IFt0aXRsZVByb3BdOiB0cmltbWVkIH0gOiB7fSxcbiAgICAgIH0pXG4gICAgfSwgMzAwKVxuICB9XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGRlYm91bmNlUmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChkZWJvdW5jZVJlZi5jdXJyZW50KVxuICAgIH1cbiAgfSwgW10pXG5cbiAgY29uc3QgaGFuZGxlQWN0aW9uUGVyZm9ybWVkID0gKCkgPT4gZmV0Y2hEYXRhKClcblxuICBjb25zdCBjdXJyZW50UGFnZSA9IE51bWJlcihwYWdlKSB8fCAxXG4gIGNvbnN0IHJvd3NQZXJQYWdlID0gTnVtYmVyKHBlclBhZ2UpIHx8IDEwXG4gIGNvbnN0IHRvdGFsUm93cyA9IE51bWJlcih0b3RhbCkgfHwgMFxuICBjb25zdCB0b3RhbFBhZ2VzID0gTWF0aC5tYXgoMSwgTWF0aC5jZWlsKHRvdGFsUm93cyAvIHJvd3NQZXJQYWdlKSB8fCAxKVxuICBjb25zdCBmcm9tID0gdG90YWxSb3dzID09PSAwID8gMCA6IChjdXJyZW50UGFnZSAtIDEpICogcm93c1BlclBhZ2UgKyAxXG4gIGNvbnN0IHRvID0gTWF0aC5taW4oY3VycmVudFBhZ2UgKiByb3dzUGVyUGFnZSwgdG90YWxSb3dzKVxuXG4gIGNvbnN0IGdvVG9QYWdlID0gKG5leHRQYWdlKSA9PiB7XG4gICAgY29uc3Qgc2FmZSA9IE1hdGgubWluKE1hdGgubWF4KDEsIG5leHRQYWdlKSwgdG90YWxQYWdlcylcbiAgICBzdG9yZVBhcmFtcyh7XG4gICAgICBwYWdlOiBTdHJpbmcoc2FmZSksXG4gICAgICBxOiBwYXJzZWRRdWVyeT8ucSB8fCBmaWx0ZXJzPy5bdGl0bGVQcm9wXSB8fCB1bmRlZmluZWQsXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNoYW5nZVBlclBhZ2UgPSAobmV4dCkgPT4ge1xuICAgIHN0b3JlUGFyYW1zKHtcbiAgICAgIHBhZ2U6ICcxJyxcbiAgICAgIHBlclBhZ2U6IFN0cmluZyhuZXh0KSxcbiAgICAgIHE6IHBhcnNlZFF1ZXJ5Py5xIHx8IGZpbHRlcnM/Llt0aXRsZVByb3BdIHx8IHVuZGVmaW5lZCxcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgcGFnZU51bWJlcnMgPSBbXVxuICBjb25zdCB3aW5kb3dTaXplID0gNVxuICBsZXQgc3RhcnQgPSBNYXRoLm1heCgxLCBjdXJyZW50UGFnZSAtIE1hdGguZmxvb3Iod2luZG93U2l6ZSAvIDIpKVxuICBsZXQgZW5kID0gTWF0aC5taW4odG90YWxQYWdlcywgc3RhcnQgKyB3aW5kb3dTaXplIC0gMSlcbiAgc3RhcnQgPSBNYXRoLm1heCgxLCBlbmQgLSB3aW5kb3dTaXplICsgMSlcbiAgZm9yIChsZXQgbnVtYmVyID0gc3RhcnQ7IG51bWJlciA8PSBlbmQ7IG51bWJlciArPSAxKSBwYWdlTnVtYmVycy5wdXNoKG51bWJlcilcblxuICByZXR1cm4gKFxuICAgIDxCb3ggdmFyaWFudD1cImdyZXlcIj5cbiAgICAgIDxCb3ggbWI9XCJsZ1wiIHN0eWxlPXt7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCBtYXhXaWR0aDogNDIwIH19PlxuICAgICAgICA8Qm94XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgdG9wOiAnNTAlJyxcbiAgICAgICAgICAgIGxlZnQ6IDEyLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgtNTAlKScsXG4gICAgICAgICAgICBwb2ludGVyRXZlbnRzOiAnbm9uZScsXG4gICAgICAgICAgICBvcGFjaXR5OiAwLjYsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxJY29uIGljb249XCJTZWFyY2hcIiAvPlxuICAgICAgICA8L0JveD5cbiAgICAgICAgPElucHV0XG4gICAgICAgICAgdmFsdWU9e3F1ZXJ5fVxuICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVRdWVyeUNoYW5nZX1cbiAgICAgICAgICBwbGFjZWhvbGRlcj17YFNlYXJjaCBhbGwgJHtyZXNvdXJjZS5uYW1lfS4uLmB9XG4gICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZ0xlZnQ6IDM2IH19XG4gICAgICAgIC8+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCB2YXJpYW50PVwiY29udGFpbmVyXCI+XG4gICAgICAgIDxSZWNvcmRzVGFibGVcbiAgICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgICAgcmVjb3Jkcz17cmVjb3Jkc31cbiAgICAgICAgICBhY3Rpb25QZXJmb3JtZWQ9e2hhbmRsZUFjdGlvblBlcmZvcm1lZH1cbiAgICAgICAgICBvblNlbGVjdD17aGFuZGxlU2VsZWN0fVxuICAgICAgICAgIG9uU2VsZWN0QWxsPXtoYW5kbGVTZWxlY3RBbGx9XG4gICAgICAgICAgc2VsZWN0ZWRSZWNvcmRzPXtzZWxlY3RlZFJlY29yZHN9XG4gICAgICAgICAgZGlyZWN0aW9uPXtkaXJlY3Rpb259XG4gICAgICAgICAgc29ydEJ5PXtzb3J0Qnl9XG4gICAgICAgICAgaXNMb2FkaW5nPXtsb2FkaW5nfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbGlzdC1wYWdpbmF0aW9uXCI+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidG9rcmktbGlzdC1wYWdpbmF0aW9uLXN1bW1hcnlcIj5cbiAgICAgICAgICAgIHt0b3RhbFJvd3MgPT09IDAgPyAnTm8gcmVjb3JkcycgOiBgU2hvd2luZyAke2Zyb2194oCTJHt0b30gb2YgJHt0b3RhbFJvd3N9YH1cbiAgICAgICAgICA8L1RleHQ+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxpc3QtcGFnaW5hdGlvbi1zaXplXCI+XG4gICAgICAgICAgICA8c3Bhbj5Sb3dzPC9zcGFuPlxuICAgICAgICAgICAgPExvY2FsU2VsZWN0XG4gICAgICAgICAgICAgIHZhbHVlPXtTdHJpbmcocm93c1BlclBhZ2UpfVxuICAgICAgICAgICAgICBvcHRpb25zPXtQRVJfUEFHRV9PUFRJT05TLm1hcCgob3B0aW9uKSA9PiAoe1xuICAgICAgICAgICAgICAgIHZhbHVlOiBTdHJpbmcob3B0aW9uKSxcbiAgICAgICAgICAgICAgICBsYWJlbDogU3RyaW5nKG9wdGlvbiksXG4gICAgICAgICAgICAgIH0pKX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBjaGFuZ2VQZXJQYWdlKE51bWJlcihuZXh0KSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1saXN0LXBhZ2luYXRpb24tcGFnZXNcIj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRpc2FibGVkPXtjdXJyZW50UGFnZSA8PSAxfSBvbkNsaWNrPXsoKSA9PiBnb1RvUGFnZShjdXJyZW50UGFnZSAtIDEpfT5cbiAgICAgICAgICAgICAgUHJldlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICB7cGFnZU51bWJlcnMubWFwKChudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGtleT17bnVtYmVyfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bnVtYmVyID09PSBjdXJyZW50UGFnZSA/ICdpcy1jdXJyZW50JyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGdvVG9QYWdlKG51bWJlcil9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7bnVtYmVyfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGlzYWJsZWQ9e2N1cnJlbnRQYWdlID49IHRvdGFsUGFnZXN9IG9uQ2xpY2s9eygpID0+IGdvVG9QYWdlKGN1cnJlbnRQYWdlICsgMSl9PlxuICAgICAgICAgICAgICBOZXh0XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBDbXNMaXN0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgTG9jYWxTZWxlY3QsIFN0YXR1c1N3aXRjaCwgaXNGbGFnT24gfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5jb25zdCB3aXRob3V0VHJhaWxpbmdTbGFzaCA9ICh2YWx1ZSkgPT4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9cXC8rJC8sICcnKVxuXG5mdW5jdGlvbiByZXNvbHZlSW1hZ2VVcmwocGF0aCwgYXBwVXJsKSB7XG4gIGlmICghcGF0aCkgcmV0dXJuICcnXG4gIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChwYXRoKSkgcmV0dXJuIHBhdGhcbiAgcmV0dXJuIGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke3BhdGh9YFxufVxuXG5mdW5jdGlvbiBGaWVsZEVycm9yKHsgZXJyb3IgfSkge1xuICBpZiAoIWVycm9yPy5tZXNzYWdlKSByZXR1cm4gbnVsbFxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3IubWVzc2FnZX08L3NwYW4+XG59XG5cbmNvbnN0IFJldmlld0VkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlLCBhY3Rpb24gfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFt1cGxvYWRpbmcsIHNldFVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3ByZXZpZXdVcmwsIHNldFByZXZpZXdVcmxdID0gdXNlU3RhdGUoJycpXG5cbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgaXNOZXcgPSBhY3Rpb24/Lm5hbWUgPT09ICduZXcnIHx8ICFyZWNvcmQ/LmlkXG4gIGNvbnN0IGN1c3RvbSA9IHJlc291cmNlPy5vcHRpb25zPy5jdXN0b20gfHwge31cbiAgY29uc3QgYXBpQmFzZVVybCA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcGlCYXNlVXJsIHx8ICcvYXBpL3YxJylcbiAgY29uc3QgYXBwVXJsID0gY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IHJhdGluZyA9IE1hdGgubWluKDUsIE1hdGgubWF4KDEsIE51bWJlcihwYXJhbXMucmF0aW5nKSB8fCA1KSlcbiAgY29uc3QgaXNBcHByb3ZlZCA9XG4gICAgaXNOZXcgJiYgKHBhcmFtcy5pc0FwcHJvdmVkID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQXBwcm92ZWQgPT09ICcnKVxuICAgICAgPyB0cnVlXG4gICAgICA6IGlzRmxhZ09uKHBhcmFtcy5pc0FwcHJvdmVkKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTmV3ICYmIChwYXJhbXMuaXNBcHByb3ZlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FwcHJvdmVkID09PSAnJykpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnaXNBcHByb3ZlZCcsIHRydWUpXG4gICAgfVxuICAgIGlmIChpc05ldyAmJiAhcGFyYW1zLnJhdGluZykgaGFuZGxlQ2hhbmdlKCdyYXRpbmcnLCA1KVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW2lzTmV3XSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAocHJldmlld1VybD8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChwcmV2aWV3VXJsKVxuICAgIH1cbiAgfSwgW3ByZXZpZXdVcmxdKVxuXG4gIGNvbnN0IGltYWdlVXJsID0gdXNlTWVtbyhcbiAgICAoKSA9PiByZXNvbHZlSW1hZ2VVcmwocGFyYW1zLmltYWdlLCBhcHBVcmwpLFxuICAgIFthcHBVcmwsIHBhcmFtcy5pbWFnZV0sXG4gIClcbiAgY29uc3QgZGlzcGxheWVkSW1hZ2VVcmwgPSBwcmV2aWV3VXJsIHx8IGltYWdlVXJsXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IHVwbG9hZEltYWdlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgaWYgKCFmaWxlKSByZXR1cm5cblxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZvbGRlcicsICdyZXZpZXdzJylcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIGNvbnN0IGxvY2FsUHJldmlld1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSlcbiAgICBzZXRQcmV2aWV3VXJsKGxvY2FsUHJldmlld1VybClcbiAgICBzZXRVcGxvYWRpbmcodHJ1ZSlcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L21lZGlhL3VwbG9hZGAsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgfSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UgfHwgJ0ltYWdlIHVwbG9hZCBmYWlsZWQnKVxuICAgICAgfVxuICAgICAgY29uc3QgbWVkaWEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIHNldEZpZWxkKCdpbWFnZScsIG1lZGlhLnBhdGgpXG4gICAgICBzZXRQcmV2aWV3VXJsKHJlc29sdmVJbWFnZVVybChtZWRpYS5wYXRoLCBhcHBVcmwpKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ1Bob3RvIHVwbG9hZGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCB1cGxvYWQgaW1hZ2UnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFVwbG9hZGluZyhmYWxzZSlcbiAgICAgIGlmIChmaWxlUmVmLmN1cnJlbnQpIGZpbGVSZWYuY3VycmVudC52YWx1ZSA9ICcnXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIHJldmlldycsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBpc05ldyA/ICdSZXZpZXcgY3JlYXRlZCcgOiAnUmV2aWV3IHVwZGF0ZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgcmV2aWV3LiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57aXNOZXcgPyAnQWRkIGhvbWVwYWdlIHJldmlldycgOiBwYXJhbXMudGl0bGUgfHwgJ1Jldmlldyd9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIEFwcHJvdmVkIHJldmlld3MgYXBwZWFyIG9uIHRoZSB3ZWJzaXRlIGhvbWVwYWdlLiBIaWRkZW4gcmV2aWV3cyBzdGF5IGluIENNUyBvbmx5LlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5XZWJzaXRlIHZpc2liaWxpdHk8L2g0PlxuICAgICAgICAgIDxwPlR1cm4gdGhpcyBvZmYgdG8gaGlkZSB0aGUgcmV2aWV3IHdpdGhvdXQgZGVsZXRpbmcgaXQuPC9wPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2lzQXBwcm92ZWR9XG4gICAgICAgICAgICBvbkxhYmVsPVwiQXBwcm92ZWRcIlxuICAgICAgICAgICAgb2ZmTGFiZWw9XCJIaWRkZW5cIlxuICAgICAgICAgICAgdGl0bGU9e2lzQXBwcm92ZWQgPyAnQXBwcm92ZWQnIDogJ0hpZGRlbid9XG4gICAgICAgICAgICBoaW50PXtpc0FwcHJvdmVkID8gJ1Zpc2libGUgb24gdGhlIGhvbWVwYWdlJyA6ICdIaWRkZW4gdW50aWwgeW91IGFwcHJvdmUgaXQnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnaXNBcHByb3ZlZCcsIG5leHQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5SYXRpbmc8L2g0PlxuICAgICAgICAgIDxwPlNob3duIGFzIHN0YXJzIG9uIHRoZSBob21lcGFnZSByZXZpZXcgY2FyZC48L3A+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgU3RhcnNcbiAgICAgICAgICAgIDxMb2NhbFNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17cmF0aW5nfVxuICAgICAgICAgICAgICBvcHRpb25zPXtbNSwgNCwgMywgMiwgMV0ubWFwKCh2YWx1ZSkgPT4gKHtcbiAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICBsYWJlbDogYCR7dmFsdWV9IHN0YXIke3ZhbHVlID09PSAxID8gJycgOiAncyd9YCxcbiAgICAgICAgICAgICAgfSkpfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdyYXRpbmcnLCBOdW1iZXIobmV4dCkpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlJldmlldyB0ZXh0PC9oND5cbiAgICAgICAgPHA+S2VlcCBpdCBzaG9ydC4gVGhpcyBpcyB3aGF0IGN1c3RvbWVycyByZWFkIG9uIHRoZSBob21lcGFnZS48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFRpdGxlXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy50aXRsZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3RpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTdXBlciBmcmVzaCBmcnVpdHNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMudGl0bGV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBSZXZpZXdlciBuYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5uYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUHJpeWEgU2hhcm1hXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLm5hbWV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBSZXZpZXdcbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICByb3dzPXs0fVxuICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY29udGVudCB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdjb250ZW50JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQWx3YXlzIGZyZXNoIGFuZCBkZWxpdmVyZWQgcmlnaHQgb24gdGltZS5cIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5jb250ZW50fSAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+UmV2aWV3ZXIgcGhvdG88L2g0PlxuICAgICAgICA8cD5PcHRpb25hbC4gSWYgZW1wdHksIHRoZSB3ZWJzaXRlIHNob3dzIGluaXRpYWxzIGluc3RlYWQuPC9wPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgUGhvdG9cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS11cGxvYWQtZHJvcCB0b2tyaS11cGxvYWQtZHJvcC1yb3VuZFwiPlxuICAgICAgICAgICAge2Rpc3BsYXllZEltYWdlVXJsID8gKFxuICAgICAgICAgICAgICA8aW1nIHNyYz17ZGlzcGxheWVkSW1hZ2VVcmx9IGFsdD17cGFyYW1zLm5hbWUgfHwgJ1Jldmlld2VyJ30gLz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxzcGFuPnt1cGxvYWRpbmcgPyAnVXBsb2FkaW5n4oCmJyA6ICdDbGljayB0byB1cGxvYWQgYSBwaG90byd9PC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDxpbnB1dCByZWY9e2ZpbGVSZWZ9IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIG9uQ2hhbmdlPXt1cGxvYWRJbWFnZX0gLz5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkpQRywgUE5HLCBHSUYsIG9yIFdlYlAgdXAgdG8gNU1CPC9zcGFuPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZyB8fCB1cGxvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nIHx8IHVwbG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICB7aXNOZXcgPyAnQ3JlYXRlIHJldmlldycgOiAnU2F2ZSByZXZpZXcnfVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFJldmlld0VkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCwgVGlueU1DRSB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuY29uc3QgRURJVE9SX09QVElPTlMgPSB7XG4gIHBsdWdpbnM6IFsnbGluaycsICdsaXN0cycsICdpbWFnZScsICdhdXRvbGluaycsICdjb2RlJywgJ3dvcmRjb3VudCddLFxuICB0b29sYmFyOiAndW5kbyByZWRvIHwgYmxvY2tzIHwgYm9sZCBpdGFsaWMgdW5kZXJsaW5lIHwgYnVsbGlzdCBudW1saXN0IHwgbGluayBpbWFnZSB8IHJlbW92ZWZvcm1hdCcsXG4gIGhlaWdodDogNDIwLFxufVxuXG5mdW5jdGlvbiByZXNvbHZlSW1hZ2VVcmwocGF0aCwgYXBwVXJsKSB7XG4gIGlmICghcGF0aCkgcmV0dXJuICcnXG4gIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChwYXRoKSkgcmV0dXJuIHBhdGhcbiAgcmV0dXJuIGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke3BhdGh9YFxufVxuXG5mdW5jdGlvbiBkYXRlSW5wdXRWYWx1ZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJydcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxuICBpZiAoTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuIFN0cmluZyh2YWx1ZSkuc2xpY2UoMCwgMTApXG4gIGNvbnN0IHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKClcbiAgY29uc3QgbW9udGggPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgJzAnKVxuICBjb25zdCBkYXkgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJylcbiAgcmV0dXJuIGAke3llYXJ9LSR7bW9udGh9LSR7ZGF5fWBcbn1cblxuZnVuY3Rpb24gcGFkKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnBhZFN0YXJ0KDIsICcwJylcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXRlVmFsdWUodmFsdWUpIHtcbiAgY29uc3QgdGV4dCA9IFN0cmluZyh2YWx1ZSB8fCAnJykudHJpbSgpXG4gIGlmICghdGV4dCkgcmV0dXJuIG51bGxcbiAgY29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSkvKVxuICBpZiAobWF0Y2gpIHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoTnVtYmVyKG1hdGNoWzFdKSwgTnVtYmVyKG1hdGNoWzJdKSAtIDEsIE51bWJlcihtYXRjaFszXSkpXG4gICAgcmV0dXJuIE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkgPyBudWxsIDogZGF0ZVxuICB9XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0ZXh0KVxuICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSA/IG51bGwgOiBkYXRlXG59XG5cbmZ1bmN0aW9uIHRvRGF0ZVZhbHVlKGRhdGUpIHtcbiAgcmV0dXJuIGAke2RhdGUuZ2V0RnVsbFllYXIoKX0tJHtwYWQoZGF0ZS5nZXRNb250aCgpICsgMSl9LSR7cGFkKGRhdGUuZ2V0RGF0ZSgpKX1gXG59XG5cbmZ1bmN0aW9uIERhdGVGaWVsZCh7IHZhbHVlLCBvbkNoYW5nZSB9KSB7XG4gIGNvbnN0IHNlbGVjdGVkID0gcGFyc2VEYXRlVmFsdWUodmFsdWUpXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbW9udGhEYXRlLCBzZXRNb250aERhdGVdID0gdXNlU3RhdGUoc2VsZWN0ZWQgfHwgbmV3IERhdGUoKSlcbiAgY29uc3Qgd3JhcFJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbb3BlblVwLCBzZXRPcGVuVXBdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCByZWN0ID0gd3JhcFJlZi5jdXJyZW50Py5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgaWYgKCFyZWN0KSByZXR1cm5cbiAgICAgIGNvbnN0IHNwYWNlQmVsb3cgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSByZWN0LmJvdHRvbVxuICAgICAgc2V0T3BlblVwKHNwYWNlQmVsb3cgPCAzMjAgJiYgcmVjdC50b3AgPiBzcGFjZUJlbG93KVxuICAgIH1cbiAgICB1cGRhdGUoKVxuICAgIGNvbnN0IG9uRG9jQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghd3JhcFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHVwZGF0ZSwgdHJ1ZSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdXBkYXRlLCB0cnVlKVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkKSBzZXRNb250aERhdGUoc2VsZWN0ZWQpXG4gIH0sIFt2YWx1ZV0pXG5cbiAgY29uc3QgeWVhciA9IG1vbnRoRGF0ZS5nZXRGdWxsWWVhcigpXG4gIGNvbnN0IG1vbnRoID0gbW9udGhEYXRlLmdldE1vbnRoKClcbiAgY29uc3QgZmlyc3REYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSkuZ2V0RGF5KClcbiAgY29uc3QgdG90YWxEYXlzID0gbmV3IERhdGUoeWVhciwgbW9udGggKyAxLCAwKS5nZXREYXRlKClcbiAgY29uc3QgY2VsbHMgPSBbXVxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZmlyc3REYXk7IGluZGV4ICs9IDEpIGNlbGxzLnB1c2gobnVsbClcbiAgZm9yIChsZXQgZGF5ID0gMTsgZGF5IDw9IHRvdGFsRGF5czsgZGF5ICs9IDEpIGNlbGxzLnB1c2goZGF5KVxuICBjb25zdCBzZWxlY3RlZERheSA9IHNlbGVjdGVkICYmIHNlbGVjdGVkLmdldEZ1bGxZZWFyKCkgPT09IHllYXIgJiYgc2VsZWN0ZWQuZ2V0TW9udGgoKSA9PT0gbW9udGhcbiAgICA/IHNlbGVjdGVkLmdldERhdGUoKVxuICAgIDogbnVsbFxuXG4gIGNvbnN0IGNob29zZSA9IChkYXkpID0+IHtcbiAgICBvbkNoYW5nZSh0b0RhdGVWYWx1ZShuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF5KSkpXG4gICAgc2V0T3BlbihmYWxzZSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyXCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItY29udHJvbFwiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KX0+XG4gICAgICAgIDxzcGFuPntzZWxlY3RlZCA/IHNlbGVjdGVkLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tR0InKSA6ICdTZWxlY3QgYSBkYXRlJ308L3NwYW4+XG4gICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPvCfk4U8L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLWRhdGVwaWNrZXItcG9wJHtvcGVuVXAgPyAnIGlzLXVwJyA6ICcnfWB9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1uYXZcIj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE1vbnRoRGF0ZShuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpKX0+4oC5PC9idXR0b24+XG4gICAgICAgICAgICA8c3Ryb25nPnttb250aERhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1VUycsIHsgbW9udGg6ICdsb25nJywgeWVhcjogJ251bWVyaWMnIH0pfTwvc3Ryb25nPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0TW9udGhEYXRlKG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMSkpfT7igLo8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItd2Vla1wiPlxuICAgICAgICAgICAge1snUycsICdNJywgJ1QnLCAnVycsICdUJywgJ0YnLCAnUyddLm1hcCgobGFiZWwsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgIDxzcGFuIGtleT17YCR7bGFiZWx9LSR7aW5kZXh9YH0+e2xhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1ncmlkXCI+XG4gICAgICAgICAgICB7Y2VsbHMubWFwKChkYXksIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgIGRheSA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICBrZXk9e2Ake3llYXJ9LSR7bW9udGh9LSR7ZGF5fWB9XG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2VsZWN0ZWREYXkgPT09IGRheSA/ICdpcy1zZWxlY3RlZCcgOiAnJ31cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGNob29zZShkYXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtkYXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiA8c3BhbiBrZXk9e2BlbXB0eS0ke2luZGV4fWB9IC8+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItYWN0aW9uc1wiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1jbGVhclwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZSgnJylcbiAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBDbGVhclxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWNsZWFyXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgICAgIHNldE1vbnRoRGF0ZSh0b2RheSlcbiAgICAgICAgICAgICAgICBvbkNoYW5nZSh0b0RhdGVWYWx1ZSh0b2RheSkpXG4gICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgVG9kYXlcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIEZpZWxkRXJyb3IoeyBlcnJvciB9KSB7XG4gIGlmICghZXJyb3I/Lm1lc3NhZ2UpIHJldHVybiBudWxsXG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPntlcnJvci5tZXNzYWdlfTwvc3Bhbj5cbn1cblxuY29uc3QgQmxvZ0VkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlLCBhY3Rpb24gfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UuaWQpXG4gIGNvbnN0IGZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgW3VwbG9hZGluZywgc2V0VXBsb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcHJldmlld1VybCwgc2V0UHJldmlld1VybF0gPSB1c2VTdGF0ZSgnJylcblxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBpc05ldyA9IGFjdGlvbj8ubmFtZSA9PT0gJ25ldycgfHwgIXJlY29yZD8uaWRcbiAgY29uc3QgY3VzdG9tID0gcmVzb3VyY2U/Lm9wdGlvbnM/LmN1c3RvbSB8fCB7fVxuICBjb25zdCBhcGlCYXNlVXJsID0gd2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwaUJhc2VVcmwgfHwgJy9hcGkvdjEnKVxuICBjb25zdCBhcHBVcmwgPSBjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW5cbiAgY29uc3QgZXJyb3JzID0gdXNlTWVtbygoKSA9PiByZWNvcmQ/LmVycm9ycyB8fCB7fSwgW3JlY29yZD8uZXJyb3JzXSlcbiAgY29uc3QgaXNQdWJsaXNoZWQgPSBpc05ldyAmJiAocGFyYW1zLmlzUHVibGlzaGVkID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzUHVibGlzaGVkID09PSAnJylcbiAgICA/IHRydWVcbiAgICA6IGlzRmxhZ09uKHBhcmFtcy5pc1B1Ymxpc2hlZClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLmlzUHVibGlzaGVkID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzUHVibGlzaGVkID09PSAnJykpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnaXNQdWJsaXNoZWQnLCB0cnVlKVxuICAgIH1cbiAgICBpZiAoaXNOZXcgJiYgIXBhcmFtcy5hdXRob3IpIGhhbmRsZUNoYW5nZSgnYXV0aG9yJywgJ1Rva3JpaWknKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW2lzTmV3XSlcblxuICB1c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGlmIChwcmV2aWV3VXJsPy5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKHByZXZpZXdVcmwpXG4gIH0sIFtwcmV2aWV3VXJsXSlcblxuICBjb25zdCBpbWFnZVVybCA9IHVzZU1lbW8oXG4gICAgKCkgPT4gcmVzb2x2ZUltYWdlVXJsKHBhcmFtcy5jb3ZlckltYWdlLCBhcHBVcmwpLFxuICAgIFthcHBVcmwsIHBhcmFtcy5jb3ZlckltYWdlXSxcbiAgKVxuICBjb25zdCBkaXNwbGF5ZWRJbWFnZVVybCA9IHByZXZpZXdVcmwgfHwgaW1hZ2VVcmxcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3QgdXBsb2FkSW1hZ2UgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICBpZiAoIWZpbGUpIHJldHVyblxuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZm9sZGVyJywgJ2Jsb2cnKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpXG4gICAgY29uc3QgbG9jYWxQcmV2aWV3VXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKVxuICAgIHNldFByZXZpZXdVcmwobG9jYWxQcmV2aWV3VXJsKVxuICAgIHNldFVwbG9hZGluZyh0cnVlKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vbWVkaWEvdXBsb2FkYCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogZm9ybURhdGEsXG4gICAgICB9KVxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJvciA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSB8fCAnSW1hZ2UgdXBsb2FkIGZhaWxlZCcpXG4gICAgICB9XG4gICAgICBjb25zdCBtZWRpYSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgICAgc2V0RmllbGQoJ2NvdmVySW1hZ2UnLCBtZWRpYS5wYXRoKVxuICAgICAgc2V0UHJldmlld1VybChyZXNvbHZlSW1hZ2VVcmwobWVkaWEucGF0aCwgYXBwVXJsKSlcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3ZlciBpbWFnZSB1cGxvYWRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgdXBsb2FkIGltYWdlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRVcGxvYWRpbmcoZmFsc2UpXG4gICAgICBpZiAoZmlsZVJlZi5jdXJyZW50KSBmaWxlUmVmLmN1cnJlbnQudmFsdWUgPSAnJ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBibG9nIHBvc3QnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogaXNOZXcgPyAnQmxvZyBwb3N0IGNyZWF0ZWQnIDogJ0Jsb2cgcG9zdCB1cGRhdGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHRoZSBibG9nIHBvc3QuIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntpc05ldyA/ICdOZXcgYmxvZyBwb3N0JyA6IHBhcmFtcy50aXRsZSB8fCAnQmxvZyBwb3N0J308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgUHVibGlzaGVkIHBvc3RzIGFwcGVhciBvbiB0aGUgd2Vic2l0ZSBhdCAvYmxvZy4gSGlkZGVuIHBvc3RzIHN0YXkgaW4gdGhlIGFkbWluIG9ubHkuXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+V2Vic2l0ZSB2aXNpYmlsaXR5PC9oND5cbiAgICAgICAgPHA+VHVybiB0aGlzIG9mZiB0byBrZWVwIGEgZHJhZnQgd2l0aG91dCBkZWxldGluZyBpdC48L3A+XG4gICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICBjaGVja2VkPXtpc1B1Ymxpc2hlZH1cbiAgICAgICAgICBvbkxhYmVsPVwiUHVibGlzaGVkXCJcbiAgICAgICAgICBvZmZMYWJlbD1cIkRyYWZ0XCJcbiAgICAgICAgICB0aXRsZT17aXNQdWJsaXNoZWQgPyAnUHVibGlzaGVkJyA6ICdEcmFmdCd9XG4gICAgICAgICAgaGludD17aXNQdWJsaXNoZWQgPyAnVmlzaWJsZSBvbiB0aGUgYmxvZycgOiAnSGlkZGVuIHVudGlsIHlvdSBwdWJsaXNoIGl0J31cbiAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdpc1B1Ymxpc2hlZCcsIG5leHQpfVxuICAgICAgICAvPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+UG9zdDwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFRpdGxlXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy50aXRsZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3RpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJIb3cgd2UgcGFjayBhIG1vcm5pbmcgVG9rcmlpaVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy50aXRsZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFVSTCBzbHVnXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zbHVnIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnc2x1ZycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTGVhdmUgYmxhbmsgdG8gdXNlIHRoZSB0aXRsZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPlRoZSBwYWdlIHdpbGwgYmUgL2Jsb2cvdGhpcy1zbHVnPC9zcGFuPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5zbHVnfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBdXRob3JcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmF1dGhvciB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2F1dGhvcicsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVG9rcmlpaVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQ2F0ZWdvcnlcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNhdGVnb3J5IHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnY2F0ZWdvcnknLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkd1aWRlc1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPlNob3duIGFib3ZlIHRoZSB0aXRsZSBvbiB0aGUgYmxvZyBsaXN0aW5nIGFuZCB0aGUgc3RvcnkgcGFnZS48L3NwYW4+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQdWJsaXNoIGRhdGVcbiAgICAgICAgICAgIDxEYXRlRmllbGRcbiAgICAgICAgICAgICAgdmFsdWU9e2RhdGVJbnB1dFZhbHVlKHBhcmFtcy5wdWJsaXNoZWRBdCl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ3B1Ymxpc2hlZEF0JywgbmV4dCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkxlYXZlIGJsYW5rIHRvIHVzZSB0b2RheSB3aGVuIHRoZSBwb3N0IGlzIHB1Ymxpc2hlZC48L3NwYW4+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBTaG9ydCBzdW1tYXJ5XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgcm93cz17M31cbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZXhjZXJwdCB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdleGNlcnB0JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiT25lIG9yIHR3byBsaW5lcyBmb3IgdGhlIGJsb2cgbGlzdGluZy5cIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPklmIHlvdSBsZWF2ZSB0aGlzIGVtcHR5LCB0aGUgZmlyc3QgbGluZXMgb2YgdGhlIHBvc3QgYXJlIHVzZWQuPC9zcGFuPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+Q292ZXIgaW1hZ2U8L2g0PlxuICAgICAgICA8cD5TaG93biBvbiB0aGUgYmxvZyBsaXN0aW5nIGFuZCBhdCB0aGUgdG9wIG9mIHRoZSBzdG9yeS48L3A+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBDb3ZlclxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXVwbG9hZC1kcm9wXCI+XG4gICAgICAgICAgICB7ZGlzcGxheWVkSW1hZ2VVcmwgPyAoXG4gICAgICAgICAgICAgIDxpbWcgc3JjPXtkaXNwbGF5ZWRJbWFnZVVybH0gYWx0PXtwYXJhbXMudGl0bGUgfHwgJ0NvdmVyJ30gLz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxzcGFuPnt1cGxvYWRpbmcgPyAnVXBsb2FkaW5n4oCmJyA6ICdDbGljayB0byB1cGxvYWQgYSBjb3ZlciBpbWFnZSd9PC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDxpbnB1dCByZWY9e2ZpbGVSZWZ9IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIG9uQ2hhbmdlPXt1cGxvYWRJbWFnZX0gLz5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkpQRywgUE5HLCBHSUYsIG9yIFdlYlAgdXAgdG8gNU1CPC9zcGFuPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICB7ZGlzcGxheWVkSW1hZ2VVcmwgPyAoXG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICB2YXJpYW50PVwidGV4dFwiXG4gICAgICAgICAgICBtdD1cImRlZmF1bHRcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRGaWVsZCgnY292ZXJJbWFnZScsICcnKVxuICAgICAgICAgICAgICBzZXRQcmV2aWV3VXJsKCcnKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBSZW1vdmUgY292ZXJcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5TdG9yeTwvaDQ+XG4gICAgICAgIDxUaW55TUNFXG4gICAgICAgICAgdmFsdWU9e3BhcmFtcy5ib2R5IHx8ICcnfVxuICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2JvZHknLCBuZXh0KX1cbiAgICAgICAgICBvcHRpb25zPXtFRElUT1JfT1BUSU9OU31cbiAgICAgICAgLz5cbiAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5ib2R5fSAvPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZyB8fCB1cGxvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nIHx8IHVwbG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICB7aXNOZXcgPyAnUHVibGlzaCBwb3N0JyA6ICdTYXZlIHBvc3QnfVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IEJsb2dFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQge1xuICBCb3gsXG4gIEJ1dHRvbixcbiAgRHJhd2VyQ29udGVudCxcbiAgRHJhd2VyRm9vdGVyLFxuICBINCxcbiAgSWNvbixcbiAgVGV4dCxcbn0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEJhc2VQcm9wZXJ0eUNvbXBvbmVudCwgdXNlUmVjb3JkLCB1c2VOb3RpY2UgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgaXNGbGFnT24sIFNlYXJjaGFibGVNdWx0aVNlbGVjdCwgU3RhdHVzU3dpdGNoIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3QgVEFCUyA9IFtcbiAge1xuICAgIGlkOiAnZ2VuZXJhbCcsXG4gICAgbGFiZWw6ICdHZW5lcmFsJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgICdzdG9yZU5hbWUnLFxuICAgICAgJ3N0b3JlVGFnbGluZScsXG4gICAgICAnc3RvcmVFbWFpbCcsXG4gICAgICAnc3RvcmVQaG9uZTEnLFxuICAgICAgJ3N0b3JlUGhvbmUyJyxcbiAgICAgICdzdG9yZUFkZHJlc3MnLFxuICAgICAgJ3Byb21vQmFubmVyJyxcbiAgICAgICdlYXJseURlbGl2ZXJ5JyxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjaGFyZ2VzJyxcbiAgICBsYWJlbDogJ0NoYXJnZXMnLFxuICAgIGZpZWxkczogW1xuICAgICAgJ21vcm5pbmdEZWxpdmVyeVRpdGxlJyxcbiAgICAgICdtb3JuaW5nRGVsaXZlcnlTdWJ0aXRsZScsXG4gICAgICAnbW9ybmluZ1NoaXBwaW5nRmVlJyxcbiAgICAgICdtb3JuaW5nRnJlZUFib3ZlJyxcbiAgICAgICdleHByZXNzRGVsaXZlcnlUaXRsZScsXG4gICAgICAnZXhwcmVzc0RlbGl2ZXJ5U3VidGl0bGUnLFxuICAgICAgJ2V4cHJlc3NTaGlwcGluZ0ZlZScsXG4gICAgICAnZXhwcmVzc0ZyZWVBYm92ZScsXG4gICAgICAnaGFuZGxpbmdGZWUnLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hvbWVwYWdlJyxcbiAgICBsYWJlbDogJ0hvbWVwYWdlJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgICdob21lQmFubmVySW1hZ2UnLFxuICAgICAgJ2hvbWVNb2JpbGVCYW5uZXJJbWFnZScsXG4gICAgICAnaG9tZUhpZ2hsaWdodEltYWdlJyxcbiAgICAgICdob21lRmVhdHVyZWRDYXRlZ29yeVNsdWdzJyxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICdwYXltZW50cycsXG4gICAgbGFiZWw6ICdQYXltZW50cycsXG4gICAgZmllbGRzOiBbJ3Jhem9ycGF5RW5hYmxlZCcsICdyYXpvcnBheUtleUlkJywgJ3Jhem9ycGF5S2V5U2VjcmV0JywgJ2NvZEVuYWJsZWQnXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnbm90aWZpY2F0aW9ucycsXG4gICAgbGFiZWw6ICdOb3RpZmljYXRpb25zJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgICdtc2c5MUVuYWJsZWQnLFxuICAgICAgJ21zZzkxQXV0aEtleScsXG4gICAgICAnbXNnOTFTZW5kZXJJZCcsXG4gICAgICAnbXNnOTFPdHBUZW1wbGF0ZUlkJyxcbiAgICAgICdtc2c5MU9yZGVyVGVtcGxhdGVJZCcsXG4gICAgICAnbXNnOTFXaGF0c2FwcEVuYWJsZWQnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBOdW1iZXInLFxuICAgICAgJ21zZzkxV2hhdHNhcHBOYW1lc3BhY2UnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBPdHBFbmFibGVkJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwT3RwVGVtcGxhdGUnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBPdHBCdXR0b24nLFxuICAgICAgJ21zZzkxV2hhdHNhcHBPcmRlckVuYWJsZWQnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBPcmRlclRlbXBsYXRlJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwUGFydG5lckVuYWJsZWQnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBQYXJ0bmVyVGVtcGxhdGUnLFxuICAgIF0sXG4gIH0sXG5dXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmZ1bmN0aW9uIHBhcnNlU2x1Z3MocmF3KSB7XG4gIGlmICghcmF3KSByZXR1cm4gW11cbiAgaWYgKEFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIHJhdy5tYXAoKGl0ZW0pID0+IFN0cmluZyhpdGVtKS50cmltKCkpLmZpbHRlcihCb29sZWFuKVxuICBpZiAodHlwZW9mIHJhdyA9PT0gJ3N0cmluZycpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJzZWQpKSByZXR1cm4gcGFyc2VTbHVncyhwYXJzZWQpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmVcbiAgICB9XG4gICAgcmV0dXJuIHJhd1xuICAgICAgLnNwbGl0KCcsJylcbiAgICAgIC5tYXAoKGl0ZW0pID0+IGl0ZW0udHJpbSgpKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICB9XG4gIHJldHVybiBbXVxufVxuXG5mdW5jdGlvbiByZXNvbHZlSW1hZ2VVcmwocGF0aCwgYXBwVXJsKSB7XG4gIGlmICghcGF0aCkgcmV0dXJuICcnXG4gIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChwYXRoKSkgcmV0dXJuIHBhdGhcbiAgcmV0dXJuIGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke3BhdGh9YFxufVxuXG5mdW5jdGlvbiBJbWFnZVVwbG9hZGVyKHtcbiAgbGFiZWwsXG4gIGhpbnQsXG4gIHZhbHVlLFxuICBwcmV2aWV3VXJsLFxuICB1cGxvYWRpbmcsXG4gIGZpbGVSZWYsXG4gIG9uVXBsb2FkLFxuICB3aWRlLFxufSkge1xuICBjb25zdCBkaXNwbGF5ZWQgPSBwcmV2aWV3VXJsIHx8IHZhbHVlXG5cbiAgcmV0dXJuIChcbiAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICB7bGFiZWx9XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2B0b2tyaS11cGxvYWQtZHJvcCR7d2lkZSA/ICcgdG9rcmktdXBsb2FkLWRyb3Atd2lkZScgOiAnJ31gfT5cbiAgICAgICAge2Rpc3BsYXllZCA/IChcbiAgICAgICAgICA8aW1nIHNyYz17ZGlzcGxheWVkfSBhbHQ9e2Ake2xhYmVsfSBwcmV2aWV3YH0gLz5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8c3Bhbj57dXBsb2FkaW5nID8gJ1VwbG9hZGluZ+KApicgOiAnQ2xpY2sgdG8gdXBsb2FkIGFuIGltYWdlJ308L3NwYW4+XG4gICAgICAgICl9XG4gICAgICAgIDxpbnB1dCByZWY9e2ZpbGVSZWZ9IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIG9uQ2hhbmdlPXtvblVwbG9hZH0gLz5cbiAgICAgIDwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj57aGludH08L3NwYW4+XG4gICAgPC9sYWJlbD5cbiAgKVxufVxuXG5jb25zdCBOT1RJRklDQVRJT05fU0VDVElPTlMgPSBbXG4gIHtcbiAgICBpZDogJ3NtcycsXG4gICAgdGl0bGU6ICdTTVMnLFxuICAgIGludHJvOiAnTG9naW4gT1RQIGFuZCBvcmRlciBjb25maXJtYXRpb24gdGhyb3VnaCBNU0c5MSBTTVMuJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgIHsga2V5OiAnbXNnOTFFbmFibGVkJywgdHlwZTogJ3N3aXRjaCcsIGxhYmVsOiAnRW5hYmxlIE1TRzkxIFNNUycgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFBdXRoS2V5JyxcbiAgICAgICAgdHlwZTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgbGFiZWw6ICdNU0c5MSBBdXRoIEtleScsXG4gICAgICAgIGhpbnQ6ICdMZWF2ZSBibGFuayB0byBrZWVwIHRoZSBjdXJyZW50IGtleScsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVNlbmRlcklkJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBsYWJlbDogJ1NlbmRlciBJRCcsXG4gICAgICAgIGhpbnQ6ICc2LWNoYXJhY3RlciBETFQgYXBwcm92ZWQgaGVhZGVyLCBlLmcuIFRPS1JJSScsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MU90cFRlbXBsYXRlSWQnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnTG9naW4gT1RQIHRlbXBsYXRlIElEJyxcbiAgICAgICAgaGludDogJ01TRzkxIFRlbXBsYXRlIElEIGZyb20gdGhlIGNvcHkgaWNvbiwgZS5nLiA2YWFlOTc0OGEzMzdkNzE4OTEwZDMxZjMuIERvIG5vdCBwYXN0ZSB0aGUgMTktZGlnaXQgQWlydGVsIERMVCBJRC4nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFPcmRlclRlbXBsYXRlSWQnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnT3JkZXIgY29uZmlybWF0aW9uIHRlbXBsYXRlIElEJyxcbiAgICAgICAgaGludDogJ01TRzkxIFRlbXBsYXRlIElEIGZyb20gdGhlIGNvcHkgaWNvbiwgZS5nLiA2YWFlOTc4YjFkMGQ2YTEyMTcwYjkzZjQuIERvIG5vdCBwYXN0ZSB0aGUgMTktZGlnaXQgQWlydGVsIERMVCBJRC4nLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICd3aGF0c2FwcCcsXG4gICAgdGl0bGU6ICdXaGF0c0FwcCcsXG4gICAgaW50cm86ICdTaGFyZWQgbnVtYmVyIGFuZCBuYW1lc3BhY2UgZm9yIGV2ZXJ5IFdoYXRzQXBwIHRlbXBsYXRlLicsXG4gICAgZmllbGRzOiBbXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBFbmFibGVkJyxcbiAgICAgICAgdHlwZTogJ3N3aXRjaCcsXG4gICAgICAgIGxhYmVsOiAnRW5hYmxlIE1TRzkxIFdoYXRzQXBwJyxcbiAgICAgICAgaGludDogJ1VzZWQgd2hlbiBTTVMgaXMgb2ZmIG9yIHRoZSBTTVMgZ2F0ZXdheSByZWplY3RzIGEgbWVzc2FnZScsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwTnVtYmVyJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBsYWJlbDogJ1doYXRzQXBwIGJ1c2luZXNzIG51bWJlcicsXG4gICAgICAgIGhpbnQ6ICdUaGUgbnVtYmVyIG9uIHlvdXIgTVNHOTEgV2hhdHNBcHAgYWNjb3VudC4gQSAxMC1kaWdpdCBJbmRpYW4gbW9iaWxlIGdldHMgOTEgYWRkZWQgYXV0b21hdGljYWxseS4nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcE5hbWVzcGFjZScsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdXaGF0c0FwcCB0ZW1wbGF0ZSBuYW1lc3BhY2UnLFxuICAgICAgICBoaW50OiAnUmVxdWlyZWQgYnkgTVNHOTEuIERlbGl2ZXJ5IGFuZCBPVFAgdGVtcGxhdGVzIGFyZSB0b2xkIGFwYXJ0IGJ5IHRoaXMgbmFtZXNwYWNlLicsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ290cCcsXG4gICAgdGl0bGU6ICdPVFAgbWVzc2FnZScsXG4gICAgaW50cm86ICdMb2dpbiBjb2RlIHNlbnQgdG8gdGhlIGN1c3RvbWVyIG9uIFdoYXRzQXBwLicsXG4gICAgZmllbGRzOiBbXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBPdHBFbmFibGVkJyxcbiAgICAgICAgdHlwZTogJ3N3aXRjaCcsXG4gICAgICAgIGxhYmVsOiAnU2VuZCBPVFAgV2hhdHNBcHAnLFxuICAgICAgICBoaW50OiAnTG9naW4gT1RQIHRvIHRoZSBjdXN0b21lcicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwT3RwVGVtcGxhdGUnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnT1RQIHRlbXBsYXRlIG5hbWUnLFxuICAgICAgICBoaW50OiAnQXBwcm92ZWQgTVNHOTEgdGVtcGxhdGUgd2l0aCAxIGJvZHkgdmFyaWFibGU6IHRoZSBPVFAgY29kZScsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwT3RwQnV0dG9uJyxcbiAgICAgICAgdHlwZTogJ3N3aXRjaCcsXG4gICAgICAgIGxhYmVsOiAnT1RQIHRlbXBsYXRlIGhhcyBhIGNvcHktY29kZSBidXR0b24nLFxuICAgICAgICBoaW50OiAnVHVybiBvbiBvbmx5IGlmIHlvdXIgV2hhdHNBcHAgT1RQIHRlbXBsYXRlIGluY2x1ZGVzIHRoZSBjb3B5LWNvZGUgYnV0dG9uJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnb3JkZXInLFxuICAgIHRpdGxlOiAnT3JkZXIgbWVzc2FnZScsXG4gICAgaW50cm86ICdDdXN0b21lciBjb25maXJtYXRpb24gYWZ0ZXIgQ09EIGlzIHBsYWNlZCBvciBvbmxpbmUgcGF5bWVudCBpcyBjb25maXJtZWQuJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcE9yZGVyRW5hYmxlZCcsXG4gICAgICAgIHR5cGU6ICdzd2l0Y2gnLFxuICAgICAgICBsYWJlbDogJ1NlbmQgb3JkZXIgV2hhdHNBcHAnLFxuICAgICAgICBoaW50OiAnQ3VzdG9tZXIgY29uZmlybWF0aW9uIGFmdGVyIENPRCBpcyBwbGFjZWQgb3Igb25saW5lIHBheW1lbnQgaXMgY29uZmlybWVkJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBPcmRlclRlbXBsYXRlJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBsYWJlbDogJ09yZGVyIHRlbXBsYXRlIG5hbWUnLFxuICAgICAgICBoaW50OiAnQXBwcm92ZWQgdGVtcGxhdGUgd2l0aCAzIGJvZHkgdmFyaWFibGVzOiBuYW1lLCBvcmRlciBudW1iZXIsIGFtb3VudCcsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ3BhcnRuZXInLFxuICAgIHRpdGxlOiAnRGVsaXZlcnkgcGFydG5lciBtZXNzYWdlJyxcbiAgICBpbnRybzogJ1NlbnQgYWZ0ZXIgQ09EIGlzIHBsYWNlZCBvciBvbmxpbmUgcGF5bWVudCBpcyBjb25maXJtZWQsIGlmIGEgcGFydG5lciBpcyBhc3NpZ25lZC4nLFxuICAgIGZpZWxkczogW1xuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwUGFydG5lckVuYWJsZWQnLFxuICAgICAgICB0eXBlOiAnc3dpdGNoJyxcbiAgICAgICAgbGFiZWw6ICdTZW5kIGRlbGl2ZXJ5LXBhcnRuZXIgV2hhdHNBcHAnLFxuICAgICAgICBoaW50OiAnU2VudCBhZnRlciBDT0QgaXMgcGxhY2VkIG9yIG9ubGluZSBwYXltZW50IGlzIGNvbmZpcm1lZCwgaWYgYSBwYXJ0bmVyIGlzIGFzc2lnbmVkJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBQYXJ0bmVyVGVtcGxhdGUnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnRGVsaXZlcnktcGFydG5lciB0ZW1wbGF0ZSBuYW1lJyxcbiAgICAgICAgaGludDogJ0FwcHJvdmVkIHRlbXBsYXRlIHRva3JpaWlfZGVsaXZlcnlfYXNzaWduZWQgd2l0aCA4IGJvZHkgdmFyaWFibGVzIGFuZCBhIFNlYXJjaCBpbiBtYXAgYnV0dG9uLiBCdXR0b24gVVJMOiBodHRwczovL3d3dy5nb29nbGUuY29tL21hcHMvc2VhcmNoLz9hcGk9MSZxdWVyeT17ezF9fScsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG5dXG5cbmZ1bmN0aW9uIEZpZWxkVGlwKHsgdGV4dCB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCByZWYgPSB1c2VSZWYobnVsbClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghb3BlbikgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IG9uUG9pbnRlckRvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghcmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGNvbnN0IHRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBvblBvaW50ZXJEb3duKVxuICAgIH0sIDApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG9uUG9pbnRlckRvd24pXG4gICAgfVxuICB9LCBbb3Blbl0pXG5cbiAgcmV0dXJuIChcbiAgICA8c3BhblxuICAgICAgY2xhc3NOYW1lPXtgdG9rcmktaGludCR7b3BlbiA/ICcgaXMtb3BlbicgOiAnJ31gfVxuICAgICAgcmVmPXtyZWZ9XG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpfVxuICAgID5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWhpbnQtdHJpZ2dlclwiXG4gICAgICAgIGFyaWEtbGFiZWw9XCJGaWVsZCBoZWxwXCJcbiAgICAgICAgYXJpYS1leHBhbmRlZD17b3Blbn1cbiAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgc2V0T3BlbigoY3VycmVudCkgPT4gIWN1cnJlbnQpXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgID9cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktaGludC1wb3BcIiByb2xlPVwidG9vbHRpcFwiPlxuICAgICAgICB7dGV4dH1cbiAgICAgIDwvc3Bhbj5cbiAgICA8L3NwYW4+XG4gIClcbn1cblxuZnVuY3Rpb24gTm90aWZ5SW5wdXQoeyBmaWVsZCwgdmFsdWUsIG9uQ2hhbmdlIH0pIHtcbiAgY29uc3QgaXNXaGF0c2FwcE51bWJlciA9IGZpZWxkLmtleSA9PT0gJ21zZzkxV2hhdHNhcHBOdW1iZXInXG4gIGNvbnN0IFtsb2NrZWQsIHNldExvY2tlZF0gPSB1c2VTdGF0ZShmaWVsZC50eXBlID09PSAncGFzc3dvcmQnKVxuXG4gIHJldHVybiAoXG4gICAgPGlucHV0XG4gICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgdHlwZT17ZmllbGQudHlwZSA9PT0gJ3Bhc3N3b3JkJyA/ICdwYXNzd29yZCcgOiAndGV4dCd9XG4gICAgICBuYW1lPXtgdG9rcmktJHtmaWVsZC5rZXl9YH1cbiAgICAgIHZhbHVlPXtpc1doYXRzYXBwTnVtYmVyID8gU3RyaW5nKHZhbHVlID8/ICcnKS5yZXBsYWNlKC9cXEQvZywgJycpIDogdmFsdWV9XG4gICAgICByZWFkT25seT17bG9ja2VkfVxuICAgICAgaW5wdXRNb2RlPXtpc1doYXRzYXBwTnVtYmVyID8gJ251bWVyaWMnIDogdW5kZWZpbmVkfVxuICAgICAgbWF4TGVuZ3RoPXtpc1doYXRzYXBwTnVtYmVyID8gMTUgOiB1bmRlZmluZWR9XG4gICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgYXV0b0NvcnJlY3Q9XCJvZmZcIlxuICAgICAgc3BlbGxDaGVjaz17ZmFsc2V9XG4gICAgICBwbGFjZWhvbGRlcj17XG4gICAgICAgIGZpZWxkLnR5cGUgPT09ICdwYXNzd29yZCdcbiAgICAgICAgICA/ICdMZWF2ZSBibGFuayB0byBrZWVwIHRoZSBjdXJyZW50IGtleSdcbiAgICAgICAgICA6IGlzV2hhdHNhcHBOdW1iZXJcbiAgICAgICAgICAgID8gJ01TRzkxIFdoYXRzQXBwIG51bWJlcidcbiAgICAgICAgICAgIDogdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICBvbkZvY3VzPXsoKSA9PiBzZXRMb2NrZWQoZmFsc2UpfVxuICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT5cbiAgICAgICAgb25DaGFuZ2UoXG4gICAgICAgICAgZmllbGQua2V5LFxuICAgICAgICAgIGlzV2hhdHNhcHBOdW1iZXIgPyBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKS5zbGljZSgwLCAxNSkgOiBldmVudC50YXJnZXQudmFsdWUsXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIE5vdGlmaWNhdGlvbnNGaWVsZHMoeyBwYXJhbXMsIG9uQ2hhbmdlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW5vdGlmeS1maWVsZHNcIj5cbiAgICAgIHtOT1RJRklDQVRJT05fU0VDVElPTlMubWFwKChzZWN0aW9uKSA9PiAoXG4gICAgICAgIDxzZWN0aW9uIGtleT17c2VjdGlvbi5pZH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+e3NlY3Rpb24udGl0bGV9PC9oND5cbiAgICAgICAgICA8cD57c2VjdGlvbi5pbnRyb308L3A+XG4gICAgICAgICAge3NlY3Rpb24uZmllbGRzLm1hcCgoZmllbGQpID0+XG4gICAgICAgICAgICBmaWVsZC50eXBlID09PSAnc3dpdGNoJyA/IChcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e2ZpZWxkLmtleX0gY2xhc3NOYW1lPVwidG9rcmktbm90aWZ5LXN3aXRjaFwiPlxuICAgICAgICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2lzRmxhZ09uKHBhcmFtc1tmaWVsZC5rZXldKX1cbiAgICAgICAgICAgICAgICAgIHRpdGxlPXtmaWVsZC5sYWJlbH1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gb25DaGFuZ2UoZmllbGQua2V5LCBuZXh0KX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHtmaWVsZC5oaW50ID8gPEZpZWxkVGlwIHRleHQ9e2ZpZWxkLmhpbnR9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8bGFiZWwga2V5PXtmaWVsZC5rZXl9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWxhYmVsLWxpbmVcIj5cbiAgICAgICAgICAgICAgICAgIHtmaWVsZC5sYWJlbH1cbiAgICAgICAgICAgICAgICAgIHtmaWVsZC5oaW50ID8gPEZpZWxkVGlwIHRleHQ9e2ZpZWxkLmhpbnR9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPE5vdGlmeUlucHV0XG4gICAgICAgICAgICAgICAgICBmaWVsZD17ZmllbGR9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zW2ZpZWxkLmtleV0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17b25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICksXG4gICAgICAgICAgKX1cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgKSl9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgU2V0dGluZ3NFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgW2FjdGl2ZVRhYiwgc2V0QWN0aXZlVGFiXSA9IHVzZVN0YXRlKCdnZW5lcmFsJylcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IGJhbm5lckZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgbW9iaWxlQmFubmVyRmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBoaWdobGlnaHRGaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFtiYW5uZXJQcmV2aWV3LCBzZXRCYW5uZXJQcmV2aWV3XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbbW9iaWxlQmFubmVyUHJldmlldywgc2V0TW9iaWxlQmFubmVyUHJldmlld10gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2hpZ2hsaWdodFByZXZpZXcsIHNldEhpZ2hsaWdodFByZXZpZXddID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtiYW5uZXJVcGxvYWRpbmcsIHNldEJhbm5lclVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW21vYmlsZUJhbm5lclVwbG9hZGluZywgc2V0TW9iaWxlQmFubmVyVXBsb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaGlnaGxpZ2h0VXBsb2FkaW5nLCBzZXRIaWdobGlnaHRVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjYXRlZ29yaWVzLCBzZXRDYXRlZ29yaWVzXSA9IHVzZVN0YXRlKFtdKVxuXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGN1c3RvbSA9IHJlc291cmNlPy5vcHRpb25zPy5jdXN0b20gfHwge31cbiAgY29uc3QgYXBpQmFzZVVybCA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcGlCYXNlVXJsIHx8ICcvYXBpL3YxJylcbiAgY29uc3QgYXBwVXJsID0gY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luXG4gIGNvbnN0IHNlbGVjdGVkQ2F0ZWdvcnlTbHVncyA9IHBhcnNlU2x1Z3MocGFyYW1zLmhvbWVGZWF0dXJlZENhdGVnb3J5U2x1Z3MpXG5cbiAgY29uc3QgYmFubmVySW1hZ2VVcmwgPSB1c2VNZW1vKFxuICAgICgpID0+IHJlc29sdmVJbWFnZVVybChwYXJhbXMuaG9tZUJhbm5lckltYWdlLCBhcHBVcmwpLFxuICAgIFthcHBVcmwsIHBhcmFtcy5ob21lQmFubmVySW1hZ2VdLFxuICApXG4gIGNvbnN0IG1vYmlsZUJhbm5lckltYWdlVXJsID0gdXNlTWVtbyhcbiAgICAoKSA9PiByZXNvbHZlSW1hZ2VVcmwocGFyYW1zLmhvbWVNb2JpbGVCYW5uZXJJbWFnZSwgYXBwVXJsKSxcbiAgICBbYXBwVXJsLCBwYXJhbXMuaG9tZU1vYmlsZUJhbm5lckltYWdlXSxcbiAgKVxuICBjb25zdCBoaWdobGlnaHRJbWFnZVVybCA9IHVzZU1lbW8oXG4gICAgKCkgPT4gcmVzb2x2ZUltYWdlVXJsKHBhcmFtcy5ob21lSGlnaGxpZ2h0SW1hZ2UsIGFwcFVybCksXG4gICAgW2FwcFVybCwgcGFyYW1zLmhvbWVIaWdobGlnaHRJbWFnZV0sXG4gIClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpXG4gICAgaWYgKGhhc2ggPT09ICdhcHBlYXJhbmNlJykge1xuICAgICAgc2V0QWN0aXZlVGFiKCdjaGFyZ2VzJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoaGFzaCAmJiBUQUJTLnNvbWUoKHRhYikgPT4gdGFiLmlkID09PSBoYXNoKSkge1xuICAgICAgc2V0QWN0aXZlVGFiKGhhc2gpXG4gICAgfVxuICB9LCBbXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCAnJywgYCMke2FjdGl2ZVRhYn1gKVxuICB9LCBbYWN0aXZlVGFiXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoYmFubmVyUHJldmlldz8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChiYW5uZXJQcmV2aWV3KVxuICAgIH1cbiAgfSwgW2Jhbm5lclByZXZpZXddKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChtb2JpbGVCYW5uZXJQcmV2aWV3Py5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKG1vYmlsZUJhbm5lclByZXZpZXcpXG4gICAgfVxuICB9LCBbbW9iaWxlQmFubmVyUHJldmlld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGhpZ2hsaWdodFByZXZpZXc/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwoaGlnaGxpZ2h0UHJldmlldylcbiAgICB9XG4gIH0sIFtoaWdobGlnaHRQcmV2aWV3XSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBpZ25vcmUgPSBmYWxzZVxuICAgIGZldGNoKGAke2FwaUJhc2VVcmx9L2NhdGVnb3JpZXNgKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0Q2F0ZWdvcmllcyhBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFtdKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGlmICghaWdub3JlKSBzZXRDYXRlZ29yaWVzKFtdKVxuICAgICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWdub3JlID0gdHJ1ZVxuICAgIH1cbiAgfSwgW2FwaUJhc2VVcmxdKVxuXG4gIGNvbnN0IHVwbG9hZEltYWdlID0gYXN5bmMgKGV2ZW50LCBmaWVsZCwgc2V0UHJldmlldywgc2V0QnVzeSwgZmlsZVJlZiwgc3VjY2Vzc01lc3NhZ2UpID0+IHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICBpZiAoIWZpbGUpIHJldHVyblxuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZm9sZGVyJywgJ2dlbmVyYWwnKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpXG4gICAgY29uc3QgbG9jYWxQcmV2aWV3VXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKVxuICAgIHNldFByZXZpZXcobG9jYWxQcmV2aWV3VXJsKVxuICAgIHNldEJ1c3kodHJ1ZSlcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L21lZGlhL3VwbG9hZGAsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgfSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UgfHwgJ0ltYWdlIHVwbG9hZCBmYWlsZWQnKVxuICAgICAgfVxuICAgICAgY29uc3QgbWVkaWEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIGhhbmRsZUNoYW5nZShmaWVsZCwgbWVkaWEucGF0aClcbiAgICAgIHNldFByZXZpZXcocmVzb2x2ZUltYWdlVXJsKG1lZGlhLnBhdGgsIGFwcFVybCkpXG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBzdWNjZXNzTWVzc2FnZSwgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCB1cGxvYWQgaW1hZ2UnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgICBpZiAoZmlsZVJlZi5jdXJyZW50KSBmaWxlUmVmLmN1cnJlbnQudmFsdWUgPSAnJ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBzZXR0aW5ncycsXG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAobm90aWNlPy50eXBlID09PSAnc3VjY2VzcycgfHwgcmVzcG9uc2U/LmRhdGE/LnJlY29yZCkge1xuICAgICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgICBtZXNzYWdlOiAnU2V0dGluZ3Mgc2F2ZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgICBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgc2V0dGluZ3MuIFBsZWFzZSB0cnkgYWdhaW4uJyxcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGNsYXNzTmFtZT1cInRva3JpLXNldHRpbmdzLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktc2V0dGluZ3MtdGFic1wiIG1iPVwieGxcIj5cbiAgICAgICAge1RBQlMubWFwKCh0YWIpID0+IChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBrZXk9e3RhYi5pZH1cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgdG9rcmktc2V0dGluZ3MtdGFiJHthY3RpdmVUYWIgPT09IHRhYi5pZCA/ICcgaXMtYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIodGFiLmlkKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7dGFiLmxhYmVsfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApKX1cbiAgICAgIDwvQm94PlxuXG4gICAgICA8RHJhd2VyQ29udGVudD5cbiAgICAgICAge1RBQlMubWFwKCh0YWIpID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0gcmVzb3VyY2UuZWRpdFByb3BlcnRpZXMuZmlsdGVyKChwcm9wZXJ0eSkgPT5cbiAgICAgICAgICAgIHRhYi5maWVsZHMuaW5jbHVkZXMocHJvcGVydHkucHJvcGVydHlQYXRoKSxcbiAgICAgICAgICApXG5cbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJveFxuICAgICAgICAgICAgICBrZXk9e3RhYi5pZH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktc2V0dGluZ3MtcGFuZWxcIlxuICAgICAgICAgICAgICBwPVwieGxcIlxuICAgICAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiBhY3RpdmVUYWIgPT09IHRhYi5pZCA/ICdibG9jaycgOiAnbm9uZScgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEg0IG1iPVwic21cIj57dGFiLmxhYmVsfTwvSDQ+XG4gICAgICAgICAgICAgIDxUZXh0IG1iPVwieGxcIiBvcGFjaXR5PXswLjc1fT5cbiAgICAgICAgICAgICAgICB7dGFiLmlkID09PSAnY2hhcmdlcydcbiAgICAgICAgICAgICAgICAgID8gJ1NldCBjb3B5IGFuZCBwcmljZXMgZm9yIE1vcm5pbmcgYW5kIEV4cHJlc3MgZGVsaXZlcnkuIEhhbmRsaW5nIGZlZSBpcyBhZGRlZCB0byBldmVyeSBvcmRlci4nXG4gICAgICAgICAgICAgICAgICA6IHRhYi5pZCA9PT0gJ2hvbWVwYWdlJ1xuICAgICAgICAgICAgICAgICAgICA/ICdUaGVzZSBpbWFnZXMgYW5kIGNhdGVnb3JpZXMgYXBwZWFyIG9uIHRoZSB3ZWJzaXRlIGhvbWVwYWdlLiBDbGljayBTYXZlIGNoYW5nZXMgYWZ0ZXIgdXBsb2FkaW5nLidcbiAgICAgICAgICAgICAgICAgICAgOiB0YWIuaWQgPT09ICdub3RpZmljYXRpb25zJ1xuICAgICAgICAgICAgICAgICAgICAgID8gJ0F1dGgga2V5LCBXaGF0c0FwcCBudW1iZXIsIGFuZCBuYW1lc3BhY2UgYXJlIHNoYXJlZC4gRWFjaCB0ZW1wbGF0ZSBoYXMgaXRzIG93biBuYW1lIGFuZCBvbi9vZmYgdG9nZ2xlLiBPcmRlciBhbmQgcGFydG5lciBtZXNzYWdlcyBzZW5kIG9ubHkgYWZ0ZXIgQ09EIGlzIHBsYWNlZCBvciB0aGUgb25saW5lIHBheW1lbnQgaXMgY29uZmlybWVkLidcbiAgICAgICAgICAgICAgICAgICAgICA6ICdVcGRhdGUgeW91ciBzdG9yZSBzZXR0aW5ncyBhbmQgY2xpY2sgU2F2ZSBjaGFuZ2VzIGJlbG93Lid9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAge3RhYi5pZCA9PT0gJ2NoYXJnZXMnID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hhcmdlcy1maWVsZHNcIj5cbiAgICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoND5Nb3JuaW5nIGRlbGl2ZXJ5PC9oND5cbiAgICAgICAgICAgICAgICAgICAgPHA+U2hvd24gYXQgY2hlY2tvdXQgd2hlbiB0aGlzIG9wdGlvbiBpcyBvbiBmb3IgdGhlIHBpbmNvZGUuPC9wPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgVGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/Lm1vcm5pbmdEZWxpdmVyeVRpdGxlID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdtb3JuaW5nRGVsaXZlcnlUaXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkZsYXdsZXNzIE1vcm5pbmcgRGVsaXZlcnlcIlxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICBTdWJ0aXRsZVxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8ubW9ybmluZ0RlbGl2ZXJ5U3VidGl0bGUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdEZWxpdmVyeVN1YnRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRnJlc2huZXNzIEd1YXJhbnRlZWRcIlxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIFNoaXBwaW5nIGZlZSAo4oK5KVxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/Lm1vcm5pbmdTaGlwcGluZ0ZlZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdtb3JuaW5nU2hpcHBpbmdGZWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIEZyZWUgYWJvdmUgKOKCuSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5tb3JuaW5nRnJlZUFib3ZlID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdGcmVlQWJvdmUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj4wIG1lYW5zIG5vIGZyZWUgZGVsaXZlcnk8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgICAgICAgICAgICA8aDQ+RXhwcmVzcyBkZWxpdmVyeTwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIDxwPlNob3duIGF0IGNoZWNrb3V0LiBEaXNhYmxlZCBwaW5jb2RlcyBzdGlsbCBzZWUgdGhpcyBhcyBjb21pbmcgc29vbi48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICBUaXRsZVxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8uZXhwcmVzc0RlbGl2ZXJ5VGl0bGUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2V4cHJlc3NEZWxpdmVyeVRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2FtZSBkYXlcIlxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICBTdWJ0aXRsZVxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8uZXhwcmVzc0RlbGl2ZXJ5U3VidGl0bGUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2V4cHJlc3NEZWxpdmVyeVN1YnRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiT24tRGVtYW5kIEx1eHVyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgU2hpcHBpbmcgZmVlICjigrkpXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8uZXhwcmVzc1NoaXBwaW5nRmVlID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2V4cHJlc3NTaGlwcGluZ0ZlZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgRnJlZSBhYm92ZSAo4oK5KVxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/LmV4cHJlc3NGcmVlQWJvdmUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc0ZyZWVBYm92ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPjAgbWVhbnMgbm8gZnJlZSBkZWxpdmVyeTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWwgdG9rcmktY2hhcmdlcy1oYW5kbGluZ1wiPlxuICAgICAgICAgICAgICAgICAgICBIYW5kbGluZyBjaGFyZ2UgKOKCuSlcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5oYW5kbGluZ0ZlZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2hhbmRsaW5nRmVlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkNhcnQgaGFuZGxpbmcgZmVlIGFkZGVkIHRvIGV2ZXJ5IG9yZGVyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKSA6IHRhYi5pZCA9PT0gJ2hvbWVwYWdlJyA/IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWhvbWVwYWdlLWZpZWxkc1wiPlxuICAgICAgICAgICAgICAgICAgPEltYWdlVXBsb2FkZXJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCJIb21lIGJhbm5lciBpbWFnZVwiXG4gICAgICAgICAgICAgICAgICAgIGhpbnQ9XCJEZXNrdG9wIC8gbGFyZ2Utc2NyZWVuIGhlcm8gYmFubmVyLiBKUEcsIFBORywgR0lGLCBvciBXZWJQIHVwIHRvIDVNQi5cIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17YmFubmVySW1hZ2VVcmx9XG4gICAgICAgICAgICAgICAgICAgIHByZXZpZXdVcmw9e2Jhbm5lclByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZGluZz17YmFubmVyVXBsb2FkaW5nfVxuICAgICAgICAgICAgICAgICAgICBmaWxlUmVmPXtiYW5uZXJGaWxlUmVmfVxuICAgICAgICAgICAgICAgICAgICB3aWRlXG4gICAgICAgICAgICAgICAgICAgIG9uVXBsb2FkPXsoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgdXBsb2FkSW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdob21lQmFubmVySW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0QmFubmVyUHJldmlldyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEJhbm5lclVwbG9hZGluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhbm5lckZpbGVSZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQmFubmVyIGltYWdlIHVwbG9hZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8SW1hZ2VVcGxvYWRlclxuICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIkhvbWUgbW9iaWxlIGJhbm5lciBpbWFnZVwiXG4gICAgICAgICAgICAgICAgICAgIGhpbnQ9XCJTaG93biBvbiBwaG9uZXMuIElmIGVtcHR5LCB0aGUgZGVza3RvcCBiYW5uZXIgaXMgdXNlZCBpbnN0ZWFkLlwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXttb2JpbGVCYW5uZXJJbWFnZVVybH1cbiAgICAgICAgICAgICAgICAgICAgcHJldmlld1VybD17bW9iaWxlQmFubmVyUHJldmlld31cbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkaW5nPXttb2JpbGVCYW5uZXJVcGxvYWRpbmd9XG4gICAgICAgICAgICAgICAgICAgIGZpbGVSZWY9e21vYmlsZUJhbm5lckZpbGVSZWZ9XG4gICAgICAgICAgICAgICAgICAgIG9uVXBsb2FkPXsoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgdXBsb2FkSW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdob21lTW9iaWxlQmFubmVySW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0TW9iaWxlQmFubmVyUHJldmlldyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldE1vYmlsZUJhbm5lclVwbG9hZGluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vYmlsZUJhbm5lckZpbGVSZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAnTW9iaWxlIGJhbm5lciBpbWFnZSB1cGxvYWRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPEltYWdlVXBsb2FkZXJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCJGcnVpdCBoaWdobGlnaHQgaW1hZ2VcIlxuICAgICAgICAgICAgICAgICAgICBoaW50PVwiUmVwbGFjZXMgdGhlIGtpd2kgaW1hZ2UgaW4g4oCcVGhlIFNtYWxsIEZydWl0IHdpdGggYSBCaWcgUHVuY2jigJ0gb24gdGhlIHdlYnNpdGUuXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2hpZ2hsaWdodEltYWdlVXJsfVxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3VXJsPXtoaWdobGlnaHRQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRpbmc9e2hpZ2hsaWdodFVwbG9hZGluZ31cbiAgICAgICAgICAgICAgICAgICAgZmlsZVJlZj17aGlnaGxpZ2h0RmlsZVJlZn1cbiAgICAgICAgICAgICAgICAgICAgb25VcGxvYWQ9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICB1cGxvYWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2hvbWVIaWdobGlnaHRJbWFnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRIaWdobGlnaHRQcmV2aWV3LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0SGlnaGxpZ2h0VXBsb2FkaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0RmlsZVJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICdIaWdobGlnaHQgaW1hZ2UgdXBsb2FkZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgSG9tZXBhZ2UgY2F0ZWdvcmllc1xuICAgICAgICAgICAgICAgICAgICA8U2VhcmNoYWJsZU11bHRpU2VsZWN0XG4gICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucz17Y2F0ZWdvcmllcy5tYXAoKGl0ZW0pID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5zbHVnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGl0ZW0ubGFiZWwgfHwgaXRlbS50aXRsZSB8fCBpdGVtLnNsdWcsXG4gICAgICAgICAgICAgICAgICAgICAgfSkpfVxuICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZENhdGVnb3J5U2x1Z3N9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhzbHVncykgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUNoYW5nZSgnaG9tZUZlYXR1cmVkQ2F0ZWdvcnlTbHVncycsIEpTT04uc3RyaW5naWZ5KHNsdWdzKSlcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggYW5kIHNlbGVjdCBjYXRlZ29yaWVzXCJcbiAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcj1cIlNlYXJjaCBjYXRlZ29yaWVzXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPlxuICAgICAgICAgICAgICAgICAgICAgIFRoZXNlIGNhdGVnb3JpZXMgbG9hZCBvbiB0aGUgd2Vic2l0ZSBhZnRlciB0aGUgZnJ1aXQgaGlnaGxpZ2h0IHNlY3Rpb24sIG9uZSBhdFxuICAgICAgICAgICAgICAgICAgICAgIGEgdGltZSBhcyB0aGUgdmlzaXRvciBzY3JvbGxzLlxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApIDogdGFiLmlkID09PSAnbm90aWZpY2F0aW9ucycgPyAoXG4gICAgICAgICAgICAgICAgPE5vdGlmaWNhdGlvbnNGaWVsZHMgcGFyYW1zPXtwYXJhbXN9IG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2V9IC8+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5tYXAoKHByb3BlcnR5KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8QmFzZVByb3BlcnR5Q29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgIGtleT17cHJvcGVydHkucHJvcGVydHlQYXRofVxuICAgICAgICAgICAgICAgICAgICB3aGVyZT1cImVkaXRcIlxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eT17cHJvcGVydHl9XG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgICAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgPC9EcmF3ZXJDb250ZW50PlxuXG4gICAgICA8RHJhd2VyRm9vdGVyPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIFNhdmUgY2hhbmdlc1xuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvRHJhd2VyRm9vdGVyPlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNldHRpbmdzRWRpdFxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IFN0YXR1c1N3aXRjaCwgaXNGbGFnT24gfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5mdW5jdGlvbiBGaWVsZEVycm9yKHsgZXJyb3IgfSkge1xuICBpZiAoIWVycm9yPy5tZXNzYWdlKSByZXR1cm4gbnVsbFxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3IubWVzc2FnZX08L3NwYW4+XG59XG5cbmNvbnN0IEFwcFJlbGVhc2VFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChpbml0aWFsUmVjb3JkLCByZXNvdXJjZS5pZClcbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgZXJyb3JzID0gcmVjb3JkPy5lcnJvcnMgfHwge31cbiAgY29uc3QgcGxhdGZvcm0gPSBwYXJhbXMucGxhdGZvcm0gfHwgcmVjb3JkPy5pZCB8fCAnYXBwJ1xuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2UpIGFkZE5vdGljZShub3RpY2UpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSB0aGUgYXBwIHVwZGF0ZSBydWxlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntwbGF0Zm9ybSA9PT0gJ2lvcycgPyAnaVBob25lJyA6ICdBbmRyb2lkJ30gdXBkYXRlPC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIExlYXZlIHRoaXMgb2ZmIHVudGlsIHRoZSBuZXcgYXBwIGlzIGFjdHVhbGx5IGF2YWlsYWJsZSBpbiB0aGUgc3RvcmUuIFJhaXNpbmcgdGhlIG1pbmltdW1cbiAgICAgICAgICBiZWZvcmUgdGhhdCBzZW5kcyBwZW9wbGUgdG8gYSBzdG9yZSBwYWdlIHdpdGggbm90aGluZyB0byBkb3dubG9hZC5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5UdXJuIHRoaXMgcGxhdGZvcm0gb248L2g0PlxuICAgICAgICA8cD5PZmYgbWVhbnMgdGhlIGFwcCBvcGVucyBub3JtYWxseSwgZXZlbiBpZiB0aGUgbnVtYmVycyBiZWxvdyBhcmUgZmlsbGVkIGluLjwvcD5cbiAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgIGNoZWNrZWQ9e2lzRmxhZ09uKHBhcmFtcy5lbmFibGVkKX1cbiAgICAgICAgICBvbkxhYmVsPVwiT25cIlxuICAgICAgICAgIG9mZkxhYmVsPVwiT2ZmXCJcbiAgICAgICAgICB0aXRsZT17aXNGbGFnT24ocGFyYW1zLmVuYWJsZWQpID8gJ0NoZWNraW5nIHZlcnNpb25zJyA6ICdOb3QgY2hlY2tpbmcnfVxuICAgICAgICAgIGhpbnQ9e2lzRmxhZ09uKHBhcmFtcy5lbmFibGVkKSA/ICdUaGUgYXBwIHdpbGwgcmVhZCB0aGVzZSBydWxlcycgOiAnTm8gdXBkYXRlIHNjcmVlbiBpcyBzaG93bid9XG4gICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnZW5hYmxlZCcsIG5leHQpfVxuICAgICAgICAvPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+QnVpbGQgbnVtYmVyczwvaDQ+XG4gICAgICAgIDxwPlVzZSB0aGUgYnVpbGQgbnVtYmVyLCBub3QgdGhlIG5hbWUgMS4wLjMuIEFuZHJvaWQgY2FsbHMgaXQgdmVyc2lvbiBjb2RlLiBpUGhvbmUgdXNlcyB0aGUgYnVpbGQgbnVtYmVyLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgTGF0ZXN0IGJ1aWxkXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubGF0ZXN0QnVpbGQgPz8gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2xhdGVzdEJ1aWxkJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+T2xkZXIgYnVpbGRzIHNlZSBVcGRhdGUgYW5kIE5vdCBub3cuPC9zcGFuPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5sYXRlc3RCdWlsZH0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIE1pbmltdW0gYnVpbGRcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5taW5pbXVtQnVpbGQgPz8gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ21pbmltdW1CdWlsZCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkFueXRoaW5nIG9sZGVyIG11c3QgdXBkYXRlLiBVc2UgMCB3aGlsZSB5b3UgYXJlIG5vdCBmb3JjaW5nIGFueW9uZS48L3NwYW4+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLm1pbmltdW1CdWlsZH0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIEJsb2NrZWQgYnVpbGRzXG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5ibG9ja2VkQnVpbGRzIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2Jsb2NrZWRCdWlsZHMnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCI3LCA5XCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5Pbmx5IHRoZXNlIGV4YWN0IGJ1aWxkcyBhcmUgc3RvcHBlZC4gT3RoZXIgb2xkZXIgYnVpbGRzIGNhbiBrZWVwIHdvcmtpbmcuPC9zcGFuPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgQXNrIGFnYWluIGFmdGVyIChob3VycylcbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucmVtaW5kQWZ0ZXJIb3VycyA/PyAyNH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdyZW1pbmRBZnRlckhvdXJzJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5BZnRlciBOb3Qgbm93LCB0aGUgc29mdCBwcm9tcHQgc3RheXMgcXVpZXQgZm9yIHRoaXMgbG9uZy48L3NwYW4+XG4gICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5yZW1pbmRBZnRlckhvdXJzfSAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+VXBkYXRlIG1lc3NhZ2U8L2g0PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgVGl0bGVcbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnRpdGxlIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3RpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgTWVzc2FnZVxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHJvd3M9ezN9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm1lc3NhZ2UgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbWVzc2FnZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlBhdXNlIHRoZSBhcHA8L2g0PlxuICAgICAgICA8cD5Vc2UgdGhpcyBmb3IgYW4gb3V0YWdlLiBJdCBkb2VzIG5vdCBzZW5kIGFueW9uZSB0byB0aGUgc3RvcmUuPC9wPlxuICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgY2hlY2tlZD17aXNGbGFnT24ocGFyYW1zLm1haW50ZW5hbmNlKX1cbiAgICAgICAgICBvbkxhYmVsPVwiUGF1c2VkXCJcbiAgICAgICAgICBvZmZMYWJlbD1cIk9wZW5cIlxuICAgICAgICAgIHRpdGxlPXtpc0ZsYWdPbihwYXJhbXMubWFpbnRlbmFuY2UpID8gJ0FwcCBpcyBwYXVzZWQnIDogJ0FwcCBpcyBvcGVuJ31cbiAgICAgICAgICBoaW50PXtpc0ZsYWdPbihwYXJhbXMubWFpbnRlbmFuY2UpID8gJ1Blb3BsZSBzZWUgdGhpcyBtZXNzYWdlIGluc3RlYWQgb2YgdGhlIHNob3AnIDogJ01haW50ZW5hbmNlIHNjcmVlbiBpcyBoaWRkZW4nfVxuICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ21haW50ZW5hbmNlJywgbmV4dCl9XG4gICAgICAgIC8+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBQYXVzZSB0aXRsZVxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubWFpbnRlbmFuY2VUaXRsZSB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdtYWludGVuYW5jZVRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgUGF1c2UgbWVzc2FnZVxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHJvd3M9ezN9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm1haW50ZW5hbmNlTWVzc2FnZSB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdtYWludGVuYW5jZU1lc3NhZ2UnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICBTYXZlIHJ1bGVcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBSZWxlYXNlRWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuZnVuY3Rpb24gcGFyc2VTbHVncyhyYXcpIHtcbiAgaWYgKCFyYXcpIHJldHVybiBbXVxuICBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSByZXR1cm4gcmF3Lm1hcCgoaXRlbSkgPT4gU3RyaW5nKGl0ZW0pLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pXG4gIGlmICh0eXBlb2YgcmF3ID09PSAnc3RyaW5nJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdylcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcnNlZCkpIHJldHVybiBwYXJzZVNsdWdzKHBhcnNlZClcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGlnbm9yZVxuICAgIH1cbiAgICByZXR1cm4gcmF3XG4gICAgICAuc3BsaXQoJywnKVxuICAgICAgLm1hcCgoaXRlbSkgPT4gaXRlbS50cmltKCkpXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gIH1cbiAgcmV0dXJuIFtdXG59XG5cbmZ1bmN0aW9uIHBhZChudW0pIHtcbiAgcmV0dXJuIFN0cmluZyhudW0pLnBhZFN0YXJ0KDIsICcwJylcbn1cblxuZnVuY3Rpb24gdG9EYXRldGltZVZhbHVlKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gJydcbiAgcmV0dXJuIGAke2RhdGUuZ2V0RnVsbFllYXIoKX0tJHtwYWQoZGF0ZS5nZXRNb250aCgpICsgMSl9LSR7cGFkKGRhdGUuZ2V0RGF0ZSgpKX1UJHtwYWQoZGF0ZS5nZXRIb3VycygpKX06JHtwYWQoZGF0ZS5nZXRNaW51dGVzKCkpfWBcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZXRpbWVMYWJlbCh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJydcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxuICBpZiAoTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuICcnXG4gIHJldHVybiBkYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHtcbiAgICBkYXk6ICcyLWRpZ2l0JyxcbiAgICBtb250aDogJ3Nob3J0JyxcbiAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgaG91cjogJzItZGlnaXQnLFxuICAgIG1pbnV0ZTogJzItZGlnaXQnLFxuICB9KVxufVxuXG5mdW5jdGlvbiB1c2VBbmNob3JlZE1lbnUob3Blbikge1xuICBjb25zdCB3cmFwUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFtvcGVuVXAsIHNldE9wZW5VcF0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghb3BlbikgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgY29uc3QgdXBkYXRlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgbm9kZSA9IHdyYXBSZWYuY3VycmVudFxuICAgICAgaWYgKCFub2RlKSByZXR1cm5cbiAgICAgIGNvbnN0IHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBzcGFjZUJlbG93ID0gd2luZG93LmlubmVySGVpZ2h0IC0gcmVjdC5ib3R0b21cbiAgICAgIHNldE9wZW5VcChzcGFjZUJlbG93IDwgMjQwICYmIHJlY3QudG9wID4gc3BhY2VCZWxvdylcbiAgICB9XG5cbiAgICB1cGRhdGUoKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHVwZGF0ZSwgdHJ1ZSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB1cGRhdGUsIHRydWUpXG4gICAgfVxuICB9LCBbb3Blbl0pXG5cbiAgcmV0dXJuIHsgd3JhcFJlZiwgb3BlblVwIH1cbn1cblxuZnVuY3Rpb24gQ2hvaWNlQ2FyZCh7IHNlbGVjdGVkLCB0aXRsZSwgaGludCwgb25DbGljayB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B0b2tyaS1jaG9pY2UtY2FyZCR7c2VsZWN0ZWQgPyAnIGlzLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgID5cbiAgICAgIDxzdHJvbmc+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgPHNwYW4+e2hpbnR9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmZ1bmN0aW9uIEFuY2hvcmVkU2VsZWN0KHsgdmFsdWUsIG9wdGlvbnMsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG4gIGNvbnN0IHNlbGVjdGVkID0gb3B0aW9ucy5maW5kKChpdGVtKSA9PiBpdGVtLnZhbHVlID09PSB2YWx1ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9uRG9jQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghd3JhcFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICB9LCBbd3JhcFJlZl0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0XCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNvbnRyb2xcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKChjdXJyZW50KSA9PiAhY3VycmVudCl9PlxuICAgICAgICA8c3Bhbj57c2VsZWN0ZWQ/LmxhYmVsIHx8IHBsYWNlaG9sZGVyfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY2FyZXRcIj57b3BlbiA/ICfilrQnIDogJ+KWvid9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b2tyaS1tdWx0aXNlbGVjdC1tZW51JHtvcGVuVXAgPyAnIGlzLXVwJyA6ICcnfWB9PlxuICAgICAgICAgIHtvcHRpb25zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e2l0ZW0udmFsdWV9XG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1tdWx0aXNlbGVjdC1vcHRpb24ke2l0ZW0udmFsdWUgPT09IHZhbHVlID8gJyBpcy1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIFNlYXJjaGFibGVNdWx0aVNlbGVjdCh7IG9wdGlvbnMsIHNlbGVjdGVkLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIsIHNlYXJjaFBsYWNlaG9sZGVyIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IHsgd3JhcFJlZiwgb3BlblVwIH0gPSB1c2VBbmNob3JlZE1lbnUob3BlbilcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9uRG9jQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghd3JhcFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICB9LCBbd3JhcFJlZl0pXG5cbiAgY29uc3Qgc2VsZWN0ZWRTZXQgPSB1c2VNZW1vKCgpID0+IG5ldyBTZXQoc2VsZWN0ZWQpLCBbc2VsZWN0ZWRdKVxuICBjb25zdCBzZWxlY3RlZE9wdGlvbnMgPSBvcHRpb25zLmZpbHRlcigoaXRlbSkgPT4gc2VsZWN0ZWRTZXQuaGFzKGl0ZW0udmFsdWUpKVxuICBjb25zdCBmaWx0ZXJlZCA9IG9wdGlvbnMuZmlsdGVyKChpdGVtKSA9PlxuICAgIGAke2l0ZW0ubGFiZWx9ICR7aXRlbS52YWx1ZX1gLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkudHJpbSgpLnRvTG93ZXJDYXNlKCkpLFxuICApXG5cbiAgY29uc3QgdG9nZ2xlID0gKHZhbHVlKSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkU2V0Lmhhcyh2YWx1ZSkpIG9uQ2hhbmdlKHNlbGVjdGVkLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gdmFsdWUpKVxuICAgIGVsc2Ugb25DaGFuZ2UoWy4uLnNlbGVjdGVkLCB2YWx1ZV0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3RcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY29udHJvbFwiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHZhbHVlKSA9PiAhdmFsdWUpfT5cbiAgICAgICAge3NlbGVjdGVkT3B0aW9ucy5sZW5ndGggPyAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY2hpcHNcIj5cbiAgICAgICAgICAgIHtzZWxlY3RlZE9wdGlvbnMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICAgIDxzcGFuIGtleT17aXRlbS52YWx1ZX0gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY2hpcFwiPlxuICAgICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICByb2xlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIHRhYkluZGV4PXswfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZShpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICDDl1xuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LXBsYWNlaG9sZGVyXCI+e3BsYWNlaG9sZGVyfTwvc3Bhbj5cbiAgICAgICAgKX1cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY2FyZXRcIj57b3BlbiA/ICfilrQnIDogJ+KWvid9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b2tyaS1tdWx0aXNlbGVjdC1tZW51JHtvcGVuVXAgPyAnIGlzLXVwJyA6ICcnfWB9PlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHZhbHVlPXtxdWVyeX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFF1ZXJ5KGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj17c2VhcmNoUGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICBhdXRvRm9jdXNcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtbGlzdFwiPlxuICAgICAgICAgICAge2ZpbHRlcmVkLmxlbmd0aCA/IChcbiAgICAgICAgICAgICAgZmlsdGVyZWQubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tlZCA9IHNlbGVjdGVkU2V0LmhhcyhpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8bGFiZWwga2V5PXtpdGVtLnZhbHVlfSBjbGFzc05hbWU9e2B0b2tyaS1tdWx0aXNlbGVjdC1vcHRpb24ke2NoZWNrZWQgPyAnIGlzLXNlbGVjdGVkJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZD17Y2hlY2tlZH0gb25DaGFuZ2U9eygpID0+IHRvZ2dsZShpdGVtLnZhbHVlKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWVtcHR5XCI+Tm8gbWF0Y2hlczwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBEYXRlVGltZVBpY2tlcih7IHZhbHVlLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgfSkge1xuICBjb25zdCBwYXJzZWQgPSB2YWx1ZSA/IG5ldyBEYXRlKHZhbHVlKSA6IG51bGxcbiAgY29uc3QgdmFsaWQgPSBwYXJzZWQgJiYgIU51bWJlci5pc05hTihwYXJzZWQuZ2V0VGltZSgpKSA/IHBhcnNlZCA6IG51bGxcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFttb250aERhdGUsIHNldE1vbnRoRGF0ZV0gPSB1c2VTdGF0ZSh2YWxpZCB8fCBuZXcgRGF0ZSgpKVxuICBjb25zdCBbaG91cnMsIHNldEhvdXJzXSA9IHVzZVN0YXRlKHZhbGlkID8gcGFkKHZhbGlkLmdldEhvdXJzKCkpIDogJzAwJylcbiAgY29uc3QgW21pbnV0ZXMsIHNldE1pbnV0ZXNdID0gdXNlU3RhdGUodmFsaWQgPyBwYWQodmFsaWQuZ2V0TWludXRlcygpKSA6ICcwMCcpXG4gIGNvbnN0IHsgd3JhcFJlZiwgb3BlblVwIH0gPSB1c2VBbmNob3JlZE1lbnUob3BlbilcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9uRG9jQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghd3JhcFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICB9LCBbd3JhcFJlZl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXZhbGlkKSByZXR1cm5cbiAgICBzZXRNb250aERhdGUodmFsaWQpXG4gICAgc2V0SG91cnMocGFkKHZhbGlkLmdldEhvdXJzKCkpKVxuICAgIHNldE1pbnV0ZXMocGFkKHZhbGlkLmdldE1pbnV0ZXMoKSkpXG4gIH0sIFt2YWx1ZV0pXG5cbiAgY29uc3QgeWVhciA9IG1vbnRoRGF0ZS5nZXRGdWxsWWVhcigpXG4gIGNvbnN0IG1vbnRoID0gbW9udGhEYXRlLmdldE1vbnRoKClcbiAgY29uc3QgZmlyc3REYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSkuZ2V0RGF5KClcbiAgY29uc3QgdG90YWxEYXlzID0gbmV3IERhdGUoeWVhciwgbW9udGggKyAxLCAwKS5nZXREYXRlKClcbiAgY29uc3QgY2VsbHMgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGZpcnN0RGF5OyBpICs9IDEpIGNlbGxzLnB1c2gobnVsbClcbiAgZm9yIChsZXQgZGF5ID0gMTsgZGF5IDw9IHRvdGFsRGF5czsgZGF5ICs9IDEpIGNlbGxzLnB1c2goZGF5KVxuXG4gIGNvbnN0IGFwcGx5ID0gKGRheSwgbmV4dEhvdXJzID0gaG91cnMsIG5leHRNaW51dGVzID0gbWludXRlcykgPT4ge1xuICAgIGNvbnN0IG5leHQgPSBgJHt5ZWFyfS0ke3BhZChtb250aCArIDEpfS0ke3BhZChkYXkpfVQke3BhZChOdW1iZXIobmV4dEhvdXJzKSB8fCAwKX06JHtwYWQoTnVtYmVyKG5leHRNaW51dGVzKSB8fCAwKX1gXG4gICAgb25DaGFuZ2UobmV4dClcbiAgfVxuXG4gIGNvbnN0IHNlbGVjdGVkRGF5ID1cbiAgICB2YWxpZCAmJiB2YWxpZC5nZXRGdWxsWWVhcigpID09PSB5ZWFyICYmIHZhbGlkLmdldE1vbnRoKCkgPT09IG1vbnRoID8gdmFsaWQuZ2V0RGF0ZSgpIDogbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyXCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItY29udHJvbFwiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KX0+XG4gICAgICAgIDxzcGFuPnt2YWxpZCA/IGZvcm1hdERhdGV0aW1lTGFiZWwodmFsaWQpIDogcGxhY2Vob2xkZXJ9PC9zcGFuPlxuICAgICAgICA8c3Bhbj7wn5OFPC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b2tyaS1kYXRlcGlja2VyLXBvcCR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItbmF2XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb250aERhdGUobmV3IERhdGUoeWVhciwgbW9udGggLSAxLCAxKSl9PlxuICAgICAgICAgICAgICDigLlcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPHN0cm9uZz5cbiAgICAgICAgICAgICAge21vbnRoRGF0ZS50b0xvY2FsZVN0cmluZygnZW4tSU4nLCB7IG1vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJyB9KX1cbiAgICAgICAgICAgIDwvc3Ryb25nPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0TW9udGhEYXRlKG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMSkpfT5cbiAgICAgICAgICAgICAg4oC6XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItd2Vla1wiPlxuICAgICAgICAgICAge1snU3UnLCAnTW8nLCAnVHUnLCAnV2UnLCAnVGgnLCAnRnInLCAnU2EnXS5tYXAoKGxhYmVsKSA9PiAoXG4gICAgICAgICAgICAgIDxzcGFuIGtleT17bGFiZWx9PntsYWJlbH08L3NwYW4+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItZ3JpZFwiPlxuICAgICAgICAgICAge2NlbGxzLm1hcCgoZGF5LCBpbmRleCkgPT5cbiAgICAgICAgICAgICAgZGF5ID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIGtleT17YCR7eWVhcn0tJHttb250aH0tJHtkYXl9YH1cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzZWxlY3RlZERheSA9PT0gZGF5ID8gJ2lzLXNlbGVjdGVkJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gYXBwbHkoZGF5KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7ZGF5fVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxzcGFuIGtleT17YGVtcHR5LSR7aW5kZXh9YH0gLz5cbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLXRpbWVcIj5cbiAgICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgICAgSG91clxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICBtYXg9XCIyM1wiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2hvdXJzfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSBwYWQoTWF0aC5taW4oMjMsIE1hdGgubWF4KDAsIE51bWJlcihldmVudC50YXJnZXQudmFsdWUpIHx8IDApKSlcbiAgICAgICAgICAgICAgICAgIHNldEhvdXJzKG5leHQpXG4gICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWREYXkpIGFwcGx5KHNlbGVjdGVkRGF5LCBuZXh0LCBtaW51dGVzKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICBNaW51dGVcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgbWF4PVwiNTlcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXttaW51dGVzfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSBwYWQoTWF0aC5taW4oNTksIE1hdGgubWF4KDAsIE51bWJlcihldmVudC50YXJnZXQudmFsdWUpIHx8IDApKSlcbiAgICAgICAgICAgICAgICAgIHNldE1pbnV0ZXMobmV4dClcbiAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZERheSkgYXBwbHkoc2VsZWN0ZWREYXksIGhvdXJzLCBuZXh0KVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1jbGVhclwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZSgnJylcbiAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBDbGVhclxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgQ291cG9uRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG5cbiAgY29uc3QgW3Byb2R1Y3RzLCBzZXRQcm9kdWN0c10gPSB1c2VTdGF0ZShbXSlcbiAgY29uc3QgW2NhdGVnb3JpZXMsIHNldENhdGVnb3JpZXNdID0gdXNlU3RhdGUoW10pXG5cbiAgY29uc3Qgc2VsZWN0ZWRTbHVncyA9IHBhcnNlU2x1Z3MocGFyYW1zLnRhcmdldFNsdWdzKVxuICBjb25zdCB0YXJnZXRUeXBlID0gcGFyYW1zLnRhcmdldFR5cGUgfHwgJ2FsbCdcbiAgY29uc3QgYXBwbHlPbiA9IHBhcmFtcy5hcHBseU9uIHx8ICdjYXJ0J1xuICBjb25zdCB1c2FnZVR5cGUgPSBwYXJhbXMudXNhZ2VUeXBlIHx8ICd1bmxpbWl0ZWQnXG4gIGNvbnN0IGNvdXBvblR5cGUgPSBwYXJhbXMudHlwZSB8fCAncGVyY2VudCdcbiAgY29uc3QgaXNBY3RpdmUgPSBwYXJhbXMuaXNBY3RpdmUgIT09IGZhbHNlICYmIHBhcmFtcy5pc0FjdGl2ZSAhPT0gJ2ZhbHNlJ1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGlnbm9yZSA9IGZhbHNlXG5cbiAgICBhc3luYyBmdW5jdGlvbiBsb2FkQ2F0YWxvZygpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5RGF0YSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L2NhdGVnb3JpZXNgKS50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICBjb25zdCBhbGxQcm9kdWN0cyA9IFtdXG4gICAgICAgIGxldCBwYWdlID0gMVxuICAgICAgICBsZXQgaGFzTW9yZSA9IHRydWVcbiAgICAgICAgd2hpbGUgKGhhc01vcmUgJiYgcGFnZSA8PSAyMCkge1xuICAgICAgICAgIGNvbnN0IHByb2R1Y3REYXRhID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vcHJvZHVjdHM/cGFnZT0ke3BhZ2V9JmxpbWl0PTEwMGApLnRoZW4oKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgcmVzcG9uc2UuanNvbigpLFxuICAgICAgICAgIClcbiAgICAgICAgICBhbGxQcm9kdWN0cy5wdXNoKC4uLihwcm9kdWN0RGF0YS5wcm9kdWN0cyB8fCBbXSkpXG4gICAgICAgICAgaGFzTW9yZSA9IEJvb2xlYW4ocHJvZHVjdERhdGEuaGFzTW9yZSlcbiAgICAgICAgICBwYWdlICs9IDFcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWdub3JlKSByZXR1cm5cbiAgICAgICAgc2V0UHJvZHVjdHMoYWxsUHJvZHVjdHMpXG4gICAgICAgIHNldENhdGVnb3JpZXMoQXJyYXkuaXNBcnJheShjYXRlZ29yeURhdGEpID8gY2F0ZWdvcnlEYXRhIDogW10pXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgaWYgKCFpZ25vcmUpIHtcbiAgICAgICAgICBzZXRQcm9kdWN0cyhbXSlcbiAgICAgICAgICBzZXRDYXRlZ29yaWVzKFtdKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbG9hZENhdGFsb2coKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbYXBpQmFzZVVybF0pXG5cbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgc2V0U2VsZWN0ZWRTbHVncyA9IChuZXh0KSA9PiBzZXRGaWVsZCgndGFyZ2V0U2x1Z3MnLCBKU09OLnN0cmluZ2lmeShuZXh0KSlcblxuICBjb25zdCBwcm9kdWN0T3B0aW9ucyA9IHVzZU1lbW8oXG4gICAgKCkgPT4gcHJvZHVjdHMubWFwKChpdGVtKSA9PiAoeyB2YWx1ZTogaXRlbS5zbHVnLCBsYWJlbDogaXRlbS5uYW1lIH0pKSxcbiAgICBbcHJvZHVjdHNdLFxuICApXG4gIGNvbnN0IGNhdGVnb3J5T3B0aW9ucyA9IHVzZU1lbW8oXG4gICAgKCkgPT4gY2F0ZWdvcmllcy5tYXAoKGl0ZW0pID0+ICh7IHZhbHVlOiBpdGVtLnNsdWcsIGxhYmVsOiBpdGVtLmxhYmVsIH0pKSxcbiAgICBbY2F0ZWdvcmllc10sXG4gIClcblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgY291cG9uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3Vwb24gc2F2ZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgY291cG9uLiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj5DcmVhdGUgYSBzdG9yZSBjb3Vwb248L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgU2V0IHdobyBnZXRzIHRoZSBkaXNjb3VudCwgd2hlcmUgaXQgYXBwbGllcywgYW5kIGhvdyBtYW55IHRpbWVzIGl0IGNhbiBiZSB1c2VkLlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Db3Vwb24gY29kZTwvaDQ+XG4gICAgICAgICAgPHA+Q3VzdG9tZXJzIHdpbGwgdHlwZSB0aGlzIGF0IGNoZWNrb3V0IG9uIHRoZSB3ZWJzaXRlIGFuZCBhcHAuPC9wPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0IHRva3JpLWNvdXBvbi1jb2RlXCJcbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY29kZSB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdjb2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCkpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJXRUxDT01FMTBcIlxuICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdG9nZ2xlXCI+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17aXNBY3RpdmV9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdpc0FjdGl2ZScsIGV2ZW50LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICBDb3Vwb24gaXMgYWN0aXZlXG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkRpc2NvdW50PC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNob2ljZS1yb3dcIj5cbiAgICAgICAgICAgIDxDaG9pY2VDYXJkXG4gICAgICAgICAgICAgIHNlbGVjdGVkPXtjb3Vwb25UeXBlID09PSAncGVyY2VudCd9XG4gICAgICAgICAgICAgIHRpdGxlPVwiUGVyY2VudCBvZmZcIlxuICAgICAgICAgICAgICBoaW50PVwiZS5nLiAxMCUgb2ZmXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ3R5cGUnLCAncGVyY2VudCcpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxDaG9pY2VDYXJkXG4gICAgICAgICAgICAgIHNlbGVjdGVkPXtjb3Vwb25UeXBlID09PSAnZmxhdCd9XG4gICAgICAgICAgICAgIHRpdGxlPVwiRmxhdCBhbW91bnRcIlxuICAgICAgICAgICAgICBoaW50PVwiZS5nLiDigrk1MCBvZmZcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgndHlwZScsICdmbGF0Jyl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIHtjb3Vwb25UeXBlID09PSAncGVyY2VudCcgPyAnUGVyY2VudCB2YWx1ZScgOiAnQW1vdW50ICjigrkpJ31cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy52YWx1ZSA/PyAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3ZhbHVlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgTWluIGNhcnQgKOKCuSlcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5taW5DYXJ0ID8/ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdtaW5DYXJ0JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjBcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgTWF4IGRpc2NvdW50ICjigrkpXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubWF4RGlzY291bnQgPz8gJyd9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ21heERpc2NvdW50JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIk5vIGNhcFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkFwcGx5IGRpc2NvdW50IG9uPC9oND5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaG9pY2Utcm93XCI+XG4gICAgICAgICAgPENob2ljZUNhcmRcbiAgICAgICAgICAgIHNlbGVjdGVkPXthcHBseU9uID09PSAnY2FydCd9XG4gICAgICAgICAgICB0aXRsZT1cIkNhcnQgdG90YWxcIlxuICAgICAgICAgICAgaGludD1cIlJlZHVjZSB0aGUgaXRlbXMgc3VidG90YWxcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ2FwcGx5T24nLCAnY2FydCcpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPENob2ljZUNhcmRcbiAgICAgICAgICAgIHNlbGVjdGVkPXthcHBseU9uID09PSAnc2hpcHBpbmcnfVxuICAgICAgICAgICAgdGl0bGU9XCJTaGlwcGluZyBmZWVcIlxuICAgICAgICAgICAgaGludD1cIlJlZHVjZSBkZWxpdmVyeSBjaGFyZ2VzXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCdhcHBseU9uJywgJ3NoaXBwaW5nJyl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5XaG8gY2FuIGdldCB0aGlzIGRpc2NvdW50PC9oND5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIEFwcGx5IHRvXG4gICAgICAgICAgPEFuY2hvcmVkU2VsZWN0XG4gICAgICAgICAgICB2YWx1ZT17dGFyZ2V0VHlwZX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQ2hvb3NlIHdobyB0aGlzIGNvdXBvbiBhcHBsaWVzIHRvXCJcbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4ge1xuICAgICAgICAgICAgICBzZXRGaWVsZCgndGFyZ2V0VHlwZScsIG5leHQpXG4gICAgICAgICAgICAgIHNldFNlbGVjdGVkU2x1Z3MoW10pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb3B0aW9ucz17W1xuICAgICAgICAgICAgICB7IHZhbHVlOiAnYWxsJywgbGFiZWw6ICdBbGwgcHJvZHVjdHMnIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6ICdwcm9kdWN0cycsIGxhYmVsOiAnU2VsZWN0ZWQgcHJvZHVjdHMnIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6ICdjYXRlZ29yaWVzJywgbGFiZWw6ICdTZWxlY3RlZCBjYXRlZ29yaWVzJyB9LFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuXG4gICAgICAgIHt0YXJnZXRUeXBlID09PSAncHJvZHVjdHMnID8gKFxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFByb2R1Y3RzXG4gICAgICAgICAgICA8U2VhcmNoYWJsZU11bHRpU2VsZWN0XG4gICAgICAgICAgICAgIG9wdGlvbnM9e3Byb2R1Y3RPcHRpb25zfVxuICAgICAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0ZWRTbHVnc31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldFNlbGVjdGVkU2x1Z3N9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VsZWN0IHByb2R1Y3RzXCJcbiAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggcHJvZHVjdHNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFyZ2V0VHlwZSA9PT0gJ2NhdGVnb3JpZXMnID8gKFxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIENhdGVnb3JpZXNcbiAgICAgICAgICAgIDxTZWFyY2hhYmxlTXVsdGlTZWxlY3RcbiAgICAgICAgICAgICAgb3B0aW9ucz17Y2F0ZWdvcnlPcHRpb25zfVxuICAgICAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0ZWRTbHVnc31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldFNlbGVjdGVkU2x1Z3N9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VsZWN0IGNhdGVnb3JpZXNcIlxuICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcj1cIlNlYXJjaCBjYXRlZ29yaWVzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+VXNhZ2U8L2g0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hvaWNlLXJvd1wiPlxuICAgICAgICAgICAgPENob2ljZUNhcmRcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3VzYWdlVHlwZSA9PT0gJ3VubGltaXRlZCd9XG4gICAgICAgICAgICAgIHRpdGxlPVwiVW5saW1pdGVkXCJcbiAgICAgICAgICAgICAgaGludD1cIkN1c3RvbWVycyBjYW4gcmV1c2UgaXRcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgndXNhZ2VUeXBlJywgJ3VubGltaXRlZCcpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxDaG9pY2VDYXJkXG4gICAgICAgICAgICAgIHNlbGVjdGVkPXt1c2FnZVR5cGUgPT09ICdzaW5nbGUnfVxuICAgICAgICAgICAgICB0aXRsZT1cIlNpbmdsZSB1c2VcIlxuICAgICAgICAgICAgICBoaW50PVwiT25lIHVzZSBwZXIgY3VzdG9tZXJcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgndXNhZ2VUeXBlJywgJ3NpbmdsZScpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7dXNhZ2VUeXBlID09PSAndW5saW1pdGVkJyA/IChcbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgT3B0aW9uYWwgZ2xvYmFsIGNhcFxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjFcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudXNhZ2VMaW1pdCA/PyAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgndXNhZ2VMaW1pdCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJMZWF2ZSBibGFuayBmb3IgdW5saW1pdGVkXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxUZXh0PkVhY2ggbG9nZ2VkLWluIGN1c3RvbWVyIGNhbiB1c2UgdGhpcyBjb3Vwb24gb25jZS48L1RleHQ+XG4gICAgICAgICAgKX1cbiAgICAgICAgICB7cGFyYW1zLnVzZWRDb3VudCA/IDxUZXh0IG10PVwiZGVmYXVsdFwiPlVzZWQge3BhcmFtcy51c2VkQ291bnR9IHRpbWUocykgc28gZmFyLjwvVGV4dD4gOiBudWxsfVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+U2NoZWR1bGU8L2g0PlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFN0YXJ0cyBhdFxuICAgICAgICAgICAgPERhdGVUaW1lUGlja2VyXG4gICAgICAgICAgICAgIHZhbHVlPXt0b0RhdGV0aW1lVmFsdWUocGFyYW1zLnN0YXJ0c0F0KX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnc3RhcnRzQXQnLCBuZXh0IHx8IG51bGwpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlbGVjdCBzdGFydCBkYXRlIGFuZCB0aW1lXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBFeHBpcmVzIGF0XG4gICAgICAgICAgICA8RGF0ZVRpbWVQaWNrZXJcbiAgICAgICAgICAgICAgdmFsdWU9e3RvRGF0ZXRpbWVWYWx1ZShwYXJhbXMuZXhwaXJlc0F0KX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnZXhwaXJlc0F0JywgbmV4dCB8fCBudWxsKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3QgZXhwaXJ5IGRhdGUgYW5kIHRpbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIFNhdmUgY291cG9uXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ291cG9uRWRpdFxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5jb25zdCBGVUxGSUxMTUVOVCA9IHtcbiAgcGVuZGluZzogeyBsYWJlbDogJ1dhaXRpbmcgZm9yIGZ1bGZpbGxtZW50JywgdG9uZTogJ3BlbmRpbmcnIH0sXG4gIHBhaWQ6IHsgbGFiZWw6ICdQcm9jZXNzaW5nJywgdG9uZTogJ3Byb2Nlc3NpbmcnIH0sXG4gIHBhY2tlZDogeyBsYWJlbDogJ1BhY2tlZCcsIHRvbmU6ICdwYWNrZWQnIH0sXG4gIHNoaXBwZWQ6IHsgbGFiZWw6ICdTaGlwcGVkJywgdG9uZTogJ3NoaXBwZWQnIH0sXG4gIGRlbGl2ZXJlZDogeyBsYWJlbDogJ0RlbGl2ZXJlZCcsIHRvbmU6ICdkZWxpdmVyZWQnIH0sXG4gIGNhbmNlbGxlZDogeyBsYWJlbDogJ0NhbmNlbGxlZCcsIHRvbmU6ICdjYW5jZWxsZWQnIH0sXG59XG5cbmZ1bmN0aW9uIGlzT25saW5lT3JkZXIocGFyYW1zID0ge30pIHtcbiAgY29uc3QgbW9kZSA9IFN0cmluZyhwYXJhbXMucGF5bWVudE1vZGUgfHwgJycpLnRvTG93ZXJDYXNlKClcbiAgaWYgKG1vZGUgPT09ICdvbmxpbmUnKSByZXR1cm4gdHJ1ZVxuICBpZiAobW9kZSA9PT0gJ2NvZCcpIHJldHVybiBmYWxzZVxuICByZXR1cm4gQm9vbGVhbihwYXJhbXMucmF6b3JwYXlQYXltZW50SWQgfHwgcGFyYW1zLnJhem9ycGF5T3JkZXJJZClcbn1cblxuZnVuY3Rpb24gcGF5bWVudEJhZGdlKHBhcmFtcyA9IHt9KSB7XG4gIGNvbnN0IG9ubGluZSA9IGlzT25saW5lT3JkZXIocGFyYW1zKVxuICBjb25zdCBtZXRob2QgPSBvbmxpbmUgPyAnT25saW5lJyA6ICdDT0QnXG4gIGNvbnN0IHN0YXR1cyA9IFN0cmluZyhwYXJhbXMucGF5bWVudFN0YXR1cyB8fCAncGVuZGluZycpLnRvTG93ZXJDYXNlKClcblxuICBpZiAoc3RhdHVzID09PSAncGFpZCcpIHJldHVybiB7IGxhYmVsOiBgJHttZXRob2R9IMK3IFBhaWRgLCB0b25lOiAncGFpZCcgfVxuICBpZiAoc3RhdHVzID09PSAnZmFpbGVkJykgcmV0dXJuIHsgbGFiZWw6IGAke21ldGhvZH0gwrcgRmFpbGVkYCwgdG9uZTogJ2ZhaWxlZCcgfVxuICBpZiAoc3RhdHVzID09PSAncmVmdW5kZWQnKSByZXR1cm4geyBsYWJlbDogYCR7bWV0aG9kfSDCtyBSZWZ1bmRlZGAsIHRvbmU6ICdyZWZ1bmRlZCcgfVxuICBpZiAob25saW5lKSByZXR1cm4geyBsYWJlbDogJ09ubGluZSDCtyBXYWl0aW5nJywgdG9uZTogJ3dhaXRpbmcnIH1cbiAgcmV0dXJuIHsgbGFiZWw6ICdDT0QgwrcgVW5wYWlkJywgdG9uZTogJ3BlbmRpbmcnIH1cbn1cblxuZnVuY3Rpb24gUGlsbCh7IGxhYmVsLCB0b25lIH0pIHtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YHRva3JpLW9yZGVyLXBpbGwgdG9rcmktbGlzdC1waWxsIGlzLSR7dG9uZX1gfT57bGFiZWx9PC9zcGFuPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnVsZmlsbG1lbnRCYWRnZShzdGF0dXMpIHtcbiAgY29uc3Qga2V5ID0gU3RyaW5nKHN0YXR1cyB8fCAncGVuZGluZycpLnRvTG93ZXJDYXNlKClcbiAgcmV0dXJuIEZVTEZJTExNRU5UW2tleV0gfHwgRlVMRklMTE1FTlQucGVuZGluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF5bWVudEJhZGdlKHBhcmFtcykge1xuICByZXR1cm4gcGF5bWVudEJhZGdlKHBhcmFtcylcbn1cblxuZnVuY3Rpb24gRnVsZmlsbG1lbnRCYWRnZSh7IHJlY29yZCB9KSB7XG4gIGNvbnN0IGJhZGdlID0gZ2V0RnVsZmlsbG1lbnRCYWRnZShyZWNvcmQ/LnBhcmFtcz8uc3RhdHVzKVxuICByZXR1cm4gPFBpbGwgbGFiZWw9e2JhZGdlLmxhYmVsfSB0b25lPXtiYWRnZS50b25lfSAvPlxufVxuXG5mdW5jdGlvbiBQYXltZW50QmFkZ2UoeyByZWNvcmQgfSkge1xuICBjb25zdCBiYWRnZSA9IGdldFBheW1lbnRCYWRnZShyZWNvcmQ/LnBhcmFtcylcbiAgcmV0dXJuIDxQaWxsIGxhYmVsPXtiYWRnZS5sYWJlbH0gdG9uZT17YmFkZ2UudG9uZX0gLz5cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gT3JkZXJMaXN0QmFkZ2UoeyByZWNvcmQsIHByb3BlcnR5IH0pIHtcbiAgY29uc3QgcGF0aCA9IHByb3BlcnR5Py5wYXRoIHx8IHByb3BlcnR5Py5wcm9wZXJ0eVBhdGggfHwgJydcbiAgaWYgKHBhdGggPT09ICdzdGF0dXMnKSByZXR1cm4gPEZ1bGZpbGxtZW50QmFkZ2UgcmVjb3JkPXtyZWNvcmR9IC8+XG4gIHJldHVybiA8UGF5bWVudEJhZGdlIHJlY29yZD17cmVjb3JkfSAvPlxufVxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEFwaUNsaWVudCwgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgTG9jYWxTZWxlY3QsIFNlYXJjaGFibGVTZWxlY3QsIHVzZUFuY2hvcmVkTWVudSB9IGZyb20gJy4vZm9ybS1jb250cm9scydcbmltcG9ydCB7IGdldEZ1bGZpbGxtZW50QmFkZ2UsIGdldFBheW1lbnRCYWRnZSB9IGZyb20gJy4vb3JkZXItbGlzdC1iYWRnZXMuanN4J1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuY29uc3QgRlVMRklMTE1FTlQgPSBbXG4gIHsgdmFsdWU6ICdwZW5kaW5nJywgbGFiZWw6ICdXYWl0aW5nIGZvciBmdWxmaWxsbWVudCcgfSxcbiAgeyB2YWx1ZTogJ3BhaWQnLCBsYWJlbDogJ1Byb2Nlc3NpbmcnIH0sXG4gIHsgdmFsdWU6ICdwYWNrZWQnLCBsYWJlbDogJ1BhY2tlZCcgfSxcbiAgeyB2YWx1ZTogJ3NoaXBwZWQnLCBsYWJlbDogJ1NoaXBwZWQnIH0sXG4gIHsgdmFsdWU6ICdkZWxpdmVyZWQnLCBsYWJlbDogJ0RlbGl2ZXJlZCcgfSxcbiAgeyB2YWx1ZTogJ2NhbmNlbGxlZCcsIGxhYmVsOiAnQ2FuY2VsbGVkJyB9LFxuXVxuXG5jb25zdCBQQVlNRU5UX09QVElPTlMgPSBbXG4gIHsgdmFsdWU6ICdwZW5kaW5nJywgbGFiZWw6ICdQZW5kaW5nJyB9LFxuICB7IHZhbHVlOiAncGFpZCcsIGxhYmVsOiAnUGFpZCcgfSxcbiAgeyB2YWx1ZTogJ2ZhaWxlZCcsIGxhYmVsOiAnRmFpbGVkJyB9LFxuICB7IHZhbHVlOiAncmVmdW5kZWQnLCBsYWJlbDogJ1JlZnVuZGVkJyB9LFxuXVxuXG5mdW5jdGlvbiBDb3B5SWQoeyBsYWJlbCwgdmFsdWUsIGhyZWYgfSkge1xuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGlmICghdmFsdWUpIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1yenAtcm93XCI+XG4gICAgICA8c3Bhbj57bGFiZWx9PC9zcGFuPlxuICAgICAgPGNvZGU+e3ZhbHVlfTwvY29kZT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQodmFsdWUpPy50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gc2V0Q29waWVkKGZhbHNlKSwgMTIwMClcbiAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7fSlcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2NvcGllZCA/ICdDb3BpZWQnIDogJ0NvcHknfVxuICAgICAgPC9idXR0b24+XG4gICAgICB7aHJlZiA/IChcbiAgICAgICAgPGEgaHJlZj17aHJlZn0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiPlxuICAgICAgICAgIE9wZW4gaW4gUmF6b3JwYXlcbiAgICAgICAgPC9hPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gZGVsaXZlcnlDaG9pY2VMYWJlbChvcHRpb24pIHtcbiAgaWYgKG9wdGlvbiA9PT0gJ2V4cHJlc3MnKSByZXR1cm4gJ0V4cHJlc3MnXG4gIGlmIChvcHRpb24gPT09ICdtb3JuaW5nJykgcmV0dXJuICdNb3JuaW5nJ1xuICByZXR1cm4gJydcbn1cblxuZnVuY3Rpb24gZm9ybWF0RXhwZWN0ZWREYXRlKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gJydcbiAgcmV0dXJuIGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1HQicsIHtcbiAgICBkYXk6ICdudW1lcmljJyxcbiAgICBtb250aDogJ3Nob3J0JyxcbiAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgdGltZVpvbmU6ICdBc2lhL0tvbGthdGEnLFxuICB9KVxufVxuXG5jb25zdCBmb3JtYXRNb25leSA9ICh2YWx1ZSkgPT4ge1xuICBjb25zdCBhbW91bnQgPSBOdW1iZXIodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oYW1vdW50KSkgcmV0dXJuICfigrkwJ1xuICByZXR1cm4gYOKCuSR7YW1vdW50LnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pfWBcbn1cblxuY29uc3QgZm9ybWF0RGF0ZVRpbWUgPSAodmFsdWUpID0+IHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICfigJQnXG4gIHJldHVybiBuZXcgRGF0ZSh2YWx1ZSkudG9Mb2NhbGVTdHJpbmcoJ2VuLUlOJywge1xuICAgIGRhdGVTdHlsZTogJ21lZGl1bScsXG4gICAgdGltZVN0eWxlOiAnc2hvcnQnLFxuICB9KVxufVxuXG5jb25zdCByZXNvbHZlSW1hZ2UgPSAodmFsdWUpID0+IHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdCh2YWx1ZSkpIHJldHVybiB2YWx1ZVxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnLycpKSByZXR1cm4gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke3ZhbHVlfWBcbiAgcmV0dXJuIHZhbHVlXG59XG5cbmZ1bmN0aW9uIE1vcmVNZW51KHsgdW5wYWlkLCBjYW5TeW5jUmF6b3JwYXksIGJ1c3ksIG9uQ2FzaCwgb25Rciwgb25TeW5jUmF6b3JwYXksIG9uUmVzZW5kUGFydG5lciB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1tb3JlXCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHZhbHVlKSA9PiAhdmFsdWUpfT5cbiAgICAgICAgTW9yZSBhY3Rpb25zXG4gICAgICAgIDxzcGFuPntvcGVuID8gJ+KWtCcgOiAn4pa+J308L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLW9yZGVyLW1vcmUtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtCb29sZWFuKGJ1c3kpfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICBvblJlc2VuZFBhcnRuZXIoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7YnVzeSA9PT0gJ3Jlc2VuZFBhcnRuZXJXaGF0c2FwcCcgPyAnU2VuZGluZ+KApicgOiAnUmVzZW5kIG1lc3NhZ2UgdG8gZGVsaXZlcnkgcGFydG5lcid9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAge3VucGFpZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgb25DYXNoKClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2J1c3kgPT09ICdjb2xsZWN0Q2FzaCcgPyAnU2F2aW5n4oCmJyA6ICdNYXJrIGNhc2ggY29sbGVjdGVkJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgb25RcigpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtidXN5ID09PSAnZ2VuZXJhdGVRcicgPyAnQ3JlYXRpbmfigKYnIDogJ0dlbmVyYXRlIHBheW1lbnQgUVInfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtjYW5TeW5jUmF6b3JwYXkgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgb25TeW5jUmF6b3JwYXkoKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7YnVzeSA9PT0gJ3N5bmNSYXpvcnBheScgPyAnQ2hlY2tpbmcgUmF6b3JwYXnigKYnIDogJ1N5bmMgUmF6b3JwYXkgcGF5bWVudCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBzbmFwc2hvdChwYXJhbXMgPSB7fSkge1xuICByZXR1cm4ge1xuICAgIHN0YXR1czogcGFyYW1zLnN0YXR1cyB8fCAnJyxcbiAgICBwYXltZW50U3RhdHVzOiBwYXJhbXMucGF5bWVudFN0YXR1cyB8fCAnJyxcbiAgICBkZWxpdmVyeVBhcnRuZXJJZDogcGFyYW1zLmRlbGl2ZXJ5UGFydG5lcklkIHx8ICcnLFxuICAgIGNvbnRhY3ROYW1lOiBwYXJhbXMuY29udGFjdE5hbWUgfHwgJycsXG4gICAgY29udGFjdFBob25lOiBwYXJhbXMuY29udGFjdFBob25lIHx8ICcnLFxuICAgIGFkZHJlc3NMaW5lMTogcGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJyxcbiAgICBhZGRyZXNzTGluZTI6IHBhcmFtcy5hZGRyZXNzTGluZTIgfHwgJycsXG4gICAgYWRkcmVzc0NpdHk6IHBhcmFtcy5hZGRyZXNzQ2l0eSB8fCAnJyxcbiAgICBhZGRyZXNzU3RhdGU6IHBhcmFtcy5hZGRyZXNzU3RhdGUgfHwgJycsXG4gICAgYWRkcmVzc1BpbmNvZGU6IHBhcmFtcy5hZGRyZXNzUGluY29kZSB8fCAnJyxcbiAgICBhZGRyZXNzTGFuZG1hcms6IHBhcmFtcy5hZGRyZXNzTGFuZG1hcmsgfHwgJycsXG4gIH1cbn1cblxuY29uc3QgT3JkZXJEZXRhaWwgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlLCBhY3Rpb24gfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdCwgbG9hZGluZywgc2V0UmVjb3JkIH0gPSB1c2VSZWNvcmQoaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UuaWQpXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2FjdGlvbkJ1c3ksIHNldEFjdGlvbkJ1c3ldID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtwYXJ0bmVycywgc2V0UGFydG5lcnNdID0gdXNlU3RhdGUoW3sgdmFsdWU6ICcnLCBsYWJlbDogJ1VuYXNzaWduZWQnIH1dKVxuICBjb25zdCBbYmFzZWxpbmUsIHNldEJhc2VsaW5lXSA9IHVzZVN0YXRlKCgpID0+IHNuYXBzaG90KGluaXRpYWxSZWNvcmQ/LnBhcmFtcykpXG4gIGNvbnN0IFtlZGl0Q29udGFjdCwgc2V0RWRpdENvbnRhY3RdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtlZGl0QWRkcmVzcywgc2V0RWRpdEFkZHJlc3NdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWN0aW9uPy5uYW1lICE9PSAnc2hvdycpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBuZXh0ID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL3Nob3dcXC8/JC8sICcvZWRpdCcpXG4gICAgaWYgKG5leHQgIT09IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSkgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UobmV4dClcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH0sIFthY3Rpb24/Lm5hbWVdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGlnbm9yZSA9IGZhbHNlXG4gICAgYXBpXG4gICAgICAucmVzb3VyY2VBY3Rpb24oeyByZXNvdXJjZUlkOiAnRGVsaXZlcnlQYXJ0bmVyJywgYWN0aW9uTmFtZTogJ2xpc3QnLCBwYXJhbXM6IHsgcGVyUGFnZTogMjAwIH0gfSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAoaWdub3JlKSByZXR1cm5cbiAgICAgICAgY29uc3QgcmVjb3JkcyA9IHJlc3BvbnNlLmRhdGE/LnJlY29yZHMgfHwgW11cbiAgICAgICAgc2V0UGFydG5lcnMoW1xuICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ1VuYXNzaWduZWQnIH0sXG4gICAgICAgICAgLi4ucmVjb3Jkcy5tYXAoKGl0ZW0pID0+ICh7XG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5pZCB8fCBpdGVtLnBhcmFtcz8uaWQsXG4gICAgICAgICAgICBsYWJlbDogaXRlbS5wYXJhbXM/LmlzQWN0aXZlID09PSBmYWxzZVxuICAgICAgICAgICAgICA/IGAke2l0ZW0ucGFyYW1zPy5uYW1lIHx8ICdQYXJ0bmVyJ30gKGluYWN0aXZlKWBcbiAgICAgICAgICAgICAgOiBpdGVtLnBhcmFtcz8ubmFtZSB8fCAnUGFydG5lcicsXG4gICAgICAgICAgfSkpLFxuICAgICAgICBdKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGlmICghaWdub3JlKSBzZXRQYXJ0bmVycyhbeyB2YWx1ZTogJycsIGxhYmVsOiAnVW5hc3NpZ25lZCcgfV0pXG4gICAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBpdGVtcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHBhcmFtcy5pdGVtc0pzb24gfHwgJ1tdJylcbiAgICAgIHJldHVybiBwYXJzZWQubWFwKChpdGVtKSA9PiAoeyAuLi5pdGVtLCBpbWFnZTogcmVzb2x2ZUltYWdlKGl0ZW0uaW1hZ2UpIH0pKVxuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICB9LCBbcGFyYW1zLml0ZW1zSnNvbl0pXG5cbiAgY29uc3QgY3VycmVudCA9IHNuYXBzaG90KHBhcmFtcylcbiAgY29uc3QgZGlydHkgPSBPYmplY3Qua2V5cyhjdXJyZW50KS5zb21lKChrZXkpID0+IGN1cnJlbnRba2V5XSAhPT0gYmFzZWxpbmVba2V5XSlcbiAgY29uc3QgbGlzdFVybCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9yZWNvcmRzXFwvLiokLywgJycpXG4gIGNvbnN0IHVucGFpZCA9IHBhcmFtcy5wYXltZW50U3RhdHVzICE9PSAncGFpZCdcbiAgY29uc3QgY2FuU3luY1Jhem9ycGF5ID0gdW5wYWlkICYmIHBhcmFtcy5wYXltZW50TW9kZSA9PT0gJ29ubGluZSdcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY2FuU3luY1Jhem9ycGF5IHx8ICFyZWNvcmQ/LmlkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgbGV0IGlnbm9yZSA9IGZhbHNlXG4gICAgYXBpXG4gICAgICAucmVjb3JkQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIHJlY29yZElkOiByZWNvcmQuaWQsXG4gICAgICAgIGFjdGlvbk5hbWU6ICdzeW5jUmF6b3JwYXknLFxuICAgICAgfSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAoaWdub3JlKSByZXR1cm5cbiAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGE/LnJlY29yZCkge1xuICAgICAgICAgIHNldFJlY29yZChyZXNwb25zZS5kYXRhLnJlY29yZClcbiAgICAgICAgICBzZXRCYXNlbGluZShzbmFwc2hvdChyZXNwb25zZS5kYXRhLnJlY29yZC5wYXJhbXMpKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlLmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnc3VjY2VzcycpIGFkZE5vdGljZShub3RpY2UpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHt9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbY2FuU3luY1Jhem9ycGF5LCByZWNvcmQ/LmlkLCByZXNvdXJjZS5pZCwgc2V0UmVjb3JkXSlcblxuICBjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNvbnN0IHBob25lID0gU3RyaW5nKHBhcmFtcy5jb250YWN0UGhvbmUgfHwgJycpLnJlcGxhY2UoL1xcRC9nLCAnJylcbiAgICBjb25zdCBwaW4gPSBTdHJpbmcocGFyYW1zLmFkZHJlc3NQaW5jb2RlIHx8ICcnKS5yZXBsYWNlKC9cXEQvZywgJycpXG4gICAgaWYgKCFTdHJpbmcocGFyYW1zLmNvbnRhY3ROYW1lIHx8ICcnKS50cmltKCkgfHwgcGhvbmUubGVuZ3RoIDwgMTApIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdFbnRlciB0aGUgY3VzdG9tZXIgbmFtZSBhbmQgYSAxMC1kaWdpdCBjb250YWN0IG51bWJlci4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFTdHJpbmcocGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJykudHJpbSgpIHx8ICFTdHJpbmcocGFyYW1zLmFkZHJlc3NDaXR5IHx8ICcnKS50cmltKCkgfHwgIVN0cmluZyhwYXJhbXMuYWRkcmVzc1N0YXRlIHx8ICcnKS50cmltKCkgfHwgcGluLmxlbmd0aCAhPT0gNikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0VudGVyIHRoZSBob3VzZSwgY2l0eSwgc3RhdGUsIGFuZCBhIDYtZGlnaXQgcGluY29kZS4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc2V0U2F2aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc3VibWl0KClcbiAgICAgIGNvbnN0IG5leHQgPSByZXNwb25zZT8uZGF0YT8ucmVjb3JkPy5wYXJhbXNcbiAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgIHNldEJhc2VsaW5lKHNuYXBzaG90KG5leHQpKVxuICAgICAgICBzZXRFZGl0Q29udGFjdChmYWxzZSlcbiAgICAgICAgc2V0RWRpdEFkZHJlc3MoZmFsc2UpXG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFNhdmluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBydW5QYXltZW50QWN0aW9uID0gYXN5bmMgKGFjdGlvbk5hbWUpID0+IHtcbiAgICBpZiAoYWN0aW9uTmFtZSA9PT0gJ2NvbGxlY3RDYXNoJyAmJiAhd2luZG93LmNvbmZpcm0oJ01hcmsgdGhpcyBvcmRlciBhcyBwYWlkIGluIGNhc2g/JykpIHJldHVyblxuICAgIHNldEFjdGlvbkJ1c3koYWN0aW9uTmFtZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIHJlY29yZElkOiByZWNvcmQuaWQsXG4gICAgICAgIGFjdGlvbk5hbWUsXG4gICAgICB9KVxuICAgICAgaWYgKHJlc3BvbnNlLmRhdGE/LnJlY29yZCkge1xuICAgICAgICBzZXRSZWNvcmQocmVzcG9uc2UuZGF0YS5yZWNvcmQpXG4gICAgICAgIHNldEJhc2VsaW5lKHNuYXBzaG90KHJlc3BvbnNlLmRhdGEucmVjb3JkLnBhcmFtcykpXG4gICAgICB9XG4gICAgICBhZGROb3RpY2UocmVzcG9uc2UuZGF0YT8ubm90aWNlIHx8IHsgbWVzc2FnZTogJ1VwZGF0ZWQuJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBjb21wbGV0ZSB0aGlzIGFjdGlvbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEFjdGlvbkJ1c3koJycpXG4gICAgfVxuICB9XG5cbiAgaWYgKGFjdGlvbj8ubmFtZSA9PT0gJ3Nob3cnKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGZ1bGZpbGxtZW50ID0gZ2V0RnVsZmlsbG1lbnRCYWRnZShwYXJhbXMuc3RhdHVzKVxuICBjb25zdCBwYXltZW50ID0gZ2V0UGF5bWVudEJhZGdlKHBhcmFtcylcbiAgY29uc3Qgc3RhdHVzTGFiZWwgPSBmdWxmaWxsbWVudC5sYWJlbFxuICBjb25zdCByZXN0b3JlRmllbGRzID0gKGtleXMsIGNsb3NlKSA9PiB7XG4gICAga2V5cy5mb3JFYWNoKChrZXkpID0+IGhhbmRsZUNoYW5nZShrZXksIGJhc2VsaW5lW2tleV0gfHwgJycpKVxuICAgIGNsb3NlKGZhbHNlKVxuICB9XG4gIGNvbnN0IGFkZHJlc3NUZXh0ID0gW1xuICAgIHBhcmFtcy5hZGRyZXNzTGluZTEsXG4gICAgcGFyYW1zLmFkZHJlc3NMaW5lMixcbiAgICBbcGFyYW1zLmFkZHJlc3NDaXR5LCBwYXJhbXMuYWRkcmVzc1N0YXRlLCBwYXJhbXMuYWRkcmVzc1BpbmNvZGVdLmZpbHRlcihCb29sZWFuKS5qb2luKCcsICcpLFxuICAgIHBhcmFtcy5hZGRyZXNzTGFuZG1hcmsgPyBgTGFuZG1hcms6ICR7cGFyYW1zLmFkZHJlc3NMYW5kbWFya31gIDogJycsXG4gIF0uZmlsdGVyKEJvb2xlYW4pXG4gIGNvbnN0IHBheW1lbnRMYWJlbCA9IHBheW1lbnQubGFiZWxcbiAgY29uc3QgcGFydG5lck5hbWUgPSBwYXJhbXMuZGVsaXZlcnlQYXJ0bmVyTmFtZVxuICAgID8gYCR7cGFyYW1zLmRlbGl2ZXJ5UGFydG5lck5hbWV9JHtwYXJhbXMuZGVsaXZlcnlQYXJ0bmVyUGhvbmUgPyBgIMK3ICR7cGFyYW1zLmRlbGl2ZXJ5UGFydG5lclBob25lfWAgOiAnJ31gXG4gICAgOiAnTm8gZGVsaXZlcnkgcGFydG5lciB5ZXQnXG4gIGNvbnN0IGl0ZW1Db3VudCA9IGl0ZW1zLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiBzdW0gKyBOdW1iZXIoaXRlbS5xdWFudGl0eSB8fCAwKSwgMClcbiAgY29uc3QgZGVsaXZlcnlOYW1lID0gZGVsaXZlcnlDaG9pY2VMYWJlbChwYXJhbXMuZGVsaXZlcnlPcHRpb24pXG4gIGNvbnN0IGV4cGVjdGVkRGVsaXZlcnkgPSBmb3JtYXRFeHBlY3RlZERhdGUocGFyYW1zLmV4cGVjdGVkRGVsaXZlcnlEYXRlKVxuXG4gIHJldHVybiAoXG4gICAgPGZvcm0gY2xhc3NOYW1lPVwidG9rcmktb3JkZXJcIiBvblN1Ym1pdD17aGFuZGxlU2F2ZX0+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXRpdGxlXCI+XG4gICAgICAgICAgPGEgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItYmFja1wiIGhyZWY9e2xpc3RVcmx9IGFyaWEtbGFiZWw9XCJCYWNrIHRvIG9yZGVyc1wiPuKGkDwvYT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10aXRsZS1yb3dcIj5cbiAgICAgICAgICAgICAgPGgyPiN7cGFyYW1zLm9yZGVyTm99PC9oMj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktb3JkZXItcGlsbCBpcy0ke3BheW1lbnQudG9uZX1gfT57cGF5bWVudExhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktb3JkZXItcGlsbCBpcy0ke2Z1bGZpbGxtZW50LnRvbmV9YH0+e3N0YXR1c0xhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHA+e2Zvcm1hdERhdGVUaW1lKHBhcmFtcy5jcmVhdGVkQXQpfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItYWN0aW9uc1wiPlxuICAgICAgICAgIDxhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnZvaWNlXCJcbiAgICAgICAgICAgIGhyZWY9e2AvdG9rcmktYmFja29mZmljZS9vcmRlcnMvJHtyZWNvcmQuaWR9L2ludm9pY2U/ZG93bmxvYWQ9MWB9XG4gICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICB0aXRsZT1cIkRvd25sb2FkIFBERiBpbnZvaWNlXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBEb3dubG9hZCBJbnZvaWNlXG4gICAgICAgICAgPC9hPlxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItc2F2ZVwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17IWRpcnR5IHx8IGxvYWRpbmcgfHwgc2F2aW5nfT5cbiAgICAgICAgICAgIHtzYXZpbmcgPyAnU2F2aW5n4oCmJyA6ICdTYXZlJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8TW9yZU1lbnVcbiAgICAgICAgICAgIHVucGFpZD17dW5wYWlkfVxuICAgICAgICAgICAgY2FuU3luY1Jhem9ycGF5PXtjYW5TeW5jUmF6b3JwYXl9XG4gICAgICAgICAgICBidXN5PXthY3Rpb25CdXN5fVxuICAgICAgICAgICAgb25DYXNoPXsoKSA9PiBydW5QYXltZW50QWN0aW9uKCdjb2xsZWN0Q2FzaCcpfVxuICAgICAgICAgICAgb25Rcj17KCkgPT4gcnVuUGF5bWVudEFjdGlvbignZ2VuZXJhdGVRcicpfVxuICAgICAgICAgICAgb25TeW5jUmF6b3JwYXk9eygpID0+IHJ1blBheW1lbnRBY3Rpb24oJ3N5bmNSYXpvcnBheScpfVxuICAgICAgICAgICAgb25SZXNlbmRQYXJ0bmVyPXsoKSA9PiBydW5QYXltZW50QWN0aW9uKCdyZXNlbmRQYXJ0bmVyV2hhdHNhcHAnKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWxheW91dFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLW1haW5cIj5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWNhcmQtaGVhZFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0b2tyaS1vcmRlci1tYXJrIGlzLSR7ZnVsZmlsbG1lbnQudG9uZX1gfSAvPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e3N0YXR1c0xhYmVsfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxzcGFuPntpdGVtQ291bnR9IHtpdGVtQ291bnQgPT09IDEgPyAnaXRlbScgOiAnaXRlbXMnfSDCtyB7cGFydG5lck5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWxlY3RcIj5cbiAgICAgICAgICAgICAgICA8TG9jYWxTZWxlY3RcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc3RhdHVzIHx8ICdwZW5kaW5nJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e0ZVTEZJTExNRU5UfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKCdzdGF0dXMnLCB2YWx1ZSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtpdGVtcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVtcHR5XCI+Tm8gaXRlbXMgb24gdGhpcyBvcmRlci48L3A+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWl0ZW1zXCI+XG4gICAgICAgICAgICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGFydGljbGUga2V5PXtpdGVtLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10aHVtYi13cmFwXCI+XG4gICAgICAgICAgICAgICAgICAgICAge2l0ZW0uaW1hZ2UgPyA8aW1nIHNyYz17aXRlbS5pbWFnZX0gYWx0PVwiXCIgLz4gOiA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10aHVtYlwiIC8+fVxuICAgICAgICAgICAgICAgICAgICAgIDxlbT57aXRlbS5xdWFudGl0eX08L2VtPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgICAge2l0ZW0ud2VpZ2h0ID8gPHNwYW4+e2l0ZW0ud2VpZ2h0fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcXR5XCI+e2Zvcm1hdE1vbmV5KGl0ZW0ucHJpY2VWYWx1ZSl9IMOXIHtpdGVtLnF1YW50aXR5fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGI+e2Zvcm1hdE1vbmV5KGl0ZW0ubGluZVRvdGFsKX08L2I+XG4gICAgICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWNhcmQtaGVhZFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0b2tyaS1vcmRlci1tYXJrIGlzLSR7cGF5bWVudC50b25lfWB9IC8+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz57cGF5bWVudExhYmVsfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxzcGFuPntwYXJhbXMucGF5bWVudE1ldGhvZCB8fCAnQ2FzaCBvbiBkZWxpdmVyeSd9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWxlY3RcIj5cbiAgICAgICAgICAgICAgICA8TG9jYWxTZWxlY3RcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucGF5bWVudFN0YXR1cyB8fCAncGVuZGluZyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXtQQVlNRU5UX09QVElPTlN9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2UoJ3BheW1lbnRTdGF0dXMnLCB2YWx1ZSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10b3RhbHNcIj5cbiAgICAgICAgICAgICAgPGRpdj48ZHQ+U3VidG90YWw8L2R0PjxkZD57aXRlbUNvdW50fSB7aXRlbUNvdW50ID09PSAxID8gJ2l0ZW0nIDogJ2l0ZW1zJ308L2RkPjxkZD57Zm9ybWF0TW9uZXkocGFyYW1zLml0ZW1zVG90YWwpfTwvZGQ+PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGR0PkRlbGl2ZXJ5e2RlbGl2ZXJ5TmFtZSA/IGAgLSAke2RlbGl2ZXJ5TmFtZX1gIDogJyd9PC9kdD5cbiAgICAgICAgICAgICAgICA8ZGQ+e2V4cGVjdGVkRGVsaXZlcnkgPyBgRXhwZWN0ZWQgJHtleHBlY3RlZERlbGl2ZXJ5fWAgOiAnJ308L2RkPlxuICAgICAgICAgICAgICAgIDxkZD57cGFyYW1zLmZyZWVEZWxpdmVyeUFwcGxpZWQgfHwgTnVtYmVyKHBhcmFtcy5kZWxpdmVyeUNoYXJnZSkgPT09IDAgPyAnRnJlZSAoV2VsY29tZSBvZmZlciknIDogZm9ybWF0TW9uZXkocGFyYW1zLmRlbGl2ZXJ5Q2hhcmdlKX08L2RkPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj48ZHQ+SGFuZGxpbmc8L2R0PjxkZCAvPjxkZD57Zm9ybWF0TW9uZXkocGFyYW1zLmhhbmRsaW5nQ2hhcmdlKX08L2RkPjwvZGl2PlxuICAgICAgICAgICAgICB7TnVtYmVyKHBhcmFtcy50YXhUb3RhbCkgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8ZHQ+VGF4ZXMgKEdTVCl7cGFyYW1zLmlzSW50ZXJTdGF0ZSA/ICcgwrcgSUdTVCcgOiAnIMK3IENHU1QrU0dTVCd9PC9kdD5cbiAgICAgICAgICAgICAgICAgIDxkZCAvPlxuICAgICAgICAgICAgICAgICAgPGRkPntmb3JtYXRNb25leShwYXJhbXMudGF4VG90YWwpfTwvZGQ+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7TnVtYmVyKHBhcmFtcy5zbWFsbENhcnRDaGFyZ2UpID4gMCA/IChcbiAgICAgICAgICAgICAgICA8ZGl2PjxkdD5TbWFsbCBjYXJ0PC9kdD48ZGQgLz48ZGQ+e2Zvcm1hdE1vbmV5KHBhcmFtcy5zbWFsbENhcnRDaGFyZ2UpfTwvZGQ+PC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7TnVtYmVyKHBhcmFtcy5kaXNjb3VudCkgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxkaXY+PGR0PkRpc2NvdW50e3BhcmFtcy5jb3Vwb25Db2RlID8gYCDCtyAke3BhcmFtcy5jb3Vwb25Db2RlfWAgOiAnJ308L2R0PjxkZCAvPjxkZD4te2Zvcm1hdE1vbmV5KHBhcmFtcy5kaXNjb3VudCl9PC9kZD48L2Rpdj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaXMtdG90YWxcIj48ZHQ+VG90YWw8L2R0PjxkZCAvPjxkZD57Zm9ybWF0TW9uZXkocGFyYW1zLmdyYW5kVG90YWwpfTwvZGQ+PC9kaXY+XG4gICAgICAgICAgICA8L2RsPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jb2xsZWN0ZWRcIj5cbiAgICAgICAgICAgICAgPHNwYW4+e3BhcmFtcy5wYXltZW50U3RhdHVzID09PSAncGFpZCcgPyAnUGFpZCBieSBjdXN0b21lcicgOiAnU3RpbGwgdG8gY29sbGVjdCd9PC9zcGFuPlxuICAgICAgICAgICAgICA8Yj57Zm9ybWF0TW9uZXkocGFyYW1zLmdyYW5kVG90YWwpfTwvYj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge3BhcmFtcy5wYXltZW50Q29sbGVjdGVkQXMgPyA8cCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1tZXRhXCI+Q29sbGVjdGVkIGFzIHtwYXJhbXMucGF5bWVudENvbGxlY3RlZEFzfTwvcD4gOiBudWxsfVxuICAgICAgICAgICAge3BhcmFtcy5wYXltZW50TW9kZSA9PT0gJ29ubGluZScgfHwgcGFyYW1zLnJhem9ycGF5UGF5bWVudElkIHx8IHBhcmFtcy5yYXpvcnBheU9yZGVySWQgPyAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcnpwXCI+XG4gICAgICAgICAgICAgICAgPENvcHlJZFxuICAgICAgICAgICAgICAgICAgbGFiZWw9XCJQYXltZW50IElEXCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucmF6b3JwYXlQYXltZW50SWR9XG4gICAgICAgICAgICAgICAgICBocmVmPXtwYXJhbXMucmF6b3JwYXlQYXltZW50SWRcbiAgICAgICAgICAgICAgICAgICAgPyBgaHR0cHM6Ly9kYXNoYm9hcmQucmF6b3JwYXkuY29tL2FwcC9wYXltZW50cy8ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXMucmF6b3JwYXlQYXltZW50SWQpfWBcbiAgICAgICAgICAgICAgICAgICAgOiAnJ31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxDb3B5SWRcbiAgICAgICAgICAgICAgICAgIGxhYmVsPVwiUmF6b3JwYXkgb3JkZXJcIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5yYXpvcnBheU9yZGVySWR9XG4gICAgICAgICAgICAgICAgICBocmVmPXtwYXJhbXMucmF6b3JwYXlPcmRlcklkXG4gICAgICAgICAgICAgICAgICAgID8gYGh0dHBzOi8vZGFzaGJvYXJkLnJhem9ycGF5LmNvbS9hcHAvb3JkZXJzLyR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5yYXpvcnBheU9yZGVySWQpfWBcbiAgICAgICAgICAgICAgICAgICAgOiAnJ31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHshcGFyYW1zLnJhem9ycGF5UGF5bWVudElkID8gKFxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItbWV0YVwiPk5vIFJhem9ycGF5IHBheW1lbnQgSUQgeWV0LiBVc2UgU3luYyBSYXpvcnBheSBwYXltZW50IGlmIG1vbmV5IHdhcyBjYXB0dXJlZC48L3A+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICB7cGFyYW1zLnJhem9ycGF5UXJVcmwgPyAoXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcXJcIiBzcmM9e3BhcmFtcy5yYXpvcnBheVFyVXJsfSBhbHQ9XCJEb29yc3RlcCBwYXltZW50IFFSXCIgLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGFzaWRlIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNpZGVcIj5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNlY3Rpb24taGVhZFwiPlxuICAgICAgICAgICAgICA8aDM+Q3VzdG9tZXI8L2gzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNlY3Rpb24taGVhZFwiPlxuICAgICAgICAgICAgICA8aDQ+Q29udGFjdDwvaDQ+XG4gICAgICAgICAgICAgIHtlZGl0Q29udGFjdCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXRcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gcmVzdG9yZUZpZWxkcyhbJ2NvbnRhY3ROYW1lJywgJ2NvbnRhY3RQaG9uZSddLCBzZXRFZGl0Q29udGFjdCl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZWRpdFwiIG9uQ2xpY2s9eygpID0+IHNldEVkaXRDb250YWN0KHRydWUpfT5cbiAgICAgICAgICAgICAgICAgIEVkaXRcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge2VkaXRDb250YWN0ID8gKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXQtZmllbGRzXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICBOYW1lXG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNvbnRhY3ROYW1lIHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2NvbnRhY3ROYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZmllbGRcIj5cbiAgICAgICAgICAgICAgICAgIFBob25lIG51bWJlclxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY29udGFjdFBob25lIHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2NvbnRhY3RQaG9uZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1yZWFkXCI+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz57cGFyYW1zLmNvbnRhY3ROYW1lIHx8ICfigJQnfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxwPntwYXJhbXMuY29udGFjdFBob25lID8gYCs5MSAke3BhcmFtcy5jb250YWN0UGhvbmV9YCA6ICfigJQnfTwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApfVxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNlY3Rpb24taGVhZFwiPlxuICAgICAgICAgICAgICA8aDQ+U2hpcHBpbmcgYWRkcmVzczwvaDQ+XG4gICAgICAgICAgICAgIHtlZGl0QWRkcmVzcyA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXRcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gcmVzdG9yZUZpZWxkcyhcbiAgICAgICAgICAgICAgICAgICAgWydhZGRyZXNzTGluZTEnLCAnYWRkcmVzc0xpbmUyJywgJ2FkZHJlc3NDaXR5JywgJ2FkZHJlc3NTdGF0ZScsICdhZGRyZXNzUGluY29kZScsICdhZGRyZXNzTGFuZG1hcmsnXSxcbiAgICAgICAgICAgICAgICAgICAgc2V0RWRpdEFkZHJlc3MsXG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXRcIiBvbkNsaWNrPXsoKSA9PiBzZXRFZGl0QWRkcmVzcyh0cnVlKX0+XG4gICAgICAgICAgICAgICAgICBFZGl0XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtlZGl0QWRkcmVzcyA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0LWZpZWxkc1wiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgSG91c2UgLyBmbGF0XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzTGluZTEnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgU3RyZWV0IC8gYXJlYVxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzTGluZTIgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnYWRkcmVzc0xpbmUyJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWFkZHJlc3MtZ3JpZFwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIENpdHlcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWRkcmVzc0NpdHkgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzQ2l0eScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIFN0YXRlXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NTdGF0ZSB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2FkZHJlc3NTdGF0ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIFBpbmNvZGVcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWRkcmVzc1BpbmNvZGUgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzUGluY29kZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIExhbmRtYXJrXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NMYW5kbWFyayB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2FkZHJlc3NMYW5kbWFyaycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcmVhZFwiPlxuICAgICAgICAgICAgICAgIHthZGRyZXNzVGV4dC5sZW5ndGggPyBhZGRyZXNzVGV4dC5tYXAoKGxpbmUpID0+IDxwIGtleT17bGluZX0+e2xpbmV9PC9wPikgOiA8cD7igJQ8L3A+fVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8aDQ+RGVsaXZlcnkgcGFydG5lcjwvaDQ+XG4gICAgICAgICAgICA8U2VhcmNoYWJsZVNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmRlbGl2ZXJ5UGFydG5lcklkIHx8ICcnfVxuICAgICAgICAgICAgICBvcHRpb25zPXtwYXJ0bmVyc31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKCdkZWxpdmVyeVBhcnRuZXJJZCcsIHZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJVbmFzc2lnbmVkXCJcbiAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggcGFydG5lcnNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Zvcm0+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgT3JkZXJEZXRhaWxcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJbnB1dCwgTGFiZWwsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB1c2VOb3RpY2UgfSBmcm9tICdhZG1pbmpzJ1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuY29uc3QgRXllSWNvbiA9ICh7IGhpZGRlbiB9KSA9PlxuICBoaWRkZW4gPyAoXG4gICAgPHN2ZyB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTMgM2wxOCAxOFwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTEwLjYgMTAuNkEyIDIgMCAwIDAgMTMuNCAxMy40XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOS45IDQuMkExMC43IDEwLjcgMCAwIDEgMTIgNGM1IDAgOSA0LjUgMTAgOGExMi44IDEyLjggMCAwIDEtMi4xIDMuNlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTYuNiA2LjZDNC4zIDggMi43IDEwLjIgMiAxMmMxIDMuNSA1IDggMTAgOCAxLjUgMCAyLjktLjQgNC4xLTFcIiAvPlxuICAgIDwvc3ZnPlxuICApIDogKFxuICAgIDxzdmcgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yIDEyczQtNyAxMC03IDEwIDcgMTAgNy00IDctMTAgN1MyIDEyIDIgMTJ6XCIgLz5cbiAgICAgIDxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiIC8+XG4gICAgPC9zdmc+XG4gIClcblxuZnVuY3Rpb24gUGFzc3dvcmRGaWVsZCh7IGlkLCBsYWJlbCwgdmFsdWUsIG9uQ2hhbmdlLCB2aXNpYmxlLCBvblRvZ2dsZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPEJveCBtYj1cImxnXCI+XG4gICAgICA8TGFiZWwgaHRtbEZvcj17aWR9IHJlcXVpcmVkPntsYWJlbH08L0xhYmVsPlxuICAgICAgPEJveCBwb3NpdGlvbj1cInJlbGF0aXZlXCIgd2lkdGg9XCIxMDAlXCI+XG4gICAgICAgIDxJbnB1dFxuICAgICAgICAgIGlkPXtpZH1cbiAgICAgICAgICB0eXBlPXt2aXNpYmxlID8gJ3RleHQnIDogJ3Bhc3N3b3JkJ31cbiAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICBhdXRvQ29tcGxldGU9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmdSaWdodDogNDIgfX1cbiAgICAgICAgLz5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGFyaWEtbGFiZWw9e3Zpc2libGUgPyAnSGlkZSBwYXNzd29yZCcgOiAnU2hvdyBwYXNzd29yZCd9XG4gICAgICAgICAgb25DbGljaz17b25Ub2dnbGV9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgcmlnaHQ6IDgsXG4gICAgICAgICAgICB0b3A6ICc1MCUnLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgtNTAlKScsXG4gICAgICAgICAgICBib3JkZXI6IDAsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgY29sb3I6ICcjMDQ3ODU3JyxcbiAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1mbGV4JyxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDI2LFxuICAgICAgICAgICAgaGVpZ2h0OiAyNixcbiAgICAgICAgICAgIHBhZGRpbmc6IDAsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxFeWVJY29uIGhpZGRlbj17dmlzaWJsZX0gLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5jb25zdCBDaGFuZ2VQYXNzd29yZCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IFtwYXNzd29yZCwgc2V0UGFzc3dvcmRdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtjb25maXJtUGFzc3dvcmQsIHNldENvbmZpcm1QYXNzd29yZF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW3Nob3dQYXNzd29yZCwgc2V0U2hvd1Bhc3N3b3JkXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2hvd0NvbmZpcm0sIHNldFNob3dDb25maXJtXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUoJycpXG5cbiAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG4gIH1cblxuICBjb25zdCBzYXZlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIHNldEVycm9yKCcnKVxuICAgIGlmICghcGFzc3dvcmQgfHwgcGFzc3dvcmQubGVuZ3RoIDwgNikge1xuICAgICAgc2V0RXJyb3IoJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzLicpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHBhc3N3b3JkICE9PSBjb25maXJtUGFzc3dvcmQpIHtcbiAgICAgIHNldEVycm9yKCdOZXcgcGFzc3dvcmQgYW5kIGNvbmZpcm0gcGFzc3dvcmQgbXVzdCBiZSB0aGUgc2FtZS4nKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgc2V0U2F2aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnJlY29yZEFjdGlvbih7XG4gICAgICAgIHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuICAgICAgICByZWNvcmRJZDogcmVjb3JkLmlkLFxuICAgICAgICBhY3Rpb25OYW1lOiAnY2hhbmdlUGFzc3dvcmQnLFxuICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgZGF0YTogeyBwYXNzd29yZCwgY29uZmlybVBhc3N3b3JkIH0sXG4gICAgICB9KVxuICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2UuZGF0YT8ubm90aWNlXG4gICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgIHNldEVycm9yKG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBwYXNzd29yZC4nKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChub3RpY2UpIGFkZE5vdGljZShub3RpY2UpXG4gICAgICBjb25zdCByZWRpcmVjdFVybCA9IHJlc3BvbnNlLmRhdGE/LnJlZGlyZWN0VXJsXG4gICAgICBpZiAocmVkaXJlY3RVcmwpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSByZWRpcmVjdFVybFxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNsb3NlKClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHNldEVycm9yKGVyci5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBwYXNzd29yZC4nKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRTYXZpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgICAgaW5zZXQ6IDAsXG4gICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDIsIDEyLCA4LCAwLjYyKScsXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgekluZGV4OiA4MCxcbiAgICAgICAgcGFkZGluZzogMTYsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxCb3hcbiAgICAgICAgYXM9XCJmb3JtXCJcbiAgICAgICAgb25TdWJtaXQ9e3NhdmV9XG4gICAgICAgIGJnPVwid2hpdGVcIlxuICAgICAgICB3aWR0aD17WycxMDAlJywgJzQyMHB4J119XG4gICAgICAgIHA9XCJ4bFwiXG4gICAgICAgIHN0eWxlPXt7IGJvcmRlclJhZGl1czogMTYsIGJveFNoYWRvdzogJzAgMjRweCA3MHB4IHJnYmEoMiwgNDQsIDM0LCAwLjI4KScgfX1cbiAgICAgID5cbiAgICAgICAgPEgzIG1iPVwic21cIj5DaGFuZ2UgcGFzc3dvcmQ8L0gzPlxuICAgICAgICA8VGV4dCBtYj1cInhsXCIgY29sb3I9XCIjNjQ3NDhiXCI+XG4gICAgICAgICAgU2V0IGEgbmV3IHBhc3N3b3JkIGZvciB7cmVjb3JkPy5wYXJhbXM/Lm5hbWUgfHwgcmVjb3JkPy5wYXJhbXM/LmVtYWlsIHx8ICd0aGlzIHVzZXInfS5cbiAgICAgICAgPC9UZXh0PlxuXG4gICAgICAgIDxQYXNzd29yZEZpZWxkXG4gICAgICAgICAgaWQ9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAgIGxhYmVsPVwiTmV3IHBhc3N3b3JkXCJcbiAgICAgICAgICB2YWx1ZT17cGFzc3dvcmR9XG4gICAgICAgICAgb25DaGFuZ2U9e3NldFBhc3N3b3JkfVxuICAgICAgICAgIHZpc2libGU9e3Nob3dQYXNzd29yZH1cbiAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0U2hvd1Bhc3N3b3JkKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgLz5cbiAgICAgICAgPFBhc3N3b3JkRmllbGRcbiAgICAgICAgICBpZD1cImNvbmZpcm0tcGFzc3dvcmRcIlxuICAgICAgICAgIGxhYmVsPVwiQ29uZmlybSBwYXNzd29yZFwiXG4gICAgICAgICAgdmFsdWU9e2NvbmZpcm1QYXNzd29yZH1cbiAgICAgICAgICBvbkNoYW5nZT17c2V0Q29uZmlybVBhc3N3b3JkfVxuICAgICAgICAgIHZpc2libGU9e3Nob3dDb25maXJtfVxuICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRTaG93Q29uZmlybSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgIC8+XG5cbiAgICAgICAge2Vycm9yID8gKFxuICAgICAgICAgIDxUZXh0IG1iPVwibGdcIiBjb2xvcj1cIiNkYzI2MjZcIj57ZXJyb3J9PC9UZXh0PlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIganVzdGlmeUNvbnRlbnQ9XCJmbGV4LWVuZFwiIHN0eWxlPXt7IGdhcDogMTAgfX0+XG4gICAgICAgICAgPEJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgdmFyaWFudD1cInRleHRcIiBvbkNsaWNrPXtjbG9zZX0gZGlzYWJsZWQ9e3NhdmluZ30+XG4gICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uIHR5cGU9XCJzdWJtaXRcIiB2YXJpYW50PVwiY29udGFpbmVkXCIgZGlzYWJsZWQ9e3NhdmluZ30+XG4gICAgICAgICAgICB7c2F2aW5nID8gJ1NhdmluZ+KApicgOiAnU2F2ZSBwYXNzd29yZCd9XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvQm94PlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlUGFzc3dvcmRcbiIsIi8qKiBJU08gMzE2Ni0yOklOIGNvZGVzLiBLZXB0IG5leHQgdG8gdGhlIEFkbWluSlMgZm9ybSBzbyB0aGUgZHJvcGRvd24gYWx3YXlzIGhhcyBldmVyeSBzdGF0ZS4gKi9cbmV4cG9ydCBjb25zdCBJTkRJQV9TVEFURVMgPSBbXG4gIHsgY29kZTogJ0FOJywgbmFtZTogJ0FuZGFtYW4gYW5kIE5pY29iYXIgSXNsYW5kcycgfSxcbiAgeyBjb2RlOiAnQVAnLCBuYW1lOiAnQW5kaHJhIFByYWRlc2gnIH0sXG4gIHsgY29kZTogJ0FSJywgbmFtZTogJ0FydW5hY2hhbCBQcmFkZXNoJyB9LFxuICB7IGNvZGU6ICdBUycsIG5hbWU6ICdBc3NhbScgfSxcbiAgeyBjb2RlOiAnQlInLCBuYW1lOiAnQmloYXInIH0sXG4gIHsgY29kZTogJ0NIJywgbmFtZTogJ0NoYW5kaWdhcmgnIH0sXG4gIHsgY29kZTogJ0NUJywgbmFtZTogJ0NoaGF0dGlzZ2FyaCcgfSxcbiAgeyBjb2RlOiAnREgnLCBuYW1lOiAnRGFkcmEgYW5kIE5hZ2FyIEhhdmVsaSBhbmQgRGFtYW4gYW5kIERpdScgfSxcbiAgeyBjb2RlOiAnREwnLCBuYW1lOiAnRGVsaGknIH0sXG4gIHsgY29kZTogJ0dBJywgbmFtZTogJ0dvYScgfSxcbiAgeyBjb2RlOiAnR0onLCBuYW1lOiAnR3VqYXJhdCcgfSxcbiAgeyBjb2RlOiAnSFInLCBuYW1lOiAnSGFyeWFuYScgfSxcbiAgeyBjb2RlOiAnSFAnLCBuYW1lOiAnSGltYWNoYWwgUHJhZGVzaCcgfSxcbiAgeyBjb2RlOiAnSksnLCBuYW1lOiAnSmFtbXUgYW5kIEthc2htaXInIH0sXG4gIHsgY29kZTogJ0pIJywgbmFtZTogJ0poYXJraGFuZCcgfSxcbiAgeyBjb2RlOiAnS0EnLCBuYW1lOiAnS2FybmF0YWthJyB9LFxuICB7IGNvZGU6ICdLTCcsIG5hbWU6ICdLZXJhbGEnIH0sXG4gIHsgY29kZTogJ0xBJywgbmFtZTogJ0xhZGFraCcgfSxcbiAgeyBjb2RlOiAnTEQnLCBuYW1lOiAnTGFrc2hhZHdlZXAnIH0sXG4gIHsgY29kZTogJ01QJywgbmFtZTogJ01hZGh5YSBQcmFkZXNoJyB9LFxuICB7IGNvZGU6ICdNSCcsIG5hbWU6ICdNYWhhcmFzaHRyYScgfSxcbiAgeyBjb2RlOiAnTU4nLCBuYW1lOiAnTWFuaXB1cicgfSxcbiAgeyBjb2RlOiAnTUwnLCBuYW1lOiAnTWVnaGFsYXlhJyB9LFxuICB7IGNvZGU6ICdNWicsIG5hbWU6ICdNaXpvcmFtJyB9LFxuICB7IGNvZGU6ICdOTCcsIG5hbWU6ICdOYWdhbGFuZCcgfSxcbiAgeyBjb2RlOiAnT1InLCBuYW1lOiAnT2Rpc2hhJyB9LFxuICB7IGNvZGU6ICdQWScsIG5hbWU6ICdQdWR1Y2hlcnJ5JyB9LFxuICB7IGNvZGU6ICdQQicsIG5hbWU6ICdQdW5qYWInIH0sXG4gIHsgY29kZTogJ1JKJywgbmFtZTogJ1JhamFzdGhhbicgfSxcbiAgeyBjb2RlOiAnU0snLCBuYW1lOiAnU2lra2ltJyB9LFxuICB7IGNvZGU6ICdUTicsIG5hbWU6ICdUYW1pbCBOYWR1JyB9LFxuICB7IGNvZGU6ICdURycsIG5hbWU6ICdUZWxhbmdhbmEnIH0sXG4gIHsgY29kZTogJ1RSJywgbmFtZTogJ1RyaXB1cmEnIH0sXG4gIHsgY29kZTogJ1VQJywgbmFtZTogJ1V0dGFyIFByYWRlc2gnIH0sXG4gIHsgY29kZTogJ1VUJywgbmFtZTogJ1V0dGFyYWtoYW5kJyB9LFxuICB7IGNvZGU6ICdXQicsIG5hbWU6ICdXZXN0IEJlbmdhbCcgfSxcbl1cbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBMb2NhbFNlbGVjdCwgU2VhcmNoYWJsZVNlbGVjdCwgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5pbXBvcnQgeyBJTkRJQV9TVEFURVMgfSBmcm9tICcuL2luZGlhLXN0YXRlcy5qcydcblxuY29uc3QgVkVISUNMRV9UWVBFUyA9IFtcbiAgeyB2YWx1ZTogJ0Jpa2UnLCBsYWJlbDogJ0Jpa2UnIH0sXG4gIHsgdmFsdWU6ICdTY29vdGVyJywgbGFiZWw6ICdTY29vdGVyJyB9LFxuICB7IHZhbHVlOiAnRWxlY3RyaWMgYmlrZScsIGxhYmVsOiAnRWxlY3RyaWMgYmlrZScgfSxcbiAgeyB2YWx1ZTogJ0N5Y2xlJywgbGFiZWw6ICdDeWNsZScgfSxcbiAgeyB2YWx1ZTogJ1ZhbicsIGxhYmVsOiAnVmFuJyB9LFxuICB7IHZhbHVlOiAnT3RoZXInLCBsYWJlbDogJ090aGVyJyB9LFxuXVxuXG5jb25zdCBTVEFURV9PUFRJT05TID0gSU5ESUFfU1RBVEVTLm1hcCgoaXRlbSkgPT4gKHtcbiAgdmFsdWU6IGl0ZW0ubmFtZSxcbiAgbGFiZWw6IGl0ZW0ubmFtZSxcbn0pKVxuXG5mdW5jdGlvbiBGaWVsZEVycm9yKHsgZXJyb3IgfSkge1xuICBpZiAoIWVycm9yPy5tZXNzYWdlKSByZXR1cm4gbnVsbFxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3IubWVzc2FnZX08L3NwYW4+XG59XG5cbmNvbnN0IFBhcnRuZXJFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSwgYWN0aW9uIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgaXNOZXcgPSBhY3Rpb24/Lm5hbWUgPT09ICduZXcnIHx8ICFyZWNvcmQ/LmlkXG4gIGNvbnN0IHJlYWRPbmx5ID0gYWN0aW9uPy5uYW1lID09PSAnc2hvdydcbiAgY29uc3QgaGFzUGFzc3dvcmQgPSBCb29sZWFuKHBhcmFtcy5oYXNQYXNzd29yZClcbiAgY29uc3QgaXNBY3RpdmUgPSBpc05ldyAmJiAocGFyYW1zLmlzQWN0aXZlID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQWN0aXZlID09PSAnJylcbiAgICA/IHRydWVcbiAgICA6IGlzRmxhZ09uKHBhcmFtcy5pc0FjdGl2ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLmlzQWN0aXZlID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQWN0aXZlID09PSAnJykpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnaXNBY3RpdmUnLCB0cnVlKVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtpc05ld10pXG5cbiAgY29uc3QgZXJyb3JzID0gdXNlTWVtbygoKSA9PiByZWNvcmQ/LmVycm9ycyB8fCB7fSwgW3JlY29yZD8uZXJyb3JzXSlcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIHBhcnRuZXInLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgICBtZXNzYWdlOiBpc05ld1xuICAgICAgICAgICAgPyAnUGFydG5lciBzYXZlZC4gQSBwYXNzd29yZCBlbWFpbCB3aWxsIGJlIHNlbnQgaWYgdGhleSBkbyBub3QgaGF2ZSBhIHBhc3N3b3JkIHlldC4nXG4gICAgICAgICAgICA6ICdQYXJ0bmVyIHVwZGF0ZWQnLFxuICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgcGFydG5lci4gUGxlYXNlIHRyeSBhZ2Fpbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e2lzTmV3ID8gJ0FkZCBkZWxpdmVyeSBwYXJ0bmVyJyA6IHBhcmFtcy5uYW1lIHx8ICdEZWxpdmVyeSBwYXJ0bmVyJ308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgQ29sbGVjdCBmdWxsIEtZQyBhbmQgY29udGFjdCBkZXRhaWxzLiBUaGV5IGxvZyBpbiB0byB0aGUgVG9rcmlpaSBQYXJ0bmVyIGFwcCB3aXRoIHRoaXMgZW1haWxcbiAgICAgICAgICBhZnRlciBzZXR0aW5nIGEgcGFzc3dvcmQgZnJvbSB0aGUgaW52aXRlIG1haWwuXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkFjY291bnQgc3RhdHVzPC9oND5cbiAgICAgICAgICA8cD5JbmFjdGl2ZSBwYXJ0bmVycyBjYW5ub3QgbG9nIGluLCBldmVuIGlmIHRoZXkgYWxyZWFkeSBzZXQgYSBwYXNzd29yZC48L3A+XG4gICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgY2hlY2tlZD17aXNBY3RpdmV9XG4gICAgICAgICAgICBkaXNhYmxlZD17cmVhZE9ubHl9XG4gICAgICAgICAgICB0aXRsZT17aXNBY3RpdmUgPyAnQWN0aXZlJyA6ICdJbmFjdGl2ZSd9XG4gICAgICAgICAgICBoaW50PXtpc0FjdGl2ZSA/ICdDYW4gc2lnbiBpbiB0byB0aGUgcGFydG5lciBhcHAnIDogJ0xvZ2luIGlzIGJsb2NrZWQgdW50aWwgeW91IHR1cm4gdGhpcyBvbid9XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdpc0FjdGl2ZScsIG5leHQpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgeyFpc05ldyA/IChcbiAgICAgICAgICAgIDxUZXh0IG10PVwibGdcIiBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgICB7aGFzUGFzc3dvcmQgPyAnUGFzc3dvcmQgaXMgYWxyZWFkeSBzZXQuJyA6ICdObyBwYXNzd29yZCB5ZXQg4oCUIHNlbmQgdGhlIGludml0ZSBlbWFpbCBhZnRlciBzYXZpbmcuJ31cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkxvZ2luIGRldGFpbHM8L2g0PlxuICAgICAgICAgIDxwPkVtYWlsIGlzIHVzZWQgdG8gY3JlYXRlIGFuZCByZXNldCB0aGUgcGFydG5lciBwYXNzd29yZC4gTm8gU01TIGlzIHNlbnQuPC9wPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEVtYWlsXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmVtYWlsIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZW1haWwnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cInBhcnRuZXJAZXhhbXBsZS5jb21cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMuZW1haWwgPyA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmVtYWlsfSAvPiA6IChcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPlBhc3N3b3JkIGxpbmsgaXMgc2VudCB0byB0aGlzIGluYm94PC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIE1vYmlsZSBudW1iZXJcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMH1cbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBob25lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgncGhvbmUnLCBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKS5zbGljZSgwLCAxMCkpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjEwLWRpZ2l0IG51bWJlclwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5waG9uZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlBlcnNvbmFsIGRldGFpbHM8L2g0PlxuICAgICAgICA8cD5OYW1lIGlzIHNob3duIG9uIG9yZGVycy4gRmF0aGVyJmFwb3M7cyBuYW1lIGFuZCBET0IgaGVscCB3aXRoIEtZQyByZWNvcmRzLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgRnVsbCBuYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm5hbWUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCduYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJQYXJ0bmVyIGZ1bGwgbmFtZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5uYW1lfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgRmF0aGVyJmFwb3M7cyAvIGd1YXJkaWFuIG5hbWUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5mYXRoZXJOYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZmF0aGVyTmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQXMgb24gQWFkaGFhciAvIGRvY3VtZW50c1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgRGF0ZSBvZiBiaXJ0aCA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5kYXRlT2ZCaXJ0aCB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdkYXRlT2ZCaXJ0aCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PktZQyBkb2N1bWVudHM8L2g0PlxuICAgICAgICA8cD5QQU4gYW5kIEFhZGhhYXIgYXJlIHJlcXVpcmVkIGZvciBwYXJ0bmVyIG9uYm9hcmRpbmcuPC9wPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQQU4gbnVtYmVyXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICBtYXhMZW5ndGg9ezEwfVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBhbk51bWJlciB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICBzZXRGaWVsZCgncGFuTnVtYmVyJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvW15BLVowLTldL2csICcnKS5zbGljZSgwLCAxMCkpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBQkNERTEyMzRGXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnBhbk51bWJlcn0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFhZGhhYXIgbnVtYmVyXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMn1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hYWRoYWFyTnVtYmVyIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdhYWRoYWFyTnVtYmVyJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgMTIpKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMTItZGlnaXQgQWFkaGFhclwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5hYWRoYWFyTnVtYmVyfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+Q3VycmVudCBhZGRyZXNzPC9oND5cbiAgICAgICAgPHA+V2hlcmUgdGhlIHBhcnRuZXIgY3VycmVudGx5IGxpdmVzIC8gb3BlcmF0ZXMgZnJvbS48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFkZHJlc3MgbGluZSAxXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2FkZHJlc3NMaW5lMScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiSG91c2UgLyBzdHJlZXQgLyBhcmVhXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmFkZHJlc3NMaW5lMX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFkZHJlc3MgbGluZSAyIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWRkcmVzc0xpbmUyIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnYWRkcmVzc0xpbmUyJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJMYW5kbWFyaywgY29sb255XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIENpdHlcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY2l0eSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2NpdHknLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkNpdHlcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuY2l0eX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFBpbmNvZGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICBtYXhMZW5ndGg9ezZ9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucGluY29kZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3BpbmNvZGUnLCBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKS5zbGljZSgwLCA2KSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiNi1kaWdpdCBwaW5jb2RlXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnBpbmNvZGV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBTdGF0ZVxuICAgICAgICAgIDxTZWFyY2hhYmxlU2VsZWN0XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnN0YXRlIHx8ICcnfVxuICAgICAgICAgICAgb3B0aW9ucz17W3sgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCBzdGF0ZScgfSwgLi4uU1RBVEVfT1BUSU9OU119XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdzdGF0ZScsIG5leHQpfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3Qgc3RhdGVcIlxuICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggc3RhdGVzXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuc3RhdGV9IC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBQZXJtYW5lbnQgYWRkcmVzcyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXQgdG9rcmktdGV4dGFyZWFcIlxuICAgICAgICAgICAgcm93cz17M31cbiAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucGVybWFuZW50QWRkcmVzcyB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdwZXJtYW5lbnRBZGRyZXNzJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiSWYgZGlmZmVyZW50IGZyb20gY3VycmVudCBhZGRyZXNzXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkVtZXJnZW5jeSBjb250YWN0PC9oND5cbiAgICAgICAgICA8cD5Tb21lb25lIHdlIGNhbiBjYWxsIGlmIHRoZSBwYXJ0bmVyIGlzIHVucmVhY2hhYmxlLjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDb250YWN0IG5hbWUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5lbWVyZ2VuY3lOYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZW1lcmdlbmN5TmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUmVsYXRpdmUgLyBmcmllbmQgbmFtZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQ29udGFjdCBtb2JpbGUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICBtYXhMZW5ndGg9ezEwfVxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZW1lcmdlbmN5UGhvbmUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ2VtZXJnZW5jeVBob25lJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgMTApKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMTAtZGlnaXQgbnVtYmVyXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmVtZXJnZW5jeVBob25lfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5WZWhpY2xlIGRldGFpbHM8L2g0PlxuICAgICAgICAgIDxwPlVzZWQgZm9yIGRlbGl2ZXJ5IGFzc2lnbm1lbnQgYW5kIHN1cHBvcnQuPC9wPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFZlaGljbGUgdHlwZSA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogNiB9fT5cbiAgICAgICAgICAgICAgPExvY2FsU2VsZWN0XG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy52ZWhpY2xlVHlwZSB8fCAnJ31cbiAgICAgICAgICAgICAgICBvcHRpb25zPXtbeyB2YWx1ZTogJycsIGxhYmVsOiAnU2VsZWN0IHZlaGljbGUnIH0sIC4uLlZFSElDTEVfVFlQRVNdfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ3ZlaGljbGVUeXBlJywgbmV4dCl9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBWZWhpY2xlIG51bWJlciA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnZlaGljbGVOdW1iZXIgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3ZlaGljbGVOdW1iZXInLCBldmVudC50YXJnZXQudmFsdWUudG9VcHBlckNhc2UoKS5zbGljZSgwLCAyMCkpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJlLmcuIE1IMTJBQjEyMzRcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkJhbmsgZGV0YWlsczwvaDQ+XG4gICAgICAgIDxwPkZvciBwYXlvdXRzIGFuZCByZWltYnVyc2VtZW50cy4gT3B0aW9uYWwgZm9yIG5vdywgYnV0IHJlY29tbWVuZGVkLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQWNjb3VudCBob2xkZXIgbmFtZSA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFjY291bnRIb2xkZXJOYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnYWNjb3VudEhvbGRlck5hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFzIHBlciBiYW5rIGFjY291bnRcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFjY291bnQgbnVtYmVyIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWNjb3VudE51bWJlciB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2FjY291bnROdW1iZXInLCBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnJykpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkJhbmsgYWNjb3VudCBudW1iZXJcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIElGU0MgY29kZSA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMX1cbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuaWZzY0NvZGUgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICBzZXRGaWVsZCgnaWZzY0NvZGUnLCBldmVudC50YXJnZXQudmFsdWUudG9VcHBlckNhc2UoKS5yZXBsYWNlKC9bXkEtWjAtOV0vZywgJycpLnNsaWNlKDAsIDExKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU0JJTjAwMDEyMzRcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5pZnNjQ29kZX0gLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkludGVybmFsIG5vdGVzPC9oND5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIE5vdGVzIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dCB0b2tyaS10ZXh0YXJlYVwiXG4gICAgICAgICAgICByb3dzPXs0fVxuICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5ub3RlcyB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdub3RlcycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNoaWZ0IHRpbWluZywgaHViLCBvciBhbnl0aGluZyB5b3VyIHRlYW0gc2hvdWxkIHJlbWVtYmVyXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7cmVhZE9ubHkgPyBudWxsIDogKFxuICAgICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgICAge2lzTmV3ID8gJ0NyZWF0ZSBwYXJ0bmVyJyA6ICdTYXZlIHBhcnRuZXInfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFydG5lckVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24gfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBTZWFyY2hhYmxlU2VsZWN0LCBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcbmltcG9ydCB7IElORElBX1NUQVRFUyB9IGZyb20gJy4vaW5kaWEtc3RhdGVzLmpzJ1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuY29uc3QgU1RBVEVfT1BUSU9OUyA9IElORElBX1NUQVRFUy5tYXAoKGl0ZW0pID0+ICh7XG4gIHZhbHVlOiBpdGVtLmNvZGUsXG4gIGxhYmVsOiBgJHtpdGVtLm5hbWV9ICgke2l0ZW0uY29kZX0pYCxcbn0pKVxuXG5jb25zdCBQaW5jb2RlRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzTmV3ID0gYWN0aW9uPy5uYW1lID09PSAnbmV3JyB8fCAhcmVjb3JkPy5pZFxuICBjb25zdCByZWFkT25seSA9IGFjdGlvbj8ubmFtZSA9PT0gJ3Nob3cnXG4gIGNvbnN0IGlzQWN0aXZlID0gaXNOZXcgJiYgKHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJycpXG4gICAgPyB0cnVlXG4gICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNBY3RpdmUpXG4gIGNvbnN0IG1vcm5pbmdFbmFibGVkID0gaXNOZXcgJiYgKHBhcmFtcy5tb3JuaW5nRW5hYmxlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5tb3JuaW5nRW5hYmxlZCA9PT0gJycpXG4gICAgPyB0cnVlXG4gICAgOiBpc0ZsYWdPbihwYXJhbXMubW9ybmluZ0VuYWJsZWQpXG4gIGNvbnN0IGV4cHJlc3NFbmFibGVkID0gaXNOZXcgJiYgKHBhcmFtcy5leHByZXNzRW5hYmxlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5leHByZXNzRW5hYmxlZCA9PT0gJycpXG4gICAgPyBmYWxzZVxuICAgIDogaXNGbGFnT24ocGFyYW1zLmV4cHJlc3NFbmFibGVkKVxuICBjb25zdCBbcGFydG5lcnMsIHNldFBhcnRuZXJzXSA9IHVzZVN0YXRlKFtdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTmV3ICYmIChwYXJhbXMuaXNBY3RpdmUgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBY3RpdmUgPT09ICcnKSkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdpc0FjdGl2ZScsIHRydWUpXG4gICAgfVxuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLm1vcm5pbmdFbmFibGVkID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLm1vcm5pbmdFbmFibGVkID09PSAnJykpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnbW9ybmluZ0VuYWJsZWQnLCB0cnVlKVxuICAgIH1cbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5leHByZXNzRW5hYmxlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5leHByZXNzRW5hYmxlZCA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ2V4cHJlc3NFbmFibGVkJywgZmFsc2UpXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW2lzTmV3XSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBpZ25vcmUgPSBmYWxzZVxuICAgIGFwaVxuICAgICAgLnJlc291cmNlQWN0aW9uKHsgcmVzb3VyY2VJZDogJ0RlbGl2ZXJ5UGFydG5lcicsIGFjdGlvbk5hbWU6ICdsaXN0JywgcGFyYW1zOiB7IHBlclBhZ2U6IDIwMCB9IH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKGlnbm9yZSkgcmV0dXJuXG4gICAgICAgIGNvbnN0IHJlY29yZHMgPSByZXNwb25zZS5kYXRhPy5yZWNvcmRzIHx8IFtdXG4gICAgICAgIHNldFBhcnRuZXJzKFxuICAgICAgICAgIHJlY29yZHMubWFwKChpdGVtKSA9PiAoe1xuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uaWQgfHwgaXRlbS5wYXJhbXM/LmlkLFxuICAgICAgICAgICAgbGFiZWw6IGlzRmxhZ09uKGl0ZW0ucGFyYW1zPy5pc0FjdGl2ZSlcbiAgICAgICAgICAgICAgPyBpdGVtLnBhcmFtcz8ubmFtZSB8fCAnUGFydG5lcidcbiAgICAgICAgICAgICAgOiBgJHtpdGVtLnBhcmFtcz8ubmFtZSB8fCAnUGFydG5lcid9IChpbmFjdGl2ZSlgLFxuICAgICAgICAgIH0pKSxcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGlmICghaWdub3JlKSBzZXRQYXJ0bmVycyhbXSlcbiAgICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlnbm9yZSA9IHRydWVcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IHBhcnRuZXJJZCA9IHBhcmFtcy5wYXJ0bmVySWQgfHwgcGFyYW1zLnBhcnRuZXIgfHwgJydcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIHBpbmNvZGUnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogaXNOZXcgPyAnUGluY29kZSBhZGRlZCcgOiAnUGluY29kZSB1cGRhdGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHBpbmNvZGUuIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntpc05ldyA/ICdBZGQgc2VydmljZWFibGUgcGluY29kZScgOiBgUElOICR7cGFyYW1zLnBpbmNvZGUgfHwgJyd9YH08L0gzPlxuICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46IDAsIGNvbG9yOiAnI2ZmZicsIG9wYWNpdHk6IDAuOSB9fT5cbiAgICAgICAgICBDdXN0b21lcnMgY2FuIHNhdmUgYW4gYWRkcmVzcyBhbmQgY2hlY2sgb3V0IG9ubHkgd2hlbiB0aGlzIHBpbmNvZGUgaXMgYWN0aXZlLlxuICAgICAgICA8L3A+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5EZWxpdmVyeSBjb3ZlcmFnZTwvaDQ+XG4gICAgICAgICAgPHA+VHVybiB0aGlzIG9mZiB0byBzdG9wIHRha2luZyBvcmRlcnMgZm9yIHRoaXMgUElOIHdpdGhvdXQgZGVsZXRpbmcgaXQuPC9wPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2lzQWN0aXZlfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgdGl0bGU9e2lzQWN0aXZlID8gJ1dlIGRlbGl2ZXIgaGVyZScgOiAnTm90IGRlbGl2ZXJpbmcnfVxuICAgICAgICAgICAgaGludD17aXNBY3RpdmUgPyAnQWRkcmVzcyBzYXZlIGFuZCBjaGVja291dCBhcmUgYWxsb3dlZCcgOiAnQ3VzdG9tZXJzIHdpbGwgc2VlIHRoYXQgdGhpcyBQSU4gaXMgbm90IHNlcnZpY2VhYmxlJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzQWN0aXZlJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkRlbGl2ZXJ5IG9wdGlvbnM8L2g0PlxuICAgICAgICAgIDxwPlR1cm4gYW4gb3B0aW9uIG9mZiB0byBzaG93IGl0IGFzIGNvbWluZyBzb29uIGF0IGNoZWNrb3V0LiBJZiBib3RoIGFyZSBvZmYsIHRoaXMgUElOIGlzIG5vdCBkZWxpdmVyYWJsZS48L3A+XG4gICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgY2hlY2tlZD17bW9ybmluZ0VuYWJsZWR9XG4gICAgICAgICAgICBkaXNhYmxlZD17cmVhZE9ubHl9XG4gICAgICAgICAgICBvbkxhYmVsPVwiT25cIlxuICAgICAgICAgICAgb2ZmTGFiZWw9XCJPZmZcIlxuICAgICAgICAgICAgdGl0bGU9XCJNb3JuaW5nIGRlbGl2ZXJ5XCJcbiAgICAgICAgICAgIGhpbnQ9e21vcm5pbmdFbmFibGVkID8gJ1Nob3BwZXJzIGNhbiBjaG9vc2UgbW9ybmluZyBkZWxpdmVyeScgOiAnU2hvd24gYXMgY29taW5nIHNvb24nfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnbW9ybmluZ0VuYWJsZWQnLCBuZXh0KX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiAxMiB9fSAvPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2V4cHJlc3NFbmFibGVkfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgb25MYWJlbD1cIk9uXCJcbiAgICAgICAgICAgIG9mZkxhYmVsPVwiT2ZmXCJcbiAgICAgICAgICAgIHRpdGxlPVwiRXhwcmVzcyBkZWxpdmVyeVwiXG4gICAgICAgICAgICBoaW50PXtleHByZXNzRW5hYmxlZCA/ICdTaG9wcGVycyBjYW4gY2hvb3NlIEV4cHJlc3MgZGVsaXZlcnknIDogJ1Nob3duIGFzIGNvbWluZyBzb29uJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2V4cHJlc3NFbmFibGVkJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkFzc2lnbmVkIHBhcnRuZXI8L2g0PlxuICAgICAgICAgIDxwPk5ldyBvcmRlcnMgaW4gdGhpcyBQSU4gYXJlIGF1dG8tYXNzaWduZWQgdG8gdGhpcyBwYXJ0bmVyLiBZb3UgY2FuIHJlYXNzaWduIGxhdGVyIG9uIHRoZSBvcmRlci48L3A+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgRGVsaXZlcnkgcGFydG5lciA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8U2VhcmNoYWJsZVNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17cGFydG5lcklkfVxuICAgICAgICAgICAgICBvcHRpb25zPXtbeyB2YWx1ZTogJycsIGxhYmVsOiAnTm8gcGFydG5lciBhc3NpZ25lZCcgfSwgLi4ucGFydG5lcnNdfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdwYXJ0bmVySWQnLCBuZXh0KVxuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdwYXJ0bmVyJywgbmV4dClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3QgYSBwYXJ0bmVyXCJcbiAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggcGFydG5lcnNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkxvY2F0aW9uPC9oND5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUGluY29kZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICBtYXhMZW5ndGg9ezZ9XG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seSB8fCAhaXNOZXd9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucGluY29kZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3BpbmNvZGUnLCBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKS5zbGljZSgwLCA2KSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiNi1kaWdpdCBQSU5cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMucGluY29kZSA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9ycy5waW5jb2RlLm1lc3NhZ2V9PC9zcGFuPiA6IChcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkluZGlhIFBJTiBjb2RlLCA2IGRpZ2l0czwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBcmVhIG5hbWUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hcmVhTGFiZWwgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdhcmVhTGFiZWwnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFuZGhlcmkgV2VzdCwgQmFuZHJhLCDigKZcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQ2l0eVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jaXR5IHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnY2l0eScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTXVtYmFpXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7ZXJyb3JzLmNpdHkgPyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPntlcnJvcnMuY2l0eS5tZXNzYWdlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgU3RhdGVcbiAgICAgICAgICAgIDxTZWFyY2hhYmxlU2VsZWN0XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc3RhdGVDb2RlIHx8IHBhcmFtcy5zdGF0ZSB8fCAnJ31cbiAgICAgICAgICAgICAgb3B0aW9ucz17W3sgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCBzdGF0ZScgfSwgLi4uU1RBVEVfT1BUSU9OU119XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3N0YXRlQ29kZScsIG5leHQpXG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3N0YXRlJywgbmV4dClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3Qgc3RhdGVcIlxuICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcj1cIlNlYXJjaCBzdGF0ZXNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMuc3RhdGUgfHwgZXJyb3JzLnN0YXRlQ29kZSA/IChcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj5cbiAgICAgICAgICAgICAgICB7KGVycm9ycy5zdGF0ZSB8fCBlcnJvcnMuc3RhdGVDb2RlKS5tZXNzYWdlfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+QWxsIEluZGlhbiBzdGF0ZXMgYW5kIHVuaW9uIHRlcnJpdG9yaWVzPC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAge3JlYWRPbmx5ID8gbnVsbCA6IChcbiAgICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICAgIHtpc05ldyA/ICdBZGQgcGluY29kZScgOiAnU2F2ZSBwaW5jb2RlJ31cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBpbmNvZGVFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB1c2VOb3RpY2UgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKVxuXG5jb25zdCBTdGF0dXNUb2dnbGUgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQsIHJlc291cmNlLCBwcm9wZXJ0eSwgd2hlcmUsIG9uQ2hhbmdlIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCBmaWVsZCA9IHByb3BlcnR5Py5wYXRoIHx8ICdpc0FjdGl2ZSdcbiAgY29uc3QgYWN0aW9uTmFtZSA9IHByb3BlcnR5Py5jdXN0b20/LmFjdGlvbk5hbWUgfHwgJ3RvZ2dsZUFjdGl2ZSdcbiAgY29uc3Qgb25MYWJlbCA9IHByb3BlcnR5Py5jdXN0b20/Lm9uTGFiZWwgfHwgJ0FjdGl2ZSdcbiAgY29uc3Qgb2ZmTGFiZWwgPSBwcm9wZXJ0eT8uY3VzdG9tPy5vZmZMYWJlbCB8fCAnSW5hY3RpdmUnXG4gIGNvbnN0IHJhdyA9IHJlY29yZD8ucGFyYW1zPy5bZmllbGRdXG4gIGNvbnN0IFtjaGVja2VkLCBzZXRDaGVja2VkXSA9IHVzZVN0YXRlKGlzRmxhZ09uKHJhdykpXG4gIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0Q2hlY2tlZChpc0ZsYWdPbihyYXcpKVxuICB9LCBbcmF3LCByZWNvcmQ/LmlkXSlcblxuICBjb25zdCBwZXJzaXN0ID0gYXN5bmMgKG5leHQpID0+IHtcbiAgICBpZiAoIXJlY29yZD8uaWQpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIHJlY29yZElkOiByZWNvcmQuaWQsXG4gICAgICAgIGFjdGlvbk5hbWUsXG4gICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICBkYXRhOiB7IFtmaWVsZF06IG5leHQgfSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBzYXZlZCA9IHJlc3BvbnNlLmRhdGE/LnJlY29yZD8ucGFyYW1zPy5bZmllbGRdXG4gICAgICBzZXRDaGVja2VkKHNhdmVkID09PSB1bmRlZmluZWQgPyBuZXh0IDogaXNGbGFnT24oc2F2ZWQpKVxuICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2UuZGF0YT8ubm90aWNlXG4gICAgICBhZGROb3RpY2Uoe1xuICAgICAgICBtZXNzYWdlOiBub3RpY2U/Lm1lc3NhZ2UgfHwgKG5leHQgPyBgTWFya2VkICR7b25MYWJlbC50b0xvd2VyQ2FzZSgpfWAgOiBgTWFya2VkICR7b2ZmTGFiZWwudG9Mb3dlckNhc2UoKX1gKSxcbiAgICAgICAgdHlwZTogbm90aWNlPy50eXBlIHx8ICdzdWNjZXNzJyxcbiAgICAgIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCB1cGRhdGUgc3RhdHVzLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAobmV4dCkgPT4ge1xuICAgIGlmICh3aGVyZSA9PT0gJ2VkaXQnICYmIHR5cGVvZiBvbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgc2V0Q2hlY2tlZChuZXh0KVxuICAgICAgb25DaGFuZ2UoZmllbGQsIG5leHQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgcGVyc2lzdChuZXh0KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8U3RhdHVzU3dpdGNoXG4gICAgICBjb21wYWN0PXt3aGVyZSAhPT0gJ2VkaXQnfVxuICAgICAgY2hlY2tlZD17Y2hlY2tlZH1cbiAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgb25MYWJlbD17b25MYWJlbH1cbiAgICAgIG9mZkxhYmVsPXtvZmZMYWJlbH1cbiAgICAgIHRpdGxlPXt3aGVyZSA9PT0gJ2VkaXQnID8gKGNoZWNrZWQgPyBvbkxhYmVsIDogb2ZmTGFiZWwpIDogdW5kZWZpbmVkfVxuICAgICAgaGludD17d2hlcmUgPT09ICdlZGl0JyA/IHByb3BlcnR5Py5kZXNjcmlwdGlvbiA6IHVuZGVmaW5lZH1cbiAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2V9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBTdGF0dXNUb2dnbGVcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmZ1bmN0aW9uIHBhZCh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5wYWRTdGFydCgyLCAnMCcpXG59XG5cbmZ1bmN0aW9uIHRvRGF0ZUlucHV0KHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCB0ZXh0ID0gU3RyaW5nKHZhbHVlKVxuICBpZiAoL15cXGR7NH0tXFxkezJ9LVxcZHsyfS8udGVzdCh0ZXh0KSkgcmV0dXJuIHRleHQuc2xpY2UoMCwgMTApXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcbiAgaWYgKE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiAnJ1xuICByZXR1cm4gYCR7ZGF0ZS5nZXRGdWxsWWVhcigpfS0ke3BhZChkYXRlLmdldE1vbnRoKCkgKyAxKX0tJHtwYWQoZGF0ZS5nZXREYXRlKCkpfWBcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2hlbih2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJ+KAlCdcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxuICBpZiAoTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuICfigJQnXG4gIHJldHVybiBkYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgZGF0ZVN0eWxlOiAnbWVkaXVtJywgdGltZVN0eWxlOiAnc2hvcnQnIH0pXG59XG5cbmZ1bmN0aW9uIHBhcnNlQWRkcmVzc2VzKHBhcmFtcykge1xuICBjb25zdCByYXcgPSBwYXJhbXMuYWRkcmVzc2VzXG4gIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcuZmlsdGVyKEJvb2xlYW4pXG4gIGlmIChyYXcgJiYgdHlwZW9mIHJhdyA9PT0gJ29iamVjdCcpIHJldHVybiBbcmF3XVxuICBpZiAodHlwZW9mIHJhdyA9PT0gJ3N0cmluZycgJiYgcmF3LnRyaW0oKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdylcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcnNlZCkpIHJldHVybiBwYXJzZWQuZmlsdGVyKEJvb2xlYW4pXG4gICAgICBpZiAocGFyc2VkICYmIHR5cGVvZiBwYXJzZWQgPT09ICdvYmplY3QnKSByZXR1cm4gW3BhcnNlZF1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGZsYXR0ZW5lZCBBZG1pbkpTIHBhcmFtcyBiZWxvd1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGdyb3VwZWQgPSB7fVxuICBPYmplY3QuZW50cmllcyhwYXJhbXMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgIGNvbnN0IG1hdGNoID0ga2V5Lm1hdGNoKC9eYWRkcmVzc2VzXFwuKFxcZCspXFwuKC4rKSQvKVxuICAgIGlmICghbWF0Y2ggfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHJldHVyblxuICAgIGNvbnN0IFssIGluZGV4LCBmaWVsZF0gPSBtYXRjaFxuICAgIGdyb3VwZWRbaW5kZXhdID0gZ3JvdXBlZFtpbmRleF0gfHwge31cbiAgICBncm91cGVkW2luZGV4XVtmaWVsZF0gPSB2YWx1ZVxuICB9KVxuICByZXR1cm4gT2JqZWN0LmtleXMoZ3JvdXBlZClcbiAgICAuc29ydCgoYSwgYikgPT4gTnVtYmVyKGEpIC0gTnVtYmVyKGIpKVxuICAgIC5tYXAoKGtleSkgPT4gZ3JvdXBlZFtrZXldKVxufVxuXG5mdW5jdGlvbiBhZGRyZXNzTGluZXMoYWRkcmVzcykge1xuICByZXR1cm4gW1xuICAgIGFkZHJlc3MubGluZTEsXG4gICAgYWRkcmVzcy5saW5lMixcbiAgICBbYWRkcmVzcy5jaXR5LCBhZGRyZXNzLnN0YXRlLCBhZGRyZXNzLnBpbmNvZGVdLmZpbHRlcihCb29sZWFuKS5qb2luKCcsICcpLFxuICAgIGFkZHJlc3MubGFuZG1hcmsgPyBgTGFuZG1hcms6ICR7YWRkcmVzcy5sYW5kbWFya31gIDogJycsXG4gIF0uZmlsdGVyKEJvb2xlYW4pXG59XG5cbmNvbnN0IEN1c3RvbWVyRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBpc0FjdGl2ZSA9IHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJydcbiAgICA/IHRydWVcbiAgICA6IGlzRmxhZ09uKHBhcmFtcy5pc0FjdGl2ZSlcbiAgY29uc3QgYWRkcmVzc2VzID0gdXNlTWVtbygoKSA9PiBwYXJzZUFkZHJlc3NlcyhwYXJhbXMpLCBbcGFyYW1zXSlcbiAgY29uc3QgZXJyb3JzID0gdXNlTWVtbygoKSA9PiByZWNvcmQ/LmVycm9ycyB8fCB7fSwgW3JlY29yZD8uZXJyb3JzXSlcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIGN1c3RvbWVyJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDdXN0b21lciB1cGRhdGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIGN1c3RvbWVyLiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57cGFyYW1zLm5hbWUgfHwgJ0N1c3RvbWVyJ308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgKzkxIHtwYXJhbXMucGhvbmUgfHwgJ+KAlCd9IMK3IGpvaW5lZCB7Zm9ybWF0V2hlbihwYXJhbXMuY3JlYXRlZEF0KX1cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+QWNjb3VudCBzdGF0dXM8L2g0PlxuICAgICAgICAgIDxwPkluYWN0aXZlIGN1c3RvbWVycyBjYW5ub3Qgc2lnbiBpbiB3aXRoIHRoaXMgbW9iaWxlIG51bWJlci48L3A+XG4gICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgY2hlY2tlZD17aXNBY3RpdmV9XG4gICAgICAgICAgICB0aXRsZT17aXNBY3RpdmUgPyAnQWN0aXZlJyA6ICdJbmFjdGl2ZSd9XG4gICAgICAgICAgICBoaW50PXtpc0FjdGl2ZSA/ICdDYW4gbG9nIGluIG9uIHRoZSB3ZWJzaXRlIGFuZCBhcHAnIDogJ0xvZ2luIGlzIGJsb2NrZWQgdW50aWwgeW91IHR1cm4gdGhpcyBvbid9XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdpc0FjdGl2ZScsIG5leHQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Qcm9maWxlPC9oND5cbiAgICAgICAgICA8cD5QaG9uZSBjb21lcyBmcm9tIE9UUCBsb2dpbiBhbmQgc3RheXMgYXMgdGhlIGN1c3RvbWVy4oCZcyBsb2dpbiBpZC48L3A+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgTmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ25hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkN1c3RvbWVyIG5hbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMubmFtZSA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9ycy5uYW1lLm1lc3NhZ2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgTW9iaWxlXG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIiB2YWx1ZT17cGFyYW1zLnBob25lIHx8ICcnfSByZWFkT25seSAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgRGF0ZSBvZiBiaXJ0aFxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17dG9EYXRlSW5wdXQocGFyYW1zLmRhdGVPZkJpcnRoKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZGF0ZU9mQmlydGgnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7ZXJyb3JzLmRhdGVPZkJpcnRoID8gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3JzLmRhdGVPZkJpcnRoLm1lc3NhZ2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlNhdmVkIGFkZHJlc3NlczwvaDQ+XG4gICAgICAgIDxwPlxuICAgICAgICAgIHthZGRyZXNzZXMubGVuZ3RoXG4gICAgICAgICAgICA/IGAke2FkZHJlc3Nlcy5sZW5ndGh9IGFkZHJlc3Mke2FkZHJlc3Nlcy5sZW5ndGggPT09IDEgPyAnJyA6ICdlcyd9IHNhdmVkIGluIHRoZSBjdXN0b21lciBhY2NvdW50LmBcbiAgICAgICAgICAgIDogJ1RoaXMgY3VzdG9tZXIgaGFzIG5vdCBzYXZlZCBhIGRlbGl2ZXJ5IGFkZHJlc3MgeWV0Lid9XG4gICAgICAgIDwvcD5cbiAgICAgICAge2FkZHJlc3Nlcy5sZW5ndGggPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1hZGRyZXNzLWdyaWRcIj5cbiAgICAgICAgICAgIHthZGRyZXNzZXMubWFwKChhZGRyZXNzLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICA8YXJ0aWNsZSBrZXk9e2FkZHJlc3MuaWQgfHwgYCR7YWRkcmVzcy5waW5jb2RlfS0ke2luZGV4fWB9IGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtY2FyZFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktYWRkcmVzcy10b3BcIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtbGFiZWxcIj57YWRkcmVzcy5sYWJlbCB8fCAnQWRkcmVzcyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAge2FkZHJlc3MucGluY29kZSA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtcGluXCI+e2FkZHJlc3MucGluY29kZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPnthZGRyZXNzLm5hbWUgfHwgcGFyYW1zLm5hbWUgfHwgJ0N1c3RvbWVyJ308L3N0cm9uZz5cbiAgICAgICAgICAgICAgICB7YWRkcmVzcy5waG9uZSA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtcGhvbmVcIj4rOTEge2FkZHJlc3MucGhvbmV9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAge2FkZHJlc3NMaW5lcyhhZGRyZXNzKS5tYXAoKGxpbmUpID0+IChcbiAgICAgICAgICAgICAgICAgIDxwIGtleT17bGluZX0+e2xpbmV9PC9wPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICBTYXZlIGN1c3RvbWVyXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ3VzdG9tZXJFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IEZsYWdDYXJkLCBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3QgUk9MRVMgPSBbXG4gIHsgdmFsdWU6ICdzdGFmZicsIHRpdGxlOiAnU3RhZmYnLCBoaW50OiAnQWNjZXNzIG9ubHkgdGhlIGFyZWFzIHlvdSB0aWNrIGJlbG93JyB9LFxuICB7IHZhbHVlOiAnYWRtaW4nLCB0aXRsZTogJ0FkbWluJywgaGludDogJ0Z1bGwgYWNjZXNzIHRvIHRoZSBDTVMnIH0sXG4gIHsgdmFsdWU6ICdzdXBlcl9hZG1pbicsIHRpdGxlOiAnU3VwZXIgYWRtaW4nLCBoaW50OiAnRnVsbCBhY2Nlc3MsIHNhbWUgYXMgYWRtaW4nIH0sXG5dXG5cbmNvbnN0IFBFUk1JU1NJT05TID0gW1xuICB7IGtleTogJ21hbmFnZVByb2R1Y3RzJywgbGFiZWw6ICdQcm9kdWN0cycsIGhpbnQ6ICdBZGQgYW5kIGVkaXQgcHJvZHVjdHMnIH0sXG4gIHsga2V5OiAnbWFuYWdlQ2F0YWxvZycsIGxhYmVsOiAnQ2F0YWxvZycsIGhpbnQ6ICdDYXRlZ29yaWVzIGFuZCBjb2xsZWN0aW9ucycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VNZWRpYScsIGxhYmVsOiAnTWVkaWEnLCBoaW50OiAnVXBsb2FkIGFuZCByZXBsYWNlIGltYWdlcycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VPcmRlcnMnLCBsYWJlbDogJ09yZGVycycsIGhpbnQ6ICdWaWV3IGFuZCB1cGRhdGUgb3JkZXJzJyB9LFxuICB7IGtleTogJ21hbmFnZUNvdXBvbnMnLCBsYWJlbDogJ0NvdXBvbnMnLCBoaW50OiAnQ3JlYXRlIGRpc2NvdW50IGNvZGVzJyB9LFxuICB7IGtleTogJ21hbmFnZUNvbnRlbnQnLCBsYWJlbDogJ0NvbnRlbnQnLCBoaW50OiAnUGFnZXMgYW5kIHJldmlld3MnIH0sXG4gIHsga2V5OiAnbWFuYWdlU2V0dGluZ3MnLCBsYWJlbDogJ1NldHRpbmdzJywgaGludDogJ1N0b3JlIGFuZCBob21lcGFnZSBzZXR0aW5ncycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VVc2VycycsIGxhYmVsOiAnVGVhbScsIGhpbnQ6ICdDcmVhdGUgdXNlcnMgYW5kIGNoYW5nZSBhY2Nlc3MnIH0sXG5dXG5cbmZ1bmN0aW9uIEZpZWxkRXJyb3IoeyBlcnJvciB9KSB7XG4gIGlmICghZXJyb3I/Lm1lc3NhZ2UpIHJldHVybiBudWxsXG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPntlcnJvci5tZXNzYWdlfTwvc3Bhbj5cbn1cblxuZnVuY3Rpb24gUGFzc3dvcmRGaWVsZCh7IGxhYmVsLCB2YWx1ZSwgb25DaGFuZ2UsIGVycm9yLCBwbGFjZWhvbGRlciB9KSB7XG4gIGNvbnN0IFt2aXNpYmxlLCBzZXRWaXNpYmxlXSA9IHVzZVN0YXRlKGZhbHNlKVxuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgIHtsYWJlbH1cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXBhc3N3b3JkLXdyYXBcIj5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICB0eXBlPXt2aXNpYmxlID8gJ3RleHQnIDogJ3Bhc3N3b3JkJ31cbiAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICBwbGFjZWhvbGRlcj17cGxhY2Vob2xkZXJ9XG4gICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLXBhc3N3b3JkLXRvZ2dsZVwiXG4gICAgICAgICAgYXJpYS1sYWJlbD17dmlzaWJsZSA/ICdIaWRlIHBhc3N3b3JkJyA6ICdTaG93IHBhc3N3b3JkJ31cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaXNpYmxlKChjdXJyZW50KSA9PiAhY3VycmVudCl9XG4gICAgICAgID5cbiAgICAgICAgICB7dmlzaWJsZSA/ICdIaWRlJyA6ICdTaG93J31cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L3NwYW4+XG4gICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3J9IC8+XG4gICAgPC9sYWJlbD5cbiAgKVxufVxuXG5jb25zdCBUZWFtRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzTmV3ID0gYWN0aW9uPy5uYW1lID09PSAnbmV3JyB8fCAhcmVjb3JkPy5pZFxuICBjb25zdCByb2xlID0gcGFyYW1zLnJvbGUgfHwgJ3N0YWZmJ1xuICBjb25zdCBpc0FjdGl2ZSA9XG4gICAgaXNOZXcgJiYgKHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJycpXG4gICAgICA/IHRydWVcbiAgICAgIDogaXNGbGFnT24ocGFyYW1zLmlzQWN0aXZlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTmV3ICYmIChwYXJhbXMuaXNBY3RpdmUgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBY3RpdmUgPT09ICcnKSkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdpc0FjdGl2ZScsIHRydWUpXG4gICAgfVxuICAgIGlmIChpc05ldyAmJiAhcGFyYW1zLnJvbGUpIGhhbmRsZUNoYW5nZSgncm9sZScsICdzdGFmZicpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbaXNOZXddKVxuXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuICBjb25zdCBwZXJtaXNzaW9uT24gPSAoa2V5KSA9PiBpc0ZsYWdPbihwYXJhbXNbYHBlcm1pc3Npb25zLiR7a2V5fWBdKVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSB0ZWFtIG1lbWJlcicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpY2Uoe1xuICAgICAgICAgIG1lc3NhZ2U6IGlzTmV3ID8gJ1RlYW0gbWVtYmVyIGNyZWF0ZWQnIDogJ1RlYW0gbWVtYmVyIHVwZGF0ZWQnLFxuICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgdGVhbSBtZW1iZXIuIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntpc05ldyA/ICdBZGQgdGVhbSBtZW1iZXInIDogcGFyYW1zLm5hbWUgfHwgJ1RlYW0gbWVtYmVyJ308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgVGhleSBzaWduIGluIHRvIFRva3JpaWkgQ01TIHdpdGggdXNlcm5hbWUgb3IgZW1haWwuIEluYWN0aXZlIHVzZXJzIGNhbm5vdCBsb2cgaW4uXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkFjY291bnQgc3RhdHVzPC9oND5cbiAgICAgICAgICA8cD5UdXJuIHRoaXMgb2ZmIHRvIGJsb2NrIENNUyBsb2dpbiB3aXRob3V0IGRlbGV0aW5nIHRoZSBhY2NvdW50LjwvcD5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgIHRpdGxlPXtpc0FjdGl2ZSA/ICdBY3RpdmUnIDogJ0luYWN0aXZlJ31cbiAgICAgICAgICAgIGhpbnQ9e2lzQWN0aXZlID8gJ0NhbiBzaWduIGluIHRvIHRoZSBhZG1pbiBwYW5lbCcgOiAnTG9naW4gaXMgYmxvY2tlZCB1bnRpbCB5b3UgdHVybiB0aGlzIG9uJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzQWN0aXZlJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlJvbGU8L2g0PlxuICAgICAgICAgIDxwPkFkbWluIGFuZCBzdXBlciBhZG1pbiBnZXQgZnVsbCBhY2Nlc3MuIFN0YWZmIG9ubHkgZ2V0cyB0aGUgcGVybWlzc2lvbnMgeW91IGVuYWJsZS48L3A+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaG9pY2Utcm93XCI+XG4gICAgICAgICAgICB7Uk9MRVMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICAgIDxGbGFnQ2FyZFxuICAgICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZX1cbiAgICAgICAgICAgICAgICBzZWxlY3RlZD17cm9sZSA9PT0gaXRlbS52YWx1ZX1cbiAgICAgICAgICAgICAgICB0aXRsZT17aXRlbS50aXRsZX1cbiAgICAgICAgICAgICAgICBoaW50PXtpdGVtLmhpbnR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ3JvbGUnLCBpdGVtLnZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkxvZ2luIGRldGFpbHM8L2g0PlxuICAgICAgICA8cD5Vc2VybmFtZSBvciBlbWFpbCBjYW4gYmUgdXNlZCBvbiB0aGUgQ01TIGxvZ2luIHNjcmVlbi48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEZ1bGwgbmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ25hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlRlYW0gbWVtYmVyIG5hbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMubmFtZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFVzZXJuYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy51c2VybmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3VzZXJuYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRyaW0oKSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiZS5nLiByYXZpLmNtc1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy51c2VybmFtZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIEVtYWlsXG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmVtYWlsIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2VtYWlsJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwibmFtZUB0b2tyaWlpLmNvbVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmVtYWlsfSAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICB7aXNOZXcgPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8UGFzc3dvcmRGaWVsZFxuICAgICAgICAgICAgICBsYWJlbD1cIlBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5wYXNzd29yZCB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gc2V0RmllbGQoJ3Bhc3N3b3JkJywgdmFsdWUpfVxuICAgICAgICAgICAgICBlcnJvcj17ZXJyb3JzLnBhc3N3b3JkfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkF0IGxlYXN0IDYgY2hhcmFjdGVyc1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPFBhc3N3b3JkRmllbGRcbiAgICAgICAgICAgICAgbGFiZWw9XCJDb25maXJtIHBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jb25maXJtUGFzc3dvcmQgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHNldEZpZWxkKCdjb25maXJtUGFzc3dvcmQnLCB2YWx1ZSl9XG4gICAgICAgICAgICAgIGVycm9yPXtlcnJvcnMuY29uZmlybVBhc3N3b3JkfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlR5cGUgcGFzc3dvcmQgYWdhaW5cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+VXNlIENoYW5nZSBwYXNzd29yZCBmcm9tIHRoZSB0ZWFtIGxpc3QgdG8gcmVzZXQgbG9naW4uPC9zcGFuPlxuICAgICAgICApfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7cm9sZSA9PT0gJ3N0YWZmJyA/IChcbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+UGVybWlzc2lvbnM8L2g0PlxuICAgICAgICAgIDxwPk9ubHkgdXNlZCBmb3Igc3RhZmYuIFRvZ2dsZSB3aGF0IHRoaXMgcGVyc29uIGNhbiBvcGVuIGluIHRoZSBDTVMuPC9wPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktcGVybS1saXN0XCI+XG4gICAgICAgICAgICB7UEVSTUlTU0lPTlMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtpdGVtLmtleX0gY2xhc3NOYW1lPVwidG9rcmktcGVybS1yb3dcIj5cbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzdHJvbmc+e2l0ZW0ubGFiZWx9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8c3Bhbj57aXRlbS5oaW50fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgICAgICAgY29tcGFjdFxuICAgICAgICAgICAgICAgICAgY2hlY2tlZD17cGVybWlzc2lvbk9uKGl0ZW0ua2V5KX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoYHBlcm1pc3Npb25zLiR7aXRlbS5rZXl9YCwgbmV4dCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICB7aXNOZXcgPyAnQ3JlYXRlIHRlYW0gbWVtYmVyJyA6ICdTYXZlIHRlYW0gbWVtYmVyJ31cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZWFtRWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUXVlcnlQYXJhbXMsIHVzZVJlY29yZHMgfSBmcm9tICdhZG1pbmpzJ1xuY29uc3QgRk9MREVSUyA9IFsnYWxsJywgJ3Byb2R1Y3RzJywgJ2NhdGVnb3JpZXMnLCAncmV2aWV3cycsICdwYWdlcycsICdnZW5lcmFsJ11cblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuZnVuY3Rpb24gZm9ybWF0U2l6ZShieXRlcykge1xuICBjb25zdCBzaXplID0gTnVtYmVyKGJ5dGVzKSB8fCAwXG4gIGlmIChzaXplIDwgMTAyNCkgcmV0dXJuIGAke3NpemV9IEJgXG4gIGlmIChzaXplIDwgMTAyNCAqIDEwMjQpIHJldHVybiBgJHtNYXRoLnJvdW5kKHNpemUgLyAxMDI0KX0gS0JgXG4gIHJldHVybiBgJHsoc2l6ZSAvICgxMDI0ICogMTAyNCkpLnRvRml4ZWQoMSl9IE1CYFxufVxuXG5mdW5jdGlvbiBmb3JtYXRXaGVuKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gJydcbiAgcmV0dXJuIGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1JTicsIHsgZGF5OiAnbnVtZXJpYycsIG1vbnRoOiAnc2hvcnQnLCB5ZWFyOiAnbnVtZXJpYycgfSlcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVVybChwYXRoLCBhcHBVcmwpIHtcbiAgaWYgKCFwYXRoKSByZXR1cm4gJydcbiAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhdGgpKSByZXR1cm4gcGF0aFxuICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGF0aH1gXG59XG5cbmNvbnN0IE1lZGlhTGlicmFyeSA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlc291cmNlLCBzZXRUYWcgfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgc3RvcmVQYXJhbXMsIGZpbHRlcnMgfSA9IHVzZVF1ZXJ5UGFyYW1zKClcbiAgY29uc3QgeyByZWNvcmRzLCBsb2FkaW5nLCBmZXRjaERhdGEsIHRvdGFsLCBwZXJQYWdlIH0gPSB1c2VSZWNvcmRzKHJlc291cmNlLmlkKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFt1cGxvYWRpbmcsIHNldFVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2J1c3lJZCwgc2V0QnVzeUlkXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBmb2xkZXIgPSBTdHJpbmcoZmlsdGVycz8uZm9sZGVyIHx8ICdhbGwnKVxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG4gIGNvbnN0IGFwcFVybCA9IGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICBjb25zdCB1cGxvYWRGb2xkZXIgPSBmb2xkZXIgPT09ICdhbGwnID8gJ2dlbmVyYWwnIDogZm9sZGVyXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2V0VGFnKSBzZXRUYWcoU3RyaW5nKHRvdGFsIHx8IDApKVxuICB9LCBbdG90YWwsIHNldFRhZ10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoTnVtYmVyKHBlclBhZ2UpIDwgNTApIHN0b3JlUGFyYW1zKHsgcGVyUGFnZTogJzUwJyB9KVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW10pXG5cbiAgY29uc3QgaXRlbXMgPSB1c2VNZW1vKFxuICAgICgpID0+XG4gICAgICAocmVjb3JkcyB8fCBbXSkubWFwKChpdGVtKSA9PiAoe1xuICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgbmFtZTogaXRlbS5wYXJhbXM/Lm9yaWdpbmFsTmFtZSB8fCBpdGVtLnBhcmFtcz8uZmlsZW5hbWUgfHwgJ0ltYWdlJyxcbiAgICAgICAgZm9sZGVyOiBpdGVtLnBhcmFtcz8uZm9sZGVyIHx8ICdnZW5lcmFsJyxcbiAgICAgICAgcGF0aDogaXRlbS5wYXJhbXM/LnBhdGggfHwgJycsXG4gICAgICAgIHNpemU6IGl0ZW0ucGFyYW1zPy5zaXplLFxuICAgICAgICBjcmVhdGVkQXQ6IGl0ZW0ucGFyYW1zPy5jcmVhdGVkQXQsXG4gICAgICAgIHVybDogcmVzb2x2ZVVybChpdGVtLnBhcmFtcz8ucGF0aCwgYXBwVXJsKSxcbiAgICAgIH0pKSxcbiAgICBbYXBwVXJsLCByZWNvcmRzXSxcbiAgKVxuXG4gIGNvbnN0IHNldEZvbGRlciA9IChuZXh0KSA9PiB7XG4gICAgc3RvcmVQYXJhbXMoe1xuICAgICAgcGFnZTogJzEnLFxuICAgICAgZmlsdGVyczogbmV4dCA9PT0gJ2FsbCcgPyB7fSA6IHsgZm9sZGVyOiBuZXh0IH0sXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHVwbG9hZEZpbGVzID0gYXN5bmMgKGZpbGVzKSA9PiB7XG4gICAgY29uc3QgbGlzdCA9IFsuLi5maWxlc10uZmlsdGVyKChmaWxlKSA9PiBmaWxlLnR5cGUuc3RhcnRzV2l0aCgnaW1hZ2UvJykpXG4gICAgaWYgKCFsaXN0Lmxlbmd0aCkgcmV0dXJuXG4gICAgc2V0VXBsb2FkaW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBsaXN0KSB7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdmb2xkZXInLCB1cGxvYWRGb2xkZXIpXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vbWVkaWEvdXBsb2FkYCwge1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgICB9KVxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSB8fCBgQ291bGQgbm90IHVwbG9hZCAke2ZpbGUubmFtZX1gKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhZGROb3RpY2Uoe1xuICAgICAgICBtZXNzYWdlOiBsaXN0Lmxlbmd0aCA9PT0gMSA/ICdJbWFnZSB1cGxvYWRlZCcgOiBgJHtsaXN0Lmxlbmd0aH0gaW1hZ2VzIHVwbG9hZGVkYCxcbiAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgfSlcbiAgICAgIGZldGNoRGF0YSgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ1VwbG9hZCBmYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFVwbG9hZGluZyhmYWxzZSlcbiAgICAgIGlmIChmaWxlUmVmLmN1cnJlbnQpIGZpbGVSZWYuY3VycmVudC52YWx1ZSA9ICcnXG4gICAgfVxuICB9XG5cbiAgY29uc3QgY29weVBhdGggPSBhc3luYyAocGF0aCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChwYXRoKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0ZpbGUgcGF0aCBjb3BpZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICB9IGNhdGNoIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IHBhdGgsIHR5cGU6ICdpbmZvJyB9KVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlbW92ZSA9IGFzeW5jIChpZCwgbmFtZSkgPT4ge1xuICAgIGlmICghd2luZG93LmNvbmZpcm0oYERlbGV0ZSDigJwke25hbWV94oCdPyBUaGlzIGNhbm5vdCBiZSB1bmRvbmUuYCkpIHJldHVyblxuICAgIHNldEJ1c3lJZChpZClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS8ke2lkfWAsIHsgbWV0aG9kOiAnREVMRVRFJyB9KVxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKVxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5tZXNzYWdlIHx8ICdDb3VsZCBub3QgZGVsZXRlIGltYWdlJylcbiAgICAgIH1cbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGRhdGEubWVzc2FnZSB8fCAnSW1hZ2UgZGVsZXRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgZmV0Y2hEYXRhKClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IGRlbGV0ZSBpbWFnZScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeUlkKCcnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPk1lZGlhIGxpYnJhcnk8L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgVXBsb2FkIGltYWdlcyB1c2VkIG9uIHByb2R1Y3RzLCBjYXRlZ29yaWVzLCByZXZpZXdzLCBhbmQgdGhlIGhvbWVwYWdlLiBGaWxlcyBzdGF5IG9uIHRoaXMgc2VydmVyLlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlVwbG9hZDwvaDQ+XG4gICAgICAgIDxwPlxuICAgICAgICAgIEZpbGVzIGdvIGludG8gdGhlIDxzdHJvbmc+e3VwbG9hZEZvbGRlcn08L3N0cm9uZz4gZm9sZGVyXG4gICAgICAgICAge2ZvbGRlciA9PT0gJ2FsbCcgPyAnIChzZWxlY3QgYSBmb2xkZXIgYmVsb3cgdG8gY2hhbmdlIHRoaXMpLicgOiAnLid9XG4gICAgICAgIDwvcD5cbiAgICAgICAgPGxhYmVsXG4gICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktdXBsb2FkLWRyb3BcIlxuICAgICAgICAgIG9uRHJhZ092ZXI9eyhldmVudCkgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKX1cbiAgICAgICAgICBvbkRyb3A9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgdXBsb2FkRmlsZXMoZXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8c3Bhbj57dXBsb2FkaW5nID8gJ1VwbG9hZGluZ+KApicgOiAnQ2xpY2sgb3IgZHJvcCBpbWFnZXMgaGVyZSd9PC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgcmVmPXtmaWxlUmVmfVxuICAgICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgICAgYWNjZXB0PVwiaW1hZ2UvKlwiXG4gICAgICAgICAgICBtdWx0aXBsZVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3VwbG9hZGluZ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHVwbG9hZEZpbGVzKGV2ZW50LnRhcmdldC5maWxlcyl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkpQRywgUE5HLCBHSUYsIG9yIFdlYlAgdXAgdG8gNU1CIGVhY2g8L3NwYW4+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5MaWJyYXJ5PC9oND5cbiAgICAgICAgPHA+e3RvdGFsIHx8IDB9IGZpbGV7KHRvdGFsIHx8IDApID09PSAxID8gJycgOiAncyd9e2ZvbGRlciAhPT0gJ2FsbCcgPyBgIGluICR7Zm9sZGVyfWAgOiAnJ30uPC9wPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWZvbGRlci1jaGlwc1wiPlxuICAgICAgICAgIHtGT0xERVJTLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e2l0ZW19XG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1mb2xkZXItY2hpcCR7Zm9sZGVyID09PSBpdGVtID8gJyBpcy1vbicgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGb2xkZXIoaXRlbSl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpdGVtID09PSAnYWxsJyA/ICdBbGwgZm9sZGVycycgOiBpdGVtfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHtsb2FkaW5nID8gKFxuICAgICAgICAgIDxUZXh0IG10PVwieGxcIj5Mb2FkaW5nIGltYWdlc+KApjwvVGV4dD5cbiAgICAgICAgKSA6IGl0ZW1zLmxlbmd0aCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW1lZGlhLWdyaWRcIj5cbiAgICAgICAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgPGFydGljbGUga2V5PXtpdGVtLmlkfSBjbGFzc05hbWU9XCJ0b2tyaS1tZWRpYS1jYXJkXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tZWRpYS10aHVtYlwiPlxuICAgICAgICAgICAgICAgICAge2l0ZW0udXJsID8gPGltZyBzcmM9e2l0ZW0udXJsfSBhbHQ9e2l0ZW0ubmFtZX0gLz4gOiA8c3Bhbj5ObyBwcmV2aWV3PC9zcGFuPn1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nIHRpdGxlPXtpdGVtLm5hbWV9PntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICB7aXRlbS5mb2xkZXJ9IMK3IHtmb3JtYXRTaXplKGl0ZW0uc2l6ZSl9XG4gICAgICAgICAgICAgICAgICB7aXRlbS5jcmVhdGVkQXQgPyBgIMK3ICR7Zm9ybWF0V2hlbihpdGVtLmNyZWF0ZWRBdCl9YCA6ICcnfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW1lZGlhLWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b24gc2l6ZT1cInNtXCIgdmFyaWFudD1cInRleHRcIiBvbkNsaWNrPXsoKSA9PiBjb3B5UGF0aChpdGVtLnBhdGgpfT5cbiAgICAgICAgICAgICAgICAgICAgQ29weSBwYXRoXG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5SWQgPT09IGl0ZW0uaWR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHJlbW92ZShpdGVtLmlkLCBpdGVtLm5hbWUpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7YnVzeUlkID09PSBpdGVtLmlkID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICBEZWxldGVcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8VGV4dCBtdD1cInhsXCI+Tm8gaW1hZ2VzIGluIHRoaXMgZm9sZGVyIHlldC48L1RleHQ+XG4gICAgICAgICl9XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVkaWFMaWJyYXJ5XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgaXNGbGFnT24sIFN0YXR1c1N3aXRjaCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IFRheEVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wc1xuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cblxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCBpc1RheGFibGVCb29sID0gaXNGbGFnT24ocGFyYW1zLmlzVGF4YWJsZSlcblxuICBjb25zdCBoYW5kbGVUYXhhYmxlVG9nZ2xlID0gKHZhbHVlKSA9PiB7XG4gICAgc2V0RmllbGQoJ2lzVGF4YWJsZScsIHZhbHVlKVxuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHNldEZpZWxkKCdnc3RSYXRlJywgMClcbiAgICB9IGVsc2UgaWYgKE51bWJlcihwYXJhbXMuZ3N0UmF0ZSB8fCAwKSA9PT0gMCkge1xuICAgICAgc2V0RmllbGQoJ2dzdFJhdGUnLCA1KVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uU3VibWl0ID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQ/LnByZXZlbnREZWZhdWx0Py4oKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBoYW5kbGVTdWJtaXQoKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ1RheCBjb25maWd1cmF0aW9uIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5LicsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gdXBkYXRlIHRheCBjb25maWd1cmF0aW9uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17b25TdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZWFkXCI+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPEgzPntwYXJhbXMucHJvZHVjdE5hbWUgfHwgJ0VkaXQgUHJvZHVjdCBUYXgnfTwvSDM+XG4gICAgICAgICAgPFRleHQgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgIENvbmZpZ3VyZSBIU04gY29kZSBhbmQgR1NUIHBlcmNlbnRhZ2UgZm9yIHRoaXMgcHJvZHVjdC5cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5Qcm9kdWN0IGRldGFpbHM8L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUHJvZHVjdCBuYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5wcm9kdWN0TmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgZGlzYWJsZWRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgb3BhY2l0eTogMC43LCBjdXJzb3I6ICdub3QtYWxsb3dlZCcgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDYXRlZ29yeVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY2F0ZWdvcnlOYW1lIHx8ICdHZW5lcmFsJ31cbiAgICAgICAgICAgICAgZGlzYWJsZWRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgb3BhY2l0eTogMC43LCBjdXJzb3I6ICdub3QtYWxsb3dlZCcgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5UYXhhYmlsaXR5IHN0YXR1czwvaDQ+XG4gICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICBjaGVja2VkPXtpc1RheGFibGVCb29sfVxuICAgICAgICAgIHRpdGxlPVwiVGF4YWJsZVwiXG4gICAgICAgICAgaGludD17aXNUYXhhYmxlQm9vbCA/ICdHU1Qgd2lsbCBiZSBjaGFyZ2VkIGF0IGNoZWNrb3V0JyA6ICcwJSBHU1QgKGZyZXNoIGZydWl0cyAvIGV4ZW1wdCknfVxuICAgICAgICAgIG9uTGFiZWw9XCJZZXNcIlxuICAgICAgICAgIG9mZkxhYmVsPVwiTm9cIlxuICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVUYXhhYmxlVG9nZ2xlfVxuICAgICAgICAvPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+R1NUICYgSFNOIGRldGFpbHM8L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgSFNOIGNvZGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmhzbkNvZGUgfHwgJzA4MDgnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnaHNuQ29kZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiZS5nLiAwODAyIGZvciBkcnkgZnJ1aXRzLCAwODA4IGZvciBmcmVzaCBmcnVpdHNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEdTVCAlIHJhdGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgbWF4PVwiMTAwXCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5nc3RSYXRlID8/IChpc1RheGFibGVCb29sID8gNSA6IDApfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZ3N0UmF0ZScsIE51bWJlcihldmVudC50YXJnZXQudmFsdWUpIHx8IDApfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImUuZy4gNSBmb3IgZHJ5IGZydWl0c1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8VGV4dCBtdD1cInNtXCIgb3BhY2l0eT17MC43fSBmb250U2l6ZT1cIjEycHhcIj5cbiAgICAgICAgICB7aXNUYXhhYmxlQm9vbFxuICAgICAgICAgICAgPyBgQXQgY2hlY2tvdXQsIGludHJhLXN0YXRlIG9yZGVycyBzcGxpdCBpbnRvICR7KE51bWJlcihwYXJhbXMuZ3N0UmF0ZSB8fCA1KSAvIDIpLnRvRml4ZWQoMSl9JSBDR1NUICsgJHsoTnVtYmVyKHBhcmFtcy5nc3RSYXRlIHx8IDUpIC8gMikudG9GaXhlZCgxKX0lIFNHU1Q7IGludGVyLXN0YXRlIG9yZGVycyBjaGFyZ2UgJHtOdW1iZXIocGFyYW1zLmdzdFJhdGUgfHwgNSl9JSBJR1NULmBcbiAgICAgICAgICAgIDogJ1Byb2R1Y3QgaXMgZXhlbXB0L25vbi10YXhhYmxlICgwJSBHU1QpLid9XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIFNhdmUgdGF4IHNldHRpbmdzXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgVGF4RWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5cbmZ1bmN0aW9uIGNvcHlUZXh0KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgfHwgIW5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCkgcmV0dXJuIFByb21pc2UucmVqZWN0KClcbiAgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHZhbHVlKVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSYXpvcnBheVBheW1lbnRJZCh7IHJlY29yZCB9KSB7XG4gIGNvbnN0IHBheW1lbnRJZCA9IFN0cmluZyhyZWNvcmQ/LnBhcmFtcz8ucmF6b3JwYXlQYXltZW50SWQgfHwgJycpLnRyaW0oKVxuICBjb25zdCBwYWlkID0gcmVjb3JkPy5wYXJhbXM/LnBheW1lbnRTdGF0dXMgPT09ICdwYWlkJ1xuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgaWYgKCFwYWlkIHx8ICFwYXltZW50SWQpIHtcbiAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktcnpwLWVtcHR5XCI+4oCUPC9zcGFuPlxuICB9XG5cbiAgY29uc3QgaGFuZGxlQ29weSA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGNvcHlUZXh0KHBheW1lbnRJZClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgc2V0Q29waWVkKHRydWUpXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDEyMDApXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHt9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXJ6cC1jZWxsXCIgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX0+XG4gICAgICA8YVxuICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1yenAtaWRcIlxuICAgICAgICBocmVmPXtgaHR0cHM6Ly9kYXNoYm9hcmQucmF6b3JwYXkuY29tL2FwcC9wYXltZW50cy8ke2VuY29kZVVSSUNvbXBvbmVudChwYXltZW50SWQpfWB9XG4gICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICB0aXRsZT1cIk9wZW4gdGhpcyBwYXltZW50IGluIFJhem9ycGF5XCJcbiAgICAgID5cbiAgICAgICAge3BheW1lbnRJZH1cbiAgICAgIDwvYT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLXJ6cC1jb3B5XCIgb25DbGljaz17aGFuZGxlQ29weX0+XG4gICAgICAgIHtjb3BpZWQgPyAnQ29waWVkJyA6ICdDb3B5J31cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgQm94LFxuICBCdXR0b24sXG4gIEZvcm1Hcm91cCxcbiAgSDIsXG4gIElucHV0LFxuICBMYWJlbCxcbiAgTWVzc2FnZUJveCxcbiAgVGV4dCxcbn0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcydcblxuY29uc3QgUkVNRU1CRVJFRF9MT0dJTl9LRVkgPSAndG9rcmlfYWRtaW5fbG9naW4nXG5cbmNvbnN0IExvZ2luID0gKCkgPT4ge1xuICBjb25zdCB7IGFjdGlvbiwgZXJyb3JNZXNzYWdlIH0gPSB3aW5kb3cuX19BUFBfU1RBVEVfXyB8fCB7fVxuICBjb25zdCB7IHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKClcbiAgY29uc3QgYWRtaW5Sb290ID0gYWN0aW9uPy5yZXBsYWNlKC9cXC9sb2dpbiQvLCAnJykgfHwgJydcbiAgY29uc3QgZm9yZ290UGFzc3dvcmRVcmwgPSBgJHthZG1pblJvb3R9L2ZvcmdvdC1wYXNzd29yZGBcbiAgY29uc3QgW2lkZW50aWZpZXIsIHNldElkZW50aWZpZXJdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtyZW1lbWJlckxvZ2luLCBzZXRSZW1lbWJlckxvZ2luXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2hvd1Bhc3N3b3JkLCBzZXRTaG93UGFzc3dvcmRdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByZW1lbWJlcmVkTG9naW4gPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oUkVNRU1CRVJFRF9MT0dJTl9LRVkpXG4gICAgaWYgKHJlbWVtYmVyZWRMb2dpbikge1xuICAgICAgc2V0SWRlbnRpZmllcihyZW1lbWJlcmVkTG9naW4pXG4gICAgICBzZXRSZW1lbWJlckxvZ2luKHRydWUpXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBmb3JtID0gZXZlbnQuY3VycmVudFRhcmdldFxuICAgIGNvbnN0IGVtYWlsSW5wdXQgPSBmb3JtLmVsZW1lbnRzLm5hbWVkSXRlbSgnZW1haWwnKVxuICAgIGNvbnN0IHZhbHVlID1cbiAgICAgIChlbWFpbElucHV0ICYmICd2YWx1ZScgaW4gZW1haWxJbnB1dCA/IFN0cmluZyhlbWFpbElucHV0LnZhbHVlKSA6IGlkZW50aWZpZXIpLnRyaW0oKVxuXG4gICAgaWYgKGVtYWlsSW5wdXQgJiYgJ3ZhbHVlJyBpbiBlbWFpbElucHV0KSB7XG4gICAgICBlbWFpbElucHV0LnZhbHVlID0gdmFsdWVcbiAgICB9XG5cbiAgICBpZiAocmVtZW1iZXJMb2dpbiAmJiB2YWx1ZSkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFJFTUVNQkVSRURfTE9HSU5fS0VZLCB2YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFJFTUVNQkVSRURfTE9HSU5fS0VZKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgZmxleFxuICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiXG4gICAgICBtaW5IZWlnaHQ9XCIxMDB2aFwiXG4gICAgICBiZz1cImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMwMjJjMjIsICMwNDc4NTcpXCJcbiAgICAgIHA9XCJ4bFwiXG4gICAgPlxuICAgICAgPEJveFxuICAgICAgICBiZz1cIndoaXRlXCJcbiAgICAgICAgd2lkdGg9e1snMTAwJScsICc0NDBweCddfVxuICAgICAgICBib3JkZXJSYWRpdXM9XCIxOHB4XCJcbiAgICAgICAgYm94U2hhZG93PVwiMCAyNHB4IDcwcHggcmdiYSgyLCA0NCwgMzQsIDAuMzUpXCJcbiAgICAgICAgcD1cIngzXCJcbiAgICAgID5cbiAgICAgICAgPEgyIGNvbG9yPVwiIzAyMmMyMlwiIG1iPVwic21cIj5Ub2tyaWlpIENNUzwvSDI+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwiIzY0NzQ4YlwiIG1iPVwieGxcIj5cbiAgICAgICAgICBTaWduIGluIHdpdGggeW91ciBhZG1pbiBlbWFpbCBvciB1c2VybmFtZSB0byBtYW5hZ2UgcHJvZHVjdHMsIG9yZGVycywgYW5kIGNvbnRlbnQuXG4gICAgICAgIDwvVGV4dD5cblxuICAgICAgICB7ZXJyb3JNZXNzYWdlID8gKFxuICAgICAgICAgIDxNZXNzYWdlQm94XG4gICAgICAgICAgICBtYj1cImxnXCJcbiAgICAgICAgICAgIG1lc3NhZ2U9e2Vycm9yTWVzc2FnZS5zcGxpdCgnICcpLmxlbmd0aCA+IDEgPyBlcnJvck1lc3NhZ2UgOiB0cmFuc2xhdGVNZXNzYWdlKGVycm9yTWVzc2FnZSl9XG4gICAgICAgICAgICB2YXJpYW50PVwiZGFuZ2VyXCJcbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICA8Qm94IGFzPVwiZm9ybVwiIGFjdGlvbj17YWN0aW9ufSBtZXRob2Q9XCJQT1NUXCIgb25TdWJtaXQ9e2hhbmRsZVN1Ym1pdH0+XG4gICAgICAgICAgPEZvcm1Hcm91cD5cbiAgICAgICAgICAgIDxMYWJlbCByZXF1aXJlZD5FbWFpbCBvciB1c2VybmFtZTwvTGFiZWw+XG4gICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgbmFtZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciBlbWFpbCBvciB1c2VybmFtZVwiXG4gICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cInVzZXJuYW1lXCJcbiAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXtpZGVudGlmaWVyfVxuICAgICAgICAgICAgICBrZXk9e2lkZW50aWZpZXIgfHwgJ2xvZ2luLWVtYWlsJ31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9Gb3JtR3JvdXA+XG5cbiAgICAgICAgICA8Rm9ybUdyb3VwPlxuICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPlBhc3N3b3JkPC9MYWJlbD5cbiAgICAgICAgICAgIDxCb3ggcG9zaXRpb249XCJyZWxhdGl2ZVwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPXtzaG93UGFzc3dvcmQgPyAndGV4dCcgOiAncGFzc3dvcmQnfVxuICAgICAgICAgICAgICAgIG5hbWU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciBwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwiY3VycmVudC1wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZ1JpZ2h0OiA0MiB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17c2hvd1Bhc3N3b3JkID8gJ0hpZGUgcGFzc3dvcmQnIDogJ1Nob3cgcGFzc3dvcmQnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNob3dQYXNzd29yZCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgcmlnaHQ6IDgsXG4gICAgICAgICAgICAgICAgICB0b3A6ICc1MCUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgtNTAlKScsXG4gICAgICAgICAgICAgICAgICBib3JkZXI6IDAsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMDQ3ODU3JyxcbiAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1mbGV4JyxcbiAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgd2lkdGg6IDI2LFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyNixcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDAsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtzaG93UGFzc3dvcmQgPyAoXG4gICAgICAgICAgICAgICAgICA8c3ZnXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMjBcIlxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIyMFwiXG4gICAgICAgICAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPVwiMlwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTMgM2wxOCAxOFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTAuNiAxMC42QTIgMiAwIDAgMCAxMy40IDEzLjRcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTkuOSA0LjJBMTAuNyAxMC43IDAgMCAxIDEyIDRjNSAwIDkgNC41IDEwIDhhMTIuOCAxMi44IDAgMCAxLTIuMSAzLjZcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTYuNiA2LjZDNC4zIDggMi43IDEwLjIgMiAxMmMxIDMuNSA1IDggMTAgOCAxLjUgMCAyLjktLjQgNC4xLTFcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9XCIyMFwiXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjIwXCJcbiAgICAgICAgICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9XCIyXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMiAxMnM0LTcgMTAtNyAxMCA3IDEwIDctNCA3LTEwIDdTMiAxMiAyIDEyelwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiIC8+XG4gICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgIDwvRm9ybUdyb3VwPlxuXG4gICAgICAgICAgPEJveCBkaXNwbGF5PVwiZmxleFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBtYj1cImxnXCI+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJyZW1lbWJlci1sb2dpblwiXG4gICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgIGNoZWNrZWQ9e3JlbWVtYmVyTG9naW59XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFJlbWVtYmVyTG9naW4oZXZlbnQudGFyZ2V0LmNoZWNrZWQpfVxuICAgICAgICAgICAgICBzdHlsZT17eyBtYXJnaW5SaWdodDogOCB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwicmVtZW1iZXItbG9naW5cIiBzdHlsZT17eyBjb2xvcjogJyM0NzU1NjknLCBmb250U2l6ZTogMTQgfX0+XG4gICAgICAgICAgICAgIFJlbWVtYmVyIG15IGVtYWlsIG9yIHVzZXJuYW1lIG9uIHRoaXMgZGV2aWNlXG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAgPEJ1dHRvbiB0eXBlPVwic3VibWl0XCIgdmFyaWFudD1cImNvbnRhaW5lZFwiIHdpZHRoPVwiMTAwJVwiIG10PVwibGdcIj5cbiAgICAgICAgICAgIFNpZ24gaW5cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgPFRleHQgbXQ9XCJ4bFwiIHRleHRBbGlnbj1cImNlbnRlclwiPlxuICAgICAgICAgIDxhIGhyZWY9e2ZvcmdvdFBhc3N3b3JkVXJsfSBzdHlsZT17eyBjb2xvcjogJyMwNDc4NTcnLCBmb250V2VpZ2h0OiA3MDAgfX0+XG4gICAgICAgICAgICBGb3Jnb3QgcGFzc3dvcmQ/XG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb2dpblxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uR3JvdXAsIE1lc3NhZ2VCb3ggfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlRmlsdGVyRHJhd2VyLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnXG5cbmZ1bmN0aW9uIGFkbWluUm9vdFBhdGgoKSB7XG4gIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC9eKC4qKVxcL3Jlc291cmNlc1xcLy8pXG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcLyQvLCAnJylcbn1cblxuZnVuY3Rpb24gY2F0YWxvZ0NvbmZpZyhyZXNvdXJjZUlkKSB7XG4gIGlmIChyZXNvdXJjZUlkID09PSAnQ2F0ZWdvcnknKSB7XG4gICAgcmV0dXJuIHsgZXhwb3J0VXJsOiAnY2F0ZWdvcmllcy9leHBvcnQnLCBpbXBvcnRVcmw6ICdjYXRlZ29yaWVzL2ltcG9ydCcgfVxuICB9XG4gIGlmIChyZXNvdXJjZUlkID09PSAnUHJvZHVjdCcpIHtcbiAgICByZXR1cm4geyBleHBvcnRVcmw6ICdwcm9kdWN0cy9leHBvcnQnLCBpbXBvcnRVcmw6ICdwcm9kdWN0cy9pbXBvcnQnIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDYXRhbG9nTGlzdEhlYWRlckFjdGlvbnMoeyByZXNvdXJjZSwgb25JbXBvcnRlZCB9KSB7XG4gIGNvbnN0IHsgdHJhbnNsYXRlQnV0dG9uLCB0cmFuc2xhdGVBY3Rpb24gfSA9IHVzZVRyYW5zbGF0aW9uKClcbiAgY29uc3QgeyB0b2dnbGVGaWx0ZXIsIGZpbHRlcnNDb3VudCB9ID0gdXNlRmlsdGVyRHJhd2VyKClcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFttZXNzYWdlLCBzZXRNZXNzYWdlXSA9IHVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGZpbGVSZWYgPSB1c2VSZWYobnVsbClcblxuICBjb25zdCByZXNvdXJjZUlkID0gcmVzb3VyY2UuaWRcbiAgY29uc3QgY29uZmlnID0gY2F0YWxvZ0NvbmZpZyhyZXNvdXJjZUlkKVxuICBjb25zdCByb290ID0gYWRtaW5Sb290UGF0aCgpXG5cbiAgY29uc3QgaGFuZGxlSW1wb3J0ID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJydcbiAgICBpZiAoIWZpbGUgfHwgIWNvbmZpZykgcmV0dXJuXG5cbiAgICBzZXRMb2FkaW5nKHRydWUpXG4gICAgc2V0TWVzc2FnZShudWxsKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpXG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7cm9vdH0vY2F0YWxvZy8ke2NvbmZpZy5pbXBvcnRVcmx9YCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogZm9ybURhdGEsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLm1lc3NhZ2UgfHwgJ0ltcG9ydCBmYWlsZWQuJylcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXJyb3JDb3VudCA9IGRhdGEuZXJyb3JzPy5sZW5ndGggfHwgMFxuICAgICAgc2V0TWVzc2FnZSh7XG4gICAgICAgIHR5cGU6IGVycm9yQ291bnQgPyAnaW5mbycgOiAnc3VjY2VzcycsXG4gICAgICAgIHRleHQ6XG4gICAgICAgICAgZXJyb3JDb3VudCA+IDBcbiAgICAgICAgICAgID8gYEltcG9ydCBmaW5pc2hlZC4gJHtkYXRhLmNyZWF0ZWR9IGFkZGVkLCAke2RhdGEudXBkYXRlZH0gdXBkYXRlZC4gJHtlcnJvckNvdW50fSByb3cocykgY291bGQgbm90IGJlIGltcG9ydGVkLiBFeGlzdGluZyByb3dzIGFyZSBtYXRjaGVkIGJ5IHNsdWcuYFxuICAgICAgICAgICAgOiBgSW1wb3J0IGZpbmlzaGVkLiAke2RhdGEuY3JlYXRlZH0gYWRkZWQsICR7ZGF0YS51cGRhdGVkfSB1cGRhdGVkLiBFeGlzdGluZyByb3dzIGFyZSBtYXRjaGVkIGJ5IHNsdWcg4oCUIGtlZXAgc2x1ZyB0aGUgc2FtZSB0byB1cGRhdGUgcHJpY2UuYCxcbiAgICAgIH0pXG4gICAgICBvbkltcG9ydGVkPy4oKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2RhbmdlcicsIHRleHQ6IGVycm9yLm1lc3NhZ2UgfHwgJ0ltcG9ydCBmYWlsZWQuJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGJ1dHRvbnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIWNvbmZpZykgcmV0dXJuIFtdXG5cbiAgICBjb25zdCBpdGVtcyA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdFeHBvcnQgQ1NWJyxcbiAgICAgICAgdmFyaWFudDogJ3RleHQnLFxuICAgICAgICBocmVmOiBgJHtyb290fS9jYXRhbG9nLyR7Y29uZmlnLmV4cG9ydFVybH1gLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdFeHBvcnQgRXhjZWwnLFxuICAgICAgICB2YXJpYW50OiAndGV4dCcsXG4gICAgICAgIGhyZWY6IGAke3Jvb3R9L2NhdGFsb2cvJHtjb25maWcuZXhwb3J0VXJsfT9mb3JtYXQ9eGxzeGAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogbG9hZGluZyA/ICdJbXBvcnRpbmcuLi4nIDogJ0ltcG9ydCcsXG4gICAgICAgIHZhcmlhbnQ6ICd0ZXh0JyxcbiAgICAgICAgb25DbGljazogbG9hZGluZyA/IHVuZGVmaW5lZCA6ICgpID0+IGZpbGVSZWYuY3VycmVudD8uY2xpY2soKSxcbiAgICAgIH0sXG4gICAgXVxuXG4gICAgY29uc3QgbmV3QWN0aW9uID0gcmVzb3VyY2UucmVzb3VyY2VBY3Rpb25zPy5maW5kKChhY3Rpb24pID0+IGFjdGlvbi5uYW1lID09PSAnbmV3JylcbiAgICBpZiAobmV3QWN0aW9uKSB7XG4gICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgaWNvbjogbmV3QWN0aW9uLmljb24sXG4gICAgICAgIGxhYmVsOiB0cmFuc2xhdGVBY3Rpb24obmV3QWN0aW9uLmxhYmVsLCByZXNvdXJjZUlkKSxcbiAgICAgICAgdmFyaWFudDogbmV3QWN0aW9uLnZhcmlhbnQsXG4gICAgICAgIGhyZWY6IGAke3Jvb3R9L3Jlc291cmNlcy8ke3Jlc291cmNlSWR9L2FjdGlvbnMvbmV3YCxcbiAgICAgICAgJ2RhdGEtY3NzJzogYCR7cmVzb3VyY2VJZH0tbmV3LWJ1dHRvbmAsXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IGZpbHRlcktleSA9IGZpbHRlcnNDb3VudCA+IDAgPyAnZmlsdGVyQWN0aXZlJyA6ICdmaWx0ZXInXG4gICAgaXRlbXMucHVzaCh7XG4gICAgICBsYWJlbDogdHJhbnNsYXRlQnV0dG9uKGZpbHRlcktleSwgcmVzb3VyY2VJZCwgeyBjb3VudDogZmlsdGVyc0NvdW50IH0pLFxuICAgICAgb25DbGljazogdG9nZ2xlRmlsdGVyLFxuICAgICAgaWNvbjogJ0ZpbHRlcicsXG4gICAgICAnZGF0YS1jc3MnOiBgJHtyZXNvdXJjZUlkfS1maWx0ZXItYnV0dG9uYCxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGl0ZW1zXG4gIH0sIFtcbiAgICBjb25maWcsXG4gICAgcm9vdCxcbiAgICBsb2FkaW5nLFxuICAgIHJlc291cmNlLnJlc291cmNlQWN0aW9ucyxcbiAgICByZXNvdXJjZUlkLFxuICAgIHRyYW5zbGF0ZUFjdGlvbixcbiAgICB0cmFuc2xhdGVCdXR0b24sXG4gICAgZmlsdGVyc0NvdW50LFxuICAgIHRvZ2dsZUZpbHRlcixcbiAgXSlcblxuICBpZiAoIWNvbmZpZykgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8Qm94XG4gICAgICAgIG10PVwieGxcIlxuICAgICAgICBtYj1cImRlZmF1bHRcIlxuICAgICAgICBkaXNwbGF5PVwiZmxleFwiXG4gICAgICAgIGp1c3RpZnlDb250ZW50PVwiZmxleC1lbmRcIlxuICAgICAgICBmbGV4U2hyaW5rPXswfVxuICAgICAgICBweD17WydkZWZhdWx0JywgMF19XG4gICAgICAgIHN0eWxlPXt7IG1hcmdpblRvcDogJy01MnB4JyB9fVxuICAgICAgPlxuICAgICAgICA8QnV0dG9uR3JvdXAgYnV0dG9ucz17YnV0dG9uc30gLz5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgcmVmPXtmaWxlUmVmfVxuICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICBhY2NlcHQ9XCIuY3N2LC54bHN4LHRleHQvY3N2LGFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0XCJcbiAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX1cbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlSW1wb3J0fVxuICAgICAgICAvPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIHttZXNzYWdlICYmIChcbiAgICAgICAgPEJveCBtYj1cImRlZmF1bHRcIiBweD17WydkZWZhdWx0JywgMF19PlxuICAgICAgICAgIDxNZXNzYWdlQm94XG4gICAgICAgICAgICB2YXJpYW50PXttZXNzYWdlLnR5cGV9XG4gICAgICAgICAgICBtZXNzYWdlPXttZXNzYWdlLnRleHR9XG4gICAgICAgICAgICBvbkNsb3NlQ2xpY2s9eygpID0+IHNldE1lc3NhZ2UobnVsbCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuICAgIDwvPlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3ggfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgT3JpZ2luYWxBY3Rpb25IZWFkZXIgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IENhdGFsb2dMaXN0SGVhZGVyQWN0aW9ucyBmcm9tICcuL2NhdGFsb2ctbGlzdC1oZWFkZXItYWN0aW9ucy5qc3gnXG5cbmNvbnN0IENBVEFMT0dfUkVTT1VSQ0VTID0gbmV3IFNldChbJ1Byb2R1Y3QnLCAnQ2F0ZWdvcnknXSlcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQWN0aW9uSGVhZGVyKHByb3BzKSB7XG4gIGNvbnN0IHsgT3JpZ2luYWxDb21wb25lbnQsIGFjdGlvbiwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IEJhc2VIZWFkZXIgPSBPcmlnaW5hbENvbXBvbmVudCB8fCBPcmlnaW5hbEFjdGlvbkhlYWRlclxuICBjb25zdCBpc0NhdGFsb2dMaXN0ID0gYWN0aW9uPy5uYW1lID09PSAnbGlzdCcgJiYgQ0FUQUxPR19SRVNPVVJDRVMuaGFzKHJlc291cmNlPy5pZClcblxuICBpZiAoIWlzQ2F0YWxvZ0xpc3QpIHtcbiAgICByZXR1cm4gPEJhc2VIZWFkZXIgey4uLnByb3BzfSAvPlxuICB9XG5cbiAgY29uc3QgeyBPcmlnaW5hbENvbXBvbmVudDogX2lnbm9yZWQsIC4uLmhlYWRlclByb3BzIH0gPSBwcm9wc1xuXG4gIHJldHVybiAoXG4gICAgPEJveD5cbiAgICAgIDxCYXNlSGVhZGVyIHsuLi5oZWFkZXJQcm9wc30gb21pdEFjdGlvbnMgLz5cbiAgICAgIDxDYXRhbG9nTGlzdEhlYWRlckFjdGlvbnNcbiAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICBvbkltcG9ydGVkPXtwcm9wcy5hY3Rpb25QZXJmb3JtZWR9XG4gICAgICAvPlxuICAgIDwvQm94PlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QsIHsgbWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEZvcm1Hcm91cCwgRm9ybU1lc3NhZ2UsIExhYmVsLCBUaW55TUNFIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcblxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBwbHVnaW5zOiBbXG4gICAgJ2NvZGUnLFxuICAgICdsaW5rJyxcbiAgICAnbGlzdHMnLFxuICAgICdpbWFnZScsXG4gICAgJ3RhYmxlJyxcbiAgICAnYXV0b2xpbmsnLFxuICAgICdwcmV2aWV3JyxcbiAgICAnc2VhcmNocmVwbGFjZScsXG4gICAgJ3dvcmRjb3VudCcsXG4gICAgJ21lZGlhJyxcbiAgICAnY29kZXNhbXBsZScsXG4gIF0sXG4gIHRvb2xiYXI6XG4gICAgJ3VuZG8gcmVkbyB8IGJsb2NrcyB8IGJvbGQgaXRhbGljIHVuZGVybGluZSBzdHJpa2V0aHJvdWdoIHwgYWxpZ25sZWZ0IGFsaWduY2VudGVyIGFsaWducmlnaHQgYWxpZ25qdXN0aWZ5IHwgYnVsbGlzdCBudW1saXN0IG91dGRlbnQgaW5kZW50IHwgbGluayBpbWFnZSB0YWJsZSBjb2Rlc2FtcGxlIHwgY29kZSB8IHJlbW92ZWZvcm1hdCcsXG4gIGhlaWdodDogNDAwLFxufVxuXG5jb25zdCBSaWNodGV4dEVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyBwcm9wZXJ0eSwgcmVjb3JkLCBvbkNoYW5nZSB9ID0gcHJvcHNcbiAgY29uc3QgdmFsdWUgPSByZWNvcmQucGFyYW1zPy5bcHJvcGVydHkucGF0aF0gPz8gJydcbiAgY29uc3QgZXJyb3IgPSByZWNvcmQuZXJyb3JzPy5bcHJvcGVydHkucGF0aF1cblxuICBjb25zdCBoYW5kbGVVcGRhdGUgPSB1c2VDYWxsYmFjayhcbiAgICAobmV3VmFsdWUpID0+IHtcbiAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIG5ld1ZhbHVlKVxuICAgIH0sXG4gICAgW29uQ2hhbmdlLCBwcm9wZXJ0eS5wYXRoXSxcbiAgKVxuXG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgLi4uREVGQVVMVF9PUFRJT05TLFxuICAgIC4uLihwcm9wZXJ0eS5wcm9wcyB8fCB7fSksXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxGb3JtR3JvdXAgZXJyb3I9e0Jvb2xlYW4oZXJyb3IpfT5cbiAgICAgIDxMYWJlbCByZXF1aXJlZD17cHJvcGVydHkuaXNSZXF1aXJlZH0+e3Byb3BlcnR5LmxhYmVsfTwvTGFiZWw+XG4gICAgICA8VGlueU1DRSB2YWx1ZT17dmFsdWV9IG9uQ2hhbmdlPXtoYW5kbGVVcGRhdGV9IG9wdGlvbnM9e29wdGlvbnN9IC8+XG4gICAgICA8Rm9ybU1lc3NhZ2U+e2Vycm9yPy5tZXNzYWdlfTwvRm9ybU1lc3NhZ2U+XG4gICAgPC9Gb3JtR3JvdXA+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWVtbyhSaWNodGV4dEVkaXQpXG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBJY29uIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZUxvY2F0aW9uLCB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlcidcblxuZnVuY3Rpb24gYWRtaW5Sb290KHBhdGhuYW1lKSB7XG4gIGNvbnN0IGN1dCA9IHBhdGhuYW1lLnNlYXJjaCgvXFwvKHJlc291cmNlc3xwYWdlcykoXFwvfCQpLylcbiAgY29uc3Qgcm9vdCA9IGN1dCA9PT0gLTEgPyBwYXRobmFtZSA6IHBhdGhuYW1lLnNsaWNlKDAsIGN1dClcbiAgcmV0dXJuIHJvb3QucmVwbGFjZSgvXFwvJC8sICcnKSB8fCAnLydcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2lkZWJhclJlc291cmNlU2VjdGlvbihwcm9wcykge1xuICBjb25zdCBPcmlnaW5hbCA9IHByb3BzLk9yaWdpbmFsQ29tcG9uZW50XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKClcbiAgY29uc3QgaHJlZiA9IGFkbWluUm9vdChsb2NhdGlvbi5wYXRobmFtZSlcbiAgY29uc3Qgc2VsZWN0ZWQgPSBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC8kLywgJycpID09PSBocmVmLnJlcGxhY2UoL1xcLyQvLCAnJykgfHwgbG9jYXRpb24ucGF0aG5hbWUgPT09IGAke2hyZWZ9L2BcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8YVxuICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1zaWRlYmFyLWRhc2hib2FyZCR7c2VsZWN0ZWQgPyAnIGlzLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICBocmVmPXtocmVmfVxuICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgbmF2aWdhdGUoaHJlZilcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPEljb24gaWNvbj1cIkhvbWVcIiAvPlxuICAgICAgICA8c3Bhbj5EYXNoYm9hcmQ8L3NwYW4+XG4gICAgICA8L2E+XG4gICAgICB7T3JpZ2luYWwgPyA8T3JpZ2luYWwgcmVzb3VyY2VzPXtwcm9wcy5yZXNvdXJjZXN9IC8+IDogbnVsbH1cbiAgICA8Lz5cbiAgKVxufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgTG9hZGVyLCBUYWJsZSwgVGFibGVCb2R5IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7XG4gIE5vUmVjb3JkcyxcbiAgUmVjb3JkSW5MaXN0LFxuICBSZWNvcmRzVGFibGVIZWFkZXIsXG4gIFNlbGVjdGVkUmVjb3Jkcyxcbn0gZnJvbSAnYWRtaW5qcydcblxuY29uc3QgZ2V0UmVzb3VyY2VFbGVtZW50Q3NzID0gKHJlc291cmNlSWQsIHN1ZmZpeCkgPT4gYCR7cmVzb3VyY2VJZH0tJHtzdWZmaXh9YFxuXG4vKipcbiAqIEFkbWluSlMgbWFya3MgdGhlIGhlYWRlciBjaGVja2JveCBjaGVja2VkIHdoZW4gQU5ZIHJvdyBpcyBzZWxlY3RlZC5cbiAqIE92ZXJyaWRlIHNvOiBub25lID0gdW5jaGVja2VkLCBzb21lID0gaW5kZXRlcm1pbmF0ZSwgYWxsID0gY2hlY2tlZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUmVjb3Jkc1RhYmxlKHByb3BzKSB7XG4gIGNvbnN0IHtcbiAgICByZXNvdXJjZSxcbiAgICByZWNvcmRzLFxuICAgIGFjdGlvblBlcmZvcm1lZCxcbiAgICBzb3J0QnksXG4gICAgZGlyZWN0aW9uLFxuICAgIGlzTG9hZGluZyxcbiAgICBvblNlbGVjdCxcbiAgICBzZWxlY3RlZFJlY29yZHMsXG4gICAgb25TZWxlY3RBbGwsXG4gIH0gPSBwcm9wc1xuXG4gIGlmICghcmVjb3Jkcy5sZW5ndGgpIHtcbiAgICBpZiAoaXNMb2FkaW5nKSByZXR1cm4gPExvYWRlciAvPlxuICAgIHJldHVybiA8Tm9SZWNvcmRzIHJlc291cmNlPXtyZXNvdXJjZX0gLz5cbiAgfVxuXG4gIGNvbnN0IHNlbGVjdGVkQ291bnQgPSBzZWxlY3RlZFJlY29yZHNcbiAgICA/IHJlY29yZHMuZmlsdGVyKChyZWNvcmQpID0+IHNlbGVjdGVkUmVjb3Jkcy5zb21lKChzZWxlY3RlZCkgPT4gc2VsZWN0ZWQuaWQgPT09IHJlY29yZC5pZCkpLmxlbmd0aFxuICAgIDogMFxuICBjb25zdCBzZWxlY3RlZEFsbCA9IHNlbGVjdGVkQ291bnQgPiAwICYmIHNlbGVjdGVkQ291bnQgPT09IHJlY29yZHMubGVuZ3RoXG4gIGNvbnN0IGluZGV0ZXJtaW5hdGUgPSBzZWxlY3RlZENvdW50ID4gMCAmJiBzZWxlY3RlZENvdW50IDwgcmVjb3Jkcy5sZW5ndGhcbiAgY29uc3QgcmVjb3Jkc0hhdmVCdWxrQWN0aW9uID0gISFyZWNvcmRzLmZpbmQoKHJlY29yZCkgPT4gcmVjb3JkLmJ1bGtBY3Rpb25zLmxlbmd0aClcblxuICBjb25zdCBjb250ZW50VGFnID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHJlc291cmNlLmlkLCAndGFibGUnKVxuICBjb25zdCBzZWxlY3RlZFRhZyA9IGdldFJlc291cmNlRWxlbWVudENzcyhyZXNvdXJjZS5pZCwgJ3RhYmxlLXNlbGVjdGVkLXJlY29yZHMnKVxuICBjb25zdCBib2R5VGFnID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHJlc291cmNlLmlkLCAndGFibGUtYm9keScpXG5cbiAgcmV0dXJuIChcbiAgICA8VGFibGUgZGF0YS1jc3M9e2NvbnRlbnRUYWd9PlxuICAgICAgPFNlbGVjdGVkUmVjb3Jkc1xuICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgIHNlbGVjdGVkUmVjb3Jkcz17c2VsZWN0ZWRSZWNvcmRzfVxuICAgICAgICBkYXRhLWNzcz17c2VsZWN0ZWRUYWd9XG4gICAgICAvPlxuICAgICAgPFJlY29yZHNUYWJsZUhlYWRlclxuICAgICAgICBwcm9wZXJ0aWVzPXtyZXNvdXJjZS5saXN0UHJvcGVydGllc31cbiAgICAgICAgdGl0bGVQcm9wZXJ0eT17cmVzb3VyY2UudGl0bGVQcm9wZXJ0eX1cbiAgICAgICAgZGlyZWN0aW9uPXtkaXJlY3Rpb259XG4gICAgICAgIHNvcnRCeT17c29ydEJ5fVxuICAgICAgICBvblNlbGVjdEFsbD17cmVjb3Jkc0hhdmVCdWxrQWN0aW9uID8gb25TZWxlY3RBbGwgOiB1bmRlZmluZWR9XG4gICAgICAgIHNlbGVjdGVkQWxsPXtzZWxlY3RlZEFsbH1cbiAgICAgICAgaW5kZXRlcm1pbmF0ZT17aW5kZXRlcm1pbmF0ZX1cbiAgICAgIC8+XG4gICAgICA8VGFibGVCb2R5IGRhdGEtY3NzPXtib2R5VGFnfT5cbiAgICAgICAge3JlY29yZHMubWFwKChyZWNvcmQpID0+IChcbiAgICAgICAgICA8UmVjb3JkSW5MaXN0XG4gICAgICAgICAgICByZWNvcmQ9e3JlY29yZH1cbiAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgIGtleT17cmVjb3JkLmlkfVxuICAgICAgICAgICAgYWN0aW9uUGVyZm9ybWVkPXthY3Rpb25QZXJmb3JtZWR9XG4gICAgICAgICAgICBpc0xvYWRpbmc9e2lzTG9hZGluZ31cbiAgICAgICAgICAgIG9uU2VsZWN0PXtvblNlbGVjdH1cbiAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e1xuICAgICAgICAgICAgICBzZWxlY3RlZFJlY29yZHMgJiYgISFzZWxlY3RlZFJlY29yZHMuZmluZCgoc2VsZWN0ZWQpID0+IHNlbGVjdGVkLmlkID09PSByZWNvcmQuaWQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L1RhYmxlQm9keT5cbiAgICA8L1RhYmxlPlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFRhYmxlQ2VsbCwgVGFibGVIZWFkLCBUYWJsZVJvdyB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBQcm9wZXJ0eUhlYWRlciB9IGZyb20gJ2FkbWluanMnXG5cbmNvbnN0IGdldFJlc291cmNlRWxlbWVudENzcyA9IChyZXNvdXJjZUlkLCBzdWZmaXgpID0+IGAke3Jlc291cmNlSWR9LSR7c3VmZml4fWBcblxuY29uc3QgZGlzcGxheSA9IChpc1RpdGxlKSA9PiBbXG4gIGlzVGl0bGUgPyAndGFibGUtY2VsbCcgOiAnbm9uZScsXG4gIGlzVGl0bGUgPyAndGFibGUtY2VsbCcgOiAnbm9uZScsXG4gICd0YWJsZS1jZWxsJyxcbiAgJ3RhYmxlLWNlbGwnLFxuXVxuXG5mdW5jdGlvbiBTZWxlY3RBbGxDaGVja0JveCh7IGNoZWNrZWQsIGluZGV0ZXJtaW5hdGUsIG9uQ2hhbmdlIH0pIHtcbiAgY29uc3QgaW5wdXRSZWYgPSB1c2VSZWYobnVsbClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpbnB1dFJlZi5jdXJyZW50KSB7XG4gICAgICBpbnB1dFJlZi5jdXJyZW50LmluZGV0ZXJtaW5hdGUgPSBCb29sZWFuKGluZGV0ZXJtaW5hdGUpXG4gICAgfVxuICB9LCBbaW5kZXRlcm1pbmF0ZSwgY2hlY2tlZF0pXG5cbiAgcmV0dXJuIChcbiAgICA8bGFiZWxcbiAgICAgIGNsYXNzTmFtZT17YHRva3JpLXNlbGVjdC1hbGwke2luZGV0ZXJtaW5hdGUgPyAnIGlzLWluZGV0ZXJtaW5hdGUnIDogJyd9JHtjaGVja2VkID8gJyBpcy1jaGVja2VkJyA6ICcnfWB9XG4gICAgICBzdHlsZT17eyBtYXJnaW5MZWZ0OiA1IH19XG4gICAgPlxuICAgICAgPGlucHV0XG4gICAgICAgIHJlZj17aW5wdXRSZWZ9XG4gICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgIGNoZWNrZWQ9e0Jvb2xlYW4oY2hlY2tlZCl9XG4gICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZX1cbiAgICAgICAgYXJpYS1jaGVja2VkPXtpbmRldGVybWluYXRlID8gJ21peGVkJyA6IGNoZWNrZWQgPyAndHJ1ZScgOiAnZmFsc2UnfVxuICAgICAgLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXNlbGVjdC1hbGwtYm94XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgIHtpbmRldGVybWluYXRlID8gKFxuICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIGNsYXNzTmFtZT1cInRva3JpLXNlbGVjdC1hbGwtaWNvblwiPlxuICAgICAgICAgICAgPGxpbmUgeDE9XCI2XCIgeTE9XCIxMlwiIHgyPVwiMThcIiB5Mj1cIjEyXCIgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgKSA6IGNoZWNrZWQgPyAoXG4gICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgY2xhc3NOYW1lPVwidG9rcmktc2VsZWN0LWFsbC1pY29uXCI+XG4gICAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPVwiMjAgNiA5IDE3IDQgMTJcIiAvPlxuICAgICAgICAgIDwvc3ZnPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlY29yZHNUYWJsZUhlYWRlcihwcm9wcykge1xuICBjb25zdCB7XG4gICAgdGl0bGVQcm9wZXJ0eSxcbiAgICBwcm9wZXJ0aWVzLFxuICAgIHNvcnRCeSxcbiAgICBkaXJlY3Rpb24sXG4gICAgb25TZWxlY3RBbGwsXG4gICAgc2VsZWN0ZWRBbGwsXG4gICAgaW5kZXRlcm1pbmF0ZSxcbiAgfSA9IHByb3BzXG5cbiAgY29uc3QgY29udGVudFRhZyA9IGdldFJlc291cmNlRWxlbWVudENzcyh0aXRsZVByb3BlcnR5LnJlc291cmNlSWQsICd0YWJsZS1oZWFkJylcbiAgY29uc3Qgcm93VGFnID0gYCR7dGl0bGVQcm9wZXJ0eS5yZXNvdXJjZUlkfS10YWJsZS1oZWFkLXJvd2BcbiAgY29uc3QgY2hlY2tib3hDc3MgPSBgJHt0aXRsZVByb3BlcnR5LnJlc291cmNlSWR9LWNoZWNrYm94LXRhYmxlLWNlbGxgXG5cbiAgcmV0dXJuIChcbiAgICA8VGFibGVIZWFkIGRhdGEtY3NzPXtjb250ZW50VGFnfT5cbiAgICAgIDxUYWJsZVJvdyBkYXRhLWNzcz17cm93VGFnfT5cbiAgICAgICAgPFRhYmxlQ2VsbCBkYXRhLWNzcz17Y2hlY2tib3hDc3N9PlxuICAgICAgICAgIHtvblNlbGVjdEFsbCA/IChcbiAgICAgICAgICAgIDxTZWxlY3RBbGxDaGVja0JveFxuICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gb25TZWxlY3RBbGwoKX1cbiAgICAgICAgICAgICAgY2hlY2tlZD17Qm9vbGVhbihzZWxlY3RlZEFsbCl9XG4gICAgICAgICAgICAgIGluZGV0ZXJtaW5hdGU9e0Jvb2xlYW4oaW5kZXRlcm1pbmF0ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L1RhYmxlQ2VsbD5cbiAgICAgICAge3Byb3BlcnRpZXMubWFwKChwcm9wZXJ0eSkgPT4gKFxuICAgICAgICAgIDxQcm9wZXJ0eUhlYWRlclxuICAgICAgICAgICAgZGlzcGxheT17ZGlzcGxheShwcm9wZXJ0eS5pc1RpdGxlKX1cbiAgICAgICAgICAgIGtleT17cHJvcGVydHkucHJvcGVydHlQYXRofVxuICAgICAgICAgICAgdGl0bGVQcm9wZXJ0eT17dGl0bGVQcm9wZXJ0eX1cbiAgICAgICAgICAgIHByb3BlcnR5PXtwcm9wZXJ0eX1cbiAgICAgICAgICAgIHNvcnRCeT17c29ydEJ5fVxuICAgICAgICAgICAgZGlyZWN0aW9uPXtkaXJlY3Rpb259XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICAgIDxUYWJsZUNlbGwga2V5PVwiYWN0aW9uc1wiIHN0eWxlPXt7IHdpZHRoOiA4MCB9fSAvPlxuICAgICAgPC9UYWJsZVJvdz5cbiAgICA8L1RhYmxlSGVhZD5cbiAgKVxufVxuIiwiQWRtaW5KUy5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgUHJvZHVjdEVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcHJvZHVjdC1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0RWRpdCA9IFByb2R1Y3RFZGl0XG5pbXBvcnQgQ2F0ZWdvcnlFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2NhdGVnb3J5LWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkNhdGVnb3J5RWRpdCA9IENhdGVnb3J5RWRpdFxuaW1wb3J0IENtc0xpc3QgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY21zLWxpc3QnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkNtc0xpc3QgPSBDbXNMaXN0XG5pbXBvcnQgUmV2aWV3RWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZXZpZXctZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUmV2aWV3RWRpdCA9IFJldmlld0VkaXRcbmltcG9ydCBCbG9nRWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9ibG9nLWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkJsb2dFZGl0ID0gQmxvZ0VkaXRcbmltcG9ydCBTZXR0aW5nc0VkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvc2V0dGluZ3MtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2V0dGluZ3NFZGl0ID0gU2V0dGluZ3NFZGl0XG5pbXBvcnQgQXBwUmVsZWFzZUVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvYXBwLXJlbGVhc2UtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQXBwUmVsZWFzZUVkaXQgPSBBcHBSZWxlYXNlRWRpdFxuaW1wb3J0IENvdXBvbkVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY291cG9uLWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkNvdXBvbkVkaXQgPSBDb3Vwb25FZGl0XG5pbXBvcnQgT3JkZXJEZXRhaWwgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvb3JkZXItZGV0YWlsJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlckRldGFpbCA9IE9yZGVyRGV0YWlsXG5pbXBvcnQgQ2hhbmdlUGFzc3dvcmQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY2hhbmdlLXBhc3N3b3JkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5DaGFuZ2VQYXNzd29yZCA9IENoYW5nZVBhc3N3b3JkXG5pbXBvcnQgUGFydG5lckVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcGFydG5lci1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5QYXJ0bmVyRWRpdCA9IFBhcnRuZXJFZGl0XG5pbXBvcnQgUGluY29kZUVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcGluY29kZS1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5QaW5jb2RlRWRpdCA9IFBpbmNvZGVFZGl0XG5pbXBvcnQgU3RhdHVzVG9nZ2xlIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3N0YXR1cy10b2dnbGUnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlN0YXR1c1RvZ2dsZSA9IFN0YXR1c1RvZ2dsZVxuaW1wb3J0IEN1c3RvbWVyRWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jdXN0b21lci1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5DdXN0b21lckVkaXQgPSBDdXN0b21lckVkaXRcbmltcG9ydCBUZWFtRWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy90ZWFtLWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlRlYW1FZGl0ID0gVGVhbUVkaXRcbmltcG9ydCBNZWRpYUxpYnJhcnkgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvbWVkaWEtbGlicmFyeSdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTWVkaWFMaWJyYXJ5ID0gTWVkaWFMaWJyYXJ5XG5pbXBvcnQgVGF4RWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy90YXgtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuVGF4RWRpdCA9IFRheEVkaXRcbmltcG9ydCBSYXpvcnBheVBheW1lbnRJZCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yYXpvcnBheS1wYXltZW50LWlkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5SYXpvcnBheVBheW1lbnRJZCA9IFJhem9ycGF5UGF5bWVudElkXG5pbXBvcnQgT3JkZXJMaXN0QmFkZ2UgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvb3JkZXItbGlzdC1iYWRnZXMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk9yZGVyTGlzdEJhZGdlID0gT3JkZXJMaXN0QmFkZ2VcbmltcG9ydCBMb2dpbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9sb2dpbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTG9naW4gPSBMb2dpblxuaW1wb3J0IEFjdGlvbkhlYWRlciBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9hY3Rpb24taGVhZGVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5BY3Rpb25IZWFkZXIgPSBBY3Rpb25IZWFkZXJcbmltcG9ydCBEZWZhdWx0UmljaHRleHRFZGl0UHJvcGVydHkgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmljaHRleHQtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGVmYXVsdFJpY2h0ZXh0RWRpdFByb3BlcnR5ID0gRGVmYXVsdFJpY2h0ZXh0RWRpdFByb3BlcnR5XG5pbXBvcnQgU2lkZWJhclJlc291cmNlU2VjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9zaWRlYmFyLWRhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2lkZWJhclJlc291cmNlU2VjdGlvbiA9IFNpZGViYXJSZXNvdXJjZVNlY3Rpb25cbmltcG9ydCBSZWNvcmRzVGFibGUgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmVjb3Jkcy10YWJsZSdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUmVjb3Jkc1RhYmxlID0gUmVjb3Jkc1RhYmxlXG5pbXBvcnQgUmVjb3Jkc1RhYmxlSGVhZGVyIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JlY29yZHMtdGFibGUtaGVhZGVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5SZWNvcmRzVGFibGVIZWFkZXIgPSBSZWNvcmRzVGFibGVIZWFkZXIiXSwibmFtZXMiOlsidXNlQW5jaG9yZWRNZW51Iiwib3BlbiIsIndyYXBSZWYiLCJ1c2VSZWYiLCJvcGVuVXAiLCJzZXRPcGVuVXAiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVuZGVmaW5lZCIsInVwZGF0ZSIsIm5vZGUiLCJjdXJyZW50IiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInNwYWNlQmVsb3ciLCJ3aW5kb3ciLCJpbm5lckhlaWdodCIsImJvdHRvbSIsInRvcCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiU2VhcmNoYWJsZU11bHRpU2VsZWN0Iiwib3B0aW9ucyIsInNlbGVjdGVkIiwib25DaGFuZ2UiLCJwbGFjZWhvbGRlciIsInNlYXJjaFBsYWNlaG9sZGVyIiwic2V0T3BlbiIsInF1ZXJ5Iiwic2V0UXVlcnkiLCJvbkRvY0NsaWNrIiwiZXZlbnQiLCJjb250YWlucyIsInRhcmdldCIsImRvY3VtZW50Iiwic2VsZWN0ZWRTZXQiLCJ1c2VNZW1vIiwiU2V0Iiwic2VsZWN0ZWRPcHRpb25zIiwiZmlsdGVyIiwiaXRlbSIsImhhcyIsInZhbHVlIiwiZmlsdGVyZWQiLCJsYWJlbCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJ0cmltIiwidG9nZ2xlIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwicmVmIiwidHlwZSIsIm9uQ2xpY2siLCJsZW5ndGgiLCJtYXAiLCJrZXkiLCJyb2xlIiwidGFiSW5kZXgiLCJzdG9wUHJvcGFnYXRpb24iLCJhdXRvRm9jdXMiLCJjaGVja2VkIiwiRmxhZ0NhcmQiLCJ0aXRsZSIsImhpbnQiLCJpc0ZsYWdPbiIsIlN0YXR1c1N3aXRjaCIsImRpc2FibGVkIiwiY29tcGFjdCIsIm9uTGFiZWwiLCJvZmZMYWJlbCIsInByZXZlbnREZWZhdWx0IiwiU2VhcmNoYWJsZVNlbGVjdCIsImp1c3RQaWNrZWQiLCJmaW5kIiwiYWN0aXZlIiwib25Nb3VzZURvd24iLCJzZXRUaW1lb3V0IiwiTG9jYWxTZWxlY3QiLCJTdHJpbmciLCJhcGkiLCJBcGlDbGllbnQiLCJSQU5HRVMiLCJXSURHRVRTIiwiaW5yIiwiTnVtYmVyIiwidG9Mb2NhbGVTdHJpbmciLCJtYXhpbXVtRnJhY3Rpb25EaWdpdHMiLCJSYW5nZVNlbGVjdCIsImF4aXNNYXgiLCJwYWRkZWQiLCJtYWduaXR1ZGUiLCJNYXRoIiwiZmxvb3IiLCJsb2cxMCIsIm5vcm1hbGl6ZWQiLCJuaWNlIiwiTGluZUNoYXJ0Iiwic2VyaWVzIiwiaG92ZXIiLCJzZXRIb3ZlciIsIndpZHRoIiwiaGVpZ2h0IiwicGFkTGVmdCIsInBhZFJpZ2h0IiwicGFkVG9wIiwicGFkQm90dG9tIiwibWF4IiwicG9pbnQiLCJvcmRlclZhbHVlIiwicGxvdFdpZHRoIiwicGxvdEhlaWdodCIsImJhc2VsaW5lIiwieUZvciIsInN0ZXAiLCJjb29yZHMiLCJpbmRleCIsIngiLCJ5IiwibGluZSIsImpvaW4iLCJhcmVhIiwibGFiZWxFdmVyeSIsImNlaWwiLCJ0aWNrcyIsInJhdGlvIiwicm91bmQiLCJvbk1vdXNlTGVhdmUiLCJ2aWV3Qm94IiwidGljayIsIngxIiwieDIiLCJ5MSIsInkyIiwidGV4dEFuY2hvciIsImQiLCJmaWxsIiwib3BhY2l0eSIsInN0cm9rZSIsInN0cm9rZVdpZHRoIiwic3Ryb2tlTGluZWpvaW4iLCJzdHJva2VMaW5lY2FwIiwiZGF0ZSIsImN4IiwiY3kiLCJyIiwib25Nb3VzZUVudGVyIiwicG9pbnRlckV2ZW50cyIsInN0eWxlIiwibGVmdCIsIlBhZ2VyIiwicGFnZSIsInBhZ2VTaXplIiwidG90YWwiLCJwYWdlcyIsIm51bWJlcnMiLCJudW1iZXIiLCJwdXNoIiwiRGFzaGJvYXJkIiwicmVxdWVzdHMiLCJyYW5nZXMiLCJzZXRSYW5nZXMiLCJvcmRlcnMiLCJjdXN0b21lcnMiLCJwcm9kdWN0cyIsImRhdGEiLCJzZXREYXRhIiwic2V0UGFnZXMiLCJidXN5Iiwic2V0QnVzeSIsImxvYWRXaWRnZXQiLCJ3aWRnZXQiLCJyYW5nZSIsInRpY2tldCIsImdldERhc2hib2FyZCIsInBhcmFtcyIsInRoZW4iLCJyZXNwb25zZSIsImZpbmFsbHkiLCJmb3JFYWNoIiwiY2hhbmdlUmFuZ2UiLCJjaGFuZ2VQYWdlIiwiQm94IiwidmFyaWFudCIsIkgyIiwibWIiLCJINSIsIlRleHQiLCJvcmRlckNvdW50Iiwicm93cyIsInJvdyIsImlkIiwib3JkZXJObyIsIm5hbWUiLCJhbW91bnQiLCJwbGFjZWRBdCIsInBob25lIiwiZGF0ZU9mQmlydGgiLCJyZWdpc3RlcmVkQXQiLCJub3JtYWxpemVTbHVnSW5wdXQiLCJyZXBsYWNlIiwid2l0aG91dFRyYWlsaW5nU2xhc2giLCJwYXJzZVNsdWdzIiwicmF3IiwiQXJyYXkiLCJpc0FycmF5IiwiQm9vbGVhbiIsInBhcnNlZCIsIkpTT04iLCJwYXJzZSIsInNwbGl0IiwiUHJvZHVjdEVkaXQiLCJwcm9wcyIsInJlY29yZCIsImluaXRpYWxSZWNvcmQiLCJyZXNvdXJjZSIsImhhbmRsZUNoYW5nZSIsInN1Ym1pdCIsImhhbmRsZVN1Ym1pdCIsImxvYWRpbmciLCJ1c2VSZWNvcmQiLCJhZGROb3RpY2UiLCJ1c2VOb3RpY2UiLCJmaWxlUmVmIiwidXBsb2FkaW5nIiwic2V0VXBsb2FkaW5nIiwic2x1Z0VkaXRlZCIsInNldFNsdWdFZGl0ZWQiLCJzbHVnIiwicHJldmlld1VybCIsInNldFByZXZpZXdVcmwiLCJjYXRlZ29yaWVzIiwic2V0Q2F0ZWdvcmllcyIsImN1c3RvbSIsImFwaUJhc2VVcmwiLCJwcm9kdWN0VXJsQmFzZSIsImxvY2F0aW9uIiwib3JpZ2luIiwic2x1Z0lucHV0IiwicHJldmlld1NsdWciLCJwcm9kdWN0VXJsIiwic2VsZWN0ZWRDYXRlZ29yeVNsdWdzIiwiY2F0ZWdvcnlJZHMiLCJpbWFnZVVybCIsImltYWdlIiwidGVzdCIsImFwcFVybCIsImRpc3BsYXllZEltYWdlVXJsIiwic3RhcnRzV2l0aCIsIlVSTCIsInJldm9rZU9iamVjdFVSTCIsImlnbm9yZSIsImZldGNoIiwianNvbiIsImNhdGNoIiwic2V0RmllbGQiLCJvblByb3BlcnR5Q2hhbmdlIiwicHJvcGVydHlQYXRoIiwicmVzdCIsInNldFNlbGVjdGVkQ2F0ZWdvcmllcyIsInNsdWdzIiwic3RyaW5naWZ5IiwidXBsb2FkSW1hZ2UiLCJmaWxlIiwiZmlsZXMiLCJmb3JtRGF0YSIsIkZvcm1EYXRhIiwiYXBwZW5kIiwibG9jYWxQcmV2aWV3VXJsIiwiY3JlYXRlT2JqZWN0VVJMIiwibWV0aG9kIiwiYm9keSIsIm9rIiwiZXJyb3IiLCJFcnJvciIsIm1lc3NhZ2UiLCJtZWRpYSIsInBhdGgiLCJub3RpY2UiLCJkZXNjcmlwdGlvblByb3BlcnR5IiwiZWRpdFByb3BlcnRpZXMiLCJwcm9wZXJ0eSIsImFzIiwib25TdWJtaXQiLCJIMyIsImNvbG9yIiwicmVxdWlyZWQiLCJtdCIsImhyZWYiLCJyZWwiLCJtaW4iLCJwcmljZVZhbHVlIiwib2xkUHJpY2VWYWx1ZSIsIndlaWdodCIsImJhZGdlIiwic3RvY2siLCJzb3J0T3JkZXIiLCJtYXJnaW5Cb3R0b20iLCJpc1RheGFibGUiLCJuZXh0IiwiZ3N0UmF0ZSIsImhzbkNvZGUiLCJzcmMiLCJhbHQiLCJhY2NlcHQiLCJpc0Jlc3RTZWxsZXIiLCJpc0ltcG9ydGVkIiwiaXNGZWF0dXJlZCIsImlzQWN0aXZlIiwibWluSGVpZ2h0IiwiQmFzZVByb3BlcnR5Q29tcG9uZW50Iiwid2hlcmUiLCJCdXR0b24iLCJJY29uIiwiaWNvbiIsInNwaW4iLCJDYXRlZ29yeUVkaXQiLCJiYW5uZXJGaWxlUmVmIiwiYmFubmVyVXBsb2FkaW5nIiwic2V0QmFubmVyVXBsb2FkaW5nIiwiYmFubmVyUHJldmlld1VybCIsInNldEJhbm5lclByZXZpZXdVcmwiLCJjYXRlZ29yeVVybEJhc2UiLCJjYXRlZ29yeVVybCIsImJhbm5lckltYWdlVXJsIiwiYmFubmVySW1hZ2UiLCJkaXNwbGF5ZWRCYW5uZXJVcmwiLCJ1cGxvYWRUbyIsImZpZWxkIiwic2V0TG9jYWxQcmV2aWV3Iiwic3VjY2Vzc01lc3NhZ2UiLCJzdWJ0aXRsZSIsIm1hcmdpblRvcCIsImRpc3BsYXkiLCJQRVJfUEFHRV9PUFRJT05TIiwiQ21zTGlzdCIsInNldFRhZyIsInRpdGxlUHJvcCIsInRpdGxlUHJvcGVydHkiLCJzdG9yZVBhcmFtcyIsImZpbHRlcnMiLCJwYXJzZWRRdWVyeSIsInVzZVF1ZXJ5UGFyYW1zIiwicmVjb3JkcyIsImRpcmVjdGlvbiIsInNvcnRCeSIsImZldGNoRGF0YSIsInBlclBhZ2UiLCJ1c2VSZWNvcmRzIiwic2VsZWN0ZWRSZWNvcmRzIiwiaGFuZGxlU2VsZWN0IiwiaGFuZGxlU2VsZWN0QWxsIiwic2V0U2VsZWN0ZWRSZWNvcmRzIiwidXNlU2VsZWN0ZWRSZWNvcmRzIiwicSIsImRlYm91bmNlUmVmIiwic3RvcmVQYXJhbXNSZWYiLCJ0b1N0cmluZyIsImhhbmRsZVF1ZXJ5Q2hhbmdlIiwiY2xlYXJUaW1lb3V0IiwidHJpbW1lZCIsImhhbmRsZUFjdGlvblBlcmZvcm1lZCIsImN1cnJlbnRQYWdlIiwicm93c1BlclBhZ2UiLCJ0b3RhbFJvd3MiLCJ0b3RhbFBhZ2VzIiwiZnJvbSIsInRvIiwiZ29Ub1BhZ2UiLCJuZXh0UGFnZSIsInNhZmUiLCJjaGFuZ2VQZXJQYWdlIiwicGFnZU51bWJlcnMiLCJ3aW5kb3dTaXplIiwic3RhcnQiLCJlbmQiLCJwb3NpdGlvbiIsIm1heFdpZHRoIiwidHJhbnNmb3JtIiwiSW5wdXQiLCJwYWRkaW5nTGVmdCIsIlJlY29yZHNUYWJsZSIsImFjdGlvblBlcmZvcm1lZCIsIm9uU2VsZWN0Iiwib25TZWxlY3RBbGwiLCJpc0xvYWRpbmciLCJvcHRpb24iLCJyZXNvbHZlSW1hZ2VVcmwiLCJGaWVsZEVycm9yIiwiUmV2aWV3RWRpdCIsImFjdGlvbiIsImlzTmV3IiwiZXJyb3JzIiwicmF0aW5nIiwiaXNBcHByb3ZlZCIsImNvbnRlbnQiLCJFRElUT1JfT1BUSU9OUyIsInBsdWdpbnMiLCJ0b29sYmFyIiwiZGF0ZUlucHV0VmFsdWUiLCJEYXRlIiwiaXNOYU4iLCJnZXRUaW1lIiwic2xpY2UiLCJ5ZWFyIiwiZ2V0RnVsbFllYXIiLCJtb250aCIsImdldE1vbnRoIiwicGFkU3RhcnQiLCJkYXkiLCJnZXREYXRlIiwicGFkIiwicGFyc2VEYXRlVmFsdWUiLCJ0ZXh0IiwibWF0Y2giLCJ0b0RhdGVWYWx1ZSIsIkRhdGVGaWVsZCIsIm1vbnRoRGF0ZSIsInNldE1vbnRoRGF0ZSIsImZpcnN0RGF5IiwiZ2V0RGF5IiwidG90YWxEYXlzIiwiY2VsbHMiLCJzZWxlY3RlZERheSIsImNob29zZSIsInRvTG9jYWxlRGF0ZVN0cmluZyIsInRvZGF5IiwiQmxvZ0VkaXQiLCJpc1B1Ymxpc2hlZCIsImF1dGhvciIsImNvdmVySW1hZ2UiLCJjYXRlZ29yeSIsInB1Ymxpc2hlZEF0IiwiZXhjZXJwdCIsIlRpbnlNQ0UiLCJUQUJTIiwiZmllbGRzIiwiSW1hZ2VVcGxvYWRlciIsIm9uVXBsb2FkIiwid2lkZSIsImRpc3BsYXllZCIsIk5PVElGSUNBVElPTl9TRUNUSU9OUyIsImludHJvIiwiRmllbGRUaXAiLCJvblBvaW50ZXJEb3duIiwidGltZXIiLCJOb3RpZnlJbnB1dCIsImlzV2hhdHNhcHBOdW1iZXIiLCJsb2NrZWQiLCJzZXRMb2NrZWQiLCJyZWFkT25seSIsImlucHV0TW9kZSIsIm1heExlbmd0aCIsImF1dG9Db21wbGV0ZSIsImF1dG9Db3JyZWN0Iiwic3BlbGxDaGVjayIsIm9uRm9jdXMiLCJOb3RpZmljYXRpb25zRmllbGRzIiwic2VjdGlvbiIsIlNldHRpbmdzRWRpdCIsImFjdGl2ZVRhYiIsInNldEFjdGl2ZVRhYiIsIm1vYmlsZUJhbm5lckZpbGVSZWYiLCJoaWdobGlnaHRGaWxlUmVmIiwiYmFubmVyUHJldmlldyIsInNldEJhbm5lclByZXZpZXciLCJtb2JpbGVCYW5uZXJQcmV2aWV3Iiwic2V0TW9iaWxlQmFubmVyUHJldmlldyIsImhpZ2hsaWdodFByZXZpZXciLCJzZXRIaWdobGlnaHRQcmV2aWV3IiwibW9iaWxlQmFubmVyVXBsb2FkaW5nIiwic2V0TW9iaWxlQmFubmVyVXBsb2FkaW5nIiwiaGlnaGxpZ2h0VXBsb2FkaW5nIiwic2V0SGlnaGxpZ2h0VXBsb2FkaW5nIiwiaG9tZUZlYXR1cmVkQ2F0ZWdvcnlTbHVncyIsImhvbWVCYW5uZXJJbWFnZSIsIm1vYmlsZUJhbm5lckltYWdlVXJsIiwiaG9tZU1vYmlsZUJhbm5lckltYWdlIiwiaGlnaGxpZ2h0SW1hZ2VVcmwiLCJob21lSGlnaGxpZ2h0SW1hZ2UiLCJoYXNoIiwic29tZSIsInRhYiIsImhpc3RvcnkiLCJyZXBsYWNlU3RhdGUiLCJzZXRQcmV2aWV3IiwiZmxleCIsImZsZXhEaXJlY3Rpb24iLCJEcmF3ZXJDb250ZW50IiwicHJvcGVydGllcyIsInAiLCJINCIsIm1vcm5pbmdEZWxpdmVyeVRpdGxlIiwibW9ybmluZ0RlbGl2ZXJ5U3VidGl0bGUiLCJtb3JuaW5nU2hpcHBpbmdGZWUiLCJtb3JuaW5nRnJlZUFib3ZlIiwiZXhwcmVzc0RlbGl2ZXJ5VGl0bGUiLCJleHByZXNzRGVsaXZlcnlTdWJ0aXRsZSIsImV4cHJlc3NTaGlwcGluZ0ZlZSIsImV4cHJlc3NGcmVlQWJvdmUiLCJoYW5kbGluZ0ZlZSIsIkRyYXdlckZvb3RlciIsIkFwcFJlbGVhc2VFZGl0IiwicGxhdGZvcm0iLCJlbmFibGVkIiwibGF0ZXN0QnVpbGQiLCJtaW5pbXVtQnVpbGQiLCJibG9ja2VkQnVpbGRzIiwicmVtaW5kQWZ0ZXJIb3VycyIsIm1haW50ZW5hbmNlIiwibWFpbnRlbmFuY2VUaXRsZSIsIm1haW50ZW5hbmNlTWVzc2FnZSIsIm51bSIsInRvRGF0ZXRpbWVWYWx1ZSIsImdldEhvdXJzIiwiZ2V0TWludXRlcyIsImZvcm1hdERhdGV0aW1lTGFiZWwiLCJob3VyIiwibWludXRlIiwiQ2hvaWNlQ2FyZCIsIkFuY2hvcmVkU2VsZWN0IiwiRGF0ZVRpbWVQaWNrZXIiLCJ2YWxpZCIsImhvdXJzIiwic2V0SG91cnMiLCJtaW51dGVzIiwic2V0TWludXRlcyIsImkiLCJhcHBseSIsIm5leHRIb3VycyIsIm5leHRNaW51dGVzIiwiQ291cG9uRWRpdCIsInNldFByb2R1Y3RzIiwic2VsZWN0ZWRTbHVncyIsInRhcmdldFNsdWdzIiwidGFyZ2V0VHlwZSIsImFwcGx5T24iLCJ1c2FnZVR5cGUiLCJjb3Vwb25UeXBlIiwibG9hZENhdGFsb2ciLCJjYXRlZ29yeURhdGEiLCJhbGxQcm9kdWN0cyIsImhhc01vcmUiLCJwcm9kdWN0RGF0YSIsInNldFNlbGVjdGVkU2x1Z3MiLCJwcm9kdWN0T3B0aW9ucyIsImNhdGVnb3J5T3B0aW9ucyIsImNvZGUiLCJ0b1VwcGVyQ2FzZSIsIm1pbkNhcnQiLCJtYXhEaXNjb3VudCIsInVzYWdlTGltaXQiLCJ1c2VkQ291bnQiLCJzdGFydHNBdCIsImV4cGlyZXNBdCIsIkZVTEZJTExNRU5UIiwicGVuZGluZyIsInRvbmUiLCJwYWlkIiwicGFja2VkIiwic2hpcHBlZCIsImRlbGl2ZXJlZCIsImNhbmNlbGxlZCIsImlzT25saW5lT3JkZXIiLCJtb2RlIiwicGF5bWVudE1vZGUiLCJyYXpvcnBheVBheW1lbnRJZCIsInJhem9ycGF5T3JkZXJJZCIsInBheW1lbnRCYWRnZSIsIm9ubGluZSIsInN0YXR1cyIsInBheW1lbnRTdGF0dXMiLCJQaWxsIiwiZ2V0RnVsZmlsbG1lbnRCYWRnZSIsImdldFBheW1lbnRCYWRnZSIsIkZ1bGZpbGxtZW50QmFkZ2UiLCJQYXltZW50QmFkZ2UiLCJPcmRlckxpc3RCYWRnZSIsIlBBWU1FTlRfT1BUSU9OUyIsIkNvcHlJZCIsImNvcGllZCIsInNldENvcGllZCIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsImRlbGl2ZXJ5Q2hvaWNlTGFiZWwiLCJmb3JtYXRFeHBlY3RlZERhdGUiLCJ0aW1lWm9uZSIsImZvcm1hdE1vbmV5IiwiZm9ybWF0RGF0ZVRpbWUiLCJkYXRlU3R5bGUiLCJ0aW1lU3R5bGUiLCJyZXNvbHZlSW1hZ2UiLCJNb3JlTWVudSIsInVucGFpZCIsImNhblN5bmNSYXpvcnBheSIsIm9uQ2FzaCIsIm9uUXIiLCJvblN5bmNSYXpvcnBheSIsIm9uUmVzZW5kUGFydG5lciIsIkZyYWdtZW50Iiwic25hcHNob3QiLCJkZWxpdmVyeVBhcnRuZXJJZCIsImNvbnRhY3ROYW1lIiwiY29udGFjdFBob25lIiwiYWRkcmVzc0xpbmUxIiwiYWRkcmVzc0xpbmUyIiwiYWRkcmVzc0NpdHkiLCJhZGRyZXNzU3RhdGUiLCJhZGRyZXNzUGluY29kZSIsImFkZHJlc3NMYW5kbWFyayIsIk9yZGVyRGV0YWlsIiwic2V0UmVjb3JkIiwic2F2aW5nIiwic2V0U2F2aW5nIiwiYWN0aW9uQnVzeSIsInNldEFjdGlvbkJ1c3kiLCJwYXJ0bmVycyIsInNldFBhcnRuZXJzIiwic2V0QmFzZWxpbmUiLCJlZGl0Q29udGFjdCIsInNldEVkaXRDb250YWN0IiwiZWRpdEFkZHJlc3MiLCJzZXRFZGl0QWRkcmVzcyIsInBhdGhuYW1lIiwicmVzb3VyY2VBY3Rpb24iLCJyZXNvdXJjZUlkIiwiYWN0aW9uTmFtZSIsIml0ZW1zIiwiaXRlbXNKc29uIiwiZGlydHkiLCJPYmplY3QiLCJrZXlzIiwibGlzdFVybCIsInJlY29yZEFjdGlvbiIsInJlY29yZElkIiwiaGFuZGxlU2F2ZSIsInBpbiIsInJ1blBheW1lbnRBY3Rpb24iLCJjb25maXJtIiwiZnVsZmlsbG1lbnQiLCJwYXltZW50Iiwic3RhdHVzTGFiZWwiLCJyZXN0b3JlRmllbGRzIiwiY2xvc2UiLCJhZGRyZXNzVGV4dCIsInBheW1lbnRMYWJlbCIsInBhcnRuZXJOYW1lIiwiZGVsaXZlcnlQYXJ0bmVyTmFtZSIsImRlbGl2ZXJ5UGFydG5lclBob25lIiwiaXRlbUNvdW50IiwicmVkdWNlIiwic3VtIiwicXVhbnRpdHkiLCJkZWxpdmVyeU5hbWUiLCJkZWxpdmVyeU9wdGlvbiIsImV4cGVjdGVkRGVsaXZlcnkiLCJleHBlY3RlZERlbGl2ZXJ5RGF0ZSIsImNyZWF0ZWRBdCIsImxpbmVUb3RhbCIsInBheW1lbnRNZXRob2QiLCJpdGVtc1RvdGFsIiwiZnJlZURlbGl2ZXJ5QXBwbGllZCIsImRlbGl2ZXJ5Q2hhcmdlIiwiaGFuZGxpbmdDaGFyZ2UiLCJ0YXhUb3RhbCIsImlzSW50ZXJTdGF0ZSIsInNtYWxsQ2FydENoYXJnZSIsImRpc2NvdW50IiwiY291cG9uQ29kZSIsImdyYW5kVG90YWwiLCJwYXltZW50Q29sbGVjdGVkQXMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJyYXpvcnBheVFyVXJsIiwiRXllSWNvbiIsImhpZGRlbiIsIlBhc3N3b3JkRmllbGQiLCJ2aXNpYmxlIiwib25Ub2dnbGUiLCJMYWJlbCIsImh0bWxGb3IiLCJwYWRkaW5nUmlnaHQiLCJyaWdodCIsImJvcmRlciIsImJhY2tncm91bmQiLCJjdXJzb3IiLCJhbGlnbkl0ZW1zIiwianVzdGlmeUNvbnRlbnQiLCJwYWRkaW5nIiwiQ2hhbmdlUGFzc3dvcmQiLCJwYXNzd29yZCIsInNldFBhc3N3b3JkIiwiY29uZmlybVBhc3N3b3JkIiwic2V0Q29uZmlybVBhc3N3b3JkIiwic2hvd1Bhc3N3b3JkIiwic2V0U2hvd1Bhc3N3b3JkIiwic2hvd0NvbmZpcm0iLCJzZXRTaG93Q29uZmlybSIsInNldEVycm9yIiwiYmFjayIsInNhdmUiLCJyZWRpcmVjdFVybCIsImVyciIsImluc2V0IiwiekluZGV4IiwiYmciLCJib3JkZXJSYWRpdXMiLCJib3hTaGFkb3ciLCJlbWFpbCIsImdhcCIsIklORElBX1NUQVRFUyIsIlZFSElDTEVfVFlQRVMiLCJTVEFURV9PUFRJT05TIiwiUGFydG5lckVkaXQiLCJoYXNQYXNzd29yZCIsImZhdGhlck5hbWUiLCJwYW5OdW1iZXIiLCJhYWRoYWFyTnVtYmVyIiwiY2l0eSIsInBpbmNvZGUiLCJzdGF0ZSIsInBlcm1hbmVudEFkZHJlc3MiLCJlbWVyZ2VuY3lOYW1lIiwiZW1lcmdlbmN5UGhvbmUiLCJ2ZWhpY2xlVHlwZSIsInZlaGljbGVOdW1iZXIiLCJhY2NvdW50SG9sZGVyTmFtZSIsImFjY291bnROdW1iZXIiLCJpZnNjQ29kZSIsIm5vdGVzIiwiUGluY29kZUVkaXQiLCJtb3JuaW5nRW5hYmxlZCIsImV4cHJlc3NFbmFibGVkIiwicGFydG5lcklkIiwicGFydG5lciIsIm1hcmdpbiIsImFyZWFMYWJlbCIsInN0YXRlQ29kZSIsIlN0YXR1c1RvZ2dsZSIsInNldENoZWNrZWQiLCJwZXJzaXN0Iiwic2F2ZWQiLCJkZXNjcmlwdGlvbiIsInRvRGF0ZUlucHV0IiwiZm9ybWF0V2hlbiIsInBhcnNlQWRkcmVzc2VzIiwiYWRkcmVzc2VzIiwiZ3JvdXBlZCIsImVudHJpZXMiLCJzb3J0IiwiYSIsImIiLCJhZGRyZXNzTGluZXMiLCJhZGRyZXNzIiwibGluZTEiLCJsaW5lMiIsImxhbmRtYXJrIiwiQ3VzdG9tZXJFZGl0IiwiUk9MRVMiLCJQRVJNSVNTSU9OUyIsInNldFZpc2libGUiLCJUZWFtRWRpdCIsInBlcm1pc3Npb25PbiIsInVzZXJuYW1lIiwiRk9MREVSUyIsImZvcm1hdFNpemUiLCJieXRlcyIsInNpemUiLCJ0b0ZpeGVkIiwicmVzb2x2ZVVybCIsIk1lZGlhTGlicmFyeSIsImJ1c3lJZCIsInNldEJ1c3lJZCIsImZvbGRlciIsInVwbG9hZEZvbGRlciIsIm9yaWdpbmFsTmFtZSIsImZpbGVuYW1lIiwidXJsIiwic2V0Rm9sZGVyIiwidXBsb2FkRmlsZXMiLCJsaXN0IiwiY29weVBhdGgiLCJyZW1vdmUiLCJvbkRyYWdPdmVyIiwib25Ecm9wIiwiZGF0YVRyYW5zZmVyIiwibXVsdGlwbGUiLCJUYXhFZGl0IiwiaXNUYXhhYmxlQm9vbCIsImhhbmRsZVRheGFibGVUb2dnbGUiLCJwcm9kdWN0TmFtZSIsImNhdGVnb3J5TmFtZSIsImZvbnRTaXplIiwiY29weVRleHQiLCJQcm9taXNlIiwicmVqZWN0IiwiUmF6b3JwYXlQYXltZW50SWQiLCJwYXltZW50SWQiLCJoYW5kbGVDb3B5IiwiUkVNRU1CRVJFRF9MT0dJTl9LRVkiLCJMb2dpbiIsImVycm9yTWVzc2FnZSIsIl9fQVBQX1NUQVRFX18iLCJ0cmFuc2xhdGVNZXNzYWdlIiwidXNlVHJhbnNsYXRpb24iLCJhZG1pblJvb3QiLCJmb3Jnb3RQYXNzd29yZFVybCIsImlkZW50aWZpZXIiLCJzZXRJZGVudGlmaWVyIiwicmVtZW1iZXJMb2dpbiIsInNldFJlbWVtYmVyTG9naW4iLCJyZW1lbWJlcmVkTG9naW4iLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiZm9ybSIsImN1cnJlbnRUYXJnZXQiLCJlbWFpbElucHV0IiwiZWxlbWVudHMiLCJuYW1lZEl0ZW0iLCJzZXRJdGVtIiwicmVtb3ZlSXRlbSIsIk1lc3NhZ2VCb3giLCJGb3JtR3JvdXAiLCJkZWZhdWx0VmFsdWUiLCJtYXJnaW5SaWdodCIsInRleHRBbGlnbiIsImZvbnRXZWlnaHQiLCJhZG1pblJvb3RQYXRoIiwiY2F0YWxvZ0NvbmZpZyIsImV4cG9ydFVybCIsImltcG9ydFVybCIsIkNhdGFsb2dMaXN0SGVhZGVyQWN0aW9ucyIsIm9uSW1wb3J0ZWQiLCJ0cmFuc2xhdGVCdXR0b24iLCJ0cmFuc2xhdGVBY3Rpb24iLCJ0b2dnbGVGaWx0ZXIiLCJmaWx0ZXJzQ291bnQiLCJ1c2VGaWx0ZXJEcmF3ZXIiLCJzZXRMb2FkaW5nIiwic2V0TWVzc2FnZSIsImNvbmZpZyIsInJvb3QiLCJoYW5kbGVJbXBvcnQiLCJjcmVkZW50aWFscyIsImVycm9yQ291bnQiLCJjcmVhdGVkIiwidXBkYXRlZCIsImJ1dHRvbnMiLCJjbGljayIsIm5ld0FjdGlvbiIsInJlc291cmNlQWN0aW9ucyIsImZpbHRlcktleSIsImNvdW50IiwiZmxleFNocmluayIsInB4IiwiQnV0dG9uR3JvdXAiLCJvbkNsb3NlQ2xpY2siLCJDQVRBTE9HX1JFU09VUkNFUyIsIkFjdGlvbkhlYWRlciIsIk9yaWdpbmFsQ29tcG9uZW50IiwiQmFzZUhlYWRlciIsIk9yaWdpbmFsQWN0aW9uSGVhZGVyIiwiaXNDYXRhbG9nTGlzdCIsIl9pZ25vcmVkIiwiaGVhZGVyUHJvcHMiLCJfZXh0ZW5kcyIsIm9taXRBY3Rpb25zIiwiREVGQVVMVF9PUFRJT05TIiwiUmljaHRleHRFZGl0IiwiaGFuZGxlVXBkYXRlIiwidXNlQ2FsbGJhY2siLCJuZXdWYWx1ZSIsImlzUmVxdWlyZWQiLCJGb3JtTWVzc2FnZSIsIm1lbW8iLCJjdXQiLCJzZWFyY2giLCJTaWRlYmFyUmVzb3VyY2VTZWN0aW9uIiwiT3JpZ2luYWwiLCJ1c2VMb2NhdGlvbiIsIm5hdmlnYXRlIiwidXNlTmF2aWdhdGUiLCJyZXNvdXJjZXMiLCJnZXRSZXNvdXJjZUVsZW1lbnRDc3MiLCJzdWZmaXgiLCJMb2FkZXIiLCJOb1JlY29yZHMiLCJzZWxlY3RlZENvdW50Iiwic2VsZWN0ZWRBbGwiLCJpbmRldGVybWluYXRlIiwicmVjb3Jkc0hhdmVCdWxrQWN0aW9uIiwiYnVsa0FjdGlvbnMiLCJjb250ZW50VGFnIiwic2VsZWN0ZWRUYWciLCJib2R5VGFnIiwiVGFibGUiLCJTZWxlY3RlZFJlY29yZHMiLCJSZWNvcmRzVGFibGVIZWFkZXIiLCJsaXN0UHJvcGVydGllcyIsIlRhYmxlQm9keSIsIlJlY29yZEluTGlzdCIsImlzU2VsZWN0ZWQiLCJpc1RpdGxlIiwiU2VsZWN0QWxsQ2hlY2tCb3giLCJpbnB1dFJlZiIsIm1hcmdpbkxlZnQiLCJwb2ludHMiLCJyb3dUYWciLCJjaGVja2JveENzcyIsIlRhYmxlSGVhZCIsIlRhYmxlUm93IiwiVGFibGVDZWxsIiwiUHJvcGVydHlIZWFkZXIiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiLCJEZWZhdWx0UmljaHRleHRFZGl0UHJvcGVydHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFFTyxTQUFTQSxpQkFBZUEsQ0FBQ0MsSUFBSSxFQUFFO0VBQ3BDLEVBQUEsTUFBTUMsT0FBTyxHQUFHQyxZQUFNLENBQUMsSUFBSSxDQUFDO0lBQzVCLE1BQU0sQ0FBQ0MsTUFBTSxFQUFFQyxTQUFTLENBQUMsR0FBR0MsY0FBUSxDQUFDLEtBQUssQ0FBQztFQUUzQ0MsRUFBQUEsZUFBUyxDQUFDLE1BQU07RUFDZCxJQUFBLElBQUksQ0FBQ04sSUFBSSxFQUFFLE9BQU9PLFNBQVM7TUFFM0IsTUFBTUMsTUFBTSxHQUFHQSxNQUFNO0VBQ25CLE1BQUEsTUFBTUMsSUFBSSxHQUFHUixPQUFPLENBQUNTLE9BQU87UUFDNUIsSUFBSSxDQUFDRCxJQUFJLEVBQUU7RUFDWCxNQUFBLE1BQU1FLElBQUksR0FBR0YsSUFBSSxDQUFDRyxxQkFBcUIsRUFBRTtRQUN6QyxNQUFNQyxVQUFVLEdBQUdDLE1BQU0sQ0FBQ0MsV0FBVyxHQUFHSixJQUFJLENBQUNLLE1BQU07UUFDbkRaLFNBQVMsQ0FBQ1MsVUFBVSxHQUFHLEdBQUcsSUFBSUYsSUFBSSxDQUFDTSxHQUFHLEdBQUdKLFVBQVUsQ0FBQztNQUN0RCxDQUFDO0VBRURMLElBQUFBLE1BQU0sRUFBRTtFQUNSTSxJQUFBQSxNQUFNLENBQUNJLGdCQUFnQixDQUFDLFFBQVEsRUFBRVYsTUFBTSxDQUFDO01BQ3pDTSxNQUFNLENBQUNJLGdCQUFnQixDQUFDLFFBQVEsRUFBRVYsTUFBTSxFQUFFLElBQUksQ0FBQztFQUMvQyxJQUFBLE9BQU8sTUFBTTtFQUNYTSxNQUFBQSxNQUFNLENBQUNLLG1CQUFtQixD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
