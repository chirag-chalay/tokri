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
  function FieldError$3({
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
    }), /*#__PURE__*/React__default.default.createElement(FieldError$3, {
      error: errors.title
    })), /*#__PURE__*/React__default.default.createElement("label", {
      className: "tokri-coupon-label"
    }, "Reviewer name", /*#__PURE__*/React__default.default.createElement("input", {
      className: "tokri-coupon-input",
      required: true,
      value: params.name || '',
      onChange: event => setField('name', event.target.value),
      placeholder: "Priya Sharma"
    }), /*#__PURE__*/React__default.default.createElement(FieldError$3, {
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
    }), /*#__PURE__*/React__default.default.createElement(FieldError$3, {
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
  function FieldError$2({
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
    }), /*#__PURE__*/React__default.default.createElement(FieldError$2, {
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
    }, "The page will be /blog/this-slug"), /*#__PURE__*/React__default.default.createElement(FieldError$2, {
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
    }), /*#__PURE__*/React__default.default.createElement(FieldError$2, {
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
      }, tab.id === 'charges' ? 'Set copy and prices for Morning and 90-Minute delivery. Handling fee is added to every order.' : tab.id === 'homepage' ? 'These images and categories appear on the website homepage. Click Save changes after uploading.' : tab.id === 'notifications' ? 'Auth key, WhatsApp number, and namespace are shared. Each template has its own name and on/off toggle. Order and partner messages send only after COD is placed or the online payment is confirmed.' : 'Update your store settings and click Save changes below.'), tab.id === 'charges' ? /*#__PURE__*/React__default.default.createElement("div", {
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
      }, /*#__PURE__*/React__default.default.createElement("h4", null, "90-Minute delivery"), /*#__PURE__*/React__default.default.createElement("p", null, "Shown at checkout. Disabled pincodes still see this as coming soon."), /*#__PURE__*/React__default.default.createElement("label", {
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
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Subtotal"), /*#__PURE__*/React__default.default.createElement("dd", null, itemCount, " ", itemCount === 1 ? 'item' : 'items'), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.itemsTotal))), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Delivery", params.deliveryOption ? ` · ${params.deliveryOption === 'express' ? '90-minute' : 'Morning'}` : ''), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, params.freeDeliveryApplied || Number(params.deliveryCharge) === 0 ? 'Free (Welcome offer)' : formatMoney(params.deliveryCharge))), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Handling"), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.handlingCharge))), Number(params.taxTotal) > 0 ? /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Taxes (GST)", params.isInterState ? ' · IGST' : ' · CGST+SGST'), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.taxTotal))) : null, Number(params.smallCartCharge) > 0 ? /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Small cart"), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, formatMoney(params.smallCartCharge))) : null, Number(params.discount) > 0 ? /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("dt", null, "Discount", params.couponCode ? ` · ${params.couponCode}` : ''), /*#__PURE__*/React__default.default.createElement("dd", null), /*#__PURE__*/React__default.default.createElement("dd", null, "-", formatMoney(params.discount))) : null, /*#__PURE__*/React__default.default.createElement("div", {
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
      title: "90-Minute delivery",
      hint: expressEnabled ? 'Shoppers can choose 90-minute delivery' : 'Shown as coming soon',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9mb3JtLWNvbnRyb2xzLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9wcm9kdWN0LWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY2F0ZWdvcnktZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jbXMtbGlzdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZXZpZXctZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9ibG9nLWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvc2V0dGluZ3MtZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jb3Vwb24tZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9vcmRlci1saXN0LWJhZGdlcy5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9vcmRlci1kZXRhaWwuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY2hhbmdlLXBhc3N3b3JkLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2luZGlhLXN0YXRlcy5qcyIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3BhcnRuZXItZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9waW5jb2RlLWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvc3RhdHVzLXRvZ2dsZS5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jdXN0b21lci1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3RlYW0tZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9tZWRpYS1saWJyYXJ5LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3RheC1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3Jhem9ycGF5LXBheW1lbnQtaWQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvbG9naW4uanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY2F0YWxvZy1saXN0LWhlYWRlci1hY3Rpb25zLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2FjdGlvbi1oZWFkZXIuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmljaHRleHQtZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9zaWRlYmFyLWRhc2hib2FyZC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZWNvcmRzLXRhYmxlLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JlY29yZHMtdGFibGUtaGVhZGVyLmpzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUFuY2hvcmVkTWVudShvcGVuKSB7XG4gIGNvbnN0IHdyYXBSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgW29wZW5VcCwgc2V0T3BlblVwXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBub2RlID0gd3JhcFJlZi5jdXJyZW50XG4gICAgICBpZiAoIW5vZGUpIHJldHVyblxuICAgICAgY29uc3QgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IHNwYWNlQmVsb3cgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSByZWN0LmJvdHRvbVxuICAgICAgc2V0T3BlblVwKHNwYWNlQmVsb3cgPCAyNDAgJiYgcmVjdC50b3AgPiBzcGFjZUJlbG93KVxuICAgIH1cblxuICAgIHVwZGF0ZSgpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdXBkYXRlLCB0cnVlKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHVwZGF0ZSwgdHJ1ZSlcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICByZXR1cm4geyB3cmFwUmVmLCBvcGVuVXAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2VhcmNoYWJsZU11bHRpU2VsZWN0KHsgb3B0aW9ucywgc2VsZWN0ZWQsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciwgc2VhcmNoUGxhY2Vob2xkZXIgfSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gIH0sIFt3cmFwUmVmXSlcblxuICBjb25zdCBzZWxlY3RlZFNldCA9IHVzZU1lbW8oKCkgPT4gbmV3IFNldChzZWxlY3RlZCksIFtzZWxlY3RlZF0pXG4gIGNvbnN0IHNlbGVjdGVkT3B0aW9ucyA9IG9wdGlvbnMuZmlsdGVyKChpdGVtKSA9PiBzZWxlY3RlZFNldC5oYXMoaXRlbS52YWx1ZSkpXG4gIGNvbnN0IGZpbHRlcmVkID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+XG4gICAgYCR7aXRlbS5sYWJlbH0gJHtpdGVtLnZhbHVlfWAudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKSksXG4gIClcblxuICBjb25zdCB0b2dnbGUgPSAodmFsdWUpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRTZXQuaGFzKHZhbHVlKSkgb25DaGFuZ2Uoc2VsZWN0ZWQuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSB2YWx1ZSkpXG4gICAgZWxzZSBvbkNoYW5nZShbLi4uc2VsZWN0ZWQsIHZhbHVlXSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdFwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jb250cm9sXCIgb25DbGljaz17KCkgPT4gc2V0T3BlbigodmFsdWUpID0+ICF2YWx1ZSl9PlxuICAgICAgICB7c2VsZWN0ZWRPcHRpb25zLmxlbmd0aCA/IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jaGlwc1wiPlxuICAgICAgICAgICAge3NlbGVjdGVkT3B0aW9ucy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgPHNwYW4ga2V5PXtpdGVtLnZhbHVlfSBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jaGlwXCI+XG4gICAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgIHJvbGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9ezB9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlKGl0ZW0udmFsdWUpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIMOXXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtcGxhY2Vob2xkZXJcIj57cGxhY2Vob2xkZXJ9PC9zcGFuPlxuICAgICAgICApfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jYXJldFwiPntvcGVuID8gJ+KWtCcgOiAn4pa+J308L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW1lbnUke29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdmFsdWU9e3F1ZXJ5fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0UXVlcnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtzZWFyY2hQbGFjZWhvbGRlcn1cbiAgICAgICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1saXN0XCI+XG4gICAgICAgICAgICB7ZmlsdGVyZWQubGVuZ3RoID8gKFxuICAgICAgICAgICAgICBmaWx0ZXJlZC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGVja2VkID0gc2VsZWN0ZWRTZXQuaGFzKGl0ZW0udmFsdWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBrZXk9e2l0ZW0udmFsdWV9IGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW9wdGlvbiR7Y2hlY2tlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXtjaGVja2VkfSBvbkNoYW5nZT17KCkgPT4gdG9nZ2xlKGl0ZW0udmFsdWUpfSAvPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtZW1wdHlcIj5ObyBtYXRjaGVzPC9kaXY+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGbGFnQ2FyZCh7IHNlbGVjdGVkLCB0aXRsZSwgaGludCwgb25DbGljayB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B0b2tyaS1jaG9pY2UtY2FyZCR7c2VsZWN0ZWQgPyAnIGlzLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgID5cbiAgICAgIDxzdHJvbmc+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgPHNwYW4+e2hpbnR9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0ZsYWdPbih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09ICd0cnVlJyB8fCB2YWx1ZSA9PT0gJ29uJyB8fCB2YWx1ZSA9PT0gMSB8fCB2YWx1ZSA9PT0gJzEnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGF0dXNTd2l0Y2goe1xuICBjaGVja2VkLFxuICBvbkNoYW5nZSxcbiAgZGlzYWJsZWQsXG4gIHRpdGxlLFxuICBoaW50LFxuICBjb21wYWN0ID0gZmFsc2UsXG4gIG9uTGFiZWwgPSAnQWN0aXZlJyxcbiAgb2ZmTGFiZWwgPSAnSW5hY3RpdmUnLFxufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgdG9rcmktc3dpdGNoJHtjaGVja2VkID8gJyBpcy1vbicgOiAnJ30ke2NvbXBhY3QgPyAnIGlzLWNvbXBhY3QnIDogJyd9YH1cbiAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgIGFyaWEtcHJlc3NlZD17Y2hlY2tlZH1cbiAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIGlmICghZGlzYWJsZWQpIG9uQ2hhbmdlKCFjaGVja2VkKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1zd2l0Y2gtdHJhY2tcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktc3dpdGNoLXRodW1iXCIgLz5cbiAgICAgIDwvc3Bhbj5cbiAgICAgIHt0aXRsZSB8fCBoaW50ID8gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1zd2l0Y2gtY29weVwiPlxuICAgICAgICAgIHt0aXRsZSA/IDxzdHJvbmc+e3RpdGxlfTwvc3Ryb25nPiA6IG51bGx9XG4gICAgICAgICAge2hpbnQgPyA8c3Bhbj57aGludH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKSA6IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktc3RhdHVzLXBpbGwke2NoZWNrZWQgPyAnIGlzLW9uJyA6ICcnfWB9PlxuICAgICAgICAgIHtjaGVja2VkID8gb25MYWJlbCA6IG9mZkxhYmVsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hhYmxlU2VsZWN0KHsgdmFsdWUsIG9wdGlvbnMsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciwgc2VhcmNoUGxhY2Vob2xkZXIsIGRpc2FibGVkIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IHsgd3JhcFJlZiwgb3BlblVwIH0gPSB1c2VBbmNob3JlZE1lbnUob3BlbilcbiAgY29uc3QganVzdFBpY2tlZCA9IHVzZVJlZihmYWxzZSlcbiAgY29uc3Qgc2VsZWN0ZWQgPSBvcHRpb25zLmZpbmQoKGl0ZW0pID0+IGl0ZW0udmFsdWUgPT09IHZhbHVlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gIH0sIFt3cmFwUmVmXSlcblxuICBjb25zdCBmaWx0ZXJlZCA9IG9wdGlvbnMuZmlsdGVyKChpdGVtKSA9PlxuICAgIGAke2l0ZW0ubGFiZWx9ICR7aXRlbS52YWx1ZX1gLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkudHJpbSgpLnRvTG93ZXJDYXNlKCkpLFxuICApXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0XCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNvbnRyb2xcIlxuICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBpZiAoanVzdFBpY2tlZC5jdXJyZW50KSB7XG4gICAgICAgICAgICBqdXN0UGlja2VkLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWRpc2FibGVkKSBzZXRPcGVuKChjdXJyZW50KSA9PiAhY3VycmVudClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtzZWxlY3RlZCA/ICcnIDogJ3Rva3JpLW11bHRpc2VsZWN0LXBsYWNlaG9sZGVyJ30+XG4gICAgICAgICAge3NlbGVjdGVkPy5sYWJlbCB8fCBwbGFjZWhvbGRlcn1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jYXJldFwiPntvcGVuID8gJ+KWtCcgOiAn4pa+J308L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW1lbnUke29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdmFsdWU9e3F1ZXJ5fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0UXVlcnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtzZWFyY2hQbGFjZWhvbGRlcn1cbiAgICAgICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1saXN0XCI+XG4gICAgICAgICAgICB7ZmlsdGVyZWQubGVuZ3RoID8gKFxuICAgICAgICAgICAgICBmaWx0ZXJlZC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmUgPSBpdGVtLnZhbHVlID09PSB2YWx1ZVxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBrZXk9e2l0ZW0udmFsdWUgfHwgJ2VtcHR5J31cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3Qtb3B0aW9uJHthY3RpdmUgPyAnIGlzLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICBqdXN0UGlja2VkLmN1cnJlbnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2UoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgIHNldFF1ZXJ5KCcnKVxuICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RQaWNrZWQuY3VycmVudCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgfSwgMClcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1lbXB0eVwiPk5vIG1hdGNoZXM8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIExvY2FsU2VsZWN0KHsgdmFsdWUsIG9wdGlvbnMsIG9uQ2hhbmdlLCBkaXNhYmxlZCB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG4gIGNvbnN0IHNlbGVjdGVkID0gb3B0aW9ucy5maW5kKChpdGVtKSA9PiBTdHJpbmcoaXRlbS52YWx1ZSkgPT09IFN0cmluZyh2YWx1ZSkpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1sb2NhbC1zZWxlY3RcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktbG9jYWwtc2VsZWN0LWNvbnRyb2xcIlxuICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBpZiAoIWRpc2FibGVkKSBzZXRPcGVuKChjdXJyZW50KSA9PiAhY3VycmVudClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4+e3NlbGVjdGVkPy5sYWJlbCB8fCB2YWx1ZX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNhcmV0XCI+e29wZW4gPyAn4pa0JyA6ICfilr4nfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktbG9jYWwtc2VsZWN0LW1lbnUke29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAge29wdGlvbnMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBrZXk9e2l0ZW0udmFsdWV9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW9wdGlvbiR7U3RyaW5nKGl0ZW0udmFsdWUpID09PSBTdHJpbmcodmFsdWUpID8gJyBpcy1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBBcGlDbGllbnQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgQm94LCBIMiwgSDUsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgTG9jYWxTZWxlY3QgfSBmcm9tICcuL2Zvcm0tY29udHJvbHMnXG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKVxuY29uc3QgUkFOR0VTID0gW1xuICB7IHZhbHVlOiAnN2QnLCBsYWJlbDogJzcgZGF5cycgfSxcbiAgeyB2YWx1ZTogJ3RoaXNNb250aCcsIGxhYmVsOiAnVGhpcyBtb250aCcgfSxcbiAgeyB2YWx1ZTogJ2xhc3RNb250aCcsIGxhYmVsOiAnTGFzdCBtb250aCcgfSxcbiAgeyB2YWx1ZTogJzkwZCcsIGxhYmVsOiAnMyBtb250aHMnIH0sXG5dXG5jb25zdCBXSURHRVRTID0gWydvcmRlclZhbHVlJywgJ29yZGVycycsICdjdXN0b21lcnMnLCAncHJvZHVjdHMnXVxuXG5jb25zdCBpbnIgPSAodmFsdWUpID0+XG4gIGDigrkke051bWJlcih2YWx1ZSB8fCAwKS50b0xvY2FsZVN0cmluZygnZW4tSU4nLCB7IG1heGltdW1GcmFjdGlvbkRpZ2l0czogMCB9KX1gXG5cbmZ1bmN0aW9uIFJhbmdlU2VsZWN0KHsgdmFsdWUsIG9uQ2hhbmdlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXJhbmdlLXNlbGVjdFwiPlxuICAgICAgPExvY2FsU2VsZWN0IHZhbHVlPXt2YWx1ZX0gb3B0aW9ucz17UkFOR0VTfSBvbkNoYW5nZT17b25DaGFuZ2V9IC8+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gYXhpc01heCh2YWx1ZSkge1xuICBpZiAodmFsdWUgPD0gMCkgcmV0dXJuIDEwMDBcbiAgY29uc3QgcGFkZGVkID0gdmFsdWUgKiAxLjFcbiAgY29uc3QgbWFnbml0dWRlID0gMTAgKiogTWF0aC5mbG9vcihNYXRoLmxvZzEwKHBhZGRlZCkpXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBwYWRkZWQgLyBtYWduaXR1ZGVcbiAgY29uc3QgbmljZSA9IG5vcm1hbGl6ZWQgPD0gMSA/IDEgOiBub3JtYWxpemVkIDw9IDIgPyAyIDogbm9ybWFsaXplZCA8PSA1ID8gNSA6IDEwXG4gIHJldHVybiBuaWNlICogbWFnbml0dWRlXG59XG5cbmZ1bmN0aW9uIExpbmVDaGFydCh7IHNlcmllcyB9KSB7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGUobnVsbClcbiAgY29uc3Qgd2lkdGggPSAxMjAwXG4gIGNvbnN0IGhlaWdodCA9IDMyMFxuICBjb25zdCBwYWRMZWZ0ID0gODZcbiAgY29uc3QgcGFkUmlnaHQgPSAxOFxuICBjb25zdCBwYWRUb3AgPSAxOFxuICBjb25zdCBwYWRCb3R0b20gPSAzNlxuICBjb25zdCBtYXggPSBheGlzTWF4KE1hdGgubWF4KC4uLnNlcmllcy5tYXAoKHBvaW50KSA9PiBwb2ludC5vcmRlclZhbHVlKSwgMCkpXG4gIGNvbnN0IHBsb3RXaWR0aCA9IHdpZHRoIC0gcGFkTGVmdCAtIHBhZFJpZ2h0XG4gIGNvbnN0IHBsb3RIZWlnaHQgPSBoZWlnaHQgLSBwYWRUb3AgLSBwYWRCb3R0b21cbiAgY29uc3QgYmFzZWxpbmUgPSBwYWRUb3AgKyBwbG90SGVpZ2h0XG4gIGNvbnN0IHlGb3IgPSAodmFsdWUpID0+IGJhc2VsaW5lIC0gKHZhbHVlIC8gbWF4KSAqIHBsb3RIZWlnaHRcbiAgY29uc3Qgc3RlcCA9IHNlcmllcy5sZW5ndGggPiAxID8gcGxvdFdpZHRoIC8gKHNlcmllcy5sZW5ndGggLSAxKSA6IHBsb3RXaWR0aFxuICBjb25zdCBjb29yZHMgPSBzZXJpZXMubWFwKChwb2ludCwgaW5kZXgpID0+IHtcbiAgICBjb25zdCB4ID0gc2VyaWVzLmxlbmd0aCA9PT0gMSA/IHBhZExlZnQgKyBwbG90V2lkdGggLyAyIDogcGFkTGVmdCArIGluZGV4ICogc3RlcFxuICAgIHJldHVybiB7IHgsIHk6IHlGb3IocG9pbnQub3JkZXJWYWx1ZSksIHBvaW50IH1cbiAgfSlcbiAgY29uc3QgbGluZSA9IGNvb3Jkcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiBgJHtpbmRleCA/ICdMJyA6ICdNJ30ke2l0ZW0ueH0sJHtpdGVtLnl9YCkuam9pbignICcpXG4gIGNvbnN0IGFyZWEgPSBjb29yZHMubGVuZ3RoXG4gICAgPyBgJHtsaW5lfSBMJHtjb29yZHNbY29vcmRzLmxlbmd0aCAtIDFdLnh9LCR7YmFzZWxpbmV9IEwke2Nvb3Jkc1swXS54fSwke2Jhc2VsaW5lfSBaYFxuICAgIDogJydcbiAgY29uc3QgbGFiZWxFdmVyeSA9IHNlcmllcy5sZW5ndGggPiAyMCA/IE1hdGguY2VpbChzZXJpZXMubGVuZ3RoIC8gOCkgOiBzZXJpZXMubGVuZ3RoID4gMTAgPyA0IDogMVxuICBjb25zdCB0aWNrcyA9IFswLCAwLjI1LCAwLjUsIDAuNzUsIDFdLm1hcCgocmF0aW8pID0+ICh7XG4gICAgdmFsdWU6IE1hdGgucm91bmQobWF4ICogcmF0aW8pLFxuICAgIHk6IHlGb3IobWF4ICogcmF0aW8pLFxuICB9KSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hhcnQtcGxvdFwiIG9uTW91c2VMZWF2ZT17KCkgPT4gc2V0SG92ZXIobnVsbCl9PlxuICAgICAgPHN2ZyB2aWV3Qm94PXtgMCAwICR7d2lkdGh9ICR7aGVpZ2h0fWB9IGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0XCIgcm9sZT1cImltZ1wiPlxuICAgICAgICB7dGlja3MubWFwKCh0aWNrKSA9PiAoXG4gICAgICAgICAgPGcga2V5PXt0aWNrLnZhbHVlfT5cbiAgICAgICAgICAgIDxsaW5lIHgxPXtwYWRMZWZ0fSB4Mj17d2lkdGggLSBwYWRSaWdodH0geTE9e3RpY2sueX0geTI9e3RpY2sueX0gY2xhc3NOYW1lPVwidG9rcmktY2hhcnQtZ3JpZGxpbmVcIiAvPlxuICAgICAgICAgICAgPHRleHQgeD17cGFkTGVmdCAtIDEwfSB5PXt0aWNrLnkgKyA0fSB0ZXh0QW5jaG9yPVwiZW5kXCIgY2xhc3NOYW1lPVwidG9rcmktY2hhcnQtYXhpc1wiPlxuICAgICAgICAgICAgICB7aW5yKHRpY2sudmFsdWUpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvZz5cbiAgICAgICAgKSl9XG4gICAgICAgIDxwYXRoIGQ9e2FyZWF9IGZpbGw9XCIjMDQ3ODU3XCIgb3BhY2l0eT1cIjAuMTZcIiAvPlxuICAgICAgICA8cGF0aCBkPXtsaW5lfSBmaWxsPVwibm9uZVwiIHN0cm9rZT1cIiMwNDc4NTdcIiBzdHJva2VXaWR0aD1cIjNcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgLz5cbiAgICAgICAge2Nvb3Jkcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICA8ZyBrZXk9e2l0ZW0ucG9pbnQuZGF0ZX0+XG4gICAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICAgIGN4PXtpdGVtLnh9XG4gICAgICAgICAgICAgIGN5PXtpdGVtLnl9XG4gICAgICAgICAgICAgIHI9XCIxNFwiXG4gICAgICAgICAgICAgIGZpbGw9XCJ0cmFuc3BhcmVudFwiXG4gICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4gc2V0SG92ZXIoaXRlbSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGNpcmNsZSBjeD17aXRlbS54fSBjeT17aXRlbS55fSByPVwiNC41XCIgZmlsbD1cIiNmZmZcIiBzdHJva2U9XCIjMDQ3ODU3XCIgc3Ryb2tlV2lkdGg9XCIyXCIgcG9pbnRlckV2ZW50cz1cIm5vbmVcIiAvPlxuICAgICAgICAgIDwvZz5cbiAgICAgICAgKSl9XG4gICAgICAgIHtjb29yZHMubWFwKChpdGVtLCBpbmRleCkgPT5cbiAgICAgICAgICBpbmRleCAlIGxhYmVsRXZlcnkgPT09IDAgPyAoXG4gICAgICAgICAgICA8dGV4dCBrZXk9e2Ake2l0ZW0ucG9pbnQuZGF0ZX0tbGFiZWxgfSB4PXtpdGVtLnh9IHk9e2hlaWdodCAtIDh9IHRleHRBbmNob3I9XCJtaWRkbGVcIiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1sYWJlbFwiPlxuICAgICAgICAgICAgICB7aXRlbS5wb2ludC5sYWJlbH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICApIDogbnVsbCxcbiAgICAgICAgKX1cbiAgICAgIDwvc3ZnPlxuICAgICAge2hvdmVyID8gKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgdG9rcmktY2hhcnQtdGlwJHtob3Zlci55IDwgOTAgPyAnIGlzLWJlbG93JyA6ICcnfWB9XG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogYCR7KGhvdmVyLnggLyB3aWR0aCkgKiAxMDB9JWAsIHRvcDogYCR7KGhvdmVyLnkgLyBoZWlnaHQpICogMTAwfSVgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8c3Bhbj57aG92ZXIucG9pbnQubGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDxzdHJvbmc+e2lucihob3Zlci5wb2ludC5vcmRlclZhbHVlKX08L3N0cm9uZz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBQYWdlcih7IHBhZ2UsIHBhZ2VTaXplLCB0b3RhbCwgb25DaGFuZ2UgfSkge1xuICBjb25zdCBwYWdlcyA9IE1hdGgubWF4KDEsIE1hdGguY2VpbCgodG90YWwgfHwgMCkgLyBwYWdlU2l6ZSkpXG4gIGlmIChwYWdlcyA8PSAxKSByZXR1cm4gbnVsbFxuICBjb25zdCBudW1iZXJzID0gW11cbiAgZm9yIChsZXQgbnVtYmVyID0gMTsgbnVtYmVyIDw9IHBhZ2VzOyBudW1iZXIgKz0gMSkgbnVtYmVycy5wdXNoKG51bWJlcilcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXdpZGdldC1wYWdlc1wiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1saXN0LXBhZ2luYXRpb24tcGFnZXNcIj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGlzYWJsZWQ9e3BhZ2UgPD0gMX0gb25DbGljaz17KCkgPT4gb25DaGFuZ2UocGFnZSAtIDEpfT5cbiAgICAgICAgICBQcmV2XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICB7bnVtYmVycy5tYXAoKG51bWJlcikgPT4gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAga2V5PXtudW1iZXJ9XG4gICAgICAgICAgICBjbGFzc05hbWU9e251bWJlciA9PT0gcGFnZSA/ICdpcy1jdXJyZW50JyA6ICcnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UobnVtYmVyKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7bnVtYmVyfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApKX1cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGlzYWJsZWQ9e3BhZ2UgPj0gcGFnZXN9IG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKHBhZ2UgKyAxKX0+XG4gICAgICAgICAgTmV4dFxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IERhc2hib2FyZCA9ICgpID0+IHtcbiAgY29uc3QgcmVxdWVzdHMgPSB1c2VSZWYoe30pXG4gIGNvbnN0IFtyYW5nZXMsIHNldFJhbmdlc10gPSB1c2VTdGF0ZSh7XG4gICAgb3JkZXJWYWx1ZTogJzdkJyxcbiAgICBvcmRlcnM6ICc3ZCcsXG4gICAgY3VzdG9tZXJzOiAnN2QnLFxuICAgIHByb2R1Y3RzOiAnN2QnLFxuICB9KVxuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZSh7fSlcbiAgY29uc3QgW3BhZ2VzLCBzZXRQYWdlc10gPSB1c2VTdGF0ZSh7IG9yZGVyczogMSwgY3VzdG9tZXJzOiAxIH0pXG4gIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKHtcbiAgICBvcmRlclZhbHVlOiB0cnVlLFxuICAgIG9yZGVyczogdHJ1ZSxcbiAgICBjdXN0b21lcnM6IHRydWUsXG4gICAgcHJvZHVjdHM6IHRydWUsXG4gIH0pXG5cbiAgY29uc3QgbG9hZFdpZGdldCA9ICh3aWRnZXQsIHJhbmdlLCBwYWdlID0gMSkgPT4ge1xuICAgIGNvbnN0IHRpY2tldCA9IChyZXF1ZXN0cy5jdXJyZW50W3dpZGdldF0gfHwgMCkgKyAxXG4gICAgcmVxdWVzdHMuY3VycmVudFt3aWRnZXRdID0gdGlja2V0XG4gICAgc2V0QnVzeSgoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgW3dpZGdldF06IHRydWUgfSkpXG4gICAgYXBpXG4gICAgICAuZ2V0RGFzaGJvYXJkKHsgcGFyYW1zOiB7IHdpZGdldCwgcmFuZ2UsIHBhZ2UgfSB9KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXF1ZXN0cy5jdXJyZW50W3dpZGdldF0gIT09IHRpY2tldCkgcmV0dXJuXG4gICAgICAgIHNldERhdGEoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIC4uLnJlc3BvbnNlLmRhdGEgfSkpXG4gICAgICB9KVxuICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICBpZiAocmVxdWVzdHMuY3VycmVudFt3aWRnZXRdICE9PSB0aWNrZXQpIHJldHVyblxuICAgICAgICBzZXRCdXN5KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBbd2lkZ2V0XTogZmFsc2UgfSkpXG4gICAgICB9KVxuICB9XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBXSURHRVRTLmZvckVhY2goKHdpZGdldCkgPT4gbG9hZFdpZGdldCh3aWRnZXQsICc3ZCcpKVxuICB9LCBbXSlcblxuICBjb25zdCBjaGFuZ2VSYW5nZSA9ICh3aWRnZXQsIHJhbmdlKSA9PiB7XG4gICAgc2V0UmFuZ2VzKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBbd2lkZ2V0XTogcmFuZ2UgfSkpXG4gICAgaWYgKHdpZGdldCA9PT0gJ29yZGVycycgfHwgd2lkZ2V0ID09PSAnY3VzdG9tZXJzJykge1xuICAgICAgc2V0UGFnZXMoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiAxIH0pKVxuICAgIH1cbiAgICBsb2FkV2lkZ2V0KHdpZGdldCwgcmFuZ2UsIDEpXG4gIH1cblxuICBjb25zdCBjaGFuZ2VQYWdlID0gKHdpZGdldCwgcGFnZSkgPT4ge1xuICAgIHNldFBhZ2VzKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBbd2lkZ2V0XTogcGFnZSB9KSlcbiAgICBsb2FkV2lkZ2V0KHdpZGdldCwgcmFuZ2VzW3dpZGdldF0sIHBhZ2UpXG4gIH1cblxuICBjb25zdCBvcmRlclZhbHVlID0gZGF0YS5vcmRlclZhbHVlXG4gIGNvbnN0IG9yZGVycyA9IGRhdGEub3JkZXJzXG4gIGNvbnN0IGN1c3RvbWVycyA9IGRhdGEuY3VzdG9tZXJzXG4gIGNvbnN0IHByb2R1Y3RzID0gZGF0YS5wcm9kdWN0c1xuXG4gIHJldHVybiAoXG4gICAgPEJveCB2YXJpYW50PVwidHJhbnNwYXJlbnRcIiBjbGFzc05hbWU9XCJ0b2tyaS1hbmFseXRpY3NcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktYW5hbHl0aWNzLWhlYWRcIj5cbiAgICAgICAgPEgyIG1iPVwic21cIj5EYXNoYm9hcmQ8L0gyPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWNhcmQgdG9rcmktY2hhcnQtY2FyZC13aWRlXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktd2lkZ2V0LWhlYWRcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPEg1IG1iPVwic21cIj5PcmRlciBWYWx1ZTwvSDU+XG4gICAgICAgICAgICA8VGV4dCBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgICB7YnVzeS5vcmRlclZhbHVlICYmICFvcmRlclZhbHVlXG4gICAgICAgICAgICAgICAgPyAnTG9hZGluZ+KApidcbiAgICAgICAgICAgICAgICA6IGAke2lucihvcmRlclZhbHVlPy50b3RhbCl9IGZyb20gJHtvcmRlclZhbHVlPy5vcmRlckNvdW50IHx8IDB9IG9yZGVyc2B9XG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPFJhbmdlU2VsZWN0IHZhbHVlPXtyYW5nZXMub3JkZXJWYWx1ZX0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gY2hhbmdlUmFuZ2UoJ29yZGVyVmFsdWUnLCB2YWx1ZSl9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7b3JkZXJWYWx1ZT8uc2VyaWVzPy5sZW5ndGggPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1mcmFtZVwiPlxuICAgICAgICAgICAgPExpbmVDaGFydCBzZXJpZXM9e29yZGVyVmFsdWUuc2VyaWVzfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1zcGxpdFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1jYXJkXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS13aWRnZXQtaGVhZFwiPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPEg1IG1iPVwic21cIj5PcmRlciBBbW91bnQ8L0g1PlxuICAgICAgICAgICAgICA8VGV4dCBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgICAgIHtidXN5Lm9yZGVycyAmJiAhb3JkZXJzID8gJ0xvYWRpbmfigKYnIDogYCR7b3JkZXJzPy50b3RhbCB8fCAwfSBvcmRlcnNgfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxSYW5nZVNlbGVjdCB2YWx1ZT17cmFuZ2VzLm9yZGVyc30gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gY2hhbmdlUmFuZ2UoJ29yZGVycycsIHZhbHVlKX0gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7b3JkZXJzPy5yb3dzPy5sZW5ndGggPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInRva3JpLWRhdGEtdGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5PcmRlciBudW1iZXI8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5BbW91bnQ8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+UGxhY2VkPC90aD5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICB7b3JkZXJzLnJvd3MubWFwKChyb3cpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17cm93LmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5vcmRlck5vfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cubmFtZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57aW5yKHJvdy5hbW91bnQpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cucGxhY2VkQXR9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPFRleHQgb3BhY2l0eT17MC43fT57YnVzeS5vcmRlcnMgPyAnTG9hZGluZ+KApicgOiAnTm8gb3JkZXJzIGluIHRoaXMgcGVyaW9kLid9PC9UZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgICAgPFBhZ2VyXG4gICAgICAgICAgICBwYWdlPXtvcmRlcnM/LnBhZ2UgfHwgcGFnZXMub3JkZXJzfVxuICAgICAgICAgICAgcGFnZVNpemU9e29yZGVycz8ucGFnZVNpemUgfHwgMTB9XG4gICAgICAgICAgICB0b3RhbD17b3JkZXJzPy50b3RhbCB8fCAwfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhwYWdlKSA9PiBjaGFuZ2VQYWdlKCdvcmRlcnMnLCBwYWdlKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY2hhcnQtY2FyZFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktd2lkZ2V0LWhlYWRcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxINSBtYj1cInNtXCI+TmV3IEN1c3RvbWVyczwvSDU+XG4gICAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgICAge2J1c3kuY3VzdG9tZXJzICYmICFjdXN0b21lcnMgPyAnTG9hZGluZ+KApicgOiBgJHtjdXN0b21lcnM/LnRvdGFsIHx8IDB9IHBlb3BsZSByZWdpc3RlcmVkYH1cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8UmFuZ2VTZWxlY3QgdmFsdWU9e3Jhbmdlcy5jdXN0b21lcnN9IG9uQ2hhbmdlPXsodmFsdWUpID0+IGNoYW5nZVJhbmdlKCdjdXN0b21lcnMnLCB2YWx1ZSl9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge2N1c3RvbWVycz8ucm93cz8ubGVuZ3RoID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS10YWJsZS13cmFwXCI+XG4gICAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ0b2tyaS1kYXRhLXRhYmxlXCI+XG4gICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5QaG9uZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlIG9mIGJpcnRoPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkNyZWF0ZWQ8L3RoPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgIHtjdXN0b21lcnMucm93cy5tYXAoKHJvdykgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtyb3cuaWR9PlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57cm93Lm5hbWV9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+KzkxIHtyb3cucGhvbmV9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5kYXRlT2ZCaXJ0aH08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57cm93LnJlZ2lzdGVyZWRBdH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8VGV4dCBvcGFjaXR5PXswLjd9PntidXN5LmN1c3RvbWVycyA/ICdMb2FkaW5n4oCmJyA6ICdObyBuZXcgY3VzdG9tZXJzIGluIHRoaXMgcGVyaW9kLid9PC9UZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgICAgPFBhZ2VyXG4gICAgICAgICAgICBwYWdlPXtjdXN0b21lcnM/LnBhZ2UgfHwgcGFnZXMuY3VzdG9tZXJzfVxuICAgICAgICAgICAgcGFnZVNpemU9e2N1c3RvbWVycz8ucGFnZVNpemUgfHwgMTB9XG4gICAgICAgICAgICB0b3RhbD17Y3VzdG9tZXJzPy50b3RhbCB8fCAwfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhwYWdlKSA9PiBjaGFuZ2VQYWdlKCdjdXN0b21lcnMnLCBwYWdlKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1zcGxpdFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1jYXJkXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS13aWRnZXQtaGVhZFwiPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPEg1IG1iPVwic21cIj5CZXN0IFNlbGxpbmcgUHJvZHVjdHM8L0g1PlxuICAgICAgICAgICAgICA8VGV4dCBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgICAgIHtidXN5LnByb2R1Y3RzICYmICFwcm9kdWN0cyA/ICdMb2FkaW5n4oCmJyA6ICdUb3AgNSBieSBudW1iZXIgb2Ygb3JkZXJzJ31cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8UmFuZ2VTZWxlY3QgdmFsdWU9e3Jhbmdlcy5wcm9kdWN0c30gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gY2hhbmdlUmFuZ2UoJ3Byb2R1Y3RzJywgdmFsdWUpfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtwcm9kdWN0cz8ucm93cz8ubGVuZ3RoID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS10YWJsZS13cmFwXCI+XG4gICAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ0b2tyaS1kYXRhLXRhYmxlXCI+XG4gICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+UHJvZHVjdDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5PcmRlcnM8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+QW1vdW50PC90aD5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICB7cHJvZHVjdHMucm93cy5tYXAoKHJvdykgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtyb3cubmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cubmFtZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57cm93Lm9yZGVyc308L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57aW5yKHJvdy5hbW91bnQpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+e2J1c3kucHJvZHVjdHMgPyAnTG9hZGluZ+KApicgOiAnTm8gcHJvZHVjdHMgc29sZCBpbiB0aGlzIHBlcmlvZC4nfTwvVGV4dD5cbiAgICAgICAgICApfVxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBEYXNoYm9hcmRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBCYXNlUHJvcGVydHlDb21wb25lbnQsIHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IEZsYWdDYXJkLCBpc0ZsYWdPbiwgU2VhcmNoYWJsZU11bHRpU2VsZWN0LCBTdGF0dXNTd2l0Y2ggfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5jb25zdCBub3JtYWxpemVTbHVnSW5wdXQgPSAodmFsdWUpID0+XG4gIFN0cmluZyh2YWx1ZSB8fCAnJylcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC50cmltKClcbiAgICAucmVwbGFjZSgvWydcIl0vZywgJycpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxuICAgIC5yZXBsYWNlKC9eLSt8LSskL2csICcnKVxuXG5jb25zdCB3aXRob3V0VHJhaWxpbmdTbGFzaCA9ICh2YWx1ZSkgPT4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9cXC8rJC8sICcnKVxuXG5mdW5jdGlvbiBwYXJzZVNsdWdzKHJhdykge1xuICBpZiAoIXJhdykgcmV0dXJuIFtdXG4gIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbSkudHJpbSgpKS5maWx0ZXIoQm9vbGVhbilcbiAgaWYgKHR5cGVvZiByYXcgPT09ICdzdHJpbmcnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyc2VkKSkgcmV0dXJuIHBhcnNlU2x1Z3MocGFyc2VkKVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gaWdub3JlXG4gICAgfVxuICAgIHJldHVybiByYXdcbiAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAubWFwKChpdGVtKSA9PiBpdGVtLnRyaW0oKSlcbiAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgfVxuICByZXR1cm4gW11cbn1cblxuY29uc3QgUHJvZHVjdEVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wc1xuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgZmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbdXBsb2FkaW5nLCBzZXRVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzbHVnRWRpdGVkLCBzZXRTbHVnRWRpdGVkXSA9IHVzZVN0YXRlKEJvb2xlYW4oaW5pdGlhbFJlY29yZD8ucGFyYW1zPy5zbHVnKSlcbiAgY29uc3QgW3ByZXZpZXdVcmwsIHNldFByZXZpZXdVcmxdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtjYXRlZ29yaWVzLCBzZXRDYXRlZ29yaWVzXSA9IHVzZVN0YXRlKFtdKVxuXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGN1c3RvbSA9IHJlc291cmNlPy5vcHRpb25zPy5jdXN0b20gfHwge31cbiAgY29uc3QgYXBpQmFzZVVybCA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcGlCYXNlVXJsIHx8ICcvYXBpL3YxJylcbiAgY29uc3QgcHJvZHVjdFVybEJhc2UgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChcbiAgICBjdXN0b20ucHJvZHVjdFVybEJhc2UgfHwgYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vcHJvZHVjdGAsXG4gIClcbiAgY29uc3Qgc2x1Z0lucHV0ID0gcGFyYW1zLnNsdWcgPz8gJydcbiAgY29uc3QgcHJldmlld1NsdWcgPSBub3JtYWxpemVTbHVnSW5wdXQoc2x1Z0lucHV0KSB8fCBub3JtYWxpemVTbHVnSW5wdXQocGFyYW1zLm5hbWUpXG4gIGNvbnN0IHByb2R1Y3RVcmwgPSBwcmV2aWV3U2x1ZyA/IGAke3Byb2R1Y3RVcmxCYXNlfS8ke3ByZXZpZXdTbHVnfWAgOiBudWxsXG4gIGNvbnN0IHNlbGVjdGVkQ2F0ZWdvcnlTbHVncyA9IHBhcnNlU2x1Z3MocGFyYW1zLmNhdGVnb3J5SWRzKVxuXG4gIGNvbnN0IGltYWdlVXJsID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFwYXJhbXMuaW1hZ2UpIHJldHVybiAnJ1xuICAgIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChwYXJhbXMuaW1hZ2UpKSByZXR1cm4gcGFyYW1zLmltYWdlXG4gICAgcmV0dXJuIGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHtwYXJhbXMuaW1hZ2V9YFxuICB9LCBbY3VzdG9tLmFwcFVybCwgcGFyYW1zLmltYWdlXSlcblxuICBjb25zdCBkaXNwbGF5ZWRJbWFnZVVybCA9IHByZXZpZXdVcmwgfHwgaW1hZ2VVcmxcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAocHJldmlld1VybD8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChwcmV2aWV3VXJsKVxuICAgIH1cbiAgfSwgW3ByZXZpZXdVcmxdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGlnbm9yZSA9IGZhbHNlXG4gICAgZmV0Y2goYCR7YXBpQmFzZVVybH0vY2F0ZWdvcmllc2ApXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGlmICghaWdub3JlKSBzZXRDYXRlZ29yaWVzKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW10pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgaWYgKCFpZ25vcmUpIHNldENhdGVnb3JpZXMoW10pXG4gICAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbYXBpQmFzZVVybF0pXG5cbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgb25Qcm9wZXJ0eUNoYW5nZSA9IChwcm9wZXJ0eVBhdGgsIHZhbHVlLCAuLi5yZXN0KSA9PiB7XG4gICAgaWYgKHByb3BlcnR5UGF0aCA9PT0gJ3NsdWcnKSB7XG4gICAgICBzZXRTbHVnRWRpdGVkKHRydWUpXG4gICAgICBoYW5kbGVDaGFuZ2UocHJvcGVydHlQYXRoLCBub3JtYWxpemVTbHVnSW5wdXQodmFsdWUpLCAuLi5yZXN0KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGhhbmRsZUNoYW5nZShwcm9wZXJ0eVBhdGgsIHZhbHVlLCAuLi5yZXN0KVxuICAgIGlmIChwcm9wZXJ0eVBhdGggPT09ICduYW1lJyAmJiAhc2x1Z0VkaXRlZCkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdzbHVnJywgbm9ybWFsaXplU2x1Z0lucHV0KHZhbHVlKSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBzZXRTZWxlY3RlZENhdGVnb3JpZXMgPSAoc2x1Z3MpID0+IHNldEZpZWxkKCdjYXRlZ29yeUlkcycsIEpTT04uc3RyaW5naWZ5KHNsdWdzKSlcblxuICBjb25zdCB1cGxvYWRJbWFnZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXVxuICAgIGlmICghZmlsZSkgcmV0dXJuXG5cbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmb2xkZXInLCAncHJvZHVjdHMnKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpXG4gICAgY29uc3QgbG9jYWxQcmV2aWV3VXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKVxuICAgIHNldFByZXZpZXdVcmwobG9jYWxQcmV2aWV3VXJsKVxuICAgIHNldFVwbG9hZGluZyh0cnVlKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vbWVkaWEvdXBsb2FkYCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogZm9ybURhdGEsXG4gICAgICB9KVxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJvciA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSB8fCAnSW1hZ2UgdXBsb2FkIGZhaWxlZCcpXG4gICAgICB9XG4gICAgICBjb25zdCBtZWRpYSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgICAgaGFuZGxlQ2hhbmdlKCdpbWFnZScsIG1lZGlhLnBhdGgpXG4gICAgICBoYW5kbGVDaGFuZ2UoJ21lZGlhSWQnLCBtZWRpYS5pZClcbiAgICAgIHNldFByZXZpZXdVcmwoXG4gICAgICAgIC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KG1lZGlhLnBhdGgpXG4gICAgICAgICAgPyBtZWRpYS5wYXRoXG4gICAgICAgICAgOiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7bWVkaWEucGF0aH1gLFxuICAgICAgKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0ltYWdlIHVwbG9hZGVkIHN1Y2Nlc3NmdWxseScsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgdXBsb2FkIGltYWdlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRVcGxvYWRpbmcoZmFsc2UpXG4gICAgICBpZiAoZmlsZVJlZi5jdXJyZW50KSBmaWxlUmVmLmN1cnJlbnQudmFsdWUgPSAnJ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBwcm9kdWN0JywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdQcm9kdWN0IHNhdmVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHByb2R1Y3QnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICB9XG5cbiAgY29uc3QgZGVzY3JpcHRpb25Qcm9wZXJ0eSA9IHJlc291cmNlLmVkaXRQcm9wZXJ0aWVzLmZpbmQoXG4gICAgKHByb3BlcnR5KSA9PiBwcm9wZXJ0eS5wcm9wZXJ0eVBhdGggPT09ICdkZXNjcmlwdGlvbicsXG4gIClcblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57cGFyYW1zLm5hbWUgfHwgJ05ldyBwcm9kdWN0J308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+QWRkIHBob3RvcywgcHJpY2VzLCBhbmQgb25lIG9yIG1vcmUgY2F0ZWdvcmllcyBmb3IgdGhlIHdlYnNpdGUgYW5kIGFwcC48L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Qcm9kdWN0IGRldGFpbHM8L2g0PlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIE5hbWVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm5hbWUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uUHJvcGVydHlDaGFuZ2UoJ25hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFscGhvbnNvIE1hbmdvXCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBTbHVnXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3NsdWdJbnB1dH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25Qcm9wZXJ0eUNoYW5nZSgnc2x1ZycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiYXV0by1nZW5lcmF0ZWQgZnJvbSBuYW1lXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8VGV4dCBtdD1cInNtXCIgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgIFByZXZpZXc6eycgJ31cbiAgICAgICAgICAgIHtwcm9kdWN0VXJsID8gKFxuICAgICAgICAgICAgICA8YSBocmVmPXtwcm9kdWN0VXJsfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyXCI+XG4gICAgICAgICAgICAgICAge3Byb2R1Y3RVcmx9XG4gICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICdHZW5lcmF0ZWQgZnJvbSBwcm9kdWN0IG5hbWUgd2hlbiBzYXZlZCdcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBQcmljZSAo4oK5KVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnByaWNlVmFsdWUgPz8gJyd9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3ByaWNlVmFsdWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBPbGQgcHJpY2UgKOKCuSlcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5vbGRQcmljZVZhbHVlID8/ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdvbGRQcmljZVZhbHVlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIk9wdGlvbmFsXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIFdlaWdodFxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMud2VpZ2h0IHx8ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd3ZWlnaHQnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMSBrZ1wiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBCYWRnZVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYmFkZ2UgfHwgJyd9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2JhZGdlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkZyZXNoXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIFN0b2NrXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zdG9jayA/PyAxMDB9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3N0b2NrJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIFNvcnQgb3JkZXJcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnNvcnRPcmRlciA/PyAwfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdzb3J0T3JkZXInLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlRheCAmIEdTVDwvaDQ+XG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206IDEyIH19PlxuICAgICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgICBjaGVja2VkPXtpc0ZsYWdPbihwYXJhbXMuaXNUYXhhYmxlKX1cbiAgICAgICAgICAgICAgdGl0bGU9XCJUYXhhYmxlXCJcbiAgICAgICAgICAgICAgaGludD17aXNGbGFnT24ocGFyYW1zLmlzVGF4YWJsZSkgPyAnR1NUIHdpbGwgYmUgY2hhcmdlZCBhdCBjaGVja291dCcgOiAnTm8gR1NUIG9uIHRoaXMgcHJvZHVjdCd9XG4gICAgICAgICAgICAgIG9uTGFiZWw9XCJZZXNcIlxuICAgICAgICAgICAgICBvZmZMYWJlbD1cIk5vXCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ2lzVGF4YWJsZScsIG5leHQpXG4gICAgICAgICAgICAgICAgaWYgKG5leHQgJiYgTnVtYmVyKHBhcmFtcy5nc3RSYXRlIHx8IDApID09PSAwKSBzZXRGaWVsZCgnZ3N0UmF0ZScsIDUpXG4gICAgICAgICAgICAgICAgaWYgKCFuZXh0KSBzZXRGaWVsZCgnZ3N0UmF0ZScsIDApXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBIU04gQ29kZVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuaHNuQ29kZSA/PyAnMDgwOCd9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2hzbkNvZGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMDgwMiBvciAwODA4XCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIEdTVCAlXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZ3N0UmF0ZSA/PyAwfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdnc3RSYXRlJywgTnVtYmVyKGV2ZW50LnRhcmdldC52YWx1ZSkgfHwgMCl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCI1XCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Qcm9kdWN0IGltYWdlPC9oND5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktdXBsb2FkLWRyb3BcIj5cbiAgICAgICAgICAgIHtkaXNwbGF5ZWRJbWFnZVVybCA/IChcbiAgICAgICAgICAgICAgPGltZyBzcmM9e2Rpc3BsYXllZEltYWdlVXJsfSBhbHQ9e3BhcmFtcy5uYW1lIHx8ICdQcm9kdWN0IHByZXZpZXcnfSAvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPHNwYW4+Q2xpY2sgdG8gdXBsb2FkIGEgc3F1YXJlIHByb2R1Y3QgcGhvdG88L3NwYW4+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGlucHV0IHJlZj17ZmlsZVJlZn0gdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgb25DaGFuZ2U9e3VwbG9hZEltYWdlfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPFRleHQgbXQ9XCJzbVwiIG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICBKUEcsIFBORywgR0lGLCBvciBXZWJQIHVwIHRvIDVNQi5cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+Q2F0ZWdvcmllczwvaDQ+XG4gICAgICAgIDxwPkEgcHJvZHVjdCBjYW4gYXBwZWFyIGluIG1vcmUgdGhhbiBvbmUgY2F0ZWdvcnkgb24gdGhlIHdlYnNpdGUgYW5kIGFwcC48L3A+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBTZWxlY3QgY2F0ZWdvcmllc1xuICAgICAgICAgIDxTZWFyY2hhYmxlTXVsdGlTZWxlY3RcbiAgICAgICAgICAgIG9wdGlvbnM9e2NhdGVnb3JpZXMubWFwKChpdGVtKSA9PiAoeyB2YWx1ZTogaXRlbS5zbHVnLCBsYWJlbDogaXRlbS5sYWJlbCB9KSl9XG4gICAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0ZWRDYXRlZ29yeVNsdWdzfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3NldFNlbGVjdGVkQ2F0ZWdvcmllc31cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoIGFuZCBzZWxlY3QgY2F0ZWdvcmllc1wiXG4gICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcj1cIlNlYXJjaCBjYXRlZ29yaWVzXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+U3RvcmUgcGxhY2VtZW50PC9oND5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaG9pY2Utcm93XCI+XG4gICAgICAgICAgPEZsYWdDYXJkXG4gICAgICAgICAgICBzZWxlY3RlZD17cGFyYW1zLmlzQmVzdFNlbGxlciA9PT0gdHJ1ZSB8fCBwYXJhbXMuaXNCZXN0U2VsbGVyID09PSAndHJ1ZSd9XG4gICAgICAgICAgICB0aXRsZT1cIkJlc3RzZWxsZXJcIlxuICAgICAgICAgICAgaGludD1cIlNob3cgaW4gYmVzdHNlbGxlcnNcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ2lzQmVzdFNlbGxlcicsICEocGFyYW1zLmlzQmVzdFNlbGxlciA9PT0gdHJ1ZSB8fCBwYXJhbXMuaXNCZXN0U2VsbGVyID09PSAndHJ1ZScpKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGbGFnQ2FyZFxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3BhcmFtcy5pc0ltcG9ydGVkID09PSB0cnVlIHx8IHBhcmFtcy5pc0ltcG9ydGVkID09PSAndHJ1ZSd9XG4gICAgICAgICAgICB0aXRsZT1cIkltcG9ydGVkXCJcbiAgICAgICAgICAgIGhpbnQ9XCJTaG93IGluIGltcG9ydGVkIGZydWl0c1wiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgnaXNJbXBvcnRlZCcsICEocGFyYW1zLmlzSW1wb3J0ZWQgPT09IHRydWUgfHwgcGFyYW1zLmlzSW1wb3J0ZWQgPT09ICd0cnVlJykpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEZsYWdDYXJkXG4gICAgICAgICAgICBzZWxlY3RlZD17cGFyYW1zLmlzRmVhdHVyZWQgPT09IHRydWUgfHwgcGFyYW1zLmlzRmVhdHVyZWQgPT09ICd0cnVlJ31cbiAgICAgICAgICAgIHRpdGxlPVwiRmVhdHVyZWRcIlxuICAgICAgICAgICAgaGludD1cIkhpZ2hsaWdodCB0aGlzIGZydWl0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCdpc0ZlYXR1cmVkJywgIShwYXJhbXMuaXNGZWF0dXJlZCA9PT0gdHJ1ZSB8fCBwYXJhbXMuaXNGZWF0dXJlZCA9PT0gJ3RydWUnKSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8RmxhZ0NhcmRcbiAgICAgICAgICAgIHNlbGVjdGVkPXtwYXJhbXMuaXNBY3RpdmUgIT09IGZhbHNlICYmIHBhcmFtcy5pc0FjdGl2ZSAhPT0gJ2ZhbHNlJ31cbiAgICAgICAgICAgIHRpdGxlPVwiQWN0aXZlXCJcbiAgICAgICAgICAgIGhpbnQ9XCJWaXNpYmxlIHRvIGN1c3RvbWVyc1wiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PlxuICAgICAgICAgICAgICBzZXRGaWVsZCgnaXNBY3RpdmUnLCAhKHBhcmFtcy5pc0FjdGl2ZSAhPT0gZmFsc2UgJiYgcGFyYW1zLmlzQWN0aXZlICE9PSAnZmFsc2UnKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkRlc2NyaXB0aW9uPC9oND5cbiAgICAgICAge2Rlc2NyaXB0aW9uUHJvcGVydHkgPyAoXG4gICAgICAgICAgPEJveCBzdHlsZT17eyBtaW5IZWlnaHQ6IDIyMCB9fT5cbiAgICAgICAgICAgIDxCYXNlUHJvcGVydHlDb21wb25lbnRcbiAgICAgICAgICAgICAgd2hlcmU9XCJlZGl0XCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9e29uUHJvcGVydHlDaGFuZ2V9XG4gICAgICAgICAgICAgIHByb3BlcnR5PXtkZXNjcmlwdGlvblByb3BlcnR5fVxuICAgICAgICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgICAgICAgIHJlY29yZD17cmVjb3JkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nIHx8IHVwbG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgfHwgdXBsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIFNhdmUgcHJvZHVjdFxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2R1Y3RFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgQmFzZVByb3BlcnR5Q29tcG9uZW50LCB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBGbGFnQ2FyZCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IG5vcm1hbGl6ZVNsdWdJbnB1dCA9ICh2YWx1ZSkgPT5cbiAgU3RyaW5nKHZhbHVlIHx8ICcnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnRyaW0oKVxuICAgIC5yZXBsYWNlKC9bJ1wiXS9nLCAnJylcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tK3wtKyQvZywgJycpXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmNvbnN0IENhdGVnb3J5RWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IGJhbm5lckZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgW3VwbG9hZGluZywgc2V0VXBsb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbYmFubmVyVXBsb2FkaW5nLCBzZXRCYW5uZXJVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzbHVnRWRpdGVkLCBzZXRTbHVnRWRpdGVkXSA9IHVzZVN0YXRlKEJvb2xlYW4oaW5pdGlhbFJlY29yZD8ucGFyYW1zPy5zbHVnKSlcbiAgY29uc3QgW3ByZXZpZXdVcmwsIHNldFByZXZpZXdVcmxdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtiYW5uZXJQcmV2aWV3VXJsLCBzZXRCYW5uZXJQcmV2aWV3VXJsXSA9IHVzZVN0YXRlKCcnKVxuXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGN1c3RvbSA9IHJlc291cmNlPy5vcHRpb25zPy5jdXN0b20gfHwge31cbiAgY29uc3QgYXBpQmFzZVVybCA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcGlCYXNlVXJsIHx8ICcvYXBpL3YxJylcbiAgY29uc3QgY2F0ZWdvcnlVcmxCYXNlID0gd2l0aG91dFRyYWlsaW5nU2xhc2goXG4gICAgY3VzdG9tLmNhdGVnb3J5VXJsQmFzZSB8fCBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9jYXRlZ29yeWAsXG4gIClcbiAgY29uc3Qgc2x1Z0lucHV0ID0gcGFyYW1zLnNsdWcgPz8gJydcbiAgY29uc3QgcHJldmlld1NsdWcgPSBub3JtYWxpemVTbHVnSW5wdXQoc2x1Z0lucHV0KSB8fCBub3JtYWxpemVTbHVnSW5wdXQocGFyYW1zLmxhYmVsKVxuICBjb25zdCBjYXRlZ29yeVVybCA9IHByZXZpZXdTbHVnID8gYCR7Y2F0ZWdvcnlVcmxCYXNlfS8ke3ByZXZpZXdTbHVnfWAgOiBudWxsXG5cbiAgY29uc3QgaW1hZ2VVcmwgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIXBhcmFtcy5pbWFnZSkgcmV0dXJuICcnXG4gICAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhcmFtcy5pbWFnZSkpIHJldHVybiBwYXJhbXMuaW1hZ2VcbiAgICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke3BhcmFtcy5pbWFnZX1gXG4gIH0sIFtjdXN0b20uYXBwVXJsLCBwYXJhbXMuaW1hZ2VdKVxuXG4gIGNvbnN0IGRpc3BsYXllZEltYWdlVXJsID0gcHJldmlld1VybCB8fCBpbWFnZVVybFxuXG4gIGNvbnN0IGJhbm5lckltYWdlVXJsID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFwYXJhbXMuYmFubmVySW1hZ2UpIHJldHVybiAnJ1xuICAgIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChwYXJhbXMuYmFubmVySW1hZ2UpKSByZXR1cm4gcGFyYW1zLmJhbm5lckltYWdlXG4gICAgcmV0dXJuIGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHtwYXJhbXMuYmFubmVySW1hZ2V9YFxuICB9LCBbY3VzdG9tLmFwcFVybCwgcGFyYW1zLmJhbm5lckltYWdlXSlcblxuICBjb25zdCBkaXNwbGF5ZWRCYW5uZXJVcmwgPSBiYW5uZXJQcmV2aWV3VXJsIHx8IGJhbm5lckltYWdlVXJsXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHByZXZpZXdVcmw/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwocHJldmlld1VybClcbiAgICB9XG4gIH0sIFtwcmV2aWV3VXJsXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoYmFubmVyUHJldmlld1VybD8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChiYW5uZXJQcmV2aWV3VXJsKVxuICAgIH1cbiAgfSwgW2Jhbm5lclByZXZpZXdVcmxdKVxuXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IG9uUHJvcGVydHlDaGFuZ2UgPSAocHJvcGVydHlQYXRoLCB2YWx1ZSwgLi4ucmVzdCkgPT4ge1xuICAgIGlmIChwcm9wZXJ0eVBhdGggPT09ICdzbHVnJykge1xuICAgICAgc2V0U2x1Z0VkaXRlZCh0cnVlKVxuICAgICAgaGFuZGxlQ2hhbmdlKHByb3BlcnR5UGF0aCwgbm9ybWFsaXplU2x1Z0lucHV0KHZhbHVlKSwgLi4ucmVzdClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBoYW5kbGVDaGFuZ2UocHJvcGVydHlQYXRoLCB2YWx1ZSwgLi4ucmVzdClcbiAgICBpZiAocHJvcGVydHlQYXRoID09PSAnbGFiZWwnICYmICFzbHVnRWRpdGVkKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ3NsdWcnLCBub3JtYWxpemVTbHVnSW5wdXQodmFsdWUpKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHVwbG9hZFRvID0gYXN5bmMgKGZpbGUsIGZpZWxkLCBzZXRMb2NhbFByZXZpZXcsIHNldEJ1c3ksIHN1Y2Nlc3NNZXNzYWdlKSA9PiB7XG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZm9sZGVyJywgJ2NhdGVnb3JpZXMnKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpXG4gICAgc2V0TG9jYWxQcmV2aWV3KFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSkpXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L21lZGlhL3VwbG9hZGAsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgfSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UgfHwgJ0ltYWdlIHVwbG9hZCBmYWlsZWQnKVxuICAgICAgfVxuICAgICAgY29uc3QgbWVkaWEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIG9uUHJvcGVydHlDaGFuZ2UoZmllbGQsIG1lZGlhLnBhdGgpXG4gICAgICBzZXRMb2NhbFByZXZpZXcoXG4gICAgICAgIC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KG1lZGlhLnBhdGgpXG4gICAgICAgICAgPyBtZWRpYS5wYXRoXG4gICAgICAgICAgOiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7bWVkaWEucGF0aH1gLFxuICAgICAgKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogc3VjY2Vzc01lc3NhZ2UsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgdXBsb2FkIGltYWdlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBjYXRlZ29yeScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ2F0ZWdvcnkgc2F2ZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgY2F0ZWdvcnknLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICB9XG5cbiAgY29uc3QgZGVzY3JpcHRpb25Qcm9wZXJ0eSA9IHJlc291cmNlLmVkaXRQcm9wZXJ0aWVzLmZpbmQoXG4gICAgKHByb3BlcnR5KSA9PiBwcm9wZXJ0eS5wcm9wZXJ0eVBhdGggPT09ICdkZXNjcmlwdGlvbicsXG4gIClcblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57cGFyYW1zLmxhYmVsIHx8ICdOZXcgY2F0ZWdvcnknfTwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5DcmVhdGUgYSBzaG9wIHNlY3Rpb24gd2l0aCBhIHRodW1ibmFpbCwgYmFubmVyLCBhbmQgcGFnZSBjb3B5LjwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkNhdGVnb3J5IGRldGFpbHM8L2g0PlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIExhYmVsXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5sYWJlbCB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25Qcm9wZXJ0eUNoYW5nZSgnbGFiZWwnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkZyZXNoIEZydWl0c1wiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUGFnZSBoZWFkaW5nXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy50aXRsZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3RpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTYW1lIGFzIGxhYmVsIGlmIGVtcHR5XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBTdWJ0aXRsZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc3VidGl0bGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdzdWJ0aXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2hvcnQgbGluZSB1bmRlciB0aGUgaGVhZGluZ1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgU2x1Z1xuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtzbHVnSW5wdXR9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uUHJvcGVydHlDaGFuZ2UoJ3NsdWcnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImF1dG8tZ2VuZXJhdGVkIGZyb20gbGFiZWxcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxUZXh0IG10PVwic21cIiBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgUHJldmlldzp7JyAnfVxuICAgICAgICAgICAge2NhdGVnb3J5VXJsID8gKFxuICAgICAgICAgICAgICA8YSBocmVmPXtjYXRlZ29yeVVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlclwiPlxuICAgICAgICAgICAgICAgIHtjYXRlZ29yeVVybH1cbiAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgJ0dlbmVyYXRlZCBmcm9tIGNhdGVnb3J5IGxhYmVsIHdoZW4gc2F2ZWQnXG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgU29ydCBvcmRlclxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc29ydE9yZGVyID8/IDB9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3NvcnRPcmRlcicsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBTdGF0dXNcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaG9pY2Utcm93XCIgc3R5bGU9e3sgbWFyZ2luVG9wOiA2IH19PlxuICAgICAgICAgICAgICAgIDxGbGFnQ2FyZFxuICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3BhcmFtcy5pc0FjdGl2ZSAhPT0gZmFsc2UgJiYgcGFyYW1zLmlzQWN0aXZlICE9PSAnZmFsc2UnfVxuICAgICAgICAgICAgICAgICAgdGl0bGU9XCJBY3RpdmVcIlxuICAgICAgICAgICAgICAgICAgaGludD1cIlNob3duIG9uIHdlYnNpdGUgYW5kIGFwcFwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PlxuICAgICAgICAgICAgICAgICAgICBzZXRGaWVsZCgnaXNBY3RpdmUnLCAhKHBhcmFtcy5pc0FjdGl2ZSAhPT0gZmFsc2UgJiYgcGFyYW1zLmlzQWN0aXZlICE9PSAnZmFsc2UnKSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5DYXRlZ29yeSBpbWFnZTwvaDQ+XG4gICAgICAgICAgPHA+U3F1YXJlIHRodW1ibmFpbCB1c2VkIGluIHRoZSBob21lIGNhdGVnb3J5IGdyaWQuPC9wPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS11cGxvYWQtZHJvcFwiPlxuICAgICAgICAgICAge2Rpc3BsYXllZEltYWdlVXJsID8gKFxuICAgICAgICAgICAgICA8aW1nIHNyYz17ZGlzcGxheWVkSW1hZ2VVcmx9IGFsdD17cGFyYW1zLmxhYmVsIHx8ICdDYXRlZ29yeSBwcmV2aWV3J30gLz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxzcGFuPkNsaWNrIHRvIHVwbG9hZCBjYXRlZ29yeSBpbWFnZTwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgcmVmPXtmaWxlUmVmfVxuICAgICAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgICAgIGFjY2VwdD1cImltYWdlLypcIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgICAgICAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIHVwbG9hZFRvKGZpbGUsICdpbWFnZScsIHNldFByZXZpZXdVcmwsIHNldFVwbG9hZGluZywgJ0ltYWdlIHVwbG9hZGVkIHN1Y2Nlc3NmdWxseScpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9ICcnXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+Q2F0ZWdvcnkgYmFubmVyPC9oND5cbiAgICAgICAgPHA+V2lkZSBpbWFnZSBzaG93biBhdCB0aGUgdG9wIG9mIHRoZSBjYXRlZ29yeSBwYWdlLjwvcD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLXVwbG9hZC1kcm9wIHRva3JpLXVwbG9hZC1kcm9wLXdpZGVcIj5cbiAgICAgICAgICB7ZGlzcGxheWVkQmFubmVyVXJsID8gKFxuICAgICAgICAgICAgPGltZyBzcmM9e2Rpc3BsYXllZEJhbm5lclVybH0gYWx0PXtwYXJhbXMubGFiZWwgfHwgJ0NhdGVnb3J5IGJhbm5lcid9IC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxzcGFuPkNsaWNrIHRvIHVwbG9hZCBhIHdpZGUgYmFubmVyICgxNjAww5c0MDAgcmVjb21tZW5kZWQpPC9zcGFuPlxuICAgICAgICAgICl9XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICByZWY9e2Jhbm5lckZpbGVSZWZ9XG4gICAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgICBhY2NlcHQ9XCJpbWFnZS8qXCJcbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgICAgICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICAgICAgdXBsb2FkVG8oXG4gICAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgICAgJ2Jhbm5lckltYWdlJyxcbiAgICAgICAgICAgICAgICAgIHNldEJhbm5lclByZXZpZXdVcmwsXG4gICAgICAgICAgICAgICAgICBzZXRCYW5uZXJVcGxvYWRpbmcsXG4gICAgICAgICAgICAgICAgICAnQmFubmVyIHVwbG9hZGVkIHN1Y2Nlc3NmdWxseScsXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9ICcnXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5EZXNjcmlwdGlvbjwvaDQ+XG4gICAgICAgIHtkZXNjcmlwdGlvblByb3BlcnR5ID8gKFxuICAgICAgICAgIDxCb3ggc3R5bGU9e3sgbWluSGVpZ2h0OiAyMjAgfX0+XG4gICAgICAgICAgICA8QmFzZVByb3BlcnR5Q29tcG9uZW50XG4gICAgICAgICAgICAgIHdoZXJlPVwiZWRpdFwiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtvblByb3BlcnR5Q2hhbmdlfVxuICAgICAgICAgICAgICBwcm9wZXJ0eT17ZGVzY3JpcHRpb25Qcm9wZXJ0eX1cbiAgICAgICAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICAgICAgICByZWNvcmQ9e3JlY29yZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdub25lJyB9fSBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAge3Jlc291cmNlLmVkaXRQcm9wZXJ0aWVzXG4gICAgICAgICAgLmZpbHRlcigocHJvcGVydHkpID0+IFsnaW1hZ2UnLCAnYmFubmVySW1hZ2UnXS5pbmNsdWRlcyhwcm9wZXJ0eS5wcm9wZXJ0eVBhdGgpKVxuICAgICAgICAgIC5tYXAoKHByb3BlcnR5KSA9PiAoXG4gICAgICAgICAgICA8QmFzZVByb3BlcnR5Q29tcG9uZW50XG4gICAgICAgICAgICAgIGtleT17cHJvcGVydHkucHJvcGVydHlQYXRofVxuICAgICAgICAgICAgICB3aGVyZT1cImVkaXRcIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17b25Qcm9wZXJ0eUNoYW5nZX1cbiAgICAgICAgICAgICAgcHJvcGVydHk9e3Byb3BlcnR5fVxuICAgICAgICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgICAgICAgIHJlY29yZD17cmVjb3JkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZyB8fCB1cGxvYWRpbmcgfHwgYmFubmVyVXBsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyB8fCB1cGxvYWRpbmcgfHwgYmFubmVyVXBsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIFNhdmUgY2F0ZWdvcnlcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBDYXRlZ29yeUVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgSWNvbiwgSW5wdXQsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHtcbiAgUmVjb3Jkc1RhYmxlLFxuICB1c2VRdWVyeVBhcmFtcyxcbiAgdXNlUmVjb3JkcyxcbiAgdXNlU2VsZWN0ZWRSZWNvcmRzLFxufSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgTG9jYWxTZWxlY3QgfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5jb25zdCBQRVJfUEFHRV9PUFRJT05TID0gWzEwLCAyNSwgNTBdXG5cbmNvbnN0IENtc0xpc3QgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZXNvdXJjZSwgc2V0VGFnIH0gPSBwcm9wc1xuICBjb25zdCB0aXRsZVByb3AgPSByZXNvdXJjZS50aXRsZVByb3BlcnR5Py5uYW1lIHx8IHJlc291cmNlLnRpdGxlUHJvcGVydHk/LnByb3BlcnR5UGF0aCB8fCAnaWQnXG5cbiAgY29uc3QgeyBzdG9yZVBhcmFtcywgZmlsdGVycywgcGFyc2VkUXVlcnkgfSA9IHVzZVF1ZXJ5UGFyYW1zKClcbiAgY29uc3Qge1xuICAgIHJlY29yZHMsXG4gICAgbG9hZGluZyxcbiAgICBkaXJlY3Rpb24sXG4gICAgc29ydEJ5LFxuICAgIHBhZ2UsXG4gICAgdG90YWwsXG4gICAgZmV0Y2hEYXRhLFxuICAgIHBlclBhZ2UsXG4gIH0gPSB1c2VSZWNvcmRzKHJlc291cmNlLmlkKVxuICBjb25zdCB7XG4gICAgc2VsZWN0ZWRSZWNvcmRzLFxuICAgIGhhbmRsZVNlbGVjdCxcbiAgICBoYW5kbGVTZWxlY3RBbGwsXG4gICAgc2V0U2VsZWN0ZWRSZWNvcmRzLFxuICB9ID0gdXNlU2VsZWN0ZWRSZWNvcmRzKHJlY29yZHMpXG5cbiAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZSgoKSA9PiBTdHJpbmcocGFyc2VkUXVlcnk/LnEgfHwgZmlsdGVycz8uW3RpdGxlUHJvcF0gfHwgJycpKVxuICBjb25zdCBkZWJvdW5jZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBzdG9yZVBhcmFtc1JlZiA9IHVzZVJlZihzdG9yZVBhcmFtcylcbiAgc3RvcmVQYXJhbXNSZWYuY3VycmVudCA9IHN0b3JlUGFyYW1zXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRRdWVyeShTdHJpbmcocGFyc2VkUXVlcnk/LnEgfHwgZmlsdGVycz8uW3RpdGxlUHJvcF0gfHwgJycpKVxuICAgIHNldFNlbGVjdGVkUmVjb3JkcyhbXSlcbiAgfSwgW3Jlc291cmNlLmlkLCB0aXRsZVByb3AsIHNldFNlbGVjdGVkUmVjb3Jkc10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2V0VGFnKSBzZXRUYWcodG90YWwudG9TdHJpbmcoKSlcbiAgfSwgW3RvdGFsLCBzZXRUYWddKVxuXG4gIGNvbnN0IGhhbmRsZVF1ZXJ5Q2hhbmdlID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBldmVudC50YXJnZXQudmFsdWVcbiAgICBzZXRRdWVyeSh2YWx1ZSlcblxuICAgIGlmIChkZWJvdW5jZVJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQoZGVib3VuY2VSZWYuY3VycmVudClcbiAgICBkZWJvdW5jZVJlZi5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCB0cmltbWVkID0gdmFsdWUudHJpbSgpXG4gICAgICBzdG9yZVBhcmFtc1JlZi5jdXJyZW50KHtcbiAgICAgICAgcGFnZTogJzEnLFxuICAgICAgICBxOiB0cmltbWVkLFxuICAgICAgICBmaWx0ZXJzOiB0cmltbWVkID8geyBbdGl0bGVQcm9wXTogdHJpbW1lZCB9IDoge30sXG4gICAgICB9KVxuICAgIH0sIDMwMClcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChkZWJvdW5jZVJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQoZGVib3VuY2VSZWYuY3VycmVudClcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZUFjdGlvblBlcmZvcm1lZCA9ICgpID0+IGZldGNoRGF0YSgpXG5cbiAgY29uc3QgY3VycmVudFBhZ2UgPSBOdW1iZXIocGFnZSkgfHwgMVxuICBjb25zdCByb3dzUGVyUGFnZSA9IE51bWJlcihwZXJQYWdlKSB8fCAxMFxuICBjb25zdCB0b3RhbFJvd3MgPSBOdW1iZXIodG90YWwpIHx8IDBcbiAgY29uc3QgdG90YWxQYWdlcyA9IE1hdGgubWF4KDEsIE1hdGguY2VpbCh0b3RhbFJvd3MgLyByb3dzUGVyUGFnZSkgfHwgMSlcbiAgY29uc3QgZnJvbSA9IHRvdGFsUm93cyA9PT0gMCA/IDAgOiAoY3VycmVudFBhZ2UgLSAxKSAqIHJvd3NQZXJQYWdlICsgMVxuICBjb25zdCB0byA9IE1hdGgubWluKGN1cnJlbnRQYWdlICogcm93c1BlclBhZ2UsIHRvdGFsUm93cylcblxuICBjb25zdCBnb1RvUGFnZSA9IChuZXh0UGFnZSkgPT4ge1xuICAgIGNvbnN0IHNhZmUgPSBNYXRoLm1pbihNYXRoLm1heCgxLCBuZXh0UGFnZSksIHRvdGFsUGFnZXMpXG4gICAgc3RvcmVQYXJhbXMoe1xuICAgICAgcGFnZTogU3RyaW5nKHNhZmUpLFxuICAgICAgcTogcGFyc2VkUXVlcnk/LnEgfHwgZmlsdGVycz8uW3RpdGxlUHJvcF0gfHwgdW5kZWZpbmVkLFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjaGFuZ2VQZXJQYWdlID0gKG5leHQpID0+IHtcbiAgICBzdG9yZVBhcmFtcyh7XG4gICAgICBwYWdlOiAnMScsXG4gICAgICBwZXJQYWdlOiBTdHJpbmcobmV4dCksXG4gICAgICBxOiBwYXJzZWRRdWVyeT8ucSB8fCBmaWx0ZXJzPy5bdGl0bGVQcm9wXSB8fCB1bmRlZmluZWQsXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHBhZ2VOdW1iZXJzID0gW11cbiAgY29uc3Qgd2luZG93U2l6ZSA9IDVcbiAgbGV0IHN0YXJ0ID0gTWF0aC5tYXgoMSwgY3VycmVudFBhZ2UgLSBNYXRoLmZsb29yKHdpbmRvd1NpemUgLyAyKSlcbiAgbGV0IGVuZCA9IE1hdGgubWluKHRvdGFsUGFnZXMsIHN0YXJ0ICsgd2luZG93U2l6ZSAtIDEpXG4gIHN0YXJ0ID0gTWF0aC5tYXgoMSwgZW5kIC0gd2luZG93U2l6ZSArIDEpXG4gIGZvciAobGV0IG51bWJlciA9IHN0YXJ0OyBudW1iZXIgPD0gZW5kOyBudW1iZXIgKz0gMSkgcGFnZU51bWJlcnMucHVzaChudW1iZXIpXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHZhcmlhbnQ9XCJncmV5XCI+XG4gICAgICA8Qm94IG1iPVwibGdcIiBzdHlsZT17eyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgbWF4V2lkdGg6IDQyMCB9fT5cbiAgICAgICAgPEJveFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogJzUwJScsXG4gICAgICAgICAgICBsZWZ0OiAxMixcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoLTUwJSknLFxuICAgICAgICAgICAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICAgICAgICAgICAgb3BhY2l0eTogMC42LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8SWNvbiBpY29uPVwiU2VhcmNoXCIgLz5cbiAgICAgICAgPC9Cb3g+XG4gICAgICAgIDxJbnB1dFxuICAgICAgICAgIHZhbHVlPXtxdWVyeX1cbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlUXVlcnlDaGFuZ2V9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e2BTZWFyY2ggYWxsICR7cmVzb3VyY2UubmFtZX0uLi5gfVxuICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmdMZWZ0OiAzNiB9fVxuICAgICAgICAvPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggdmFyaWFudD1cImNvbnRhaW5lclwiPlxuICAgICAgICA8UmVjb3Jkc1RhYmxlXG4gICAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICAgIHJlY29yZHM9e3JlY29yZHN9XG4gICAgICAgICAgYWN0aW9uUGVyZm9ybWVkPXtoYW5kbGVBY3Rpb25QZXJmb3JtZWR9XG4gICAgICAgICAgb25TZWxlY3Q9e2hhbmRsZVNlbGVjdH1cbiAgICAgICAgICBvblNlbGVjdEFsbD17aGFuZGxlU2VsZWN0QWxsfVxuICAgICAgICAgIHNlbGVjdGVkUmVjb3Jkcz17c2VsZWN0ZWRSZWNvcmRzfVxuICAgICAgICAgIGRpcmVjdGlvbj17ZGlyZWN0aW9ufVxuICAgICAgICAgIHNvcnRCeT17c29ydEJ5fVxuICAgICAgICAgIGlzTG9hZGluZz17bG9hZGluZ31cbiAgICAgICAgLz5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxpc3QtcGFnaW5hdGlvblwiPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRva3JpLWxpc3QtcGFnaW5hdGlvbi1zdW1tYXJ5XCI+XG4gICAgICAgICAgICB7dG90YWxSb3dzID09PSAwID8gJ05vIHJlY29yZHMnIDogYFNob3dpbmcgJHtmcm9tfeKAkyR7dG99IG9mICR7dG90YWxSb3dzfWB9XG4gICAgICAgICAgPC9UZXh0PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1saXN0LXBhZ2luYXRpb24tc2l6ZVwiPlxuICAgICAgICAgICAgPHNwYW4+Um93czwvc3Bhbj5cbiAgICAgICAgICAgIDxMb2NhbFNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17U3RyaW5nKHJvd3NQZXJQYWdlKX1cbiAgICAgICAgICAgICAgb3B0aW9ucz17UEVSX1BBR0VfT1BUSU9OUy5tYXAoKG9wdGlvbikgPT4gKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogU3RyaW5nKG9wdGlvbiksXG4gICAgICAgICAgICAgICAgbGFiZWw6IFN0cmluZyhvcHRpb24pLFxuICAgICAgICAgICAgICB9KSl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gY2hhbmdlUGVyUGFnZShOdW1iZXIobmV4dCkpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbGlzdC1wYWdpbmF0aW9uLXBhZ2VzXCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPD0gMX0gb25DbGljaz17KCkgPT4gZ29Ub1BhZ2UoY3VycmVudFBhZ2UgLSAxKX0+XG4gICAgICAgICAgICAgIFByZXZcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAge3BhZ2VOdW1iZXJzLm1hcCgobnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBrZXk9e251bWJlcn1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e251bWJlciA9PT0gY3VycmVudFBhZ2UgPyAnaXMtY3VycmVudCcgOiAnJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBnb1RvUGFnZShudW1iZXIpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge251bWJlcn1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRpc2FibGVkPXtjdXJyZW50UGFnZSA+PSB0b3RhbFBhZ2VzfSBvbkNsaWNrPXsoKSA9PiBnb1RvUGFnZShjdXJyZW50UGFnZSArIDEpfT5cbiAgICAgICAgICAgICAgTmV4dFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ21zTGlzdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IExvY2FsU2VsZWN0LCBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuZnVuY3Rpb24gcmVzb2x2ZUltYWdlVXJsKHBhdGgsIGFwcFVybCkge1xuICBpZiAoIXBhdGgpIHJldHVybiAnJ1xuICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGF0aCkpIHJldHVybiBwYXRoXG4gIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChhcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHtwYXRofWBcbn1cblxuZnVuY3Rpb24gRmllbGRFcnJvcih7IGVycm9yIH0pIHtcbiAgaWYgKCFlcnJvcj8ubWVzc2FnZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9yLm1lc3NhZ2V9PC9zcGFuPlxufVxuXG5jb25zdCBSZXZpZXdFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSwgYWN0aW9uIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgZmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbdXBsb2FkaW5nLCBzZXRVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtwcmV2aWV3VXJsLCBzZXRQcmV2aWV3VXJsXSA9IHVzZVN0YXRlKCcnKVxuXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzTmV3ID0gYWN0aW9uPy5uYW1lID09PSAnbmV3JyB8fCAhcmVjb3JkPy5pZFxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG4gIGNvbnN0IGFwcFVybCA9IGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICBjb25zdCBlcnJvcnMgPSB1c2VNZW1vKCgpID0+IHJlY29yZD8uZXJyb3JzIHx8IHt9LCBbcmVjb3JkPy5lcnJvcnNdKVxuICBjb25zdCByYXRpbmcgPSBNYXRoLm1pbig1LCBNYXRoLm1heCgxLCBOdW1iZXIocGFyYW1zLnJhdGluZykgfHwgNSkpXG4gIGNvbnN0IGlzQXBwcm92ZWQgPVxuICAgIGlzTmV3ICYmIChwYXJhbXMuaXNBcHByb3ZlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FwcHJvdmVkID09PSAnJylcbiAgICAgID8gdHJ1ZVxuICAgICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNBcHByb3ZlZClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLmlzQXBwcm92ZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBcHByb3ZlZCA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ2lzQXBwcm92ZWQnLCB0cnVlKVxuICAgIH1cbiAgICBpZiAoaXNOZXcgJiYgIXBhcmFtcy5yYXRpbmcpIGhhbmRsZUNoYW5nZSgncmF0aW5nJywgNSlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtpc05ld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHByZXZpZXdVcmw/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwocHJldmlld1VybClcbiAgICB9XG4gIH0sIFtwcmV2aWV3VXJsXSlcblxuICBjb25zdCBpbWFnZVVybCA9IHVzZU1lbW8oXG4gICAgKCkgPT4gcmVzb2x2ZUltYWdlVXJsKHBhcmFtcy5pbWFnZSwgYXBwVXJsKSxcbiAgICBbYXBwVXJsLCBwYXJhbXMuaW1hZ2VdLFxuICApXG4gIGNvbnN0IGRpc3BsYXllZEltYWdlVXJsID0gcHJldmlld1VybCB8fCBpbWFnZVVybFxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCB1cGxvYWRJbWFnZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXVxuICAgIGlmICghZmlsZSkgcmV0dXJuXG5cbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmb2xkZXInLCAncmV2aWV3cycpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSlcbiAgICBjb25zdCBsb2NhbFByZXZpZXdVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpXG4gICAgc2V0UHJldmlld1VybChsb2NhbFByZXZpZXdVcmwpXG4gICAgc2V0VXBsb2FkaW5nKHRydWUpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS91cGxvYWRgLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIH0pXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdJbWFnZSB1cGxvYWQgZmFpbGVkJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1lZGlhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICBzZXRGaWVsZCgnaW1hZ2UnLCBtZWRpYS5wYXRoKVxuICAgICAgc2V0UHJldmlld1VybChyZXNvbHZlSW1hZ2VVcmwobWVkaWEucGF0aCwgYXBwVXJsKSlcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdQaG90byB1cGxvYWRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgdXBsb2FkIGltYWdlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRVcGxvYWRpbmcoZmFsc2UpXG4gICAgICBpZiAoZmlsZVJlZi5jdXJyZW50KSBmaWxlUmVmLmN1cnJlbnQudmFsdWUgPSAnJ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSByZXZpZXcnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogaXNOZXcgPyAnUmV2aWV3IGNyZWF0ZWQnIDogJ1JldmlldyB1cGRhdGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHJldmlldy4gUGxlYXNlIHRyeSBhZ2Fpbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e2lzTmV3ID8gJ0FkZCBob21lcGFnZSByZXZpZXcnIDogcGFyYW1zLnRpdGxlIHx8ICdSZXZpZXcnfTwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5cbiAgICAgICAgICBBcHByb3ZlZCByZXZpZXdzIGFwcGVhciBvbiB0aGUgd2Vic2l0ZSBob21lcGFnZS4gSGlkZGVuIHJldmlld3Mgc3RheSBpbiBDTVMgb25seS5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+V2Vic2l0ZSB2aXNpYmlsaXR5PC9oND5cbiAgICAgICAgICA8cD5UdXJuIHRoaXMgb2ZmIHRvIGhpZGUgdGhlIHJldmlldyB3aXRob3V0IGRlbGV0aW5nIGl0LjwvcD5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtpc0FwcHJvdmVkfVxuICAgICAgICAgICAgb25MYWJlbD1cIkFwcHJvdmVkXCJcbiAgICAgICAgICAgIG9mZkxhYmVsPVwiSGlkZGVuXCJcbiAgICAgICAgICAgIHRpdGxlPXtpc0FwcHJvdmVkID8gJ0FwcHJvdmVkJyA6ICdIaWRkZW4nfVxuICAgICAgICAgICAgaGludD17aXNBcHByb3ZlZCA/ICdWaXNpYmxlIG9uIHRoZSBob21lcGFnZScgOiAnSGlkZGVuIHVudGlsIHlvdSBhcHByb3ZlIGl0J31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzQXBwcm92ZWQnLCBuZXh0KX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+UmF0aW5nPC9oND5cbiAgICAgICAgICA8cD5TaG93biBhcyBzdGFycyBvbiB0aGUgaG9tZXBhZ2UgcmV2aWV3IGNhcmQuPC9wPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFN0YXJzXG4gICAgICAgICAgICA8TG9jYWxTZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e3JhdGluZ31cbiAgICAgICAgICAgICAgb3B0aW9ucz17WzUsIDQsIDMsIDIsIDFdLm1hcCgodmFsdWUpID0+ICh7XG4gICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGAke3ZhbHVlfSBzdGFyJHt2YWx1ZSA9PT0gMSA/ICcnIDogJ3MnfWAsXG4gICAgICAgICAgICAgIH0pKX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgncmF0aW5nJywgTnVtYmVyKG5leHQpKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5SZXZpZXcgdGV4dDwvaDQ+XG4gICAgICAgIDxwPktlZXAgaXQgc2hvcnQuIFRoaXMgaXMgd2hhdCBjdXN0b21lcnMgcmVhZCBvbiB0aGUgaG9tZXBhZ2UuPC9wPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBUaXRsZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudGl0bGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd0aXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU3VwZXIgZnJlc2ggZnJ1aXRzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnRpdGxlfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUmV2aWV3ZXIgbmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ25hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlByaXlhIFNoYXJtYVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5uYW1lfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgUmV2aWV3XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgcm93cz17NH1cbiAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNvbnRlbnQgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnY29udGVudCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFsd2F5cyBmcmVzaCBhbmQgZGVsaXZlcmVkIHJpZ2h0IG9uIHRpbWUuXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuY29udGVudH0gLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlJldmlld2VyIHBob3RvPC9oND5cbiAgICAgICAgPHA+T3B0aW9uYWwuIElmIGVtcHR5LCB0aGUgd2Vic2l0ZSBzaG93cyBpbml0aWFscyBpbnN0ZWFkLjwvcD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIFBob3RvXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktdXBsb2FkLWRyb3AgdG9rcmktdXBsb2FkLWRyb3Atcm91bmRcIj5cbiAgICAgICAgICAgIHtkaXNwbGF5ZWRJbWFnZVVybCA/IChcbiAgICAgICAgICAgICAgPGltZyBzcmM9e2Rpc3BsYXllZEltYWdlVXJsfSBhbHQ9e3BhcmFtcy5uYW1lIHx8ICdSZXZpZXdlcid9IC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8c3Bhbj57dXBsb2FkaW5nID8gJ1VwbG9hZGluZ+KApicgOiAnQ2xpY2sgdG8gdXBsb2FkIGEgcGhvdG8nfTwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8aW5wdXQgcmVmPXtmaWxlUmVmfSB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiBvbkNoYW5nZT17dXBsb2FkSW1hZ2V9IC8+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5KUEcsIFBORywgR0lGLCBvciBXZWJQIHVwIHRvIDVNQjwvc3Bhbj5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmcgfHwgdXBsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyB8fCB1cGxvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAge2lzTmV3ID8gJ0NyZWF0ZSByZXZpZXcnIDogJ1NhdmUgcmV2aWV3J31cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZXZpZXdFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQsIFRpbnlNQ0UgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmNvbnN0IEVESVRPUl9PUFRJT05TID0ge1xuICBwbHVnaW5zOiBbJ2xpbmsnLCAnbGlzdHMnLCAnaW1hZ2UnLCAnYXV0b2xpbmsnLCAnY29kZScsICd3b3JkY291bnQnXSxcbiAgdG9vbGJhcjogJ3VuZG8gcmVkbyB8IGJsb2NrcyB8IGJvbGQgaXRhbGljIHVuZGVybGluZSB8IGJ1bGxpc3QgbnVtbGlzdCB8IGxpbmsgaW1hZ2UgfCByZW1vdmVmb3JtYXQnLFxuICBoZWlnaHQ6IDQyMCxcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUltYWdlVXJsKHBhdGgsIGFwcFVybCkge1xuICBpZiAoIXBhdGgpIHJldHVybiAnJ1xuICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGF0aCkpIHJldHVybiBwYXRoXG4gIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChhcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHtwYXRofWBcbn1cblxuZnVuY3Rpb24gZGF0ZUlucHV0VmFsdWUodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcbiAgaWYgKE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiBTdHJpbmcodmFsdWUpLnNsaWNlKDAsIDEwKVxuICBjb25zdCB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpXG4gIGNvbnN0IG1vbnRoID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJylcbiAgY29uc3QgZGF5ID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpXG4gIHJldHVybiBgJHt5ZWFyfS0ke21vbnRofS0ke2RheX1gXG59XG5cbmZ1bmN0aW9uIHBhZCh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5wYWRTdGFydCgyLCAnMCcpXG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF0ZVZhbHVlKHZhbHVlKSB7XG4gIGNvbnN0IHRleHQgPSBTdHJpbmcodmFsdWUgfHwgJycpLnRyaW0oKVxuICBpZiAoIXRleHQpIHJldHVybiBudWxsXG4gIGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaCgvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pLylcbiAgaWYgKG1hdGNoKSB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKE51bWJlcihtYXRjaFsxXSksIE51bWJlcihtYXRjaFsyXSkgLSAxLCBOdW1iZXIobWF0Y2hbM10pKVxuICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpID8gbnVsbCA6IGRhdGVcbiAgfVxuICBjb25zdCBkYXRlID0gbmV3IERhdGUodGV4dClcbiAgcmV0dXJuIE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkgPyBudWxsIDogZGF0ZVxufVxuXG5mdW5jdGlvbiB0b0RhdGVWYWx1ZShkYXRlKSB7XG4gIHJldHVybiBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9LSR7cGFkKGRhdGUuZ2V0TW9udGgoKSArIDEpfS0ke3BhZChkYXRlLmdldERhdGUoKSl9YFxufVxuXG5mdW5jdGlvbiBEYXRlRmllbGQoeyB2YWx1ZSwgb25DaGFuZ2UgfSkge1xuICBjb25zdCBzZWxlY3RlZCA9IHBhcnNlRGF0ZVZhbHVlKHZhbHVlKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW21vbnRoRGF0ZSwgc2V0TW9udGhEYXRlXSA9IHVzZVN0YXRlKHNlbGVjdGVkIHx8IG5ldyBEYXRlKCkpXG4gIGNvbnN0IHdyYXBSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgW29wZW5VcCwgc2V0T3BlblVwXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3QgdXBkYXRlID0gKCkgPT4ge1xuICAgICAgY29uc3QgcmVjdCA9IHdyYXBSZWYuY3VycmVudD8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGlmICghcmVjdCkgcmV0dXJuXG4gICAgICBjb25zdCBzcGFjZUJlbG93ID0gd2luZG93LmlubmVySGVpZ2h0IC0gcmVjdC5ib3R0b21cbiAgICAgIHNldE9wZW5VcChzcGFjZUJlbG93IDwgMzIwICYmIHJlY3QudG9wID4gc3BhY2VCZWxvdylcbiAgICB9XG4gICAgdXBkYXRlKClcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB1cGRhdGUsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHVwZGF0ZSwgdHJ1ZSlcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZWxlY3RlZCkgc2V0TW9udGhEYXRlKHNlbGVjdGVkKVxuICB9LCBbdmFsdWVdKVxuXG4gIGNvbnN0IHllYXIgPSBtb250aERhdGUuZ2V0RnVsbFllYXIoKVxuICBjb25zdCBtb250aCA9IG1vbnRoRGF0ZS5nZXRNb250aCgpXG4gIGNvbnN0IGZpcnN0RGF5ID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpLmdldERheSgpXG4gIGNvbnN0IHRvdGFsRGF5cyA9IG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMCkuZ2V0RGF0ZSgpXG4gIGNvbnN0IGNlbGxzID0gW11cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGZpcnN0RGF5OyBpbmRleCArPSAxKSBjZWxscy5wdXNoKG51bGwpXG4gIGZvciAobGV0IGRheSA9IDE7IGRheSA8PSB0b3RhbERheXM7IGRheSArPSAxKSBjZWxscy5wdXNoKGRheSlcbiAgY29uc3Qgc2VsZWN0ZWREYXkgPSBzZWxlY3RlZCAmJiBzZWxlY3RlZC5nZXRGdWxsWWVhcigpID09PSB5ZWFyICYmIHNlbGVjdGVkLmdldE1vbnRoKCkgPT09IG1vbnRoXG4gICAgPyBzZWxlY3RlZC5nZXREYXRlKClcbiAgICA6IG51bGxcblxuICBjb25zdCBjaG9vc2UgPSAoZGF5KSA9PiB7XG4gICAgb25DaGFuZ2UodG9EYXRlVmFsdWUobmV3IERhdGUoeWVhciwgbW9udGgsIGRheSkpKVxuICAgIHNldE9wZW4oZmFsc2UpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlclwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWNvbnRyb2xcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKChjdXJyZW50KSA9PiAhY3VycmVudCl9PlxuICAgICAgICA8c3Bhbj57c2VsZWN0ZWQgPyBzZWxlY3RlZC50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLUdCJykgOiAnU2VsZWN0IGEgZGF0ZSd9PC9zcGFuPlxuICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj7wn5OFPC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b2tyaS1kYXRlcGlja2VyLXBvcCR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItbmF2XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb250aERhdGUobmV3IERhdGUoeWVhciwgbW9udGggLSAxLCAxKSl9PuKAuTwvYnV0dG9uPlxuICAgICAgICAgICAgPHN0cm9uZz57bW9udGhEYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tVVMnLCB7IG1vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJyB9KX08L3N0cm9uZz5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE1vbnRoRGF0ZShuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDEpKX0+4oC6PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLXdlZWtcIj5cbiAgICAgICAgICAgIHtbJ1MnLCAnTScsICdUJywgJ1cnLCAnVCcsICdGJywgJ1MnXS5tYXAoKGxhYmVsLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICA8c3BhbiBrZXk9e2Ake2xhYmVsfS0ke2luZGV4fWB9PntsYWJlbH08L3NwYW4+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItZ3JpZFwiPlxuICAgICAgICAgICAge2NlbGxzLm1hcCgoZGF5LCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICBkYXkgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAga2V5PXtgJHt5ZWFyfS0ke21vbnRofS0ke2RheX1gfVxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NlbGVjdGVkRGF5ID09PSBkYXkgPyAnaXMtc2VsZWN0ZWQnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBjaG9vc2UoZGF5KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7ZGF5fVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogPHNwYW4ga2V5PXtgZW1wdHktJHtpbmRleH1gfSAvPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWFjdGlvbnNcIj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItY2xlYXJcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoJycpXG4gICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgQ2xlYXJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1jbGVhclwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgICAgICBzZXRNb250aERhdGUodG9kYXkpXG4gICAgICAgICAgICAgICAgb25DaGFuZ2UodG9EYXRlVmFsdWUodG9kYXkpKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFRvZGF5XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBGaWVsZEVycm9yKHsgZXJyb3IgfSkge1xuICBpZiAoIWVycm9yPy5tZXNzYWdlKSByZXR1cm4gbnVsbFxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3IubWVzc2FnZX08L3NwYW4+XG59XG5cbmNvbnN0IEJsb2dFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSwgYWN0aW9uIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKGluaXRpYWxSZWNvcmQsIHJlc291cmNlLmlkKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFt1cGxvYWRpbmcsIHNldFVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3ByZXZpZXdVcmwsIHNldFByZXZpZXdVcmxdID0gdXNlU3RhdGUoJycpXG5cbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgaXNOZXcgPSBhY3Rpb24/Lm5hbWUgPT09ICduZXcnIHx8ICFyZWNvcmQ/LmlkXG4gIGNvbnN0IGN1c3RvbSA9IHJlc291cmNlPy5vcHRpb25zPy5jdXN0b20gfHwge31cbiAgY29uc3QgYXBpQmFzZVVybCA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcGlCYXNlVXJsIHx8ICcvYXBpL3YxJylcbiAgY29uc3QgYXBwVXJsID0gY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IGlzUHVibGlzaGVkID0gaXNOZXcgJiYgKHBhcmFtcy5pc1B1Ymxpc2hlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc1B1Ymxpc2hlZCA9PT0gJycpXG4gICAgPyB0cnVlXG4gICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNQdWJsaXNoZWQpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5pc1B1Ymxpc2hlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc1B1Ymxpc2hlZCA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ2lzUHVibGlzaGVkJywgdHJ1ZSlcbiAgICB9XG4gICAgaWYgKGlzTmV3ICYmICFwYXJhbXMuYXV0aG9yKSBoYW5kbGVDaGFuZ2UoJ2F1dGhvcicsICdUb2tyaWlpJylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtpc05ld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAocHJldmlld1VybD8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChwcmV2aWV3VXJsKVxuICB9LCBbcHJldmlld1VybF0pXG5cbiAgY29uc3QgaW1hZ2VVcmwgPSB1c2VNZW1vKFxuICAgICgpID0+IHJlc29sdmVJbWFnZVVybChwYXJhbXMuY292ZXJJbWFnZSwgYXBwVXJsKSxcbiAgICBbYXBwVXJsLCBwYXJhbXMuY292ZXJJbWFnZV0sXG4gIClcbiAgY29uc3QgZGlzcGxheWVkSW1hZ2VVcmwgPSBwcmV2aWV3VXJsIHx8IGltYWdlVXJsXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IHVwbG9hZEltYWdlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgaWYgKCFmaWxlKSByZXR1cm5cblxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZvbGRlcicsICdibG9nJylcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIGNvbnN0IGxvY2FsUHJldmlld1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSlcbiAgICBzZXRQcmV2aWV3VXJsKGxvY2FsUHJldmlld1VybClcbiAgICBzZXRVcGxvYWRpbmcodHJ1ZSlcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L21lZGlhL3VwbG9hZGAsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgfSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UgfHwgJ0ltYWdlIHVwbG9hZCBmYWlsZWQnKVxuICAgICAgfVxuICAgICAgY29uc3QgbWVkaWEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIHNldEZpZWxkKCdjb3ZlckltYWdlJywgbWVkaWEucGF0aClcbiAgICAgIHNldFByZXZpZXdVcmwocmVzb2x2ZUltYWdlVXJsKG1lZGlhLnBhdGgsIGFwcFVybCkpXG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ292ZXIgaW1hZ2UgdXBsb2FkZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IHVwbG9hZCBpbWFnZScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0VXBsb2FkaW5nKGZhbHNlKVxuICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCkgZmlsZVJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgYmxvZyBwb3N0JywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGlzTmV3ID8gJ0Jsb2cgcG9zdCBjcmVhdGVkJyA6ICdCbG9nIHBvc3QgdXBkYXRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSB0aGUgYmxvZyBwb3N0LiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57aXNOZXcgPyAnTmV3IGJsb2cgcG9zdCcgOiBwYXJhbXMudGl0bGUgfHwgJ0Jsb2cgcG9zdCd9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIFB1Ymxpc2hlZCBwb3N0cyBhcHBlYXIgb24gdGhlIHdlYnNpdGUgYXQgL2Jsb2cuIEhpZGRlbiBwb3N0cyBzdGF5IGluIHRoZSBhZG1pbiBvbmx5LlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PldlYnNpdGUgdmlzaWJpbGl0eTwvaDQ+XG4gICAgICAgIDxwPlR1cm4gdGhpcyBvZmYgdG8ga2VlcCBhIGRyYWZ0IHdpdGhvdXQgZGVsZXRpbmcgaXQuPC9wPlxuICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgY2hlY2tlZD17aXNQdWJsaXNoZWR9XG4gICAgICAgICAgb25MYWJlbD1cIlB1Ymxpc2hlZFwiXG4gICAgICAgICAgb2ZmTGFiZWw9XCJEcmFmdFwiXG4gICAgICAgICAgdGl0bGU9e2lzUHVibGlzaGVkID8gJ1B1Ymxpc2hlZCcgOiAnRHJhZnQnfVxuICAgICAgICAgIGhpbnQ9e2lzUHVibGlzaGVkID8gJ1Zpc2libGUgb24gdGhlIGJsb2cnIDogJ0hpZGRlbiB1bnRpbCB5b3UgcHVibGlzaCBpdCd9XG4gICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnaXNQdWJsaXNoZWQnLCBuZXh0KX1cbiAgICAgICAgLz5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlBvc3Q8L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBUaXRsZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudGl0bGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd0aXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiSG93IHdlIHBhY2sgYSBtb3JuaW5nIFRva3JpaWlcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMudGl0bGV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBVUkwgc2x1Z1xuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc2x1ZyB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3NsdWcnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkxlYXZlIGJsYW5rIHRvIHVzZSB0aGUgdGl0bGVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5UaGUgcGFnZSB3aWxsIGJlIC9ibG9nL3RoaXMtc2x1Zzwvc3Bhbj5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuc2x1Z30gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQXV0aG9yXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hdXRob3IgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdhdXRob3InLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlRva3JpaWlcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIENhdGVnb3J5XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jYXRlZ29yeSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2NhdGVnb3J5JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJHdWlkZXNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5TaG93biBhYm92ZSB0aGUgdGl0bGUgb24gdGhlIGJsb2cgbGlzdGluZyBhbmQgdGhlIHN0b3J5IHBhZ2UuPC9zcGFuPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUHVibGlzaCBkYXRlXG4gICAgICAgICAgICA8RGF0ZUZpZWxkXG4gICAgICAgICAgICAgIHZhbHVlPXtkYXRlSW5wdXRWYWx1ZShwYXJhbXMucHVibGlzaGVkQXQpfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdwdWJsaXNoZWRBdCcsIG5leHQpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5MZWF2ZSBibGFuayB0byB1c2UgdG9kYXkgd2hlbiB0aGUgcG9zdCBpcyBwdWJsaXNoZWQuPC9zcGFuPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgU2hvcnQgc3VtbWFyeVxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHJvd3M9ezN9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmV4Y2VycHQgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZXhjZXJwdCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIk9uZSBvciB0d28gbGluZXMgZm9yIHRoZSBibG9nIGxpc3RpbmcuXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5JZiB5b3UgbGVhdmUgdGhpcyBlbXB0eSwgdGhlIGZpcnN0IGxpbmVzIG9mIHRoZSBwb3N0IGFyZSB1c2VkLjwvc3Bhbj5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkNvdmVyIGltYWdlPC9oND5cbiAgICAgICAgPHA+U2hvd24gb24gdGhlIGJsb2cgbGlzdGluZyBhbmQgYXQgdGhlIHRvcCBvZiB0aGUgc3RvcnkuPC9wPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgQ292ZXJcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS11cGxvYWQtZHJvcFwiPlxuICAgICAgICAgICAge2Rpc3BsYXllZEltYWdlVXJsID8gKFxuICAgICAgICAgICAgICA8aW1nIHNyYz17ZGlzcGxheWVkSW1hZ2VVcmx9IGFsdD17cGFyYW1zLnRpdGxlIHx8ICdDb3Zlcid9IC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8c3Bhbj57dXBsb2FkaW5nID8gJ1VwbG9hZGluZ+KApicgOiAnQ2xpY2sgdG8gdXBsb2FkIGEgY292ZXIgaW1hZ2UnfTwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8aW5wdXQgcmVmPXtmaWxlUmVmfSB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiBvbkNoYW5nZT17dXBsb2FkSW1hZ2V9IC8+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5KUEcsIFBORywgR0lGLCBvciBXZWJQIHVwIHRvIDVNQjwvc3Bhbj5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAge2Rpc3BsYXllZEltYWdlVXJsID8gKFxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgICAgbXQ9XCJkZWZhdWx0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0RmllbGQoJ2NvdmVySW1hZ2UnLCAnJylcbiAgICAgICAgICAgICAgc2V0UHJldmlld1VybCgnJylcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgUmVtb3ZlIGNvdmVyXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+U3Rvcnk8L2g0PlxuICAgICAgICA8VGlueU1DRVxuICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYm9keSB8fCAnJ31cbiAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdib2R5JywgbmV4dCl9XG4gICAgICAgICAgb3B0aW9ucz17RURJVE9SX09QVElPTlN9XG4gICAgICAgIC8+XG4gICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuYm9keX0gLz5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmcgfHwgdXBsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyB8fCB1cGxvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAge2lzTmV3ID8gJ1B1Ymxpc2ggcG9zdCcgOiAnU2F2ZSBwb3N0J31cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBCbG9nRWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgQm94LFxuICBCdXR0b24sXG4gIERyYXdlckNvbnRlbnQsXG4gIERyYXdlckZvb3RlcixcbiAgSDQsXG4gIEljb24sXG4gIFRleHQsXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBCYXNlUHJvcGVydHlDb21wb25lbnQsIHVzZVJlY29yZCwgdXNlTm90aWNlIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IGlzRmxhZ09uLCBTZWFyY2hhYmxlTXVsdGlTZWxlY3QsIFN0YXR1c1N3aXRjaCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IFRBQlMgPSBbXG4gIHtcbiAgICBpZDogJ2dlbmVyYWwnLFxuICAgIGxhYmVsOiAnR2VuZXJhbCcsXG4gICAgZmllbGRzOiBbXG4gICAgICAnc3RvcmVOYW1lJyxcbiAgICAgICdzdG9yZVRhZ2xpbmUnLFxuICAgICAgJ3N0b3JlRW1haWwnLFxuICAgICAgJ3N0b3JlUGhvbmUxJyxcbiAgICAgICdzdG9yZVBob25lMicsXG4gICAgICAnc3RvcmVBZGRyZXNzJyxcbiAgICAgICdwcm9tb0Jhbm5lcicsXG4gICAgICAnZWFybHlEZWxpdmVyeScsXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnY2hhcmdlcycsXG4gICAgbGFiZWw6ICdDaGFyZ2VzJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgICdtb3JuaW5nRGVsaXZlcnlUaXRsZScsXG4gICAgICAnbW9ybmluZ0RlbGl2ZXJ5U3VidGl0bGUnLFxuICAgICAgJ21vcm5pbmdTaGlwcGluZ0ZlZScsXG4gICAgICAnbW9ybmluZ0ZyZWVBYm92ZScsXG4gICAgICAnZXhwcmVzc0RlbGl2ZXJ5VGl0bGUnLFxuICAgICAgJ2V4cHJlc3NEZWxpdmVyeVN1YnRpdGxlJyxcbiAgICAgICdleHByZXNzU2hpcHBpbmdGZWUnLFxuICAgICAgJ2V4cHJlc3NGcmVlQWJvdmUnLFxuICAgICAgJ2hhbmRsaW5nRmVlJyxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICdob21lcGFnZScsXG4gICAgbGFiZWw6ICdIb21lcGFnZScsXG4gICAgZmllbGRzOiBbXG4gICAgICAnaG9tZUJhbm5lckltYWdlJyxcbiAgICAgICdob21lTW9iaWxlQmFubmVySW1hZ2UnLFxuICAgICAgJ2hvbWVIaWdobGlnaHRJbWFnZScsXG4gICAgICAnaG9tZUZlYXR1cmVkQ2F0ZWdvcnlTbHVncycsXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAncGF5bWVudHMnLFxuICAgIGxhYmVsOiAnUGF5bWVudHMnLFxuICAgIGZpZWxkczogWydyYXpvcnBheUVuYWJsZWQnLCAncmF6b3JwYXlLZXlJZCcsICdyYXpvcnBheUtleVNlY3JldCcsICdjb2RFbmFibGVkJ10sXG4gIH0sXG4gIHtcbiAgICBpZDogJ25vdGlmaWNhdGlvbnMnLFxuICAgIGxhYmVsOiAnTm90aWZpY2F0aW9ucycsXG4gICAgZmllbGRzOiBbXG4gICAgICAnbXNnOTFFbmFibGVkJyxcbiAgICAgICdtc2c5MUF1dGhLZXknLFxuICAgICAgJ21zZzkxU2VuZGVySWQnLFxuICAgICAgJ21zZzkxT3RwVGVtcGxhdGVJZCcsXG4gICAgICAnbXNnOTFPcmRlclRlbXBsYXRlSWQnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBFbmFibGVkJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwTnVtYmVyJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwTmFtZXNwYWNlJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwT3RwRW5hYmxlZCcsXG4gICAgICAnbXNnOTFXaGF0c2FwcE90cFRlbXBsYXRlJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwT3RwQnV0dG9uJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwT3JkZXJFbmFibGVkJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwT3JkZXJUZW1wbGF0ZScsXG4gICAgICAnbXNnOTFXaGF0c2FwcFBhcnRuZXJFbmFibGVkJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwUGFydG5lclRlbXBsYXRlJyxcbiAgICBdLFxuICB9LFxuXVxuXG5jb25zdCB3aXRob3V0VHJhaWxpbmdTbGFzaCA9ICh2YWx1ZSkgPT4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9cXC8rJC8sICcnKVxuXG5mdW5jdGlvbiBwYXJzZVNsdWdzKHJhdykge1xuICBpZiAoIXJhdykgcmV0dXJuIFtdXG4gIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbSkudHJpbSgpKS5maWx0ZXIoQm9vbGVhbilcbiAgaWYgKHR5cGVvZiByYXcgPT09ICdzdHJpbmcnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyc2VkKSkgcmV0dXJuIHBhcnNlU2x1Z3MocGFyc2VkKVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gaWdub3JlXG4gICAgfVxuICAgIHJldHVybiByYXdcbiAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAubWFwKChpdGVtKSA9PiBpdGVtLnRyaW0oKSlcbiAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgfVxuICByZXR1cm4gW11cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUltYWdlVXJsKHBhdGgsIGFwcFVybCkge1xuICBpZiAoIXBhdGgpIHJldHVybiAnJ1xuICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGF0aCkpIHJldHVybiBwYXRoXG4gIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChhcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHtwYXRofWBcbn1cblxuZnVuY3Rpb24gSW1hZ2VVcGxvYWRlcih7XG4gIGxhYmVsLFxuICBoaW50LFxuICB2YWx1ZSxcbiAgcHJldmlld1VybCxcbiAgdXBsb2FkaW5nLFxuICBmaWxlUmVmLFxuICBvblVwbG9hZCxcbiAgd2lkZSxcbn0pIHtcbiAgY29uc3QgZGlzcGxheWVkID0gcHJldmlld1VybCB8fCB2YWx1ZVxuXG4gIHJldHVybiAoXG4gICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAge2xhYmVsfVxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktdXBsb2FkLWRyb3Ake3dpZGUgPyAnIHRva3JpLXVwbG9hZC1kcm9wLXdpZGUnIDogJyd9YH0+XG4gICAgICAgIHtkaXNwbGF5ZWQgPyAoXG4gICAgICAgICAgPGltZyBzcmM9e2Rpc3BsYXllZH0gYWx0PXtgJHtsYWJlbH0gcHJldmlld2B9IC8+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPHNwYW4+e3VwbG9hZGluZyA/ICdVcGxvYWRpbmfigKYnIDogJ0NsaWNrIHRvIHVwbG9hZCBhbiBpbWFnZSd9PC9zcGFuPlxuICAgICAgICApfVxuICAgICAgICA8aW5wdXQgcmVmPXtmaWxlUmVmfSB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiBvbkNoYW5nZT17b25VcGxvYWR9IC8+XG4gICAgICA8L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+e2hpbnR9PC9zcGFuPlxuICAgIDwvbGFiZWw+XG4gIClcbn1cblxuY29uc3QgTk9USUZJQ0FUSU9OX1NFQ1RJT05TID0gW1xuICB7XG4gICAgaWQ6ICdzbXMnLFxuICAgIHRpdGxlOiAnU01TJyxcbiAgICBpbnRybzogJ0xvZ2luIE9UUCBhbmQgb3JkZXIgY29uZmlybWF0aW9uIHRocm91Z2ggTVNHOTEgU01TLicsXG4gICAgZmllbGRzOiBbXG4gICAgICB7IGtleTogJ21zZzkxRW5hYmxlZCcsIHR5cGU6ICdzd2l0Y2gnLCBsYWJlbDogJ0VuYWJsZSBNU0c5MSBTTVMnIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxQXV0aEtleScsXG4gICAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICAgIGxhYmVsOiAnTVNHOTEgQXV0aCBLZXknLFxuICAgICAgICBoaW50OiAnTGVhdmUgYmxhbmsgdG8ga2VlcCB0aGUgY3VycmVudCBrZXknLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFTZW5kZXJJZCcsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdTZW5kZXIgSUQnLFxuICAgICAgICBoaW50OiAnNi1jaGFyYWN0ZXIgRExUIGFwcHJvdmVkIGhlYWRlciwgZS5nLiBUT0tSSUknLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFPdHBUZW1wbGF0ZUlkJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBsYWJlbDogJ0xvZ2luIE9UUCB0ZW1wbGF0ZSBJRCcsXG4gICAgICAgIGhpbnQ6ICdNU0c5MSBUZW1wbGF0ZSBJRCBmcm9tIHRoZSBjb3B5IGljb24sIGUuZy4gNmFhZTk3NDhhMzM3ZDcxODkxMGQzMWYzLiBEbyBub3QgcGFzdGUgdGhlIDE5LWRpZ2l0IEFpcnRlbCBETFQgSUQuJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxT3JkZXJUZW1wbGF0ZUlkJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBsYWJlbDogJ09yZGVyIGNvbmZpcm1hdGlvbiB0ZW1wbGF0ZSBJRCcsXG4gICAgICAgIGhpbnQ6ICdNU0c5MSBUZW1wbGF0ZSBJRCBmcm9tIHRoZSBjb3B5IGljb24sIGUuZy4gNmFhZTk3OGIxZDBkNmExMjE3MGI5M2Y0LiBEbyBub3QgcGFzdGUgdGhlIDE5LWRpZ2l0IEFpcnRlbCBETFQgSUQuJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnd2hhdHNhcHAnLFxuICAgIHRpdGxlOiAnV2hhdHNBcHAnLFxuICAgIGludHJvOiAnU2hhcmVkIG51bWJlciBhbmQgbmFtZXNwYWNlIGZvciBldmVyeSBXaGF0c0FwcCB0ZW1wbGF0ZS4nLFxuICAgIGZpZWxkczogW1xuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwRW5hYmxlZCcsXG4gICAgICAgIHR5cGU6ICdzd2l0Y2gnLFxuICAgICAgICBsYWJlbDogJ0VuYWJsZSBNU0c5MSBXaGF0c0FwcCcsXG4gICAgICAgIGhpbnQ6ICdVc2VkIHdoZW4gU01TIGlzIG9mZiBvciB0aGUgU01TIGdhdGV3YXkgcmVqZWN0cyBhIG1lc3NhZ2UnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcE51bWJlcicsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdXaGF0c0FwcCBidXNpbmVzcyBudW1iZXInLFxuICAgICAgICBoaW50OiAnVGhlIG51bWJlciBvbiB5b3VyIE1TRzkxIFdoYXRzQXBwIGFjY291bnQuIEEgMTAtZGlnaXQgSW5kaWFuIG1vYmlsZSBnZXRzIDkxIGFkZGVkIGF1dG9tYXRpY2FsbHkuJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBOYW1lc3BhY2UnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnV2hhdHNBcHAgdGVtcGxhdGUgbmFtZXNwYWNlJyxcbiAgICAgICAgaGludDogJ1JlcXVpcmVkIGJ5IE1TRzkxLiBEZWxpdmVyeSBhbmQgT1RQIHRlbXBsYXRlcyBhcmUgdG9sZCBhcGFydCBieSB0aGlzIG5hbWVzcGFjZS4nLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICdvdHAnLFxuICAgIHRpdGxlOiAnT1RQIG1lc3NhZ2UnLFxuICAgIGludHJvOiAnTG9naW4gY29kZSBzZW50IHRvIHRoZSBjdXN0b21lciBvbiBXaGF0c0FwcC4nLFxuICAgIGZpZWxkczogW1xuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwT3RwRW5hYmxlZCcsXG4gICAgICAgIHR5cGU6ICdzd2l0Y2gnLFxuICAgICAgICBsYWJlbDogJ1NlbmQgT1RQIFdoYXRzQXBwJyxcbiAgICAgICAgaGludDogJ0xvZ2luIE9UUCB0byB0aGUgY3VzdG9tZXInLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcE90cFRlbXBsYXRlJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBsYWJlbDogJ09UUCB0ZW1wbGF0ZSBuYW1lJyxcbiAgICAgICAgaGludDogJ0FwcHJvdmVkIE1TRzkxIHRlbXBsYXRlIHdpdGggMSBib2R5IHZhcmlhYmxlOiB0aGUgT1RQIGNvZGUnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcE90cEJ1dHRvbicsXG4gICAgICAgIHR5cGU6ICdzd2l0Y2gnLFxuICAgICAgICBsYWJlbDogJ09UUCB0ZW1wbGF0ZSBoYXMgYSBjb3B5LWNvZGUgYnV0dG9uJyxcbiAgICAgICAgaGludDogJ1R1cm4gb24gb25seSBpZiB5b3VyIFdoYXRzQXBwIE9UUCB0ZW1wbGF0ZSBpbmNsdWRlcyB0aGUgY29weS1jb2RlIGJ1dHRvbicsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ29yZGVyJyxcbiAgICB0aXRsZTogJ09yZGVyIG1lc3NhZ2UnLFxuICAgIGludHJvOiAnQ3VzdG9tZXIgY29uZmlybWF0aW9uIGFmdGVyIENPRCBpcyBwbGFjZWQgb3Igb25saW5lIHBheW1lbnQgaXMgY29uZmlybWVkLicsXG4gICAgZmllbGRzOiBbXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBPcmRlckVuYWJsZWQnLFxuICAgICAgICB0eXBlOiAnc3dpdGNoJyxcbiAgICAgICAgbGFiZWw6ICdTZW5kIG9yZGVyIFdoYXRzQXBwJyxcbiAgICAgICAgaGludDogJ0N1c3RvbWVyIGNvbmZpcm1hdGlvbiBhZnRlciBDT0QgaXMgcGxhY2VkIG9yIG9ubGluZSBwYXltZW50IGlzIGNvbmZpcm1lZCcsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwT3JkZXJUZW1wbGF0ZScsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdPcmRlciB0ZW1wbGF0ZSBuYW1lJyxcbiAgICAgICAgaGludDogJ0FwcHJvdmVkIHRlbXBsYXRlIHdpdGggMyBib2R5IHZhcmlhYmxlczogbmFtZSwgb3JkZXIgbnVtYmVyLCBhbW91bnQnLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICdwYXJ0bmVyJyxcbiAgICB0aXRsZTogJ0RlbGl2ZXJ5IHBhcnRuZXIgbWVzc2FnZScsXG4gICAgaW50cm86ICdTZW50IGFmdGVyIENPRCBpcyBwbGFjZWQgb3Igb25saW5lIHBheW1lbnQgaXMgY29uZmlybWVkLCBpZiBhIHBhcnRuZXIgaXMgYXNzaWduZWQuJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcFBhcnRuZXJFbmFibGVkJyxcbiAgICAgICAgdHlwZTogJ3N3aXRjaCcsXG4gICAgICAgIGxhYmVsOiAnU2VuZCBkZWxpdmVyeS1wYXJ0bmVyIFdoYXRzQXBwJyxcbiAgICAgICAgaGludDogJ1NlbnQgYWZ0ZXIgQ09EIGlzIHBsYWNlZCBvciBvbmxpbmUgcGF5bWVudCBpcyBjb25maXJtZWQsIGlmIGEgcGFydG5lciBpcyBhc3NpZ25lZCcsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwUGFydG5lclRlbXBsYXRlJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBsYWJlbDogJ0RlbGl2ZXJ5LXBhcnRuZXIgdGVtcGxhdGUgbmFtZScsXG4gICAgICAgIGhpbnQ6ICdBcHByb3ZlZCB0ZW1wbGF0ZSB0b2tyaWlpX2RlbGl2ZXJ5X2Fzc2lnbmVkIHdpdGggOCBib2R5IHZhcmlhYmxlcyBhbmQgYSBTZWFyY2ggaW4gbWFwIGJ1dHRvbi4gQnV0dG9uIFVSTDogaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9tYXBzL3NlYXJjaC8/YXBpPTEmcXVlcnk9e3sxfX0nLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuXVxuXG5mdW5jdGlvbiBGaWVsZFRpcCh7IHRleHQgfSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgcmVmID0gdXNlUmVmKG51bGwpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBjb25zdCB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgb25Qb2ludGVyRG93bilcbiAgICB9LCAwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBvblBvaW50ZXJEb3duKVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHJldHVybiAoXG4gICAgPHNwYW5cbiAgICAgIGNsYXNzTmFtZT17YHRva3JpLWhpbnQke29wZW4gPyAnIGlzLW9wZW4nIDogJyd9YH1cbiAgICAgIHJlZj17cmVmfVxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICA+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1oaW50LXRyaWdnZXJcIlxuICAgICAgICBhcmlhLWxhYmVsPVwiRmllbGQgaGVscFwiXG4gICAgICAgIGFyaWEtZXhwYW5kZWQ9e29wZW59XG4gICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgIHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA/XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWhpbnQtcG9wXCIgcm9sZT1cInRvb2x0aXBcIj5cbiAgICAgICAge3RleHR9XG4gICAgICA8L3NwYW4+XG4gICAgPC9zcGFuPlxuICApXG59XG5cbmZ1bmN0aW9uIE5vdGlmeUlucHV0KHsgZmllbGQsIHZhbHVlLCBvbkNoYW5nZSB9KSB7XG4gIGNvbnN0IGlzV2hhdHNhcHBOdW1iZXIgPSBmaWVsZC5rZXkgPT09ICdtc2c5MVdoYXRzYXBwTnVtYmVyJ1xuICBjb25zdCBbbG9ja2VkLCBzZXRMb2NrZWRdID0gdXNlU3RhdGUoZmllbGQudHlwZSA9PT0gJ3Bhc3N3b3JkJylcblxuICByZXR1cm4gKFxuICAgIDxpbnB1dFxuICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgIHR5cGU9e2ZpZWxkLnR5cGUgPT09ICdwYXNzd29yZCcgPyAncGFzc3dvcmQnIDogJ3RleHQnfVxuICAgICAgbmFtZT17YHRva3JpLSR7ZmllbGQua2V5fWB9XG4gICAgICB2YWx1ZT17aXNXaGF0c2FwcE51bWJlciA/IFN0cmluZyh2YWx1ZSA/PyAnJykucmVwbGFjZSgvXFxEL2csICcnKSA6IHZhbHVlfVxuICAgICAgcmVhZE9ubHk9e2xvY2tlZH1cbiAgICAgIGlucHV0TW9kZT17aXNXaGF0c2FwcE51bWJlciA/ICdudW1lcmljJyA6IHVuZGVmaW5lZH1cbiAgICAgIG1heExlbmd0aD17aXNXaGF0c2FwcE51bWJlciA/IDE1IDogdW5kZWZpbmVkfVxuICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgIGF1dG9Db3JyZWN0PVwib2ZmXCJcbiAgICAgIHNwZWxsQ2hlY2s9e2ZhbHNlfVxuICAgICAgcGxhY2Vob2xkZXI9e1xuICAgICAgICBmaWVsZC50eXBlID09PSAncGFzc3dvcmQnXG4gICAgICAgICAgPyAnTGVhdmUgYmxhbmsgdG8ga2VlcCB0aGUgY3VycmVudCBrZXknXG4gICAgICAgICAgOiBpc1doYXRzYXBwTnVtYmVyXG4gICAgICAgICAgICA/ICdNU0c5MSBXaGF0c0FwcCBudW1iZXInXG4gICAgICAgICAgICA6IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgb25Gb2N1cz17KCkgPT4gc2V0TG9ja2VkKGZhbHNlKX1cbiAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+XG4gICAgICAgIG9uQ2hhbmdlKFxuICAgICAgICAgIGZpZWxkLmtleSxcbiAgICAgICAgICBpc1doYXRzYXBwTnVtYmVyID8gZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgMTUpIDogZXZlbnQudGFyZ2V0LnZhbHVlLFxuICAgICAgICApXG4gICAgICB9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBOb3RpZmljYXRpb25zRmllbGRzKHsgcGFyYW1zLCBvbkNoYW5nZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1ub3RpZnktZmllbGRzXCI+XG4gICAgICB7Tk9USUZJQ0FUSU9OX1NFQ1RJT05TLm1hcCgoc2VjdGlvbikgPT4gKFxuICAgICAgICA8c2VjdGlvbiBrZXk9e3NlY3Rpb24uaWR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PntzZWN0aW9uLnRpdGxlfTwvaDQ+XG4gICAgICAgICAgPHA+e3NlY3Rpb24uaW50cm99PC9wPlxuICAgICAgICAgIHtzZWN0aW9uLmZpZWxkcy5tYXAoKGZpZWxkKSA9PlxuICAgICAgICAgICAgZmllbGQudHlwZSA9PT0gJ3N3aXRjaCcgPyAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtmaWVsZC5rZXl9IGNsYXNzTmFtZT1cInRva3JpLW5vdGlmeS1zd2l0Y2hcIj5cbiAgICAgICAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICAgICAgICBjaGVja2VkPXtpc0ZsYWdPbihwYXJhbXNbZmllbGQua2V5XSl9XG4gICAgICAgICAgICAgICAgICB0aXRsZT17ZmllbGQubGFiZWx9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IG9uQ2hhbmdlKGZpZWxkLmtleSwgbmV4dCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7ZmllbGQuaGludCA/IDxGaWVsZFRpcCB0ZXh0PXtmaWVsZC5oaW50fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGxhYmVsIGtleT17ZmllbGQua2V5fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1sYWJlbC1saW5lXCI+XG4gICAgICAgICAgICAgICAgICB7ZmllbGQubGFiZWx9XG4gICAgICAgICAgICAgICAgICB7ZmllbGQuaGludCA/IDxGaWVsZFRpcCB0ZXh0PXtmaWVsZC5oaW50fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxOb3RpZnlJbnB1dFxuICAgICAgICAgICAgICAgICAgZmllbGQ9e2ZpZWxkfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtc1tmaWVsZC5rZXldID8/ICcnfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICApLFxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IFNldHRpbmdzRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnZ2VuZXJhbCcpXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBiYW5uZXJGaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IG1vYmlsZUJhbm5lckZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgaGlnaGxpZ2h0RmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbYmFubmVyUHJldmlldywgc2V0QmFubmVyUHJldmlld10gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW21vYmlsZUJhbm5lclByZXZpZXcsIHNldE1vYmlsZUJhbm5lclByZXZpZXddID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtoaWdobGlnaHRQcmV2aWV3LCBzZXRIaWdobGlnaHRQcmV2aWV3XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbYmFubmVyVXBsb2FkaW5nLCBzZXRCYW5uZXJVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFttb2JpbGVCYW5uZXJVcGxvYWRpbmcsIHNldE1vYmlsZUJhbm5lclVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2hpZ2hsaWdodFVwbG9hZGluZywgc2V0SGlnaGxpZ2h0VXBsb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY2F0ZWdvcmllcywgc2V0Q2F0ZWdvcmllc10gPSB1c2VTdGF0ZShbXSlcblxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG4gIGNvbnN0IGFwcFVybCA9IGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICBjb25zdCBzZWxlY3RlZENhdGVnb3J5U2x1Z3MgPSBwYXJzZVNsdWdzKHBhcmFtcy5ob21lRmVhdHVyZWRDYXRlZ29yeVNsdWdzKVxuXG4gIGNvbnN0IGJhbm5lckltYWdlVXJsID0gdXNlTWVtbyhcbiAgICAoKSA9PiByZXNvbHZlSW1hZ2VVcmwocGFyYW1zLmhvbWVCYW5uZXJJbWFnZSwgYXBwVXJsKSxcbiAgICBbYXBwVXJsLCBwYXJhbXMuaG9tZUJhbm5lckltYWdlXSxcbiAgKVxuICBjb25zdCBtb2JpbGVCYW5uZXJJbWFnZVVybCA9IHVzZU1lbW8oXG4gICAgKCkgPT4gcmVzb2x2ZUltYWdlVXJsKHBhcmFtcy5ob21lTW9iaWxlQmFubmVySW1hZ2UsIGFwcFVybCksXG4gICAgW2FwcFVybCwgcGFyYW1zLmhvbWVNb2JpbGVCYW5uZXJJbWFnZV0sXG4gIClcbiAgY29uc3QgaGlnaGxpZ2h0SW1hZ2VVcmwgPSB1c2VNZW1vKFxuICAgICgpID0+IHJlc29sdmVJbWFnZVVybChwYXJhbXMuaG9tZUhpZ2hsaWdodEltYWdlLCBhcHBVcmwpLFxuICAgIFthcHBVcmwsIHBhcmFtcy5ob21lSGlnaGxpZ2h0SW1hZ2VdLFxuICApXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKVxuICAgIGlmIChoYXNoID09PSAnYXBwZWFyYW5jZScpIHtcbiAgICAgIHNldEFjdGl2ZVRhYignY2hhcmdlcycpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKGhhc2ggJiYgVEFCUy5zb21lKCh0YWIpID0+IHRhYi5pZCA9PT0gaGFzaCkpIHtcbiAgICAgIHNldEFjdGl2ZVRhYihoYXNoKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgJycsIGAjJHthY3RpdmVUYWJ9YClcbiAgfSwgW2FjdGl2ZVRhYl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGJhbm5lclByZXZpZXc/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwoYmFubmVyUHJldmlldylcbiAgICB9XG4gIH0sIFtiYW5uZXJQcmV2aWV3XSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9iaWxlQmFubmVyUHJldmlldz8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChtb2JpbGVCYW5uZXJQcmV2aWV3KVxuICAgIH1cbiAgfSwgW21vYmlsZUJhbm5lclByZXZpZXddKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChoaWdobGlnaHRQcmV2aWV3Py5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKGhpZ2hsaWdodFByZXZpZXcpXG4gICAgfVxuICB9LCBbaGlnaGxpZ2h0UHJldmlld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgaWdub3JlID0gZmFsc2VcbiAgICBmZXRjaChgJHthcGlCYXNlVXJsfS9jYXRlZ29yaWVzYClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgaWYgKCFpZ25vcmUpIHNldENhdGVnb3JpZXMoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbXSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0Q2F0ZWdvcmllcyhbXSlcbiAgICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlnbm9yZSA9IHRydWVcbiAgICB9XG4gIH0sIFthcGlCYXNlVXJsXSlcblxuICBjb25zdCB1cGxvYWRJbWFnZSA9IGFzeW5jIChldmVudCwgZmllbGQsIHNldFByZXZpZXcsIHNldEJ1c3ksIGZpbGVSZWYsIHN1Y2Nlc3NNZXNzYWdlKSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgaWYgKCFmaWxlKSByZXR1cm5cblxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZvbGRlcicsICdnZW5lcmFsJylcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIGNvbnN0IGxvY2FsUHJldmlld1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSlcbiAgICBzZXRQcmV2aWV3KGxvY2FsUHJldmlld1VybClcbiAgICBzZXRCdXN5KHRydWUpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS91cGxvYWRgLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIH0pXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdJbWFnZSB1cGxvYWQgZmFpbGVkJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1lZGlhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICBoYW5kbGVDaGFuZ2UoZmllbGQsIG1lZGlhLnBhdGgpXG4gICAgICBzZXRQcmV2aWV3KHJlc29sdmVJbWFnZVVybChtZWRpYS5wYXRoLCBhcHBVcmwpKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogc3VjY2Vzc01lc3NhZ2UsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgdXBsb2FkIGltYWdlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCkgZmlsZVJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgICBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgc2V0dGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKG5vdGljZT8udHlwZSA9PT0gJ3N1Y2Nlc3MnIHx8IHJlc3BvbnNlPy5kYXRhPy5yZWNvcmQpIHtcbiAgICAgICAgICBhZGROb3RpY2Uoe1xuICAgICAgICAgICAgbWVzc2FnZTogJ1NldHRpbmdzIHNhdmVkIHN1Y2Nlc3NmdWxseScsXG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHNldHRpbmdzLiBQbGVhc2UgdHJ5IGFnYWluLicsXG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBmbGV4IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBjbGFzc05hbWU9XCJ0b2tyaS1zZXR0aW5ncy1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLXNldHRpbmdzLXRhYnNcIiBtYj1cInhsXCI+XG4gICAgICAgIHtUQUJTLm1hcCgodGFiKSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAga2V5PXt0YWIuaWR9XG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17YHRva3JpLXNldHRpbmdzLXRhYiR7YWN0aXZlVGFiID09PSB0YWIuaWQgPyAnIGlzLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKHRhYi5pZCl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3RhYi5sYWJlbH1cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKSl9XG4gICAgICA8L0JveD5cblxuICAgICAgPERyYXdlckNvbnRlbnQ+XG4gICAgICAgIHtUQUJTLm1hcCgodGFiKSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHJlc291cmNlLmVkaXRQcm9wZXJ0aWVzLmZpbHRlcigocHJvcGVydHkpID0+XG4gICAgICAgICAgICB0YWIuZmllbGRzLmluY2x1ZGVzKHByb3BlcnR5LnByb3BlcnR5UGF0aCksXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAga2V5PXt0YWIuaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLXNldHRpbmdzLXBhbmVsXCJcbiAgICAgICAgICAgICAgcD1cInhsXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogYWN0aXZlVGFiID09PSB0YWIuaWQgPyAnYmxvY2snIDogJ25vbmUnIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxINCBtYj1cInNtXCI+e3RhYi5sYWJlbH08L0g0PlxuICAgICAgICAgICAgICA8VGV4dCBtYj1cInhsXCIgb3BhY2l0eT17MC43NX0+XG4gICAgICAgICAgICAgICAge3RhYi5pZCA9PT0gJ2NoYXJnZXMnXG4gICAgICAgICAgICAgICAgICA/ICdTZXQgY29weSBhbmQgcHJpY2VzIGZvciBNb3JuaW5nIGFuZCA5MC1NaW51dGUgZGVsaXZlcnkuIEhhbmRsaW5nIGZlZSBpcyBhZGRlZCB0byBldmVyeSBvcmRlci4nXG4gICAgICAgICAgICAgICAgICA6IHRhYi5pZCA9PT0gJ2hvbWVwYWdlJ1xuICAgICAgICAgICAgICAgICAgICA/ICdUaGVzZSBpbWFnZXMgYW5kIGNhdGVnb3JpZXMgYXBwZWFyIG9uIHRoZSB3ZWJzaXRlIGhvbWVwYWdlLiBDbGljayBTYXZlIGNoYW5nZXMgYWZ0ZXIgdXBsb2FkaW5nLidcbiAgICAgICAgICAgICAgICAgICAgOiB0YWIuaWQgPT09ICdub3RpZmljYXRpb25zJ1xuICAgICAgICAgICAgICAgICAgICAgID8gJ0F1dGgga2V5LCBXaGF0c0FwcCBudW1iZXIsIGFuZCBuYW1lc3BhY2UgYXJlIHNoYXJlZC4gRWFjaCB0ZW1wbGF0ZSBoYXMgaXRzIG93biBuYW1lIGFuZCBvbi9vZmYgdG9nZ2xlLiBPcmRlciBhbmQgcGFydG5lciBtZXNzYWdlcyBzZW5kIG9ubHkgYWZ0ZXIgQ09EIGlzIHBsYWNlZCBvciB0aGUgb25saW5lIHBheW1lbnQgaXMgY29uZmlybWVkLidcbiAgICAgICAgICAgICAgICAgICAgICA6ICdVcGRhdGUgeW91ciBzdG9yZSBzZXR0aW5ncyBhbmQgY2xpY2sgU2F2ZSBjaGFuZ2VzIGJlbG93Lid9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAge3RhYi5pZCA9PT0gJ2NoYXJnZXMnID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hhcmdlcy1maWVsZHNcIj5cbiAgICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoND5Nb3JuaW5nIGRlbGl2ZXJ5PC9oND5cbiAgICAgICAgICAgICAgICAgICAgPHA+U2hvd24gYXQgY2hlY2tvdXQgd2hlbiB0aGlzIG9wdGlvbiBpcyBvbiBmb3IgdGhlIHBpbmNvZGUuPC9wPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgVGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/Lm1vcm5pbmdEZWxpdmVyeVRpdGxlID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdtb3JuaW5nRGVsaXZlcnlUaXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkZsYXdsZXNzIE1vcm5pbmcgRGVsaXZlcnlcIlxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICBTdWJ0aXRsZVxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8ubW9ybmluZ0RlbGl2ZXJ5U3VidGl0bGUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdEZWxpdmVyeVN1YnRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRnJlc2huZXNzIEd1YXJhbnRlZWRcIlxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIFNoaXBwaW5nIGZlZSAo4oK5KVxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/Lm1vcm5pbmdTaGlwcGluZ0ZlZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdtb3JuaW5nU2hpcHBpbmdGZWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIEZyZWUgYWJvdmUgKOKCuSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5tb3JuaW5nRnJlZUFib3ZlID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdGcmVlQWJvdmUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj4wIG1lYW5zIG5vIGZyZWUgZGVsaXZlcnk8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgICAgICAgICAgICA8aDQ+OTAtTWludXRlIGRlbGl2ZXJ5PC9oND5cbiAgICAgICAgICAgICAgICAgICAgPHA+U2hvd24gYXQgY2hlY2tvdXQuIERpc2FibGVkIHBpbmNvZGVzIHN0aWxsIHNlZSB0aGlzIGFzIGNvbWluZyBzb29uLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIFRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5leHByZXNzRGVsaXZlcnlUaXRsZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc0RlbGl2ZXJ5VGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTYW1lIGRheVwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIFN1YnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5leHByZXNzRGVsaXZlcnlTdWJ0aXRsZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc0RlbGl2ZXJ5U3VidGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJPbi1EZW1hbmQgTHV4dXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBTaGlwcGluZyBmZWUgKOKCuSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5leHByZXNzU2hpcHBpbmdGZWUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc1NoaXBwaW5nRmVlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBGcmVlIGFib3ZlICjigrkpXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8uZXhwcmVzc0ZyZWVBYm92ZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdleHByZXNzRnJlZUFib3ZlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+MCBtZWFucyBubyBmcmVlIGRlbGl2ZXJ5PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbCB0b2tyaS1jaGFyZ2VzLWhhbmRsaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgIEhhbmRsaW5nIGNoYXJnZSAo4oK5KVxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/LmhhbmRsaW5nRmVlID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnaGFuZGxpbmdGZWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+Q2FydCBoYW5kbGluZyBmZWUgYWRkZWQgdG8gZXZlcnkgb3JkZXI8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApIDogdGFiLmlkID09PSAnaG9tZXBhZ2UnID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktaG9tZXBhZ2UtZmllbGRzXCI+XG4gICAgICAgICAgICAgICAgICA8SW1hZ2VVcGxvYWRlclxuICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIkhvbWUgYmFubmVyIGltYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgaGludD1cIkRlc2t0b3AgLyBsYXJnZS1zY3JlZW4gaGVybyBiYW5uZXIuIEpQRywgUE5HLCBHSUYsIG9yIFdlYlAgdXAgdG8gNU1CLlwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtiYW5uZXJJbWFnZVVybH1cbiAgICAgICAgICAgICAgICAgICAgcHJldmlld1VybD17YmFubmVyUHJldmlld31cbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkaW5nPXtiYW5uZXJVcGxvYWRpbmd9XG4gICAgICAgICAgICAgICAgICAgIGZpbGVSZWY9e2Jhbm5lckZpbGVSZWZ9XG4gICAgICAgICAgICAgICAgICAgIHdpZGVcbiAgICAgICAgICAgICAgICAgICAgb25VcGxvYWQ9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICB1cGxvYWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2hvbWVCYW5uZXJJbWFnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRCYW5uZXJQcmV2aWV3LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0QmFubmVyVXBsb2FkaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYmFubmVyRmlsZVJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICdCYW5uZXIgaW1hZ2UgdXBsb2FkZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDxJbWFnZVVwbG9hZGVyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPVwiSG9tZSBtb2JpbGUgYmFubmVyIGltYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgaGludD1cIlNob3duIG9uIHBob25lcy4gSWYgZW1wdHksIHRoZSBkZXNrdG9wIGJhbm5lciBpcyB1c2VkIGluc3RlYWQuXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e21vYmlsZUJhbm5lckltYWdlVXJsfVxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3VXJsPXttb2JpbGVCYW5uZXJQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRpbmc9e21vYmlsZUJhbm5lclVwbG9hZGluZ31cbiAgICAgICAgICAgICAgICAgICAgZmlsZVJlZj17bW9iaWxlQmFubmVyRmlsZVJlZn1cbiAgICAgICAgICAgICAgICAgICAgb25VcGxvYWQ9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICB1cGxvYWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2hvbWVNb2JpbGVCYW5uZXJJbWFnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRNb2JpbGVCYW5uZXJQcmV2aWV3LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0TW9iaWxlQmFubmVyVXBsb2FkaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9iaWxlQmFubmVyRmlsZVJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICdNb2JpbGUgYmFubmVyIGltYWdlIHVwbG9hZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8SW1hZ2VVcGxvYWRlclxuICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIkZydWl0IGhpZ2hsaWdodCBpbWFnZVwiXG4gICAgICAgICAgICAgICAgICAgIGhpbnQ9XCJSZXBsYWNlcyB0aGUga2l3aSBpbWFnZSBpbiDigJxUaGUgU21hbGwgRnJ1aXQgd2l0aCBhIEJpZyBQdW5jaOKAnSBvbiB0aGUgd2Vic2l0ZS5cIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17aGlnaGxpZ2h0SW1hZ2VVcmx9XG4gICAgICAgICAgICAgICAgICAgIHByZXZpZXdVcmw9e2hpZ2hsaWdodFByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZGluZz17aGlnaGxpZ2h0VXBsb2FkaW5nfVxuICAgICAgICAgICAgICAgICAgICBmaWxlUmVmPXtoaWdobGlnaHRGaWxlUmVmfVxuICAgICAgICAgICAgICAgICAgICBvblVwbG9hZD17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIHVwbG9hZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaG9tZUhpZ2hsaWdodEltYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEhpZ2hsaWdodFByZXZpZXcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRIaWdobGlnaHRVcGxvYWRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRGaWxlUmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0hpZ2hsaWdodCBpbWFnZSB1cGxvYWRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICBIb21lcGFnZSBjYXRlZ29yaWVzXG4gICAgICAgICAgICAgICAgICAgIDxTZWFyY2hhYmxlTXVsdGlTZWxlY3RcbiAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zPXtjYXRlZ29yaWVzLm1hcCgoaXRlbSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLnNsdWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogaXRlbS5sYWJlbCB8fCBpdGVtLnRpdGxlIHx8IGl0ZW0uc2x1ZyxcbiAgICAgICAgICAgICAgICAgICAgICB9KSl9XG4gICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkQ2F0ZWdvcnlTbHVnc31cbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHNsdWdzKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlQ2hhbmdlKCdob21lRmVhdHVyZWRDYXRlZ29yeVNsdWdzJywgSlNPTi5zdHJpbmdpZnkoc2x1Z3MpKVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBhbmQgc2VsZWN0IGNhdGVnb3JpZXNcIlxuICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIGNhdGVnb3JpZXNcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgVGhlc2UgY2F0ZWdvcmllcyBsb2FkIG9uIHRoZSB3ZWJzaXRlIGFmdGVyIHRoZSBmcnVpdCBoaWdobGlnaHQgc2VjdGlvbiwgb25lIGF0XG4gICAgICAgICAgICAgICAgICAgICAgYSB0aW1lIGFzIHRoZSB2aXNpdG9yIHNjcm9sbHMuXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiB0YWIuaWQgPT09ICdub3RpZmljYXRpb25zJyA/IChcbiAgICAgICAgICAgICAgICA8Tm90aWZpY2F0aW9uc0ZpZWxkcyBwYXJhbXM9e3BhcmFtc30gb25DaGFuZ2U9e2hhbmRsZUNoYW5nZX0gLz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLm1hcCgocHJvcGVydHkpID0+IChcbiAgICAgICAgICAgICAgICAgIDxCYXNlUHJvcGVydHlDb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAga2V5PXtwcm9wZXJ0eS5wcm9wZXJ0eVBhdGh9XG4gICAgICAgICAgICAgICAgICAgIHdoZXJlPVwiZWRpdFwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5PXtwcm9wZXJ0eX1cbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICAgICAgICAgICAgICByZWNvcmQ9e3JlY29yZH1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgIClcbiAgICAgICAgfSl9XG4gICAgICA8L0RyYXdlckNvbnRlbnQ+XG5cbiAgICAgIDxEcmF3ZXJGb290ZXI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgU2F2ZSBjaGFuZ2VzXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9EcmF3ZXJGb290ZXI+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgU2V0dGluZ3NFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuXG5jb25zdCB3aXRob3V0VHJhaWxpbmdTbGFzaCA9ICh2YWx1ZSkgPT4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9cXC8rJC8sICcnKVxuXG5mdW5jdGlvbiBwYXJzZVNsdWdzKHJhdykge1xuICBpZiAoIXJhdykgcmV0dXJuIFtdXG4gIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbSkudHJpbSgpKS5maWx0ZXIoQm9vbGVhbilcbiAgaWYgKHR5cGVvZiByYXcgPT09ICdzdHJpbmcnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyc2VkKSkgcmV0dXJuIHBhcnNlU2x1Z3MocGFyc2VkKVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gaWdub3JlXG4gICAgfVxuICAgIHJldHVybiByYXdcbiAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAubWFwKChpdGVtKSA9PiBpdGVtLnRyaW0oKSlcbiAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgfVxuICByZXR1cm4gW11cbn1cblxuZnVuY3Rpb24gcGFkKG51bSkge1xuICByZXR1cm4gU3RyaW5nKG51bSkucGFkU3RhcnQoMiwgJzAnKVxufVxuXG5mdW5jdGlvbiB0b0RhdGV0aW1lVmFsdWUodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcbiAgaWYgKE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiAnJ1xuICByZXR1cm4gYCR7ZGF0ZS5nZXRGdWxsWWVhcigpfS0ke3BhZChkYXRlLmdldE1vbnRoKCkgKyAxKX0tJHtwYWQoZGF0ZS5nZXREYXRlKCkpfVQke3BhZChkYXRlLmdldEhvdXJzKCkpfToke3BhZChkYXRlLmdldE1pbnV0ZXMoKSl9YFxufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRldGltZUxhYmVsKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gJydcbiAgcmV0dXJuIGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2VuLUlOJywge1xuICAgIGRheTogJzItZGlnaXQnLFxuICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgbWludXRlOiAnMi1kaWdpdCcsXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHVzZUFuY2hvcmVkTWVudShvcGVuKSB7XG4gIGNvbnN0IHdyYXBSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgW29wZW5VcCwgc2V0T3BlblVwXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBub2RlID0gd3JhcFJlZi5jdXJyZW50XG4gICAgICBpZiAoIW5vZGUpIHJldHVyblxuICAgICAgY29uc3QgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IHNwYWNlQmVsb3cgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSByZWN0LmJvdHRvbVxuICAgICAgc2V0T3BlblVwKHNwYWNlQmVsb3cgPCAyNDAgJiYgcmVjdC50b3AgPiBzcGFjZUJlbG93KVxuICAgIH1cblxuICAgIHVwZGF0ZSgpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdXBkYXRlLCB0cnVlKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHVwZGF0ZSwgdHJ1ZSlcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICByZXR1cm4geyB3cmFwUmVmLCBvcGVuVXAgfVxufVxuXG5mdW5jdGlvbiBDaG9pY2VDYXJkKHsgc2VsZWN0ZWQsIHRpdGxlLCBoaW50LCBvbkNsaWNrIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YHRva3JpLWNob2ljZS1jYXJkJHtzZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgPlxuICAgICAgPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+XG4gICAgICA8c3Bhbj57aGludH08L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gQW5jaG9yZWRTZWxlY3QoeyB2YWx1ZSwgb3B0aW9ucywgb25DaGFuZ2UsIHBsYWNlaG9sZGVyIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHsgd3JhcFJlZiwgb3BlblVwIH0gPSB1c2VBbmNob3JlZE1lbnUob3BlbilcbiAgY29uc3Qgc2VsZWN0ZWQgPSBvcHRpb25zLmZpbmQoKGl0ZW0pID0+IGl0ZW0udmFsdWUgPT09IHZhbHVlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gIH0sIFt3cmFwUmVmXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3RcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY29udHJvbFwiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KX0+XG4gICAgICAgIDxzcGFuPntzZWxlY3RlZD8ubGFiZWwgfHwgcGxhY2Vob2xkZXJ9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jYXJldFwiPntvcGVuID8gJ+KWtCcgOiAn4pa+J308L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW1lbnUke29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAge29wdGlvbnMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZX1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW9wdGlvbiR7aXRlbS52YWx1ZSA9PT0gdmFsdWUgPyAnIGlzLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gU2VhcmNoYWJsZU11bHRpU2VsZWN0KHsgb3B0aW9ucywgc2VsZWN0ZWQsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciwgc2VhcmNoUGxhY2Vob2xkZXIgfSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gIH0sIFt3cmFwUmVmXSlcblxuICBjb25zdCBzZWxlY3RlZFNldCA9IHVzZU1lbW8oKCkgPT4gbmV3IFNldChzZWxlY3RlZCksIFtzZWxlY3RlZF0pXG4gIGNvbnN0IHNlbGVjdGVkT3B0aW9ucyA9IG9wdGlvbnMuZmlsdGVyKChpdGVtKSA9PiBzZWxlY3RlZFNldC5oYXMoaXRlbS52YWx1ZSkpXG4gIGNvbnN0IGZpbHRlcmVkID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+XG4gICAgYCR7aXRlbS5sYWJlbH0gJHtpdGVtLnZhbHVlfWAudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKSksXG4gIClcblxuICBjb25zdCB0b2dnbGUgPSAodmFsdWUpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRTZXQuaGFzKHZhbHVlKSkgb25DaGFuZ2Uoc2VsZWN0ZWQuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSB2YWx1ZSkpXG4gICAgZWxzZSBvbkNoYW5nZShbLi4uc2VsZWN0ZWQsIHZhbHVlXSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdFwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jb250cm9sXCIgb25DbGljaz17KCkgPT4gc2V0T3BlbigodmFsdWUpID0+ICF2YWx1ZSl9PlxuICAgICAgICB7c2VsZWN0ZWRPcHRpb25zLmxlbmd0aCA/IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jaGlwc1wiPlxuICAgICAgICAgICAge3NlbGVjdGVkT3B0aW9ucy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgPHNwYW4ga2V5PXtpdGVtLnZhbHVlfSBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jaGlwXCI+XG4gICAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgIHJvbGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9ezB9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlKGl0ZW0udmFsdWUpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIMOXXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtcGxhY2Vob2xkZXJcIj57cGxhY2Vob2xkZXJ9PC9zcGFuPlxuICAgICAgICApfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jYXJldFwiPntvcGVuID8gJ+KWtCcgOiAn4pa+J308L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW1lbnUke29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdmFsdWU9e3F1ZXJ5fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0UXVlcnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtzZWFyY2hQbGFjZWhvbGRlcn1cbiAgICAgICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1saXN0XCI+XG4gICAgICAgICAgICB7ZmlsdGVyZWQubGVuZ3RoID8gKFxuICAgICAgICAgICAgICBmaWx0ZXJlZC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGVja2VkID0gc2VsZWN0ZWRTZXQuaGFzKGl0ZW0udmFsdWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBrZXk9e2l0ZW0udmFsdWV9IGNsYXNzTmFtZT17YHRva3JpLW11bHRpc2VsZWN0LW9wdGlvbiR7Y2hlY2tlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXtjaGVja2VkfSBvbkNoYW5nZT17KCkgPT4gdG9nZ2xlKGl0ZW0udmFsdWUpfSAvPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtZW1wdHlcIj5ObyBtYXRjaGVzPC9kaXY+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIERhdGVUaW1lUGlja2VyKHsgdmFsdWUsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciB9KSB7XG4gIGNvbnN0IHBhcnNlZCA9IHZhbHVlID8gbmV3IERhdGUodmFsdWUpIDogbnVsbFxuICBjb25zdCB2YWxpZCA9IHBhcnNlZCAmJiAhTnVtYmVyLmlzTmFOKHBhcnNlZC5nZXRUaW1lKCkpID8gcGFyc2VkIDogbnVsbFxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW21vbnRoRGF0ZSwgc2V0TW9udGhEYXRlXSA9IHVzZVN0YXRlKHZhbGlkIHx8IG5ldyBEYXRlKCkpXG4gIGNvbnN0IFtob3Vycywgc2V0SG91cnNdID0gdXNlU3RhdGUodmFsaWQgPyBwYWQodmFsaWQuZ2V0SG91cnMoKSkgOiAnMDAnKVxuICBjb25zdCBbbWludXRlcywgc2V0TWludXRlc10gPSB1c2VTdGF0ZSh2YWxpZCA/IHBhZCh2YWxpZC5nZXRNaW51dGVzKCkpIDogJzAwJylcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gIH0sIFt3cmFwUmVmXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghdmFsaWQpIHJldHVyblxuICAgIHNldE1vbnRoRGF0ZSh2YWxpZClcbiAgICBzZXRIb3VycyhwYWQodmFsaWQuZ2V0SG91cnMoKSkpXG4gICAgc2V0TWludXRlcyhwYWQodmFsaWQuZ2V0TWludXRlcygpKSlcbiAgfSwgW3ZhbHVlXSlcblxuICBjb25zdCB5ZWFyID0gbW9udGhEYXRlLmdldEZ1bGxZZWFyKClcbiAgY29uc3QgbW9udGggPSBtb250aERhdGUuZ2V0TW9udGgoKVxuICBjb25zdCBmaXJzdERheSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxKS5nZXREYXkoKVxuICBjb25zdCB0b3RhbERheXMgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLmdldERhdGUoKVxuICBjb25zdCBjZWxscyA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZmlyc3REYXk7IGkgKz0gMSkgY2VsbHMucHVzaChudWxsKVxuICBmb3IgKGxldCBkYXkgPSAxOyBkYXkgPD0gdG90YWxEYXlzOyBkYXkgKz0gMSkgY2VsbHMucHVzaChkYXkpXG5cbiAgY29uc3QgYXBwbHkgPSAoZGF5LCBuZXh0SG91cnMgPSBob3VycywgbmV4dE1pbnV0ZXMgPSBtaW51dGVzKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IGAke3llYXJ9LSR7cGFkKG1vbnRoICsgMSl9LSR7cGFkKGRheSl9VCR7cGFkKE51bWJlcihuZXh0SG91cnMpIHx8IDApfToke3BhZChOdW1iZXIobmV4dE1pbnV0ZXMpIHx8IDApfWBcbiAgICBvbkNoYW5nZShuZXh0KVxuICB9XG5cbiAgY29uc3Qgc2VsZWN0ZWREYXkgPVxuICAgIHZhbGlkICYmIHZhbGlkLmdldEZ1bGxZZWFyKCkgPT09IHllYXIgJiYgdmFsaWQuZ2V0TW9udGgoKSA9PT0gbW9udGggPyB2YWxpZC5nZXREYXRlKCkgOiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXJcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1jb250cm9sXCIgb25DbGljaz17KCkgPT4gc2V0T3BlbigoY3VycmVudCkgPT4gIWN1cnJlbnQpfT5cbiAgICAgICAgPHNwYW4+e3ZhbGlkID8gZm9ybWF0RGF0ZXRpbWVMYWJlbCh2YWxpZCkgOiBwbGFjZWhvbGRlcn08L3NwYW4+XG4gICAgICAgIDxzcGFuPvCfk4U8L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLWRhdGVwaWNrZXItcG9wJHtvcGVuVXAgPyAnIGlzLXVwJyA6ICcnfWB9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1uYXZcIj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE1vbnRoRGF0ZShuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpKX0+XG4gICAgICAgICAgICAgIOKAuVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8c3Ryb25nPlxuICAgICAgICAgICAgICB7bW9udGhEYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgbW9udGg6ICdsb25nJywgeWVhcjogJ251bWVyaWMnIH0pfVxuICAgICAgICAgICAgPC9zdHJvbmc+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb250aERhdGUobmV3IERhdGUoeWVhciwgbW9udGggKyAxLCAxKSl9PlxuICAgICAgICAgICAgICDigLpcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci13ZWVrXCI+XG4gICAgICAgICAgICB7WydTdScsICdNbycsICdUdScsICdXZScsICdUaCcsICdGcicsICdTYSddLm1hcCgobGFiZWwpID0+IChcbiAgICAgICAgICAgICAgPHNwYW4ga2V5PXtsYWJlbH0+e2xhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1ncmlkXCI+XG4gICAgICAgICAgICB7Y2VsbHMubWFwKChkYXksIGluZGV4KSA9PlxuICAgICAgICAgICAgICBkYXkgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAga2V5PXtgJHt5ZWFyfS0ke21vbnRofS0ke2RheX1gfVxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NlbGVjdGVkRGF5ID09PSBkYXkgPyAnaXMtc2VsZWN0ZWQnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBhcHBseShkYXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtkYXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPHNwYW4ga2V5PXtgZW1wdHktJHtpbmRleH1gfSAvPlxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItdGltZVwiPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICBIb3VyXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIG1heD1cIjIzXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17aG91cnN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHBhZChNYXRoLm1pbigyMywgTWF0aC5tYXgoMCwgTnVtYmVyKGV2ZW50LnRhcmdldC52YWx1ZSkgfHwgMCkpKVxuICAgICAgICAgICAgICAgICAgc2V0SG91cnMobmV4dClcbiAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZERheSkgYXBwbHkoc2VsZWN0ZWREYXksIG5leHQsIG1pbnV0ZXMpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgIE1pbnV0ZVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICBtYXg9XCI1OVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e21pbnV0ZXN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHBhZChNYXRoLm1pbig1OSwgTWF0aC5tYXgoMCwgTnVtYmVyKGV2ZW50LnRhcmdldC52YWx1ZSkgfHwgMCkpKVxuICAgICAgICAgICAgICAgICAgc2V0TWludXRlcyhuZXh0KVxuICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkRGF5KSBhcHBseShzZWxlY3RlZERheSwgaG91cnMsIG5leHQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWNsZWFyXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKCcnKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIENsZWFyXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBDb3Vwb25FZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGN1c3RvbSA9IHJlc291cmNlPy5vcHRpb25zPy5jdXN0b20gfHwge31cbiAgY29uc3QgYXBpQmFzZVVybCA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcGlCYXNlVXJsIHx8ICcvYXBpL3YxJylcblxuICBjb25zdCBbcHJvZHVjdHMsIHNldFByb2R1Y3RzXSA9IHVzZVN0YXRlKFtdKVxuICBjb25zdCBbY2F0ZWdvcmllcywgc2V0Q2F0ZWdvcmllc10gPSB1c2VTdGF0ZShbXSlcblxuICBjb25zdCBzZWxlY3RlZFNsdWdzID0gcGFyc2VTbHVncyhwYXJhbXMudGFyZ2V0U2x1Z3MpXG4gIGNvbnN0IHRhcmdldFR5cGUgPSBwYXJhbXMudGFyZ2V0VHlwZSB8fCAnYWxsJ1xuICBjb25zdCBhcHBseU9uID0gcGFyYW1zLmFwcGx5T24gfHwgJ2NhcnQnXG4gIGNvbnN0IHVzYWdlVHlwZSA9IHBhcmFtcy51c2FnZVR5cGUgfHwgJ3VubGltaXRlZCdcbiAgY29uc3QgY291cG9uVHlwZSA9IHBhcmFtcy50eXBlIHx8ICdwZXJjZW50J1xuICBjb25zdCBpc0FjdGl2ZSA9IHBhcmFtcy5pc0FjdGl2ZSAhPT0gZmFsc2UgJiYgcGFyYW1zLmlzQWN0aXZlICE9PSAnZmFsc2UnXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgaWdub3JlID0gZmFsc2VcblxuICAgIGFzeW5jIGZ1bmN0aW9uIGxvYWRDYXRhbG9nKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2F0ZWdvcnlEYXRhID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vY2F0ZWdvcmllc2ApLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAgIGNvbnN0IGFsbFByb2R1Y3RzID0gW11cbiAgICAgICAgbGV0IHBhZ2UgPSAxXG4gICAgICAgIGxldCBoYXNNb3JlID0gdHJ1ZVxuICAgICAgICB3aGlsZSAoaGFzTW9yZSAmJiBwYWdlIDw9IDIwKSB7XG4gICAgICAgICAgY29uc3QgcHJvZHVjdERhdGEgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9wcm9kdWN0cz9wYWdlPSR7cGFnZX0mbGltaXQ9MTAwYCkudGhlbigocmVzcG9uc2UpID0+XG4gICAgICAgICAgICByZXNwb25zZS5qc29uKCksXG4gICAgICAgICAgKVxuICAgICAgICAgIGFsbFByb2R1Y3RzLnB1c2goLi4uKHByb2R1Y3REYXRhLnByb2R1Y3RzIHx8IFtdKSlcbiAgICAgICAgICBoYXNNb3JlID0gQm9vbGVhbihwcm9kdWN0RGF0YS5oYXNNb3JlKVxuICAgICAgICAgIHBhZ2UgKz0gMVxuICAgICAgICB9XG4gICAgICAgIGlmIChpZ25vcmUpIHJldHVyblxuICAgICAgICBzZXRQcm9kdWN0cyhhbGxQcm9kdWN0cylcbiAgICAgICAgc2V0Q2F0ZWdvcmllcyhBcnJheS5pc0FycmF5KGNhdGVnb3J5RGF0YSkgPyBjYXRlZ29yeURhdGEgOiBbXSlcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBpZiAoIWlnbm9yZSkge1xuICAgICAgICAgIHNldFByb2R1Y3RzKFtdKVxuICAgICAgICAgIHNldENhdGVnb3JpZXMoW10pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkQ2F0YWxvZygpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlnbm9yZSA9IHRydWVcbiAgICB9XG4gIH0sIFthcGlCYXNlVXJsXSlcblxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCBzZXRTZWxlY3RlZFNsdWdzID0gKG5leHQpID0+IHNldEZpZWxkKCd0YXJnZXRTbHVncycsIEpTT04uc3RyaW5naWZ5KG5leHQpKVxuXG4gIGNvbnN0IHByb2R1Y3RPcHRpb25zID0gdXNlTWVtbyhcbiAgICAoKSA9PiBwcm9kdWN0cy5tYXAoKGl0ZW0pID0+ICh7IHZhbHVlOiBpdGVtLnNsdWcsIGxhYmVsOiBpdGVtLm5hbWUgfSkpLFxuICAgIFtwcm9kdWN0c10sXG4gIClcbiAgY29uc3QgY2F0ZWdvcnlPcHRpb25zID0gdXNlTWVtbyhcbiAgICAoKSA9PiBjYXRlZ29yaWVzLm1hcCgoaXRlbSkgPT4gKHsgdmFsdWU6IGl0ZW0uc2x1ZywgbGFiZWw6IGl0ZW0ubGFiZWwgfSkpLFxuICAgIFtjYXRlZ29yaWVzXSxcbiAgKVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBjb3Vwb24nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdXBvbiBzYXZlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSBjb3Vwb24uIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPkNyZWF0ZSBhIHN0b3JlIGNvdXBvbjwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5cbiAgICAgICAgICBTZXQgd2hvIGdldHMgdGhlIGRpc2NvdW50LCB3aGVyZSBpdCBhcHBsaWVzLCBhbmQgaG93IG1hbnkgdGltZXMgaXQgY2FuIGJlIHVzZWQuXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkNvdXBvbiBjb2RlPC9oND5cbiAgICAgICAgICA8cD5DdXN0b21lcnMgd2lsbCB0eXBlIHRoaXMgYXQgY2hlY2tvdXQgb24gdGhlIHdlYnNpdGUgYW5kIGFwcC48L3A+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXQgdG9rcmktY291cG9uLWNvZGVcIlxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jb2RlIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2NvZGUnLCBldmVudC50YXJnZXQudmFsdWUudG9VcHBlckNhc2UoKSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIldFTENPTUUxMFwiXG4gICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10b2dnbGVcIj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICBjaGVja2VkPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2lzQWN0aXZlJywgZXZlbnQudGFyZ2V0LmNoZWNrZWQpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIENvdXBvbiBpcyBhY3RpdmVcbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+RGlzY291bnQ8L2g0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hvaWNlLXJvd1wiPlxuICAgICAgICAgICAgPENob2ljZUNhcmRcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9e2NvdXBvblR5cGUgPT09ICdwZXJjZW50J31cbiAgICAgICAgICAgICAgdGl0bGU9XCJQZXJjZW50IG9mZlwiXG4gICAgICAgICAgICAgIGhpbnQ9XCJlLmcuIDEwJSBvZmZcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgndHlwZScsICdwZXJjZW50Jyl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPENob2ljZUNhcmRcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9e2NvdXBvblR5cGUgPT09ICdmbGF0J31cbiAgICAgICAgICAgICAgdGl0bGU9XCJGbGF0IGFtb3VudFwiXG4gICAgICAgICAgICAgIGhpbnQ9XCJlLmcuIOKCuTUwIG9mZlwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCd0eXBlJywgJ2ZsYXQnKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAge2NvdXBvblR5cGUgPT09ICdwZXJjZW50JyA/ICdQZXJjZW50IHZhbHVlJyA6ICdBbW91bnQgKOKCuSknfVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnZhbHVlID8/ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgndmFsdWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBNaW4gY2FydCAo4oK5KVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm1pbkNhcnQgPz8gJyd9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ21pbkNhcnQnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBNYXggZGlzY291bnQgKOKCuSlcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5tYXhEaXNjb3VudCA/PyAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbWF4RGlzY291bnQnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTm8gY2FwXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+QXBwbHkgZGlzY291bnQgb248L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNob2ljZS1yb3dcIj5cbiAgICAgICAgICA8Q2hvaWNlQ2FyZFxuICAgICAgICAgICAgc2VsZWN0ZWQ9e2FwcGx5T24gPT09ICdjYXJ0J31cbiAgICAgICAgICAgIHRpdGxlPVwiQ2FydCB0b3RhbFwiXG4gICAgICAgICAgICBoaW50PVwiUmVkdWNlIHRoZSBpdGVtcyBzdWJ0b3RhbFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgnYXBwbHlPbicsICdjYXJ0Jyl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8Q2hvaWNlQ2FyZFxuICAgICAgICAgICAgc2VsZWN0ZWQ9e2FwcGx5T24gPT09ICdzaGlwcGluZyd9XG4gICAgICAgICAgICB0aXRsZT1cIlNoaXBwaW5nIGZlZVwiXG4gICAgICAgICAgICBoaW50PVwiUmVkdWNlIGRlbGl2ZXJ5IGNoYXJnZXNcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ2FwcGx5T24nLCAnc2hpcHBpbmcnKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PldobyBjYW4gZ2V0IHRoaXMgZGlzY291bnQ8L2g0PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgQXBwbHkgdG9cbiAgICAgICAgICA8QW5jaG9yZWRTZWxlY3RcbiAgICAgICAgICAgIHZhbHVlPXt0YXJnZXRUeXBlfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJDaG9vc2Ugd2hvIHRoaXMgY291cG9uIGFwcGxpZXMgdG9cIlxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiB7XG4gICAgICAgICAgICAgIHNldEZpZWxkKCd0YXJnZXRUeXBlJywgbmV4dClcbiAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRTbHVncyhbXSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvcHRpb25zPXtbXG4gICAgICAgICAgICAgIHsgdmFsdWU6ICdhbGwnLCBsYWJlbDogJ0FsbCBwcm9kdWN0cycgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ3Byb2R1Y3RzJywgbGFiZWw6ICdTZWxlY3RlZCBwcm9kdWN0cycgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ2NhdGVnb3JpZXMnLCBsYWJlbDogJ1NlbGVjdGVkIGNhdGVnb3JpZXMnIH0sXG4gICAgICAgICAgICBdfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG5cbiAgICAgICAge3RhcmdldFR5cGUgPT09ICdwcm9kdWN0cycgPyAoXG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUHJvZHVjdHNcbiAgICAgICAgICAgIDxTZWFyY2hhYmxlTXVsdGlTZWxlY3RcbiAgICAgICAgICAgICAgb3B0aW9ucz17cHJvZHVjdE9wdGlvbnN9XG4gICAgICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZFNsdWdzfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0U2VsZWN0ZWRTbHVnc31cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3QgcHJvZHVjdHNcIlxuICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcj1cIlNlYXJjaCBwcm9kdWN0c1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHt0YXJnZXRUeXBlID09PSAnY2F0ZWdvcmllcycgPyAoXG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQ2F0ZWdvcmllc1xuICAgICAgICAgICAgPFNlYXJjaGFibGVNdWx0aVNlbGVjdFxuICAgICAgICAgICAgICBvcHRpb25zPXtjYXRlZ29yeU9wdGlvbnN9XG4gICAgICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZFNsdWdzfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0U2VsZWN0ZWRTbHVnc31cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3QgY2F0ZWdvcmllc1wiXG4gICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIGNhdGVnb3JpZXNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Vc2FnZTwvaDQ+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaG9pY2Utcm93XCI+XG4gICAgICAgICAgICA8Q2hvaWNlQ2FyZFxuICAgICAgICAgICAgICBzZWxlY3RlZD17dXNhZ2VUeXBlID09PSAndW5saW1pdGVkJ31cbiAgICAgICAgICAgICAgdGl0bGU9XCJVbmxpbWl0ZWRcIlxuICAgICAgICAgICAgICBoaW50PVwiQ3VzdG9tZXJzIGNhbiByZXVzZSBpdFwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCd1c2FnZVR5cGUnLCAndW5saW1pdGVkJyl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPENob2ljZUNhcmRcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3VzYWdlVHlwZSA9PT0gJ3NpbmdsZSd9XG4gICAgICAgICAgICAgIHRpdGxlPVwiU2luZ2xlIHVzZVwiXG4gICAgICAgICAgICAgIGhpbnQ9XCJPbmUgdXNlIHBlciBjdXN0b21lclwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCd1c2FnZVR5cGUnLCAnc2luZ2xlJyl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHt1c2FnZVR5cGUgPT09ICd1bmxpbWl0ZWQnID8gKFxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBPcHRpb25hbCBnbG9iYWwgY2FwXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy51c2FnZUxpbWl0ID8/ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd1c2FnZUxpbWl0JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkxlYXZlIGJsYW5rIGZvciB1bmxpbWl0ZWRcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPFRleHQ+RWFjaCBsb2dnZWQtaW4gY3VzdG9tZXIgY2FuIHVzZSB0aGlzIGNvdXBvbiBvbmNlLjwvVGV4dD5cbiAgICAgICAgICApfVxuICAgICAgICAgIHtwYXJhbXMudXNlZENvdW50ID8gPFRleHQgbXQ9XCJkZWZhdWx0XCI+VXNlZCB7cGFyYW1zLnVzZWRDb3VudH0gdGltZShzKSBzbyBmYXIuPC9UZXh0PiA6IG51bGx9XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5TY2hlZHVsZTwvaDQ+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgU3RhcnRzIGF0XG4gICAgICAgICAgICA8RGF0ZVRpbWVQaWNrZXJcbiAgICAgICAgICAgICAgdmFsdWU9e3RvRGF0ZXRpbWVWYWx1ZShwYXJhbXMuc3RhcnRzQXQpfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdzdGFydHNBdCcsIG5leHQgfHwgbnVsbCl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VsZWN0IHN0YXJ0IGRhdGUgYW5kIHRpbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEV4cGlyZXMgYXRcbiAgICAgICAgICAgIDxEYXRlVGltZVBpY2tlclxuICAgICAgICAgICAgICB2YWx1ZT17dG9EYXRldGltZVZhbHVlKHBhcmFtcy5leHBpcmVzQXQpfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdleHBpcmVzQXQnLCBuZXh0IHx8IG51bGwpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlbGVjdCBleHBpcnkgZGF0ZSBhbmQgdGltZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgU2F2ZSBjb3Vwb25cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb3Vwb25FZGl0XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5cbmNvbnN0IEZVTEZJTExNRU5UID0ge1xuICBwZW5kaW5nOiB7IGxhYmVsOiAnV2FpdGluZyBmb3IgZnVsZmlsbG1lbnQnLCB0b25lOiAncGVuZGluZycgfSxcbiAgcGFpZDogeyBsYWJlbDogJ1Byb2Nlc3NpbmcnLCB0b25lOiAncHJvY2Vzc2luZycgfSxcbiAgcGFja2VkOiB7IGxhYmVsOiAnUGFja2VkJywgdG9uZTogJ3BhY2tlZCcgfSxcbiAgc2hpcHBlZDogeyBsYWJlbDogJ1NoaXBwZWQnLCB0b25lOiAnc2hpcHBlZCcgfSxcbiAgZGVsaXZlcmVkOiB7IGxhYmVsOiAnRGVsaXZlcmVkJywgdG9uZTogJ2RlbGl2ZXJlZCcgfSxcbiAgY2FuY2VsbGVkOiB7IGxhYmVsOiAnQ2FuY2VsbGVkJywgdG9uZTogJ2NhbmNlbGxlZCcgfSxcbn1cblxuZnVuY3Rpb24gaXNPbmxpbmVPcmRlcihwYXJhbXMgPSB7fSkge1xuICBjb25zdCBtb2RlID0gU3RyaW5nKHBhcmFtcy5wYXltZW50TW9kZSB8fCAnJykudG9Mb3dlckNhc2UoKVxuICBpZiAobW9kZSA9PT0gJ29ubGluZScpIHJldHVybiB0cnVlXG4gIGlmIChtb2RlID09PSAnY29kJykgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBCb29sZWFuKHBhcmFtcy5yYXpvcnBheVBheW1lbnRJZCB8fCBwYXJhbXMucmF6b3JwYXlPcmRlcklkKVxufVxuXG5mdW5jdGlvbiBwYXltZW50QmFkZ2UocGFyYW1zID0ge30pIHtcbiAgY29uc3Qgb25saW5lID0gaXNPbmxpbmVPcmRlcihwYXJhbXMpXG4gIGNvbnN0IG1ldGhvZCA9IG9ubGluZSA/ICdPbmxpbmUnIDogJ0NPRCdcbiAgY29uc3Qgc3RhdHVzID0gU3RyaW5nKHBhcmFtcy5wYXltZW50U3RhdHVzIHx8ICdwZW5kaW5nJykudG9Mb3dlckNhc2UoKVxuXG4gIGlmIChzdGF0dXMgPT09ICdwYWlkJykgcmV0dXJuIHsgbGFiZWw6IGAke21ldGhvZH0gwrcgUGFpZGAsIHRvbmU6ICdwYWlkJyB9XG4gIGlmIChzdGF0dXMgPT09ICdmYWlsZWQnKSByZXR1cm4geyBsYWJlbDogYCR7bWV0aG9kfSDCtyBGYWlsZWRgLCB0b25lOiAnZmFpbGVkJyB9XG4gIGlmIChzdGF0dXMgPT09ICdyZWZ1bmRlZCcpIHJldHVybiB7IGxhYmVsOiBgJHttZXRob2R9IMK3IFJlZnVuZGVkYCwgdG9uZTogJ3JlZnVuZGVkJyB9XG4gIGlmIChvbmxpbmUpIHJldHVybiB7IGxhYmVsOiAnT25saW5lIMK3IFdhaXRpbmcnLCB0b25lOiAnd2FpdGluZycgfVxuICByZXR1cm4geyBsYWJlbDogJ0NPRCDCtyBVbnBhaWQnLCB0b25lOiAncGVuZGluZycgfVxufVxuXG5mdW5jdGlvbiBQaWxsKHsgbGFiZWwsIHRvbmUgfSkge1xuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktb3JkZXItcGlsbCB0b2tyaS1saXN0LXBpbGwgaXMtJHt0b25lfWB9PntsYWJlbH08L3NwYW4+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGdWxmaWxsbWVudEJhZGdlKHN0YXR1cykge1xuICBjb25zdCBrZXkgPSBTdHJpbmcoc3RhdHVzIHx8ICdwZW5kaW5nJykudG9Mb3dlckNhc2UoKVxuICByZXR1cm4gRlVMRklMTE1FTlRba2V5XSB8fCBGVUxGSUxMTUVOVC5wZW5kaW5nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXltZW50QmFkZ2UocGFyYW1zKSB7XG4gIHJldHVybiBwYXltZW50QmFkZ2UocGFyYW1zKVxufVxuXG5mdW5jdGlvbiBGdWxmaWxsbWVudEJhZGdlKHsgcmVjb3JkIH0pIHtcbiAgY29uc3QgYmFkZ2UgPSBnZXRGdWxmaWxsbWVudEJhZGdlKHJlY29yZD8ucGFyYW1zPy5zdGF0dXMpXG4gIHJldHVybiA8UGlsbCBsYWJlbD17YmFkZ2UubGFiZWx9IHRvbmU9e2JhZGdlLnRvbmV9IC8+XG59XG5cbmZ1bmN0aW9uIFBheW1lbnRCYWRnZSh7IHJlY29yZCB9KSB7XG4gIGNvbnN0IGJhZGdlID0gZ2V0UGF5bWVudEJhZGdlKHJlY29yZD8ucGFyYW1zKVxuICByZXR1cm4gPFBpbGwgbGFiZWw9e2JhZGdlLmxhYmVsfSB0b25lPXtiYWRnZS50b25lfSAvPlxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBPcmRlckxpc3RCYWRnZSh7IHJlY29yZCwgcHJvcGVydHkgfSkge1xuICBjb25zdCBwYXRoID0gcHJvcGVydHk/LnBhdGggfHwgcHJvcGVydHk/LnByb3BlcnR5UGF0aCB8fCAnJ1xuICBpZiAocGF0aCA9PT0gJ3N0YXR1cycpIHJldHVybiA8RnVsZmlsbG1lbnRCYWRnZSByZWNvcmQ9e3JlY29yZH0gLz5cbiAgcmV0dXJuIDxQYXltZW50QmFkZ2UgcmVjb3JkPXtyZWNvcmR9IC8+XG59XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBMb2NhbFNlbGVjdCwgU2VhcmNoYWJsZVNlbGVjdCwgdXNlQW5jaG9yZWRNZW51IH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzJ1xuaW1wb3J0IHsgZ2V0RnVsZmlsbG1lbnRCYWRnZSwgZ2V0UGF5bWVudEJhZGdlIH0gZnJvbSAnLi9vcmRlci1saXN0LWJhZGdlcy5qc3gnXG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKVxuXG5jb25zdCBGVUxGSUxMTUVOVCA9IFtcbiAgeyB2YWx1ZTogJ3BlbmRpbmcnLCBsYWJlbDogJ1dhaXRpbmcgZm9yIGZ1bGZpbGxtZW50JyB9LFxuICB7IHZhbHVlOiAncGFpZCcsIGxhYmVsOiAnUHJvY2Vzc2luZycgfSxcbiAgeyB2YWx1ZTogJ3BhY2tlZCcsIGxhYmVsOiAnUGFja2VkJyB9LFxuICB7IHZhbHVlOiAnc2hpcHBlZCcsIGxhYmVsOiAnU2hpcHBlZCcgfSxcbiAgeyB2YWx1ZTogJ2RlbGl2ZXJlZCcsIGxhYmVsOiAnRGVsaXZlcmVkJyB9LFxuICB7IHZhbHVlOiAnY2FuY2VsbGVkJywgbGFiZWw6ICdDYW5jZWxsZWQnIH0sXG5dXG5cbmNvbnN0IFBBWU1FTlRfT1BUSU9OUyA9IFtcbiAgeyB2YWx1ZTogJ3BlbmRpbmcnLCBsYWJlbDogJ1BlbmRpbmcnIH0sXG4gIHsgdmFsdWU6ICdwYWlkJywgbGFiZWw6ICdQYWlkJyB9LFxuICB7IHZhbHVlOiAnZmFpbGVkJywgbGFiZWw6ICdGYWlsZWQnIH0sXG4gIHsgdmFsdWU6ICdyZWZ1bmRlZCcsIGxhYmVsOiAnUmVmdW5kZWQnIH0sXG5dXG5cbmZ1bmN0aW9uIENvcHlJZCh7IGxhYmVsLCB2YWx1ZSwgaHJlZiB9KSB7XG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXJ6cC1yb3dcIj5cbiAgICAgIDxzcGFuPntsYWJlbH08L3NwYW4+XG4gICAgICA8Y29kZT57dmFsdWV9PC9jb2RlPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCh2YWx1ZSk/LnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgc2V0Q29waWVkKHRydWUpXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxMjAwKVxuICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHt9KVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7Y29waWVkID8gJ0NvcGllZCcgOiAnQ29weSd9XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtocmVmID8gKFxuICAgICAgICA8YSBocmVmPXtocmVmfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCI+XG4gICAgICAgICAgT3BlbiBpbiBSYXpvcnBheVxuICAgICAgICA8L2E+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBmb3JtYXRNb25leSA9ICh2YWx1ZSkgPT4ge1xuICBjb25zdCBhbW91bnQgPSBOdW1iZXIodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oYW1vdW50KSkgcmV0dXJuICfigrkwJ1xuICByZXR1cm4gYOKCuSR7YW1vdW50LnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pfWBcbn1cblxuY29uc3QgZm9ybWF0RGF0ZVRpbWUgPSAodmFsdWUpID0+IHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICfigJQnXG4gIHJldHVybiBuZXcgRGF0ZSh2YWx1ZSkudG9Mb2NhbGVTdHJpbmcoJ2VuLUlOJywge1xuICAgIGRhdGVTdHlsZTogJ21lZGl1bScsXG4gICAgdGltZVN0eWxlOiAnc2hvcnQnLFxuICB9KVxufVxuXG5jb25zdCByZXNvbHZlSW1hZ2UgPSAodmFsdWUpID0+IHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdCh2YWx1ZSkpIHJldHVybiB2YWx1ZVxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnLycpKSByZXR1cm4gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke3ZhbHVlfWBcbiAgcmV0dXJuIHZhbHVlXG59XG5cbmZ1bmN0aW9uIE1vcmVNZW51KHsgdW5wYWlkLCBjYW5TeW5jUmF6b3JwYXksIGJ1c3ksIG9uQ2FzaCwgb25Rciwgb25TeW5jUmF6b3JwYXksIG9uUmVzZW5kUGFydG5lciB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1tb3JlXCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHZhbHVlKSA9PiAhdmFsdWUpfT5cbiAgICAgICAgTW9yZSBhY3Rpb25zXG4gICAgICAgIDxzcGFuPntvcGVuID8gJ+KWtCcgOiAn4pa+J308L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHRva3JpLW9yZGVyLW1vcmUtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtCb29sZWFuKGJ1c3kpfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICBvblJlc2VuZFBhcnRuZXIoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7YnVzeSA9PT0gJ3Jlc2VuZFBhcnRuZXJXaGF0c2FwcCcgPyAnU2VuZGluZ+KApicgOiAnUmVzZW5kIG1lc3NhZ2UgdG8gZGVsaXZlcnkgcGFydG5lcid9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAge3VucGFpZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgb25DYXNoKClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2J1c3kgPT09ICdjb2xsZWN0Q2FzaCcgPyAnU2F2aW5n4oCmJyA6ICdNYXJrIGNhc2ggY29sbGVjdGVkJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgb25RcigpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtidXN5ID09PSAnZ2VuZXJhdGVRcicgPyAnQ3JlYXRpbmfigKYnIDogJ0dlbmVyYXRlIHBheW1lbnQgUVInfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtjYW5TeW5jUmF6b3JwYXkgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgb25TeW5jUmF6b3JwYXkoKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7YnVzeSA9PT0gJ3N5bmNSYXpvcnBheScgPyAnQ2hlY2tpbmcgUmF6b3JwYXnigKYnIDogJ1N5bmMgUmF6b3JwYXkgcGF5bWVudCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBzbmFwc2hvdChwYXJhbXMgPSB7fSkge1xuICByZXR1cm4ge1xuICAgIHN0YXR1czogcGFyYW1zLnN0YXR1cyB8fCAnJyxcbiAgICBwYXltZW50U3RhdHVzOiBwYXJhbXMucGF5bWVudFN0YXR1cyB8fCAnJyxcbiAgICBkZWxpdmVyeVBhcnRuZXJJZDogcGFyYW1zLmRlbGl2ZXJ5UGFydG5lcklkIHx8ICcnLFxuICAgIGNvbnRhY3ROYW1lOiBwYXJhbXMuY29udGFjdE5hbWUgfHwgJycsXG4gICAgY29udGFjdFBob25lOiBwYXJhbXMuY29udGFjdFBob25lIHx8ICcnLFxuICAgIGFkZHJlc3NMaW5lMTogcGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJyxcbiAgICBhZGRyZXNzTGluZTI6IHBhcmFtcy5hZGRyZXNzTGluZTIgfHwgJycsXG4gICAgYWRkcmVzc0NpdHk6IHBhcmFtcy5hZGRyZXNzQ2l0eSB8fCAnJyxcbiAgICBhZGRyZXNzU3RhdGU6IHBhcmFtcy5hZGRyZXNzU3RhdGUgfHwgJycsXG4gICAgYWRkcmVzc1BpbmNvZGU6IHBhcmFtcy5hZGRyZXNzUGluY29kZSB8fCAnJyxcbiAgICBhZGRyZXNzTGFuZG1hcms6IHBhcmFtcy5hZGRyZXNzTGFuZG1hcmsgfHwgJycsXG4gIH1cbn1cblxuY29uc3QgT3JkZXJEZXRhaWwgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlLCBhY3Rpb24gfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdCwgbG9hZGluZywgc2V0UmVjb3JkIH0gPSB1c2VSZWNvcmQoaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UuaWQpXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2FjdGlvbkJ1c3ksIHNldEFjdGlvbkJ1c3ldID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtwYXJ0bmVycywgc2V0UGFydG5lcnNdID0gdXNlU3RhdGUoW3sgdmFsdWU6ICcnLCBsYWJlbDogJ1VuYXNzaWduZWQnIH1dKVxuICBjb25zdCBbYmFzZWxpbmUsIHNldEJhc2VsaW5lXSA9IHVzZVN0YXRlKCgpID0+IHNuYXBzaG90KGluaXRpYWxSZWNvcmQ/LnBhcmFtcykpXG4gIGNvbnN0IFtlZGl0Q29udGFjdCwgc2V0RWRpdENvbnRhY3RdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtlZGl0QWRkcmVzcywgc2V0RWRpdEFkZHJlc3NdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWN0aW9uPy5uYW1lICE9PSAnc2hvdycpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBuZXh0ID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL3Nob3dcXC8/JC8sICcvZWRpdCcpXG4gICAgaWYgKG5leHQgIT09IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSkgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UobmV4dClcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH0sIFthY3Rpb24/Lm5hbWVdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGlnbm9yZSA9IGZhbHNlXG4gICAgYXBpXG4gICAgICAucmVzb3VyY2VBY3Rpb24oeyByZXNvdXJjZUlkOiAnRGVsaXZlcnlQYXJ0bmVyJywgYWN0aW9uTmFtZTogJ2xpc3QnLCBwYXJhbXM6IHsgcGVyUGFnZTogMjAwIH0gfSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAoaWdub3JlKSByZXR1cm5cbiAgICAgICAgY29uc3QgcmVjb3JkcyA9IHJlc3BvbnNlLmRhdGE/LnJlY29yZHMgfHwgW11cbiAgICAgICAgc2V0UGFydG5lcnMoW1xuICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ1VuYXNzaWduZWQnIH0sXG4gICAgICAgICAgLi4ucmVjb3Jkcy5tYXAoKGl0ZW0pID0+ICh7XG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5pZCB8fCBpdGVtLnBhcmFtcz8uaWQsXG4gICAgICAgICAgICBsYWJlbDogaXRlbS5wYXJhbXM/LmlzQWN0aXZlID09PSBmYWxzZVxuICAgICAgICAgICAgICA/IGAke2l0ZW0ucGFyYW1zPy5uYW1lIHx8ICdQYXJ0bmVyJ30gKGluYWN0aXZlKWBcbiAgICAgICAgICAgICAgOiBpdGVtLnBhcmFtcz8ubmFtZSB8fCAnUGFydG5lcicsXG4gICAgICAgICAgfSkpLFxuICAgICAgICBdKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGlmICghaWdub3JlKSBzZXRQYXJ0bmVycyhbeyB2YWx1ZTogJycsIGxhYmVsOiAnVW5hc3NpZ25lZCcgfV0pXG4gICAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBpdGVtcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHBhcmFtcy5pdGVtc0pzb24gfHwgJ1tdJylcbiAgICAgIHJldHVybiBwYXJzZWQubWFwKChpdGVtKSA9PiAoeyAuLi5pdGVtLCBpbWFnZTogcmVzb2x2ZUltYWdlKGl0ZW0uaW1hZ2UpIH0pKVxuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICB9LCBbcGFyYW1zLml0ZW1zSnNvbl0pXG5cbiAgY29uc3QgY3VycmVudCA9IHNuYXBzaG90KHBhcmFtcylcbiAgY29uc3QgZGlydHkgPSBPYmplY3Qua2V5cyhjdXJyZW50KS5zb21lKChrZXkpID0+IGN1cnJlbnRba2V5XSAhPT0gYmFzZWxpbmVba2V5XSlcbiAgY29uc3QgbGlzdFVybCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9yZWNvcmRzXFwvLiokLywgJycpXG4gIGNvbnN0IHVucGFpZCA9IHBhcmFtcy5wYXltZW50U3RhdHVzICE9PSAncGFpZCdcbiAgY29uc3QgY2FuU3luY1Jhem9ycGF5ID0gdW5wYWlkICYmIHBhcmFtcy5wYXltZW50TW9kZSA9PT0gJ29ubGluZSdcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY2FuU3luY1Jhem9ycGF5IHx8ICFyZWNvcmQ/LmlkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgbGV0IGlnbm9yZSA9IGZhbHNlXG4gICAgYXBpXG4gICAgICAucmVjb3JkQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIHJlY29yZElkOiByZWNvcmQuaWQsXG4gICAgICAgIGFjdGlvbk5hbWU6ICdzeW5jUmF6b3JwYXknLFxuICAgICAgfSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAoaWdub3JlKSByZXR1cm5cbiAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGE/LnJlY29yZCkge1xuICAgICAgICAgIHNldFJlY29yZChyZXNwb25zZS5kYXRhLnJlY29yZClcbiAgICAgICAgICBzZXRCYXNlbGluZShzbmFwc2hvdChyZXNwb25zZS5kYXRhLnJlY29yZC5wYXJhbXMpKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlLmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnc3VjY2VzcycpIGFkZE5vdGljZShub3RpY2UpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHt9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbY2FuU3luY1Jhem9ycGF5LCByZWNvcmQ/LmlkLCByZXNvdXJjZS5pZCwgc2V0UmVjb3JkXSlcblxuICBjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNvbnN0IHBob25lID0gU3RyaW5nKHBhcmFtcy5jb250YWN0UGhvbmUgfHwgJycpLnJlcGxhY2UoL1xcRC9nLCAnJylcbiAgICBjb25zdCBwaW4gPSBTdHJpbmcocGFyYW1zLmFkZHJlc3NQaW5jb2RlIHx8ICcnKS5yZXBsYWNlKC9cXEQvZywgJycpXG4gICAgaWYgKCFTdHJpbmcocGFyYW1zLmNvbnRhY3ROYW1lIHx8ICcnKS50cmltKCkgfHwgcGhvbmUubGVuZ3RoIDwgMTApIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdFbnRlciB0aGUgY3VzdG9tZXIgbmFtZSBhbmQgYSAxMC1kaWdpdCBjb250YWN0IG51bWJlci4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFTdHJpbmcocGFyYW1zLmFkZHJlc3NMaW5lMSB8fCAnJykudHJpbSgpIHx8ICFTdHJpbmcocGFyYW1zLmFkZHJlc3NDaXR5IHx8ICcnKS50cmltKCkgfHwgIVN0cmluZyhwYXJhbXMuYWRkcmVzc1N0YXRlIHx8ICcnKS50cmltKCkgfHwgcGluLmxlbmd0aCAhPT0gNikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0VudGVyIHRoZSBob3VzZSwgY2l0eSwgc3RhdGUsIGFuZCBhIDYtZGlnaXQgcGluY29kZS4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc2V0U2F2aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc3VibWl0KClcbiAgICAgIGNvbnN0IG5leHQgPSByZXNwb25zZT8uZGF0YT8ucmVjb3JkPy5wYXJhbXNcbiAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgIHNldEJhc2VsaW5lKHNuYXBzaG90KG5leHQpKVxuICAgICAgICBzZXRFZGl0Q29udGFjdChmYWxzZSlcbiAgICAgICAgc2V0RWRpdEFkZHJlc3MoZmFsc2UpXG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFNhdmluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBydW5QYXltZW50QWN0aW9uID0gYXN5bmMgKGFjdGlvbk5hbWUpID0+IHtcbiAgICBpZiAoYWN0aW9uTmFtZSA9PT0gJ2NvbGxlY3RDYXNoJyAmJiAhd2luZG93LmNvbmZpcm0oJ01hcmsgdGhpcyBvcmRlciBhcyBwYWlkIGluIGNhc2g/JykpIHJldHVyblxuICAgIHNldEFjdGlvbkJ1c3koYWN0aW9uTmFtZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIHJlY29yZElkOiByZWNvcmQuaWQsXG4gICAgICAgIGFjdGlvbk5hbWUsXG4gICAgICB9KVxuICAgICAgaWYgKHJlc3BvbnNlLmRhdGE/LnJlY29yZCkge1xuICAgICAgICBzZXRSZWNvcmQocmVzcG9uc2UuZGF0YS5yZWNvcmQpXG4gICAgICAgIHNldEJhc2VsaW5lKHNuYXBzaG90KHJlc3BvbnNlLmRhdGEucmVjb3JkLnBhcmFtcykpXG4gICAgICB9XG4gICAgICBhZGROb3RpY2UocmVzcG9uc2UuZGF0YT8ubm90aWNlIHx8IHsgbWVzc2FnZTogJ1VwZGF0ZWQuJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBjb21wbGV0ZSB0aGlzIGFjdGlvbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEFjdGlvbkJ1c3koJycpXG4gICAgfVxuICB9XG5cbiAgaWYgKGFjdGlvbj8ubmFtZSA9PT0gJ3Nob3cnKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGZ1bGZpbGxtZW50ID0gZ2V0RnVsZmlsbG1lbnRCYWRnZShwYXJhbXMuc3RhdHVzKVxuICBjb25zdCBwYXltZW50ID0gZ2V0UGF5bWVudEJhZGdlKHBhcmFtcylcbiAgY29uc3Qgc3RhdHVzTGFiZWwgPSBmdWxmaWxsbWVudC5sYWJlbFxuICBjb25zdCByZXN0b3JlRmllbGRzID0gKGtleXMsIGNsb3NlKSA9PiB7XG4gICAga2V5cy5mb3JFYWNoKChrZXkpID0+IGhhbmRsZUNoYW5nZShrZXksIGJhc2VsaW5lW2tleV0gfHwgJycpKVxuICAgIGNsb3NlKGZhbHNlKVxuICB9XG4gIGNvbnN0IGFkZHJlc3NUZXh0ID0gW1xuICAgIHBhcmFtcy5hZGRyZXNzTGluZTEsXG4gICAgcGFyYW1zLmFkZHJlc3NMaW5lMixcbiAgICBbcGFyYW1zLmFkZHJlc3NDaXR5LCBwYXJhbXMuYWRkcmVzc1N0YXRlLCBwYXJhbXMuYWRkcmVzc1BpbmNvZGVdLmZpbHRlcihCb29sZWFuKS5qb2luKCcsICcpLFxuICAgIHBhcmFtcy5hZGRyZXNzTGFuZG1hcmsgPyBgTGFuZG1hcms6ICR7cGFyYW1zLmFkZHJlc3NMYW5kbWFya31gIDogJycsXG4gIF0uZmlsdGVyKEJvb2xlYW4pXG4gIGNvbnN0IHBheW1lbnRMYWJlbCA9IHBheW1lbnQubGFiZWxcbiAgY29uc3QgcGFydG5lck5hbWUgPSBwYXJhbXMuZGVsaXZlcnlQYXJ0bmVyTmFtZVxuICAgID8gYCR7cGFyYW1zLmRlbGl2ZXJ5UGFydG5lck5hbWV9JHtwYXJhbXMuZGVsaXZlcnlQYXJ0bmVyUGhvbmUgPyBgIMK3ICR7cGFyYW1zLmRlbGl2ZXJ5UGFydG5lclBob25lfWAgOiAnJ31gXG4gICAgOiAnTm8gZGVsaXZlcnkgcGFydG5lciB5ZXQnXG4gIGNvbnN0IGl0ZW1Db3VudCA9IGl0ZW1zLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiBzdW0gKyBOdW1iZXIoaXRlbS5xdWFudGl0eSB8fCAwKSwgMClcblxuICByZXR1cm4gKFxuICAgIDxmb3JtIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyXCIgb25TdWJtaXQ9e2hhbmRsZVNhdmV9PlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10b3BcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10aXRsZVwiPlxuICAgICAgICAgIDxhIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWJhY2tcIiBocmVmPXtsaXN0VXJsfSBhcmlhLWxhYmVsPVwiQmFjayB0byBvcmRlcnNcIj7ihpA8L2E+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItdGl0bGUtcm93XCI+XG4gICAgICAgICAgICAgIDxoMj4je3BhcmFtcy5vcmRlck5vfTwvaDI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRva3JpLW9yZGVyLXBpbGwgaXMtJHtwYXltZW50LnRvbmV9YH0+e3BheW1lbnRMYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRva3JpLW9yZGVyLXBpbGwgaXMtJHtmdWxmaWxsbWVudC50b25lfWB9PntzdGF0dXNMYWJlbH08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxwPntmb3JtYXREYXRlVGltZShwYXJhbXMuY3JlYXRlZEF0KX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWFjdGlvbnNcIj5cbiAgICAgICAgICA8YVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW52b2ljZVwiXG4gICAgICAgICAgICBocmVmPXtgL3Rva3JpLWJhY2tvZmZpY2Uvb3JkZXJzLyR7cmVjb3JkLmlkfS9pbnZvaWNlP2Rvd25sb2FkPTFgfVxuICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICAgICAgdGl0bGU9XCJEb3dubG9hZCBQREYgaW52b2ljZVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgRG93bmxvYWQgSW52b2ljZVxuICAgICAgICAgIDwvYT5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNhdmVcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9eyFkaXJ0eSB8fCBsb2FkaW5nIHx8IHNhdmluZ30+XG4gICAgICAgICAgICB7c2F2aW5nID8gJ1NhdmluZ+KApicgOiAnU2F2ZSd9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPE1vcmVNZW51XG4gICAgICAgICAgICB1bnBhaWQ9e3VucGFpZH1cbiAgICAgICAgICAgIGNhblN5bmNSYXpvcnBheT17Y2FuU3luY1Jhem9ycGF5fVxuICAgICAgICAgICAgYnVzeT17YWN0aW9uQnVzeX1cbiAgICAgICAgICAgIG9uQ2FzaD17KCkgPT4gcnVuUGF5bWVudEFjdGlvbignY29sbGVjdENhc2gnKX1cbiAgICAgICAgICAgIG9uUXI9eygpID0+IHJ1blBheW1lbnRBY3Rpb24oJ2dlbmVyYXRlUXInKX1cbiAgICAgICAgICAgIG9uU3luY1Jhem9ycGF5PXsoKSA9PiBydW5QYXltZW50QWN0aW9uKCdzeW5jUmF6b3JwYXknKX1cbiAgICAgICAgICAgIG9uUmVzZW5kUGFydG5lcj17KCkgPT4gcnVuUGF5bWVudEFjdGlvbigncmVzZW5kUGFydG5lcldoYXRzYXBwJyl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1sYXlvdXRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1tYWluXCI+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItY2FyZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkLWhlYWRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktb3JkZXItbWFyayBpcy0ke2Z1bGZpbGxtZW50LnRvbmV9YH0gLz5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPntzdGF0dXNMYWJlbH08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8c3Bhbj57aXRlbUNvdW50fSB7aXRlbUNvdW50ID09PSAxID8gJ2l0ZW0nIDogJ2l0ZW1zJ30gwrcge3BhcnRuZXJOYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItc2VsZWN0XCI+XG4gICAgICAgICAgICAgICAgPExvY2FsU2VsZWN0XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnN0YXR1cyB8fCAncGVuZGluZyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXtGVUxGSUxMTUVOVH1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IGhhbmRsZUNoYW5nZSgnc3RhdHVzJywgdmFsdWUpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7aXRlbXMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lbXB0eVwiPk5vIGl0ZW1zIG9uIHRoaXMgb3JkZXIuPC9wPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pdGVtc1wiPlxuICAgICAgICAgICAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgICAgIDxhcnRpY2xlIGtleT17aXRlbS5pZH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItdGh1bWItd3JhcFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtpdGVtLmltYWdlID8gPGltZyBzcmM9e2l0ZW0uaW1hZ2V9IGFsdD1cIlwiIC8+IDogPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItdGh1bWJcIiAvPn1cbiAgICAgICAgICAgICAgICAgICAgICA8ZW0+e2l0ZW0ucXVhbnRpdHl9PC9lbT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz57aXRlbS5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgIHtpdGVtLndlaWdodCA/IDxzcGFuPntpdGVtLndlaWdodH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXF0eVwiPntmb3JtYXRNb25leShpdGVtLnByaWNlVmFsdWUpfSDDlyB7aXRlbS5xdWFudGl0eX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxiPntmb3JtYXRNb25leShpdGVtLmxpbmVUb3RhbCl9PC9iPlxuICAgICAgICAgICAgICAgICAgPC9hcnRpY2xlPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItY2FyZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkLWhlYWRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktb3JkZXItbWFyayBpcy0ke3BheW1lbnQudG9uZX1gfSAvPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e3BheW1lbnRMYWJlbH08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8c3Bhbj57cGFyYW1zLnBheW1lbnRNZXRob2QgfHwgJ0Nhc2ggb24gZGVsaXZlcnknfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItc2VsZWN0XCI+XG4gICAgICAgICAgICAgICAgPExvY2FsU2VsZWN0XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBheW1lbnRTdGF0dXMgfHwgJ3BlbmRpbmcnfVxuICAgICAgICAgICAgICAgICAgb3B0aW9ucz17UEFZTUVOVF9PUFRJT05TfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKCdwYXltZW50U3RhdHVzJywgdmFsdWUpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGwgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItdG90YWxzXCI+XG4gICAgICAgICAgICAgIDxkaXY+PGR0PlN1YnRvdGFsPC9kdD48ZGQ+e2l0ZW1Db3VudH0ge2l0ZW1Db3VudCA9PT0gMSA/ICdpdGVtJyA6ICdpdGVtcyd9PC9kZD48ZGQ+e2Zvcm1hdE1vbmV5KHBhcmFtcy5pdGVtc1RvdGFsKX08L2RkPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkdD5EZWxpdmVyeXtwYXJhbXMuZGVsaXZlcnlPcHRpb24gPyBgIMK3ICR7cGFyYW1zLmRlbGl2ZXJ5T3B0aW9uID09PSAnZXhwcmVzcycgPyAnOTAtbWludXRlJyA6ICdNb3JuaW5nJ31gIDogJyd9PC9kdD5cbiAgICAgICAgICAgICAgICA8ZGQgLz5cbiAgICAgICAgICAgICAgICA8ZGQ+e3BhcmFtcy5mcmVlRGVsaXZlcnlBcHBsaWVkIHx8IE51bWJlcihwYXJhbXMuZGVsaXZlcnlDaGFyZ2UpID09PSAwID8gJ0ZyZWUgKFdlbGNvbWUgb2ZmZXIpJyA6IGZvcm1hdE1vbmV5KHBhcmFtcy5kZWxpdmVyeUNoYXJnZSl9PC9kZD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+PGR0PkhhbmRsaW5nPC9kdD48ZGQgLz48ZGQ+e2Zvcm1hdE1vbmV5KHBhcmFtcy5oYW5kbGluZ0NoYXJnZSl9PC9kZD48L2Rpdj5cbiAgICAgICAgICAgICAge051bWJlcihwYXJhbXMudGF4VG90YWwpID4gMCA/IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGR0PlRheGVzIChHU1Qpe3BhcmFtcy5pc0ludGVyU3RhdGUgPyAnIMK3IElHU1QnIDogJyDCtyBDR1NUK1NHU1QnfTwvZHQ+XG4gICAgICAgICAgICAgICAgICA8ZGQgLz5cbiAgICAgICAgICAgICAgICAgIDxkZD57Zm9ybWF0TW9uZXkocGFyYW1zLnRheFRvdGFsKX08L2RkPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge051bWJlcihwYXJhbXMuc21hbGxDYXJ0Q2hhcmdlKSA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGRpdj48ZHQ+U21hbGwgY2FydDwvZHQ+PGRkIC8+PGRkPntmb3JtYXRNb25leShwYXJhbXMuc21hbGxDYXJ0Q2hhcmdlKX08L2RkPjwvZGl2PlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge051bWJlcihwYXJhbXMuZGlzY291bnQpID4gMCA/IChcbiAgICAgICAgICAgICAgICA8ZGl2PjxkdD5EaXNjb3VudHtwYXJhbXMuY291cG9uQ29kZSA/IGAgwrcgJHtwYXJhbXMuY291cG9uQ29kZX1gIDogJyd9PC9kdD48ZGQgLz48ZGQ+LXtmb3JtYXRNb25leShwYXJhbXMuZGlzY291bnQpfTwvZGQ+PC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlzLXRvdGFsXCI+PGR0PlRvdGFsPC9kdD48ZGQgLz48ZGQ+e2Zvcm1hdE1vbmV5KHBhcmFtcy5ncmFuZFRvdGFsKX08L2RkPjwvZGl2PlxuICAgICAgICAgICAgPC9kbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItY29sbGVjdGVkXCI+XG4gICAgICAgICAgICAgIDxzcGFuPntwYXJhbXMucGF5bWVudFN0YXR1cyA9PT0gJ3BhaWQnID8gJ1BhaWQgYnkgY3VzdG9tZXInIDogJ1N0aWxsIHRvIGNvbGxlY3QnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPGI+e2Zvcm1hdE1vbmV5KHBhcmFtcy5ncmFuZFRvdGFsKX08L2I+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtwYXJhbXMucGF5bWVudENvbGxlY3RlZEFzID8gPHAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItbWV0YVwiPkNvbGxlY3RlZCBhcyB7cGFyYW1zLnBheW1lbnRDb2xsZWN0ZWRBc308L3A+IDogbnVsbH1cbiAgICAgICAgICAgIHtwYXJhbXMucGF5bWVudE1vZGUgPT09ICdvbmxpbmUnIHx8IHBhcmFtcy5yYXpvcnBheVBheW1lbnRJZCB8fCBwYXJhbXMucmF6b3JwYXlPcmRlcklkID8gKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXJ6cFwiPlxuICAgICAgICAgICAgICAgIDxDb3B5SWRcbiAgICAgICAgICAgICAgICAgIGxhYmVsPVwiUGF5bWVudCBJRFwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnJhem9ycGF5UGF5bWVudElkfVxuICAgICAgICAgICAgICAgICAgaHJlZj17cGFyYW1zLnJhem9ycGF5UGF5bWVudElkXG4gICAgICAgICAgICAgICAgICAgID8gYGh0dHBzOi8vZGFzaGJvYXJkLnJhem9ycGF5LmNvbS9hcHAvcGF5bWVudHMvJHtlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnJhem9ycGF5UGF5bWVudElkKX1gXG4gICAgICAgICAgICAgICAgICAgIDogJyd9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8Q29weUlkXG4gICAgICAgICAgICAgICAgICBsYWJlbD1cIlJhem9ycGF5IG9yZGVyXCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucmF6b3JwYXlPcmRlcklkfVxuICAgICAgICAgICAgICAgICAgaHJlZj17cGFyYW1zLnJhem9ycGF5T3JkZXJJZFxuICAgICAgICAgICAgICAgICAgICA/IGBodHRwczovL2Rhc2hib2FyZC5yYXpvcnBheS5jb20vYXBwL29yZGVycy8ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXMucmF6b3JwYXlPcmRlcklkKX1gXG4gICAgICAgICAgICAgICAgICAgIDogJyd9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7IXBhcmFtcy5yYXpvcnBheVBheW1lbnRJZCA/IChcbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLW1ldGFcIj5ObyBSYXpvcnBheSBwYXltZW50IElEIHlldC4gVXNlIFN5bmMgUmF6b3JwYXkgcGF5bWVudCBpZiBtb25leSB3YXMgY2FwdHVyZWQuPC9wPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAge3BhcmFtcy5yYXpvcnBheVFyVXJsID8gKFxuICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXFyXCIgc3JjPXtwYXJhbXMucmF6b3JwYXlRclVybH0gYWx0PVwiRG9vcnN0ZXAgcGF5bWVudCBRUlwiIC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxhc2lkZSBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zaWRlXCI+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItY2FyZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWN0aW9uLWhlYWRcIj5cbiAgICAgICAgICAgICAgPGgzPkN1c3RvbWVyPC9oMz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWN0aW9uLWhlYWRcIj5cbiAgICAgICAgICAgICAgPGg0PkNvbnRhY3Q8L2g0PlxuICAgICAgICAgICAgICB7ZWRpdENvbnRhY3QgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0XCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHJlc3RvcmVGaWVsZHMoWydjb250YWN0TmFtZScsICdjb250YWN0UGhvbmUnXSwgc2V0RWRpdENvbnRhY3QpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXRcIiBvbkNsaWNrPXsoKSA9PiBzZXRFZGl0Q29udGFjdCh0cnVlKX0+XG4gICAgICAgICAgICAgICAgICBFZGl0XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtlZGl0Q29udGFjdCA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0LWZpZWxkc1wiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgTmFtZVxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jb250YWN0TmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdjb250YWN0TmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICBQaG9uZSBudW1iZXJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNvbnRhY3RQaG9uZSB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdjb250YWN0UGhvbmUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcmVhZFwiPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e3BhcmFtcy5jb250YWN0TmFtZSB8fCAn4oCUJ308L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8cD57cGFyYW1zLmNvbnRhY3RQaG9uZSA/IGArOTEgJHtwYXJhbXMuY29udGFjdFBob25lfWAgOiAn4oCUJ308L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWN0aW9uLWhlYWRcIj5cbiAgICAgICAgICAgICAgPGg0PlNoaXBwaW5nIGFkZHJlc3M8L2g0PlxuICAgICAgICAgICAgICB7ZWRpdEFkZHJlc3MgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0XCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHJlc3RvcmVGaWVsZHMoXG4gICAgICAgICAgICAgICAgICAgIFsnYWRkcmVzc0xpbmUxJywgJ2FkZHJlc3NMaW5lMicsICdhZGRyZXNzQ2l0eScsICdhZGRyZXNzU3RhdGUnLCAnYWRkcmVzc1BpbmNvZGUnLCAnYWRkcmVzc0xhbmRtYXJrJ10sXG4gICAgICAgICAgICAgICAgICAgIHNldEVkaXRBZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0XCIgb25DbGljaz17KCkgPT4gc2V0RWRpdEFkZHJlc3ModHJ1ZSl9PlxuICAgICAgICAgICAgICAgICAgRWRpdFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7ZWRpdEFkZHJlc3MgPyAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZWRpdC1maWVsZHNcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZmllbGRcIj5cbiAgICAgICAgICAgICAgICAgIEhvdXNlIC8gZmxhdFxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzTGluZTEgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnYWRkcmVzc0xpbmUxJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZmllbGRcIj5cbiAgICAgICAgICAgICAgICAgIFN0cmVldCAvIGFyZWFcbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWRkcmVzc0xpbmUyIHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2FkZHJlc3NMaW5lMicsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1hZGRyZXNzLWdyaWRcIj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICBDaXR5XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NDaXR5IHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnYWRkcmVzc0NpdHknLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICBTdGF0ZVxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzU3RhdGUgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzU3RhdGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICBQaW5jb2RlXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NQaW5jb2RlIHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnYWRkcmVzc1BpbmNvZGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICBMYW5kbWFya1xuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzTGFuZG1hcmsgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzTGFuZG1hcmsnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXJlYWRcIj5cbiAgICAgICAgICAgICAgICB7YWRkcmVzc1RleHQubGVuZ3RoID8gYWRkcmVzc1RleHQubWFwKChsaW5lKSA9PiA8cCBrZXk9e2xpbmV9PntsaW5lfTwvcD4pIDogPHA+4oCUPC9wPn1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGg0PkRlbGl2ZXJ5IHBhcnRuZXI8L2g0PlxuICAgICAgICAgICAgPFNlYXJjaGFibGVTZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5kZWxpdmVyeVBhcnRuZXJJZCB8fCAnJ31cbiAgICAgICAgICAgICAgb3B0aW9ucz17cGFydG5lcnN9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IGhhbmRsZUNoYW5nZSgnZGVsaXZlcnlQYXJ0bmVySWQnLCB2YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVW5hc3NpZ25lZFwiXG4gICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIHBhcnRuZXJzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8L2FzaWRlPlxuICAgICAgPC9kaXY+XG4gICAgPC9mb3JtPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IE9yZGVyRGV0YWlsXG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSW5wdXQsIExhYmVsLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEFwaUNsaWVudCwgdXNlTm90aWNlIH0gZnJvbSAnYWRtaW5qcydcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5cbmNvbnN0IEV5ZUljb24gPSAoeyBoaWRkZW4gfSkgPT5cbiAgaGlkZGVuID8gKFxuICAgIDxzdmcgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0zIDNsMTggMThcIiAvPlxuICAgICAgPHBhdGggZD1cIk0xMC42IDEwLjZBMiAyIDAgMCAwIDEzLjQgMTMuNFwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkuOSA0LjJBMTAuNyAxMC43IDAgMCAxIDEyIDRjNSAwIDkgNC41IDEwIDhhMTIuOCAxMi44IDAgMCAxLTIuMSAzLjZcIiAvPlxuICAgICAgPHBhdGggZD1cIk02LjYgNi42QzQuMyA4IDIuNyAxMC4yIDIgMTJjMSAzLjUgNSA4IDEwIDggMS41IDAgMi45LS40IDQuMS0xXCIgLz5cbiAgICA8L3N2Zz5cbiAgKSA6IChcbiAgICA8c3ZnIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMiAxMnM0LTcgMTAtNyAxMCA3IDEwIDctNCA3LTEwIDdTMiAxMiAyIDEyelwiIC8+XG4gICAgICA8Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjNcIiAvPlxuICAgIDwvc3ZnPlxuICApXG5cbmZ1bmN0aW9uIFBhc3N3b3JkRmllbGQoeyBpZCwgbGFiZWwsIHZhbHVlLCBvbkNoYW5nZSwgdmlzaWJsZSwgb25Ub2dnbGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxCb3ggbWI9XCJsZ1wiPlxuICAgICAgPExhYmVsIGh0bWxGb3I9e2lkfSByZXF1aXJlZD57bGFiZWx9PC9MYWJlbD5cbiAgICAgIDxCb3ggcG9zaXRpb249XCJyZWxhdGl2ZVwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICA8SW5wdXRcbiAgICAgICAgICBpZD17aWR9XG4gICAgICAgICAgdHlwZT17dmlzaWJsZSA/ICd0ZXh0JyA6ICdwYXNzd29yZCd9XG4gICAgICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uQ2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nUmlnaHQ6IDQyIH19XG4gICAgICAgIC8+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPXt2aXNpYmxlID8gJ0hpZGUgcGFzc3dvcmQnIDogJ1Nob3cgcGFzc3dvcmQnfVxuICAgICAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHJpZ2h0OiA4LFxuICAgICAgICAgICAgdG9wOiAnNTAlJyxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoLTUwJSknLFxuICAgICAgICAgICAgYm9yZGVyOiAwLFxuICAgICAgICAgICAgYmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgIGNvbG9yOiAnIzA0Nzg1NycsXG4gICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAyNixcbiAgICAgICAgICAgIGhlaWdodDogMjYsXG4gICAgICAgICAgICBwYWRkaW5nOiAwLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8RXllSWNvbiBoaWRkZW49e3Zpc2libGV9IC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuY29uc3QgQ2hhbmdlUGFzc3dvcmQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCBbcGFzc3dvcmQsIHNldFBhc3N3b3JkXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbY29uZmlybVBhc3N3b3JkLCBzZXRDb25maXJtUGFzc3dvcmRdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtzaG93UGFzc3dvcmQsIHNldFNob3dQYXNzd29yZF0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Nob3dDb25maXJtLCBzZXRTaG93Q29uZmlybV0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKCcnKVxuXG4gIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuICB9XG5cbiAgY29uc3Qgc2F2ZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBzZXRFcnJvcignJylcbiAgICBpZiAoIXBhc3N3b3JkIHx8IHBhc3N3b3JkLmxlbmd0aCA8IDYpIHtcbiAgICAgIHNldEVycm9yKCdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDYgY2hhcmFjdGVycy4nKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChwYXNzd29yZCAhPT0gY29uZmlybVBhc3N3b3JkKSB7XG4gICAgICBzZXRFcnJvcignTmV3IHBhc3N3b3JkIGFuZCBjb25maXJtIHBhc3N3b3JkIG11c3QgYmUgdGhlIHNhbWUuJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHNldFNhdmluZyh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuICAgICAgICByZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcbiAgICAgICAgcmVjb3JkSWQ6IHJlY29yZC5pZCxcbiAgICAgICAgYWN0aW9uTmFtZTogJ2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgIGRhdGE6IHsgcGFzc3dvcmQsIGNvbmZpcm1QYXNzd29yZCB9LFxuICAgICAgfSlcbiAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlLmRhdGE/Lm5vdGljZVxuICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICBzZXRFcnJvcihub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgcGFzc3dvcmQuJylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAobm90aWNlKSBhZGROb3RpY2Uobm90aWNlKVxuICAgICAgY29uc3QgcmVkaXJlY3RVcmwgPSByZXNwb25zZS5kYXRhPy5yZWRpcmVjdFVybFxuICAgICAgaWYgKHJlZGlyZWN0VXJsKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVkaXJlY3RVcmxcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjbG9zZSgpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgcGFzc3dvcmQuJylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0U2F2aW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgIGluc2V0OiAwLFxuICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSgyLCAxMiwgOCwgMC42MiknLFxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgIHpJbmRleDogODAsXG4gICAgICAgIHBhZGRpbmc6IDE2LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8Qm94XG4gICAgICAgIGFzPVwiZm9ybVwiXG4gICAgICAgIG9uU3VibWl0PXtzYXZlfVxuICAgICAgICBiZz1cIndoaXRlXCJcbiAgICAgICAgd2lkdGg9e1snMTAwJScsICc0MjBweCddfVxuICAgICAgICBwPVwieGxcIlxuICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDE2LCBib3hTaGFkb3c6ICcwIDI0cHggNzBweCByZ2JhKDIsIDQ0LCAzNCwgMC4yOCknIH19XG4gICAgICA+XG4gICAgICAgIDxIMyBtYj1cInNtXCI+Q2hhbmdlIHBhc3N3b3JkPC9IMz5cbiAgICAgICAgPFRleHQgbWI9XCJ4bFwiIGNvbG9yPVwiIzY0NzQ4YlwiPlxuICAgICAgICAgIFNldCBhIG5ldyBwYXNzd29yZCBmb3Ige3JlY29yZD8ucGFyYW1zPy5uYW1lIHx8IHJlY29yZD8ucGFyYW1zPy5lbWFpbCB8fCAndGhpcyB1c2VyJ30uXG4gICAgICAgIDwvVGV4dD5cblxuICAgICAgICA8UGFzc3dvcmRGaWVsZFxuICAgICAgICAgIGlkPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICBsYWJlbD1cIk5ldyBwYXNzd29yZFwiXG4gICAgICAgICAgdmFsdWU9e3Bhc3N3b3JkfVxuICAgICAgICAgIG9uQ2hhbmdlPXtzZXRQYXNzd29yZH1cbiAgICAgICAgICB2aXNpYmxlPXtzaG93UGFzc3dvcmR9XG4gICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldFNob3dQYXNzd29yZCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgIC8+XG4gICAgICAgIDxQYXNzd29yZEZpZWxkXG4gICAgICAgICAgaWQ9XCJjb25maXJtLXBhc3N3b3JkXCJcbiAgICAgICAgICBsYWJlbD1cIkNvbmZpcm0gcGFzc3dvcmRcIlxuICAgICAgICAgIHZhbHVlPXtjb25maXJtUGFzc3dvcmR9XG4gICAgICAgICAgb25DaGFuZ2U9e3NldENvbmZpcm1QYXNzd29yZH1cbiAgICAgICAgICB2aXNpYmxlPXtzaG93Q29uZmlybX1cbiAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0U2hvd0NvbmZpcm0oKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAvPlxuXG4gICAgICAgIHtlcnJvciA/IChcbiAgICAgICAgICA8VGV4dCBtYj1cImxnXCIgY29sb3I9XCIjZGMyNjI2XCI+e2Vycm9yfTwvVGV4dD5cbiAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgPEJveCBkaXNwbGF5PVwiZmxleFwiIGp1c3RpZnlDb250ZW50PVwiZmxleC1lbmRcIiBzdHlsZT17eyBnYXA6IDEwIH19PlxuICAgICAgICAgIDxCdXR0b24gdHlwZT1cImJ1dHRvblwiIHZhcmlhbnQ9XCJ0ZXh0XCIgb25DbGljaz17Y2xvc2V9IGRpc2FibGVkPXtzYXZpbmd9PlxuICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiB0eXBlPVwic3VibWl0XCIgdmFyaWFudD1cImNvbnRhaW5lZFwiIGRpc2FibGVkPXtzYXZpbmd9PlxuICAgICAgICAgICAge3NhdmluZyA/ICdTYXZpbmfigKYnIDogJ1NhdmUgcGFzc3dvcmQnfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0JveD5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IENoYW5nZVBhc3N3b3JkXG4iLCIvKiogSVNPIDMxNjYtMjpJTiBjb2Rlcy4gS2VwdCBuZXh0IHRvIHRoZSBBZG1pbkpTIGZvcm0gc28gdGhlIGRyb3Bkb3duIGFsd2F5cyBoYXMgZXZlcnkgc3RhdGUuICovXG5leHBvcnQgY29uc3QgSU5ESUFfU1RBVEVTID0gW1xuICB7IGNvZGU6ICdBTicsIG5hbWU6ICdBbmRhbWFuIGFuZCBOaWNvYmFyIElzbGFuZHMnIH0sXG4gIHsgY29kZTogJ0FQJywgbmFtZTogJ0FuZGhyYSBQcmFkZXNoJyB9LFxuICB7IGNvZGU6ICdBUicsIG5hbWU6ICdBcnVuYWNoYWwgUHJhZGVzaCcgfSxcbiAgeyBjb2RlOiAnQVMnLCBuYW1lOiAnQXNzYW0nIH0sXG4gIHsgY29kZTogJ0JSJywgbmFtZTogJ0JpaGFyJyB9LFxuICB7IGNvZGU6ICdDSCcsIG5hbWU6ICdDaGFuZGlnYXJoJyB9LFxuICB7IGNvZGU6ICdDVCcsIG5hbWU6ICdDaGhhdHRpc2dhcmgnIH0sXG4gIHsgY29kZTogJ0RIJywgbmFtZTogJ0RhZHJhIGFuZCBOYWdhciBIYXZlbGkgYW5kIERhbWFuIGFuZCBEaXUnIH0sXG4gIHsgY29kZTogJ0RMJywgbmFtZTogJ0RlbGhpJyB9LFxuICB7IGNvZGU6ICdHQScsIG5hbWU6ICdHb2EnIH0sXG4gIHsgY29kZTogJ0dKJywgbmFtZTogJ0d1amFyYXQnIH0sXG4gIHsgY29kZTogJ0hSJywgbmFtZTogJ0hhcnlhbmEnIH0sXG4gIHsgY29kZTogJ0hQJywgbmFtZTogJ0hpbWFjaGFsIFByYWRlc2gnIH0sXG4gIHsgY29kZTogJ0pLJywgbmFtZTogJ0phbW11IGFuZCBLYXNobWlyJyB9LFxuICB7IGNvZGU6ICdKSCcsIG5hbWU6ICdKaGFya2hhbmQnIH0sXG4gIHsgY29kZTogJ0tBJywgbmFtZTogJ0thcm5hdGFrYScgfSxcbiAgeyBjb2RlOiAnS0wnLCBuYW1lOiAnS2VyYWxhJyB9LFxuICB7IGNvZGU6ICdMQScsIG5hbWU6ICdMYWRha2gnIH0sXG4gIHsgY29kZTogJ0xEJywgbmFtZTogJ0xha3NoYWR3ZWVwJyB9LFxuICB7IGNvZGU6ICdNUCcsIG5hbWU6ICdNYWRoeWEgUHJhZGVzaCcgfSxcbiAgeyBjb2RlOiAnTUgnLCBuYW1lOiAnTWFoYXJhc2h0cmEnIH0sXG4gIHsgY29kZTogJ01OJywgbmFtZTogJ01hbmlwdXInIH0sXG4gIHsgY29kZTogJ01MJywgbmFtZTogJ01lZ2hhbGF5YScgfSxcbiAgeyBjb2RlOiAnTVonLCBuYW1lOiAnTWl6b3JhbScgfSxcbiAgeyBjb2RlOiAnTkwnLCBuYW1lOiAnTmFnYWxhbmQnIH0sXG4gIHsgY29kZTogJ09SJywgbmFtZTogJ09kaXNoYScgfSxcbiAgeyBjb2RlOiAnUFknLCBuYW1lOiAnUHVkdWNoZXJyeScgfSxcbiAgeyBjb2RlOiAnUEInLCBuYW1lOiAnUHVuamFiJyB9LFxuICB7IGNvZGU6ICdSSicsIG5hbWU6ICdSYWphc3RoYW4nIH0sXG4gIHsgY29kZTogJ1NLJywgbmFtZTogJ1Npa2tpbScgfSxcbiAgeyBjb2RlOiAnVE4nLCBuYW1lOiAnVGFtaWwgTmFkdScgfSxcbiAgeyBjb2RlOiAnVEcnLCBuYW1lOiAnVGVsYW5nYW5hJyB9LFxuICB7IGNvZGU6ICdUUicsIG5hbWU6ICdUcmlwdXJhJyB9LFxuICB7IGNvZGU6ICdVUCcsIG5hbWU6ICdVdHRhciBQcmFkZXNoJyB9LFxuICB7IGNvZGU6ICdVVCcsIG5hbWU6ICdVdHRhcmFraGFuZCcgfSxcbiAgeyBjb2RlOiAnV0InLCBuYW1lOiAnV2VzdCBCZW5nYWwnIH0sXG5dXG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgTG9jYWxTZWxlY3QsIFNlYXJjaGFibGVTZWxlY3QsIFN0YXR1c1N3aXRjaCwgaXNGbGFnT24gfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuaW1wb3J0IHsgSU5ESUFfU1RBVEVTIH0gZnJvbSAnLi9pbmRpYS1zdGF0ZXMuanMnXG5cbmNvbnN0IFZFSElDTEVfVFlQRVMgPSBbXG4gIHsgdmFsdWU6ICdCaWtlJywgbGFiZWw6ICdCaWtlJyB9LFxuICB7IHZhbHVlOiAnU2Nvb3RlcicsIGxhYmVsOiAnU2Nvb3RlcicgfSxcbiAgeyB2YWx1ZTogJ0VsZWN0cmljIGJpa2UnLCBsYWJlbDogJ0VsZWN0cmljIGJpa2UnIH0sXG4gIHsgdmFsdWU6ICdDeWNsZScsIGxhYmVsOiAnQ3ljbGUnIH0sXG4gIHsgdmFsdWU6ICdWYW4nLCBsYWJlbDogJ1ZhbicgfSxcbiAgeyB2YWx1ZTogJ090aGVyJywgbGFiZWw6ICdPdGhlcicgfSxcbl1cblxuY29uc3QgU1RBVEVfT1BUSU9OUyA9IElORElBX1NUQVRFUy5tYXAoKGl0ZW0pID0+ICh7XG4gIHZhbHVlOiBpdGVtLm5hbWUsXG4gIGxhYmVsOiBpdGVtLm5hbWUsXG59KSlcblxuZnVuY3Rpb24gRmllbGRFcnJvcih7IGVycm9yIH0pIHtcbiAgaWYgKCFlcnJvcj8ubWVzc2FnZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9yLm1lc3NhZ2V9PC9zcGFuPlxufVxuXG5jb25zdCBQYXJ0bmVyRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzTmV3ID0gYWN0aW9uPy5uYW1lID09PSAnbmV3JyB8fCAhcmVjb3JkPy5pZFxuICBjb25zdCByZWFkT25seSA9IGFjdGlvbj8ubmFtZSA9PT0gJ3Nob3cnXG4gIGNvbnN0IGhhc1Bhc3N3b3JkID0gQm9vbGVhbihwYXJhbXMuaGFzUGFzc3dvcmQpXG4gIGNvbnN0IGlzQWN0aXZlID0gaXNOZXcgJiYgKHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJycpXG4gICAgPyB0cnVlXG4gICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNBY3RpdmUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ2lzQWN0aXZlJywgdHJ1ZSlcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbaXNOZXddKVxuXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBwYXJ0bmVyJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgbWVzc2FnZTogaXNOZXdcbiAgICAgICAgICAgID8gJ1BhcnRuZXIgc2F2ZWQuIEEgcGFzc3dvcmQgZW1haWwgd2lsbCBiZSBzZW50IGlmIHRoZXkgZG8gbm90IGhhdmUgYSBwYXNzd29yZCB5ZXQuJ1xuICAgICAgICAgICAgOiAnUGFydG5lciB1cGRhdGVkJyxcbiAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHBhcnRuZXIuIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntpc05ldyA/ICdBZGQgZGVsaXZlcnkgcGFydG5lcicgOiBwYXJhbXMubmFtZSB8fCAnRGVsaXZlcnkgcGFydG5lcid9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIENvbGxlY3QgZnVsbCBLWUMgYW5kIGNvbnRhY3QgZGV0YWlscy4gVGhleSBsb2cgaW4gdG8gdGhlIFRva3JpaWkgUGFydG5lciBhcHAgd2l0aCB0aGlzIGVtYWlsXG4gICAgICAgICAgYWZ0ZXIgc2V0dGluZyBhIHBhc3N3b3JkIGZyb20gdGhlIGludml0ZSBtYWlsLlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5BY2NvdW50IHN0YXR1czwvaDQ+XG4gICAgICAgICAgPHA+SW5hY3RpdmUgcGFydG5lcnMgY2Fubm90IGxvZyBpbiwgZXZlbiBpZiB0aGV5IGFscmVhZHkgc2V0IGEgcGFzc3dvcmQuPC9wPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2lzQWN0aXZlfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgdGl0bGU9e2lzQWN0aXZlID8gJ0FjdGl2ZScgOiAnSW5hY3RpdmUnfVxuICAgICAgICAgICAgaGludD17aXNBY3RpdmUgPyAnQ2FuIHNpZ24gaW4gdG8gdGhlIHBhcnRuZXIgYXBwJyA6ICdMb2dpbiBpcyBibG9ja2VkIHVudGlsIHlvdSB0dXJuIHRoaXMgb24nfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnaXNBY3RpdmUnLCBuZXh0KX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHshaXNOZXcgPyAoXG4gICAgICAgICAgICA8VGV4dCBtdD1cImxnXCIgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgICAge2hhc1Bhc3N3b3JkID8gJ1Bhc3N3b3JkIGlzIGFscmVhZHkgc2V0LicgOiAnTm8gcGFzc3dvcmQgeWV0IOKAlCBzZW5kIHRoZSBpbnZpdGUgZW1haWwgYWZ0ZXIgc2F2aW5nLid9XG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Mb2dpbiBkZXRhaWxzPC9oND5cbiAgICAgICAgICA8cD5FbWFpbCBpcyB1c2VkIHRvIGNyZWF0ZSBhbmQgcmVzZXQgdGhlIHBhcnRuZXIgcGFzc3dvcmQuIE5vIFNNUyBpcyBzZW50LjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBFbWFpbFxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJlbWFpbFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5lbWFpbCB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2VtYWlsJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJwYXJ0bmVyQGV4YW1wbGUuY29tXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7ZXJyb3JzLmVtYWlsID8gPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5lbWFpbH0gLz4gOiAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5QYXNzd29yZCBsaW5rIGlzIHNlbnQgdG8gdGhpcyBpbmJveDwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBNb2JpbGUgbnVtYmVyXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgIG1heExlbmd0aD17MTB9XG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5waG9uZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3Bob25lJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgMTApKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIxMC1kaWdpdCBudW1iZXJcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMucGhvbmV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5QZXJzb25hbCBkZXRhaWxzPC9oND5cbiAgICAgICAgPHA+TmFtZSBpcyBzaG93biBvbiBvcmRlcnMuIEZhdGhlciZhcG9zO3MgbmFtZSBhbmQgRE9CIGhlbHAgd2l0aCBLWUMgcmVjb3Jkcy48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEZ1bGwgbmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5uYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUGFydG5lciBmdWxsIG5hbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMubmFtZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEZhdGhlciZhcG9zO3MgLyBndWFyZGlhbiBuYW1lIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZmF0aGVyTmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2ZhdGhlck5hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFzIG9uIEFhZGhhYXIgLyBkb2N1bWVudHNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIERhdGUgb2YgYmlydGggPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZGF0ZU9mQmlydGggfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZGF0ZU9mQmlydGgnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5LWUMgZG9jdW1lbnRzPC9oND5cbiAgICAgICAgPHA+UEFOIGFuZCBBYWRoYWFyIGFyZSByZXF1aXJlZCBmb3IgcGFydG5lciBvbmJvYXJkaW5nLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUEFOIG51bWJlclxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMH1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5wYW5OdW1iZXIgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3Bhbk51bWJlcicsIGV2ZW50LnRhcmdldC52YWx1ZS50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoL1teQS1aMC05XS9nLCAnJykuc2xpY2UoMCwgMTApKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQUJDREUxMjM0RlwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5wYW5OdW1iZXJ9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBYWRoYWFyIG51bWJlclxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgIG1heExlbmd0aD17MTJ9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWFkaGFhck51bWJlciB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICBzZXRGaWVsZCgnYWFkaGFhck51bWJlcicsIGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXEQvZywgJycpLnNsaWNlKDAsIDEyKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjEyLWRpZ2l0IEFhZGhhYXJcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuYWFkaGFhck51bWJlcn0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkN1cnJlbnQgYWRkcmVzczwvaDQ+XG4gICAgICAgIDxwPldoZXJlIHRoZSBwYXJ0bmVyIGN1cnJlbnRseSBsaXZlcyAvIG9wZXJhdGVzIGZyb20uPC9wPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBZGRyZXNzIGxpbmUgMVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzTGluZTEgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdhZGRyZXNzTGluZTEnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkhvdXNlIC8gc3RyZWV0IC8gYXJlYVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5hZGRyZXNzTGluZTF9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBZGRyZXNzIGxpbmUgMiA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NMaW5lMiB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2FkZHJlc3NMaW5lMicsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTGFuZG1hcmssIGNvbG9ueVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDaXR5XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNpdHkgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdjaXR5JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJDaXR5XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmNpdHl9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQaW5jb2RlXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXs2fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBpbmNvZGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdwaW5jb2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgNikpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjYtZGlnaXQgcGluY29kZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5waW5jb2RlfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgU3RhdGVcbiAgICAgICAgICA8U2VhcmNoYWJsZVNlbGVjdFxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zdGF0ZSB8fCAnJ31cbiAgICAgICAgICAgIG9wdGlvbnM9e1t7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3Qgc3RhdGUnIH0sIC4uLlNUQVRFX09QVElPTlNdfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnc3RhdGUnLCBuZXh0KX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VsZWN0IHN0YXRlXCJcbiAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIHN0YXRlc1wiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnN0YXRlfSAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgUGVybWFuZW50IGFkZHJlc3MgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0IHRva3JpLXRleHRhcmVhXCJcbiAgICAgICAgICAgIHJvd3M9ezN9XG4gICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBlcm1hbmVudEFkZHJlc3MgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgncGVybWFuZW50QWRkcmVzcycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIklmIGRpZmZlcmVudCBmcm9tIGN1cnJlbnQgYWRkcmVzc1wiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5FbWVyZ2VuY3kgY29udGFjdDwvaDQ+XG4gICAgICAgICAgPHA+U29tZW9uZSB3ZSBjYW4gY2FsbCBpZiB0aGUgcGFydG5lciBpcyB1bnJlYWNoYWJsZS48L3A+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQ29udGFjdCBuYW1lIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZW1lcmdlbmN5TmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2VtZXJnZW5jeU5hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlJlbGF0aXZlIC8gZnJpZW5kIG5hbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIENvbnRhY3QgbW9iaWxlIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMH1cbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmVtZXJnZW5jeVBob25lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdlbWVyZ2VuY3lQaG9uZScsIGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXEQvZywgJycpLnNsaWNlKDAsIDEwKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjEwLWRpZ2l0IG51bWJlclwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5lbWVyZ2VuY3lQaG9uZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+VmVoaWNsZSBkZXRhaWxzPC9oND5cbiAgICAgICAgICA8cD5Vc2VkIGZvciBkZWxpdmVyeSBhc3NpZ25tZW50IGFuZCBzdXBwb3J0LjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBWZWhpY2xlIHR5cGUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDYgfX0+XG4gICAgICAgICAgICAgIDxMb2NhbFNlbGVjdFxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudmVoaWNsZVR5cGUgfHwgJyd9XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17W3sgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCB2ZWhpY2xlJyB9LCAuLi5WRUhJQ0xFX1RZUEVTXX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCd2ZWhpY2xlVHlwZScsIG5leHQpfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgVmVoaWNsZSBudW1iZXIgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy52ZWhpY2xlTnVtYmVyIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHNldEZpZWxkKCd2ZWhpY2xlTnVtYmVyJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCkuc2xpY2UoMCwgMjApKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiZS5nLiBNSDEyQUIxMjM0XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5CYW5rIGRldGFpbHM8L2g0PlxuICAgICAgICA8cD5Gb3IgcGF5b3V0cyBhbmQgcmVpbWJ1cnNlbWVudHMuIE9wdGlvbmFsIGZvciBub3csIGJ1dCByZWNvbW1lbmRlZC48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFjY291bnQgaG9sZGVyIG5hbWUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hY2NvdW50SG9sZGVyTmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2FjY291bnRIb2xkZXJOYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBcyBwZXIgYmFuayBhY2NvdW50XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBY2NvdW50IG51bWJlciA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFjY291bnROdW1iZXIgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdhY2NvdW50TnVtYmVyJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xccysvZywgJycpKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJCYW5rIGFjY291bnQgbnVtYmVyXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBJRlNDIGNvZGUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgIG1heExlbmd0aD17MTF9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmlmc2NDb2RlIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgc2V0RmllbGQoJ2lmc2NDb2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvW15BLVowLTldL2csICcnKS5zbGljZSgwLCAxMSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNCSU4wMDAxMjM0XCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuaWZzY0NvZGV9IC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5JbnRlcm5hbCBub3RlczwvaDQ+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBOb3RlcyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXQgdG9rcmktdGV4dGFyZWFcIlxuICAgICAgICAgICAgcm93cz17NH1cbiAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubm90ZXMgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbm90ZXMnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTaGlmdCB0aW1pbmcsIGh1Yiwgb3IgYW55dGhpbmcgeW91ciB0ZWFtIHNob3VsZCByZW1lbWJlclwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAge3JlYWRPbmx5ID8gbnVsbCA6IChcbiAgICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICAgIHtpc05ldyA/ICdDcmVhdGUgcGFydG5lcicgOiAnU2F2ZSBwYXJ0bmVyJ31cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhcnRuZXJFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEFwaUNsaWVudCwgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgU2VhcmNoYWJsZVNlbGVjdCwgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5pbXBvcnQgeyBJTkRJQV9TVEFURVMgfSBmcm9tICcuL2luZGlhLXN0YXRlcy5qcydcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5cbmNvbnN0IFNUQVRFX09QVElPTlMgPSBJTkRJQV9TVEFURVMubWFwKChpdGVtKSA9PiAoe1xuICB2YWx1ZTogaXRlbS5jb2RlLFxuICBsYWJlbDogYCR7aXRlbS5uYW1lfSAoJHtpdGVtLmNvZGV9KWAsXG59KSlcblxuY29uc3QgUGluY29kZUVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlLCBhY3Rpb24gfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBpc05ldyA9IGFjdGlvbj8ubmFtZSA9PT0gJ25ldycgfHwgIXJlY29yZD8uaWRcbiAgY29uc3QgcmVhZE9ubHkgPSBhY3Rpb24/Lm5hbWUgPT09ICdzaG93J1xuICBjb25zdCBpc0FjdGl2ZSA9IGlzTmV3ICYmIChwYXJhbXMuaXNBY3RpdmUgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBY3RpdmUgPT09ICcnKVxuICAgID8gdHJ1ZVxuICAgIDogaXNGbGFnT24ocGFyYW1zLmlzQWN0aXZlKVxuICBjb25zdCBtb3JuaW5nRW5hYmxlZCA9IGlzTmV3ICYmIChwYXJhbXMubW9ybmluZ0VuYWJsZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMubW9ybmluZ0VuYWJsZWQgPT09ICcnKVxuICAgID8gdHJ1ZVxuICAgIDogaXNGbGFnT24ocGFyYW1zLm1vcm5pbmdFbmFibGVkKVxuICBjb25zdCBleHByZXNzRW5hYmxlZCA9IGlzTmV3ICYmIChwYXJhbXMuZXhwcmVzc0VuYWJsZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuZXhwcmVzc0VuYWJsZWQgPT09ICcnKVxuICAgID8gZmFsc2VcbiAgICA6IGlzRmxhZ09uKHBhcmFtcy5leHByZXNzRW5hYmxlZClcbiAgY29uc3QgW3BhcnRuZXJzLCBzZXRQYXJ0bmVyc10gPSB1c2VTdGF0ZShbXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLmlzQWN0aXZlID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQWN0aXZlID09PSAnJykpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnaXNBY3RpdmUnLCB0cnVlKVxuICAgIH1cbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5tb3JuaW5nRW5hYmxlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5tb3JuaW5nRW5hYmxlZCA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdFbmFibGVkJywgdHJ1ZSlcbiAgICB9XG4gICAgaWYgKGlzTmV3ICYmIChwYXJhbXMuZXhwcmVzc0VuYWJsZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuZXhwcmVzc0VuYWJsZWQgPT09ICcnKSkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdleHByZXNzRW5hYmxlZCcsIGZhbHNlKVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtpc05ld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgaWdub3JlID0gZmFsc2VcbiAgICBhcGlcbiAgICAgIC5yZXNvdXJjZUFjdGlvbih7IHJlc291cmNlSWQ6ICdEZWxpdmVyeVBhcnRuZXInLCBhY3Rpb25OYW1lOiAnbGlzdCcsIHBhcmFtczogeyBwZXJQYWdlOiAyMDAgfSB9KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmUpIHJldHVyblxuICAgICAgICBjb25zdCByZWNvcmRzID0gcmVzcG9uc2UuZGF0YT8ucmVjb3JkcyB8fCBbXVxuICAgICAgICBzZXRQYXJ0bmVycyhcbiAgICAgICAgICByZWNvcmRzLm1hcCgoaXRlbSkgPT4gKHtcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmlkIHx8IGl0ZW0ucGFyYW1zPy5pZCxcbiAgICAgICAgICAgIGxhYmVsOiBpc0ZsYWdPbihpdGVtLnBhcmFtcz8uaXNBY3RpdmUpXG4gICAgICAgICAgICAgID8gaXRlbS5wYXJhbXM/Lm5hbWUgfHwgJ1BhcnRuZXInXG4gICAgICAgICAgICAgIDogYCR7aXRlbS5wYXJhbXM/Lm5hbWUgfHwgJ1BhcnRuZXInfSAoaW5hY3RpdmUpYCxcbiAgICAgICAgICB9KSksXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0UGFydG5lcnMoW10pXG4gICAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBlcnJvcnMgPSB1c2VNZW1vKCgpID0+IHJlY29yZD8uZXJyb3JzIHx8IHt9LCBbcmVjb3JkPy5lcnJvcnNdKVxuICBjb25zdCBwYXJ0bmVySWQgPSBwYXJhbXMucGFydG5lcklkIHx8IHBhcmFtcy5wYXJ0bmVyIHx8ICcnXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBwaW5jb2RlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGlzTmV3ID8gJ1BpbmNvZGUgYWRkZWQnIDogJ1BpbmNvZGUgdXBkYXRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSBwaW5jb2RlLiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57aXNOZXcgPyAnQWRkIHNlcnZpY2VhYmxlIHBpbmNvZGUnIDogYFBJTiAke3BhcmFtcy5waW5jb2RlIHx8ICcnfWB9PC9IMz5cbiAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAwLCBjb2xvcjogJyNmZmYnLCBvcGFjaXR5OiAwLjkgfX0+XG4gICAgICAgICAgQ3VzdG9tZXJzIGNhbiBzYXZlIGFuIGFkZHJlc3MgYW5kIGNoZWNrIG91dCBvbmx5IHdoZW4gdGhpcyBwaW5jb2RlIGlzIGFjdGl2ZS5cbiAgICAgICAgPC9wPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+RGVsaXZlcnkgY292ZXJhZ2U8L2g0PlxuICAgICAgICAgIDxwPlR1cm4gdGhpcyBvZmYgdG8gc3RvcCB0YWtpbmcgb3JkZXJzIGZvciB0aGlzIFBJTiB3aXRob3V0IGRlbGV0aW5nIGl0LjwvcD5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgIHRpdGxlPXtpc0FjdGl2ZSA/ICdXZSBkZWxpdmVyIGhlcmUnIDogJ05vdCBkZWxpdmVyaW5nJ31cbiAgICAgICAgICAgIGhpbnQ9e2lzQWN0aXZlID8gJ0FkZHJlc3Mgc2F2ZSBhbmQgY2hlY2tvdXQgYXJlIGFsbG93ZWQnIDogJ0N1c3RvbWVycyB3aWxsIHNlZSB0aGF0IHRoaXMgUElOIGlzIG5vdCBzZXJ2aWNlYWJsZSd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdpc0FjdGl2ZScsIG5leHQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5EZWxpdmVyeSBvcHRpb25zPC9oND5cbiAgICAgICAgICA8cD5UdXJuIGFuIG9wdGlvbiBvZmYgdG8gc2hvdyBpdCBhcyBjb21pbmcgc29vbiBhdCBjaGVja291dC4gSWYgYm90aCBhcmUgb2ZmLCB0aGlzIFBJTiBpcyBub3QgZGVsaXZlcmFibGUuPC9wPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e21vcm5pbmdFbmFibGVkfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgb25MYWJlbD1cIk9uXCJcbiAgICAgICAgICAgIG9mZkxhYmVsPVwiT2ZmXCJcbiAgICAgICAgICAgIHRpdGxlPVwiTW9ybmluZyBkZWxpdmVyeVwiXG4gICAgICAgICAgICBoaW50PXttb3JuaW5nRW5hYmxlZCA/ICdTaG9wcGVycyBjYW4gY2hvb3NlIG1vcm5pbmcgZGVsaXZlcnknIDogJ1Nob3duIGFzIGNvbWluZyBzb29uJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ21vcm5pbmdFbmFibGVkJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogMTIgfX0gLz5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtleHByZXNzRW5hYmxlZH1cbiAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgIG9uTGFiZWw9XCJPblwiXG4gICAgICAgICAgICBvZmZMYWJlbD1cIk9mZlwiXG4gICAgICAgICAgICB0aXRsZT1cIjkwLU1pbnV0ZSBkZWxpdmVyeVwiXG4gICAgICAgICAgICBoaW50PXtleHByZXNzRW5hYmxlZCA/ICdTaG9wcGVycyBjYW4gY2hvb3NlIDkwLW1pbnV0ZSBkZWxpdmVyeScgOiAnU2hvd24gYXMgY29taW5nIHNvb24nfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnZXhwcmVzc0VuYWJsZWQnLCBuZXh0KX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+QXNzaWduZWQgcGFydG5lcjwvaDQ+XG4gICAgICAgICAgPHA+TmV3IG9yZGVycyBpbiB0aGlzIFBJTiBhcmUgYXV0by1hc3NpZ25lZCB0byB0aGlzIHBhcnRuZXIuIFlvdSBjYW4gcmVhc3NpZ24gbGF0ZXIgb24gdGhlIG9yZGVyLjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBEZWxpdmVyeSBwYXJ0bmVyIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxTZWFyY2hhYmxlU2VsZWN0XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJ0bmVySWR9XG4gICAgICAgICAgICAgIG9wdGlvbnM9e1t7IHZhbHVlOiAnJywgbGFiZWw6ICdObyBwYXJ0bmVyIGFzc2lnbmVkJyB9LCAuLi5wYXJ0bmVyc119XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3BhcnRuZXJJZCcsIG5leHQpXG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3BhcnRuZXInLCBuZXh0KVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlbGVjdCBhIHBhcnRuZXJcIlxuICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcj1cIlNlYXJjaCBwYXJ0bmVyc1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+TG9jYXRpb248L2g0PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQaW5jb2RlXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgIG1heExlbmd0aD17Nn1cbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5IHx8ICFpc05ld31cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5waW5jb2RlIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgncGluY29kZScsIGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXEQvZywgJycpLnNsaWNlKDAsIDYpKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCI2LWRpZ2l0IFBJTlwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge2Vycm9ycy5waW5jb2RlID8gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3JzLnBpbmNvZGUubWVzc2FnZX08L3NwYW4+IDogKFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+SW5kaWEgUElOIGNvZGUsIDYgZGlnaXRzPC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFyZWEgbmFtZSA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFyZWFMYWJlbCB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2FyZWFMYWJlbCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQW5kaGVyaSBXZXN0LCBCYW5kcmEsIOKAplwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDaXR5XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNpdHkgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdjaXR5JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJNdW1iYWlcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMuY2l0eSA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9ycy5jaXR5Lm1lc3NhZ2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBTdGF0ZVxuICAgICAgICAgICAgPFNlYXJjaGFibGVTZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zdGF0ZUNvZGUgfHwgcGFyYW1zLnN0YXRlIHx8ICcnfVxuICAgICAgICAgICAgICBvcHRpb25zPXtbeyB2YWx1ZTogJycsIGxhYmVsOiAnU2VsZWN0IHN0YXRlJyB9LCAuLi5TVEFURV9PUFRJT05TXX1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRGaWVsZCgnc3RhdGVDb2RlJywgbmV4dClcbiAgICAgICAgICAgICAgICBzZXRGaWVsZCgnc3RhdGUnLCBuZXh0KVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlbGVjdCBzdGF0ZVwiXG4gICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIHN0YXRlc1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge2Vycm9ycy5zdGF0ZSB8fCBlcnJvcnMuc3RhdGVDb2RlID8gKFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPlxuICAgICAgICAgICAgICAgIHsoZXJyb3JzLnN0YXRlIHx8IGVycm9ycy5zdGF0ZUNvZGUpLm1lc3NhZ2V9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5BbGwgSW5kaWFuIHN0YXRlcyBhbmQgdW5pb24gdGVycml0b3JpZXM8L3NwYW4+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7cmVhZE9ubHkgPyBudWxsIDogKFxuICAgICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgICAge2lzTmV3ID8gJ0FkZCBwaW5jb2RlJyA6ICdTYXZlIHBpbmNvZGUnfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUGluY29kZUVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBBcGlDbGllbnQsIHVzZU5vdGljZSB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5cbmNvbnN0IFN0YXR1c1RvZ2dsZSA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZCwgcmVzb3VyY2UsIHByb3BlcnR5LCB3aGVyZSwgb25DaGFuZ2UgfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IGZpZWxkID0gcHJvcGVydHk/LnBhdGggfHwgJ2lzQWN0aXZlJ1xuICBjb25zdCBhY3Rpb25OYW1lID0gcHJvcGVydHk/LmN1c3RvbT8uYWN0aW9uTmFtZSB8fCAndG9nZ2xlQWN0aXZlJ1xuICBjb25zdCBvbkxhYmVsID0gcHJvcGVydHk/LmN1c3RvbT8ub25MYWJlbCB8fCAnQWN0aXZlJ1xuICBjb25zdCBvZmZMYWJlbCA9IHByb3BlcnR5Py5jdXN0b20/Lm9mZkxhYmVsIHx8ICdJbmFjdGl2ZSdcbiAgY29uc3QgcmF3ID0gcmVjb3JkPy5wYXJhbXM/LltmaWVsZF1cbiAgY29uc3QgW2NoZWNrZWQsIHNldENoZWNrZWRdID0gdXNlU3RhdGUoaXNGbGFnT24ocmF3KSlcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRDaGVja2VkKGlzRmxhZ09uKHJhdykpXG4gIH0sIFtyYXcsIHJlY29yZD8uaWRdKVxuXG4gIGNvbnN0IHBlcnNpc3QgPSBhc3luYyAobmV4dCkgPT4ge1xuICAgIGlmICghcmVjb3JkPy5pZCkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuICAgICAgICByZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcbiAgICAgICAgcmVjb3JkSWQ6IHJlY29yZC5pZCxcbiAgICAgICAgYWN0aW9uTmFtZSxcbiAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgIGRhdGE6IHsgW2ZpZWxkXTogbmV4dCB9LFxuICAgICAgfSlcbiAgICAgIGNvbnN0IHNhdmVkID0gcmVzcG9uc2UuZGF0YT8ucmVjb3JkPy5wYXJhbXM/LltmaWVsZF1cbiAgICAgIHNldENoZWNrZWQoc2F2ZWQgPT09IHVuZGVmaW5lZCA/IG5leHQgOiBpc0ZsYWdPbihzYXZlZCkpXG4gICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZS5kYXRhPy5ub3RpY2VcbiAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgIG1lc3NhZ2U6IG5vdGljZT8ubWVzc2FnZSB8fCAobmV4dCA/IGBNYXJrZWQgJHtvbkxhYmVsLnRvTG93ZXJDYXNlKCl9YCA6IGBNYXJrZWQgJHtvZmZMYWJlbC50b0xvd2VyQ2FzZSgpfWApLFxuICAgICAgICB0eXBlOiBub3RpY2U/LnR5cGUgfHwgJ3N1Y2Nlc3MnLFxuICAgICAgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IHVwZGF0ZSBzdGF0dXMuJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChuZXh0KSA9PiB7XG4gICAgaWYgKHdoZXJlID09PSAnZWRpdCcgJiYgdHlwZW9mIG9uQ2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBzZXRDaGVja2VkKG5leHQpXG4gICAgICBvbkNoYW5nZShmaWVsZCwgbmV4dClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBwZXJzaXN0KG5leHQpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgIGNvbXBhY3Q9e3doZXJlICE9PSAnZWRpdCd9XG4gICAgICBjaGVja2VkPXtjaGVja2VkfVxuICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICBvbkxhYmVsPXtvbkxhYmVsfVxuICAgICAgb2ZmTGFiZWw9e29mZkxhYmVsfVxuICAgICAgdGl0bGU9e3doZXJlID09PSAnZWRpdCcgPyAoY2hlY2tlZCA/IG9uTGFiZWwgOiBvZmZMYWJlbCkgOiB1bmRlZmluZWR9XG4gICAgICBoaW50PXt3aGVyZSA9PT0gJ2VkaXQnID8gcHJvcGVydHk/LmRlc2NyaXB0aW9uIDogdW5kZWZpbmVkfVxuICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZX1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXR1c1RvZ2dsZVxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8gfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuZnVuY3Rpb24gcGFkKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnBhZFN0YXJ0KDIsICcwJylcbn1cblxuZnVuY3Rpb24gdG9EYXRlSW5wdXQodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGNvbnN0IHRleHQgPSBTdHJpbmcodmFsdWUpXG4gIGlmICgvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9Ly50ZXN0KHRleHQpKSByZXR1cm4gdGV4dC5zbGljZSgwLCAxMClcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxuICBpZiAoTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuICcnXG4gIHJldHVybiBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9LSR7cGFkKGRhdGUuZ2V0TW9udGgoKSArIDEpfS0ke3BhZChkYXRlLmdldERhdGUoKSl9YFxufVxuXG5mdW5jdGlvbiBmb3JtYXRXaGVuKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAn4oCUJ1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gJ+KAlCdcbiAgcmV0dXJuIGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2VuLUlOJywgeyBkYXRlU3R5bGU6ICdtZWRpdW0nLCB0aW1lU3R5bGU6ICdzaG9ydCcgfSlcbn1cblxuZnVuY3Rpb24gcGFyc2VBZGRyZXNzZXMocGFyYW1zKSB7XG4gIGNvbnN0IHJhdyA9IHBhcmFtcy5hZGRyZXNzZXNcbiAgaWYgKEFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIHJhdy5maWx0ZXIoQm9vbGVhbilcbiAgaWYgKHJhdyAmJiB0eXBlb2YgcmF3ID09PSAnb2JqZWN0JykgcmV0dXJuIFtyYXddXG4gIGlmICh0eXBlb2YgcmF3ID09PSAnc3RyaW5nJyAmJiByYXcudHJpbSgpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyc2VkKSkgcmV0dXJuIHBhcnNlZC5maWx0ZXIoQm9vbGVhbilcbiAgICAgIGlmIChwYXJzZWQgJiYgdHlwZW9mIHBhcnNlZCA9PT0gJ29iamVjdCcpIHJldHVybiBbcGFyc2VkXVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gZmxhdHRlbmVkIEFkbWluSlMgcGFyYW1zIGJlbG93XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZ3JvdXBlZCA9IHt9XG4gIE9iamVjdC5lbnRyaWVzKHBhcmFtcykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgY29uc3QgbWF0Y2ggPSBrZXkubWF0Y2goL15hZGRyZXNzZXNcXC4oXFxkKylcXC4oLispJC8pXG4gICAgaWYgKCFtYXRjaCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgcmV0dXJuXG4gICAgY29uc3QgWywgaW5kZXgsIGZpZWxkXSA9IG1hdGNoXG4gICAgZ3JvdXBlZFtpbmRleF0gPSBncm91cGVkW2luZGV4XSB8fCB7fVxuICAgIGdyb3VwZWRbaW5kZXhdW2ZpZWxkXSA9IHZhbHVlXG4gIH0pXG4gIHJldHVybiBPYmplY3Qua2V5cyhncm91cGVkKVxuICAgIC5zb3J0KChhLCBiKSA9PiBOdW1iZXIoYSkgLSBOdW1iZXIoYikpXG4gICAgLm1hcCgoa2V5KSA9PiBncm91cGVkW2tleV0pXG59XG5cbmZ1bmN0aW9uIGFkZHJlc3NMaW5lcyhhZGRyZXNzKSB7XG4gIHJldHVybiBbXG4gICAgYWRkcmVzcy5saW5lMSxcbiAgICBhZGRyZXNzLmxpbmUyLFxuICAgIFthZGRyZXNzLmNpdHksIGFkZHJlc3Muc3RhdGUsIGFkZHJlc3MucGluY29kZV0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJywgJyksXG4gICAgYWRkcmVzcy5sYW5kbWFyayA/IGBMYW5kbWFyazogJHthZGRyZXNzLmxhbmRtYXJrfWAgOiAnJyxcbiAgXS5maWx0ZXIoQm9vbGVhbilcbn1cblxuY29uc3QgQ3VzdG9tZXJFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzQWN0aXZlID0gcGFyYW1zLmlzQWN0aXZlID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQWN0aXZlID09PSAnJ1xuICAgID8gdHJ1ZVxuICAgIDogaXNGbGFnT24ocGFyYW1zLmlzQWN0aXZlKVxuICBjb25zdCBhZGRyZXNzZXMgPSB1c2VNZW1vKCgpID0+IHBhcnNlQWRkcmVzc2VzKHBhcmFtcyksIFtwYXJhbXNdKVxuICBjb25zdCBlcnJvcnMgPSB1c2VNZW1vKCgpID0+IHJlY29yZD8uZXJyb3JzIHx8IHt9LCBbcmVjb3JkPy5lcnJvcnNdKVxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgY3VzdG9tZXInLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0N1c3RvbWVyIHVwZGF0ZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgY3VzdG9tZXIuIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntwYXJhbXMubmFtZSB8fCAnQ3VzdG9tZXInfTwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5cbiAgICAgICAgICArOTEge3BhcmFtcy5waG9uZSB8fCAn4oCUJ30gwrcgam9pbmVkIHtmb3JtYXRXaGVuKHBhcmFtcy5jcmVhdGVkQXQpfVxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5BY2NvdW50IHN0YXR1czwvaDQ+XG4gICAgICAgICAgPHA+SW5hY3RpdmUgY3VzdG9tZXJzIGNhbm5vdCBzaWduIGluIHdpdGggdGhpcyBtb2JpbGUgbnVtYmVyLjwvcD5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgIHRpdGxlPXtpc0FjdGl2ZSA/ICdBY3RpdmUnIDogJ0luYWN0aXZlJ31cbiAgICAgICAgICAgIGhpbnQ9e2lzQWN0aXZlID8gJ0NhbiBsb2cgaW4gb24gdGhlIHdlYnNpdGUgYW5kIGFwcCcgOiAnTG9naW4gaXMgYmxvY2tlZCB1bnRpbCB5b3UgdHVybiB0aGlzIG9uJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzQWN0aXZlJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlByb2ZpbGU8L2g0PlxuICAgICAgICAgIDxwPlBob25lIGNvbWVzIGZyb20gT1RQIGxvZ2luIGFuZCBzdGF5cyBhcyB0aGUgY3VzdG9tZXLigJlzIGxvZ2luIGlkLjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBOYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5uYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQ3VzdG9tZXIgbmFtZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge2Vycm9ycy5uYW1lID8gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3JzLm5hbWUubWVzc2FnZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBNb2JpbGVcbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiIHZhbHVlPXtwYXJhbXMucGhvbmUgfHwgJyd9IHJlYWRPbmx5IC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBEYXRlIG9mIGJpcnRoXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXt0b0RhdGVJbnB1dChwYXJhbXMuZGF0ZU9mQmlydGgpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdkYXRlT2ZCaXJ0aCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtlcnJvcnMuZGF0ZU9mQmlydGggPyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPntlcnJvcnMuZGF0ZU9mQmlydGgubWVzc2FnZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+U2F2ZWQgYWRkcmVzc2VzPC9oND5cbiAgICAgICAgPHA+XG4gICAgICAgICAge2FkZHJlc3Nlcy5sZW5ndGhcbiAgICAgICAgICAgID8gYCR7YWRkcmVzc2VzLmxlbmd0aH0gYWRkcmVzcyR7YWRkcmVzc2VzLmxlbmd0aCA9PT0gMSA/ICcnIDogJ2VzJ30gc2F2ZWQgaW4gdGhlIGN1c3RvbWVyIGFjY291bnQuYFxuICAgICAgICAgICAgOiAnVGhpcyBjdXN0b21lciBoYXMgbm90IHNhdmVkIGEgZGVsaXZlcnkgYWRkcmVzcyB5ZXQuJ31cbiAgICAgICAgPC9wPlxuICAgICAgICB7YWRkcmVzc2VzLmxlbmd0aCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtZ3JpZFwiPlxuICAgICAgICAgICAge2FkZHJlc3Nlcy5tYXAoKGFkZHJlc3MsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgIDxhcnRpY2xlIGtleT17YWRkcmVzcy5pZCB8fCBgJHthZGRyZXNzLnBpbmNvZGV9LSR7aW5kZXh9YH0gY2xhc3NOYW1lPVwidG9rcmktYWRkcmVzcy1jYXJkXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1hZGRyZXNzLXRvcFwiPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktYWRkcmVzcy1sYWJlbFwiPnthZGRyZXNzLmxhYmVsIHx8ICdBZGRyZXNzJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICB7YWRkcmVzcy5waW5jb2RlID8gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktYWRkcmVzcy1waW5cIj57YWRkcmVzcy5waW5jb2RlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e2FkZHJlc3MubmFtZSB8fCBwYXJhbXMubmFtZSB8fCAnQ3VzdG9tZXInfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIHthZGRyZXNzLnBob25lID8gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktYWRkcmVzcy1waG9uZVwiPis5MSB7YWRkcmVzcy5waG9uZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICB7YWRkcmVzc0xpbmVzKGFkZHJlc3MpLm1hcCgobGluZSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPHAga2V5PXtsaW5lfT57bGluZX08L3A+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvYXJ0aWNsZT5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIFNhdmUgY3VzdG9tZXJcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBDdXN0b21lckVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgRmxhZ0NhcmQsIFN0YXR1c1N3aXRjaCwgaXNGbGFnT24gfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5jb25zdCBST0xFUyA9IFtcbiAgeyB2YWx1ZTogJ3N0YWZmJywgdGl0bGU6ICdTdGFmZicsIGhpbnQ6ICdBY2Nlc3Mgb25seSB0aGUgYXJlYXMgeW91IHRpY2sgYmVsb3cnIH0sXG4gIHsgdmFsdWU6ICdhZG1pbicsIHRpdGxlOiAnQWRtaW4nLCBoaW50OiAnRnVsbCBhY2Nlc3MgdG8gdGhlIENNUycgfSxcbiAgeyB2YWx1ZTogJ3N1cGVyX2FkbWluJywgdGl0bGU6ICdTdXBlciBhZG1pbicsIGhpbnQ6ICdGdWxsIGFjY2Vzcywgc2FtZSBhcyBhZG1pbicgfSxcbl1cblxuY29uc3QgUEVSTUlTU0lPTlMgPSBbXG4gIHsga2V5OiAnbWFuYWdlUHJvZHVjdHMnLCBsYWJlbDogJ1Byb2R1Y3RzJywgaGludDogJ0FkZCBhbmQgZWRpdCBwcm9kdWN0cycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VDYXRhbG9nJywgbGFiZWw6ICdDYXRhbG9nJywgaGludDogJ0NhdGVnb3JpZXMgYW5kIGNvbGxlY3Rpb25zJyB9LFxuICB7IGtleTogJ21hbmFnZU1lZGlhJywgbGFiZWw6ICdNZWRpYScsIGhpbnQ6ICdVcGxvYWQgYW5kIHJlcGxhY2UgaW1hZ2VzJyB9LFxuICB7IGtleTogJ21hbmFnZU9yZGVycycsIGxhYmVsOiAnT3JkZXJzJywgaGludDogJ1ZpZXcgYW5kIHVwZGF0ZSBvcmRlcnMnIH0sXG4gIHsga2V5OiAnbWFuYWdlQ291cG9ucycsIGxhYmVsOiAnQ291cG9ucycsIGhpbnQ6ICdDcmVhdGUgZGlzY291bnQgY29kZXMnIH0sXG4gIHsga2V5OiAnbWFuYWdlQ29udGVudCcsIGxhYmVsOiAnQ29udGVudCcsIGhpbnQ6ICdQYWdlcyBhbmQgcmV2aWV3cycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VTZXR0aW5ncycsIGxhYmVsOiAnU2V0dGluZ3MnLCBoaW50OiAnU3RvcmUgYW5kIGhvbWVwYWdlIHNldHRpbmdzJyB9LFxuICB7IGtleTogJ21hbmFnZVVzZXJzJywgbGFiZWw6ICdUZWFtJywgaGludDogJ0NyZWF0ZSB1c2VycyBhbmQgY2hhbmdlIGFjY2VzcycgfSxcbl1cblxuZnVuY3Rpb24gRmllbGRFcnJvcih7IGVycm9yIH0pIHtcbiAgaWYgKCFlcnJvcj8ubWVzc2FnZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9yLm1lc3NhZ2V9PC9zcGFuPlxufVxuXG5mdW5jdGlvbiBQYXNzd29yZEZpZWxkKHsgbGFiZWwsIHZhbHVlLCBvbkNoYW5nZSwgZXJyb3IsIHBsYWNlaG9sZGVyIH0pIHtcbiAgY29uc3QgW3Zpc2libGUsIHNldFZpc2libGVdID0gdXNlU3RhdGUoZmFsc2UpXG4gIHJldHVybiAoXG4gICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAge2xhYmVsfVxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktcGFzc3dvcmQtd3JhcFwiPlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgIHR5cGU9e3Zpc2libGUgPyAndGV4dCcgOiAncGFzc3dvcmQnfVxuICAgICAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvbkNoYW5nZShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXtwbGFjZWhvbGRlcn1cbiAgICAgICAgICBhdXRvQ29tcGxldGU9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAvPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktcGFzc3dvcmQtdG9nZ2xlXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPXt2aXNpYmxlID8gJ0hpZGUgcGFzc3dvcmQnIDogJ1Nob3cgcGFzc3dvcmQnfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFZpc2libGUoKGN1cnJlbnQpID0+ICFjdXJyZW50KX1cbiAgICAgICAgPlxuICAgICAgICAgIHt2aXNpYmxlID8gJ0hpZGUnIDogJ1Nob3cnfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvc3Bhbj5cbiAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcn0gLz5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmNvbnN0IFRlYW1FZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSwgYWN0aW9uIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgaXNOZXcgPSBhY3Rpb24/Lm5hbWUgPT09ICduZXcnIHx8ICFyZWNvcmQ/LmlkXG4gIGNvbnN0IHJvbGUgPSBwYXJhbXMucm9sZSB8fCAnc3RhZmYnXG4gIGNvbnN0IGlzQWN0aXZlID1cbiAgICBpc05ldyAmJiAocGFyYW1zLmlzQWN0aXZlID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQWN0aXZlID09PSAnJylcbiAgICAgID8gdHJ1ZVxuICAgICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNBY3RpdmUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ2lzQWN0aXZlJywgdHJ1ZSlcbiAgICB9XG4gICAgaWYgKGlzTmV3ICYmICFwYXJhbXMucm9sZSkgaGFuZGxlQ2hhbmdlKCdyb2xlJywgJ3N0YWZmJylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtpc05ld10pXG5cbiAgY29uc3QgZXJyb3JzID0gdXNlTWVtbygoKSA9PiByZWNvcmQ/LmVycm9ycyB8fCB7fSwgW3JlY29yZD8uZXJyb3JzXSlcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG4gIGNvbnN0IHBlcm1pc3Npb25PbiA9IChrZXkpID0+IGlzRmxhZ09uKHBhcmFtc1tgcGVybWlzc2lvbnMuJHtrZXl9YF0pXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIHRlYW0gbWVtYmVyJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgbWVzc2FnZTogaXNOZXcgPyAnVGVhbSBtZW1iZXIgY3JlYXRlZCcgOiAnVGVhbSBtZW1iZXIgdXBkYXRlZCcsXG4gICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSB0ZWFtIG1lbWJlci4gUGxlYXNlIHRyeSBhZ2Fpbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e2lzTmV3ID8gJ0FkZCB0ZWFtIG1lbWJlcicgOiBwYXJhbXMubmFtZSB8fCAnVGVhbSBtZW1iZXInfTwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5cbiAgICAgICAgICBUaGV5IHNpZ24gaW4gdG8gVG9rcmlpaSBDTVMgd2l0aCB1c2VybmFtZSBvciBlbWFpbC4gSW5hY3RpdmUgdXNlcnMgY2Fubm90IGxvZyBpbi5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+QWNjb3VudCBzdGF0dXM8L2g0PlxuICAgICAgICAgIDxwPlR1cm4gdGhpcyBvZmYgdG8gYmxvY2sgQ01TIGxvZ2luIHdpdGhvdXQgZGVsZXRpbmcgdGhlIGFjY291bnQuPC9wPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2lzQWN0aXZlfVxuICAgICAgICAgICAgdGl0bGU9e2lzQWN0aXZlID8gJ0FjdGl2ZScgOiAnSW5hY3RpdmUnfVxuICAgICAgICAgICAgaGludD17aXNBY3RpdmUgPyAnQ2FuIHNpZ24gaW4gdG8gdGhlIGFkbWluIHBhbmVsJyA6ICdMb2dpbiBpcyBibG9ja2VkIHVudGlsIHlvdSB0dXJuIHRoaXMgb24nfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnaXNBY3RpdmUnLCBuZXh0KX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+Um9sZTwvaDQ+XG4gICAgICAgICAgPHA+QWRtaW4gYW5kIHN1cGVyIGFkbWluIGdldCBmdWxsIGFjY2Vzcy4gU3RhZmYgb25seSBnZXRzIHRoZSBwZXJtaXNzaW9ucyB5b3UgZW5hYmxlLjwvcD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNob2ljZS1yb3dcIj5cbiAgICAgICAgICAgIHtST0xFUy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgPEZsYWdDYXJkXG4gICAgICAgICAgICAgICAga2V5PXtpdGVtLnZhbHVlfVxuICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtyb2xlID09PSBpdGVtLnZhbHVlfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtpdGVtLnRpdGxlfVxuICAgICAgICAgICAgICAgIGhpbnQ9e2l0ZW0uaGludH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgncm9sZScsIGl0ZW0udmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+TG9naW4gZGV0YWlsczwvaDQ+XG4gICAgICAgIDxwPlVzZXJuYW1lIG9yIGVtYWlsIGNhbiBiZSB1c2VkIG9uIHRoZSBDTVMgbG9naW4gc2NyZWVuLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgRnVsbCBuYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5uYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVGVhbSBtZW1iZXIgbmFtZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5uYW1lfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgVXNlcm5hbWVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnVzZXJuYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgndXNlcm5hbWUnLCBldmVudC50YXJnZXQudmFsdWUudHJpbSgpKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJlLmcuIHJhdmkuY21zXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnVzZXJuYW1lfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgRW1haWxcbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB0eXBlPVwiZW1haWxcIlxuICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZW1haWwgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZW1haWwnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJuYW1lQHRva3JpaWkuY29tXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuZW1haWx9IC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIHtpc05ldyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxQYXNzd29yZEZpZWxkXG4gICAgICAgICAgICAgIGxhYmVsPVwiUGFzc3dvcmRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBhc3N3b3JkIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRGaWVsZCgncGFzc3dvcmQnLCB2YWx1ZSl9XG4gICAgICAgICAgICAgIGVycm9yPXtlcnJvcnMucGFzc3dvcmR9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQXQgbGVhc3QgNiBjaGFyYWN0ZXJzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8UGFzc3dvcmRGaWVsZFxuICAgICAgICAgICAgICBsYWJlbD1cIkNvbmZpcm0gcGFzc3dvcmRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNvbmZpcm1QYXNzd29yZCB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gc2V0RmllbGQoJ2NvbmZpcm1QYXNzd29yZCcsIHZhbHVlKX1cbiAgICAgICAgICAgICAgZXJyb3I9e2Vycm9ycy5jb25maXJtUGFzc3dvcmR9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVHlwZSBwYXNzd29yZCBhZ2FpblwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5Vc2UgQ2hhbmdlIHBhc3N3b3JkIGZyb20gdGhlIHRlYW0gbGlzdCB0byByZXNldCBsb2dpbi48L3NwYW4+XG4gICAgICAgICl9XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIHtyb2xlID09PSAnc3RhZmYnID8gKFxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5QZXJtaXNzaW9uczwvaDQ+XG4gICAgICAgICAgPHA+T25seSB1c2VkIGZvciBzdGFmZi4gVG9nZ2xlIHdoYXQgdGhpcyBwZXJzb24gY2FuIG9wZW4gaW4gdGhlIENNUy48L3A+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1wZXJtLWxpc3RcIj5cbiAgICAgICAgICAgIHtQRVJNSVNTSU9OUy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e2l0ZW0ua2V5fSBjbGFzc05hbWU9XCJ0b2tyaS1wZXJtLXJvd1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgPHN0cm9uZz57aXRlbS5sYWJlbH08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgIDxzcGFuPntpdGVtLmhpbnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICAgICAgICBjb21wYWN0XG4gICAgICAgICAgICAgICAgICBjaGVja2VkPXtwZXJtaXNzaW9uT24oaXRlbS5rZXkpfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZChgcGVybWlzc2lvbnMuJHtpdGVtLmtleX1gLCBuZXh0KX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICApIDogbnVsbH1cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIHtpc05ldyA/ICdDcmVhdGUgdGVhbSBtZW1iZXInIDogJ1NhdmUgdGVhbSBtZW1iZXInfVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRlYW1FZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VRdWVyeVBhcmFtcywgdXNlUmVjb3JkcyB9IGZyb20gJ2FkbWluanMnXG5jb25zdCBGT0xERVJTID0gWydhbGwnLCAncHJvZHVjdHMnLCAnY2F0ZWdvcmllcycsICdyZXZpZXdzJywgJ3BhZ2VzJywgJ2dlbmVyYWwnXVxuXG5jb25zdCB3aXRob3V0VHJhaWxpbmdTbGFzaCA9ICh2YWx1ZSkgPT4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9cXC8rJC8sICcnKVxuXG5mdW5jdGlvbiBmb3JtYXRTaXplKGJ5dGVzKSB7XG4gIGNvbnN0IHNpemUgPSBOdW1iZXIoYnl0ZXMpIHx8IDBcbiAgaWYgKHNpemUgPCAxMDI0KSByZXR1cm4gYCR7c2l6ZX0gQmBcbiAgaWYgKHNpemUgPCAxMDI0ICogMTAyNCkgcmV0dXJuIGAke01hdGgucm91bmQoc2l6ZSAvIDEwMjQpfSBLQmBcbiAgcmV0dXJuIGAkeyhzaXplIC8gKDEwMjQgKiAxMDI0KSkudG9GaXhlZCgxKX0gTUJgXG59XG5cbmZ1bmN0aW9uIGZvcm1hdFdoZW4odmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcbiAgaWYgKE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiAnJ1xuICByZXR1cm4gZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLUlOJywgeyBkYXk6ICdudW1lcmljJywgbW9udGg6ICdzaG9ydCcsIHllYXI6ICdudW1lcmljJyB9KVxufVxuXG5mdW5jdGlvbiByZXNvbHZlVXJsKHBhdGgsIGFwcFVybCkge1xuICBpZiAoIXBhdGgpIHJldHVybiAnJ1xuICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGF0aCkpIHJldHVybiBwYXRoXG4gIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChhcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHtwYXRofWBcbn1cblxuY29uc3QgTWVkaWFMaWJyYXJ5ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVzb3VyY2UsIHNldFRhZyB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyBzdG9yZVBhcmFtcywgZmlsdGVycyB9ID0gdXNlUXVlcnlQYXJhbXMoKVxuICBjb25zdCB7IHJlY29yZHMsIGxvYWRpbmcsIGZldGNoRGF0YSwgdG90YWwsIHBlclBhZ2UgfSA9IHVzZVJlY29yZHMocmVzb3VyY2UuaWQpXG4gIGNvbnN0IGZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgW3VwbG9hZGluZywgc2V0VXBsb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbYnVzeUlkLCBzZXRCdXN5SWRdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IGZvbGRlciA9IFN0cmluZyhmaWx0ZXJzPy5mb2xkZXIgfHwgJ2FsbCcpXG4gIGNvbnN0IGN1c3RvbSA9IHJlc291cmNlPy5vcHRpb25zPy5jdXN0b20gfHwge31cbiAgY29uc3QgYXBpQmFzZVVybCA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcGlCYXNlVXJsIHx8ICcvYXBpL3YxJylcbiAgY29uc3QgYXBwVXJsID0gY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luXG4gIGNvbnN0IHVwbG9hZEZvbGRlciA9IGZvbGRlciA9PT0gJ2FsbCcgPyAnZ2VuZXJhbCcgOiBmb2xkZXJcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZXRUYWcpIHNldFRhZyhTdHJpbmcodG90YWwgfHwgMCkpXG4gIH0sIFt0b3RhbCwgc2V0VGFnXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChOdW1iZXIocGVyUGFnZSkgPCA1MCkgc3RvcmVQYXJhbXMoeyBwZXJQYWdlOiAnNTAnIH0pXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbXSlcblxuICBjb25zdCBpdGVtcyA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgIChyZWNvcmRzIHx8IFtdKS5tYXAoKGl0ZW0pID0+ICh7XG4gICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICBuYW1lOiBpdGVtLnBhcmFtcz8ub3JpZ2luYWxOYW1lIHx8IGl0ZW0ucGFyYW1zPy5maWxlbmFtZSB8fCAnSW1hZ2UnLFxuICAgICAgICBmb2xkZXI6IGl0ZW0ucGFyYW1zPy5mb2xkZXIgfHwgJ2dlbmVyYWwnLFxuICAgICAgICBwYXRoOiBpdGVtLnBhcmFtcz8ucGF0aCB8fCAnJyxcbiAgICAgICAgc2l6ZTogaXRlbS5wYXJhbXM/LnNpemUsXG4gICAgICAgIGNyZWF0ZWRBdDogaXRlbS5wYXJhbXM/LmNyZWF0ZWRBdCxcbiAgICAgICAgdXJsOiByZXNvbHZlVXJsKGl0ZW0ucGFyYW1zPy5wYXRoLCBhcHBVcmwpLFxuICAgICAgfSkpLFxuICAgIFthcHBVcmwsIHJlY29yZHNdLFxuICApXG5cbiAgY29uc3Qgc2V0Rm9sZGVyID0gKG5leHQpID0+IHtcbiAgICBzdG9yZVBhcmFtcyh7XG4gICAgICBwYWdlOiAnMScsXG4gICAgICBmaWx0ZXJzOiBuZXh0ID09PSAnYWxsJyA/IHt9IDogeyBmb2xkZXI6IG5leHQgfSxcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdXBsb2FkRmlsZXMgPSBhc3luYyAoZmlsZXMpID0+IHtcbiAgICBjb25zdCBsaXN0ID0gWy4uLmZpbGVzXS5maWx0ZXIoKGZpbGUpID0+IGZpbGUudHlwZS5zdGFydHNXaXRoKCdpbWFnZS8nKSlcbiAgICBpZiAoIWxpc3QubGVuZ3RoKSByZXR1cm5cbiAgICBzZXRVcGxvYWRpbmcodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZvbGRlcicsIHVwbG9hZEZvbGRlcilcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSlcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS91cGxvYWRgLCB7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgYm9keTogZm9ybURhdGEsXG4gICAgICAgIH0pXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICBjb25zdCBlcnJvciA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8IGBDb3VsZCBub3QgdXBsb2FkICR7ZmlsZS5uYW1lfWApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgIG1lc3NhZ2U6IGxpc3QubGVuZ3RoID09PSAxID8gJ0ltYWdlIHVwbG9hZGVkJyA6IGAke2xpc3QubGVuZ3RofSBpbWFnZXMgdXBsb2FkZWRgLFxuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICB9KVxuICAgICAgZmV0Y2hEYXRhKClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnVXBsb2FkIGZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0VXBsb2FkaW5nKGZhbHNlKVxuICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCkgZmlsZVJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICBjb25zdCBjb3B5UGF0aCA9IGFzeW5jIChwYXRoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHBhdGgpXG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnRmlsZSBwYXRoIGNvcGllZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2gge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogcGF0aCwgdHlwZTogJ2luZm8nIH0pXG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVtb3ZlID0gYXN5bmMgKGlkLCBuYW1lKSA9PiB7XG4gICAgaWYgKCF3aW5kb3cuY29uZmlybShgRGVsZXRlIOKAnCR7bmFtZX3igJ0/IFRoaXMgY2Fubm90IGJlIHVuZG9uZS5gKSkgcmV0dXJuXG4gICAgc2V0QnVzeUlkKGlkKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L21lZGlhLyR7aWR9YCwgeyBtZXRob2Q6ICdERUxFVEUnIH0pXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBkZWxldGUgaW1hZ2UnKVxuICAgICAgfVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZGF0YS5tZXNzYWdlIHx8ICdJbWFnZSBkZWxldGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICBmZXRjaERhdGEoKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgZGVsZXRlIGltYWdlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5SWQoJycpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+TWVkaWEgbGlicmFyeTwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5cbiAgICAgICAgICBVcGxvYWQgaW1hZ2VzIHVzZWQgb24gcHJvZHVjdHMsIGNhdGVnb3JpZXMsIHJldmlld3MsIGFuZCB0aGUgaG9tZXBhZ2UuIEZpbGVzIHN0YXkgb24gdGhpcyBzZXJ2ZXIuXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+VXBsb2FkPC9oND5cbiAgICAgICAgPHA+XG4gICAgICAgICAgRmlsZXMgZ28gaW50byB0aGUgPHN0cm9uZz57dXBsb2FkRm9sZGVyfTwvc3Ryb25nPiBmb2xkZXJcbiAgICAgICAgICB7Zm9sZGVyID09PSAnYWxsJyA/ICcgKHNlbGVjdCBhIGZvbGRlciBiZWxvdyB0byBjaGFuZ2UgdGhpcykuJyA6ICcuJ31cbiAgICAgICAgPC9wPlxuICAgICAgICA8bGFiZWxcbiAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS11cGxvYWQtZHJvcFwiXG4gICAgICAgICAgb25EcmFnT3Zlcj17KGV2ZW50KSA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpfVxuICAgICAgICAgIG9uRHJvcD17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICB1cGxvYWRGaWxlcyhldmVudC5kYXRhVHJhbnNmZXIuZmlsZXMpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuPnt1cGxvYWRpbmcgPyAnVXBsb2FkaW5n4oCmJyA6ICdDbGljayBvciBkcm9wIGltYWdlcyBoZXJlJ308L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICByZWY9e2ZpbGVSZWZ9XG4gICAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgICBhY2NlcHQ9XCJpbWFnZS8qXCJcbiAgICAgICAgICAgIG11bHRpcGxlXG4gICAgICAgICAgICBkaXNhYmxlZD17dXBsb2FkaW5nfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gdXBsb2FkRmlsZXMoZXZlbnQudGFyZ2V0LmZpbGVzKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+SlBHLCBQTkcsIEdJRiwgb3IgV2ViUCB1cCB0byA1TUIgZWFjaDwvc3Bhbj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkxpYnJhcnk8L2g0PlxuICAgICAgICA8cD57dG90YWwgfHwgMH0gZmlsZXsodG90YWwgfHwgMCkgPT09IDEgPyAnJyA6ICdzJ317Zm9sZGVyICE9PSAnYWxsJyA/IGAgaW4gJHtmb2xkZXJ9YCA6ICcnfS48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZm9sZGVyLWNoaXBzXCI+XG4gICAgICAgICAge0ZPTERFUlMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17aXRlbX1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHRva3JpLWZvbGRlci1jaGlwJHtmb2xkZXIgPT09IGl0ZW0gPyAnIGlzLW9uJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZvbGRlcihpdGVtKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2l0ZW0gPT09ICdhbGwnID8gJ0FsbCBmb2xkZXJzJyA6IGl0ZW19XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge2xvYWRpbmcgPyAoXG4gICAgICAgICAgPFRleHQgbXQ9XCJ4bFwiPkxvYWRpbmcgaW1hZ2Vz4oCmPC9UZXh0PlxuICAgICAgICApIDogaXRlbXMubGVuZ3RoID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbWVkaWEtZ3JpZFwiPlxuICAgICAgICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8YXJ0aWNsZSBrZXk9e2l0ZW0uaWR9IGNsYXNzTmFtZT1cInRva3JpLW1lZGlhLWNhcmRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW1lZGlhLXRodW1iXCI+XG4gICAgICAgICAgICAgICAgICB7aXRlbS51cmwgPyA8aW1nIHNyYz17aXRlbS51cmx9IGFsdD17aXRlbS5uYW1lfSAvPiA6IDxzcGFuPk5vIHByZXZpZXc8L3NwYW4+fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxzdHJvbmcgdGl0bGU9e2l0ZW0ubmFtZX0+e2l0ZW0ubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgIHtpdGVtLmZvbGRlcn0gwrcge2Zvcm1hdFNpemUoaXRlbS5zaXplKX1cbiAgICAgICAgICAgICAgICAgIHtpdGVtLmNyZWF0ZWRBdCA/IGAgwrcgJHtmb3JtYXRXaGVuKGl0ZW0uY3JlYXRlZEF0KX1gIDogJyd9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbWVkaWEtYWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBzaXplPVwic21cIiB2YXJpYW50PVwidGV4dFwiIG9uQ2xpY2s9eygpID0+IGNvcHlQYXRoKGl0ZW0ucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICBDb3B5IHBhdGhcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3lJZCA9PT0gaXRlbS5pZH1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gcmVtb3ZlKGl0ZW0uaWQsIGl0ZW0ubmFtZSl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtidXN5SWQgPT09IGl0ZW0uaWQgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIERlbGV0ZVxuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvYXJ0aWNsZT5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxUZXh0IG10PVwieGxcIj5ObyBpbWFnZXMgaW4gdGhpcyBmb2xkZXIgeWV0LjwvVGV4dD5cbiAgICAgICAgKX1cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZWRpYUxpYnJhcnlcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBpc0ZsYWdPbiwgU3RhdHVzU3dpdGNoIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3QgVGF4RWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IGlzVGF4YWJsZUJvb2wgPSBpc0ZsYWdPbihwYXJhbXMuaXNUYXhhYmxlKVxuXG4gIGNvbnN0IGhhbmRsZVRheGFibGVUb2dnbGUgPSAodmFsdWUpID0+IHtcbiAgICBzZXRGaWVsZCgnaXNUYXhhYmxlJywgdmFsdWUpXG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgc2V0RmllbGQoJ2dzdFJhdGUnLCAwKVxuICAgIH0gZWxzZSBpZiAoTnVtYmVyKHBhcmFtcy5nc3RSYXRlIHx8IDApID09PSAwKSB7XG4gICAgICBzZXRGaWVsZCgnZ3N0UmF0ZScsIDUpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgb25TdWJtaXQgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBldmVudD8ucHJldmVudERlZmF1bHQ/LigpXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGhhbmRsZVN1Ym1pdCgpXG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnVGF4IGNvbmZpZ3VyYXRpb24gdXBkYXRlZCBzdWNjZXNzZnVsbHkuJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1cGRhdGUgdGF4IGNvbmZpZ3VyYXRpb24nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtvblN1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlYWRcIj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8SDM+e3BhcmFtcy5wcm9kdWN0TmFtZSB8fCAnRWRpdCBQcm9kdWN0IFRheCd9PC9IMz5cbiAgICAgICAgICA8VGV4dCBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgQ29uZmlndXJlIEhTTiBjb2RlIGFuZCBHU1QgcGVyY2VudGFnZSBmb3IgdGhpcyBwcm9kdWN0LlxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlByb2R1Y3QgZGV0YWlsczwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQcm9kdWN0IG5hbWVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnByb2R1Y3ROYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBkaXNhYmxlZFxuICAgICAgICAgICAgICBzdHlsZT17eyBvcGFjaXR5OiAwLjcsIGN1cnNvcjogJ25vdC1hbGxvd2VkJyB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIENhdGVnb3J5XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jYXRlZ29yeU5hbWUgfHwgJ0dlbmVyYWwnfVxuICAgICAgICAgICAgICBkaXNhYmxlZFxuICAgICAgICAgICAgICBzdHlsZT17eyBvcGFjaXR5OiAwLjcsIGN1cnNvcjogJ25vdC1hbGxvd2VkJyB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlRheGFiaWxpdHkgc3RhdHVzPC9oND5cbiAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgIGNoZWNrZWQ9e2lzVGF4YWJsZUJvb2x9XG4gICAgICAgICAgdGl0bGU9XCJUYXhhYmxlXCJcbiAgICAgICAgICBoaW50PXtpc1RheGFibGVCb29sID8gJ0dTVCB3aWxsIGJlIGNoYXJnZWQgYXQgY2hlY2tvdXQnIDogJzAlIEdTVCAoZnJlc2ggZnJ1aXRzIC8gZXhlbXB0KSd9XG4gICAgICAgICAgb25MYWJlbD1cIlllc1wiXG4gICAgICAgICAgb2ZmTGFiZWw9XCJOb1wiXG4gICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZVRheGFibGVUb2dnbGV9XG4gICAgICAgIC8+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5HU1QgJiBIU04gZGV0YWlsczwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBIU04gY29kZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuaHNuQ29kZSB8fCAnMDgwOCd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdoc25Db2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJlLmcuIDA4MDIgZm9yIGRyeSBmcnVpdHMsIDA4MDggZm9yIGZyZXNoIGZydWl0c1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgR1NUICUgcmF0ZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICBtYXg9XCIxMDBcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmdzdFJhdGUgPz8gKGlzVGF4YWJsZUJvb2wgPyA1IDogMCl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdnc3RSYXRlJywgTnVtYmVyKGV2ZW50LnRhcmdldC52YWx1ZSkgfHwgMCl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiZS5nLiA1IGZvciBkcnkgZnJ1aXRzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxUZXh0IG10PVwic21cIiBvcGFjaXR5PXswLjd9IGZvbnRTaXplPVwiMTJweFwiPlxuICAgICAgICAgIHtpc1RheGFibGVCb29sXG4gICAgICAgICAgICA/IGBBdCBjaGVja291dCwgaW50cmEtc3RhdGUgb3JkZXJzIHNwbGl0IGludG8gJHsoTnVtYmVyKHBhcmFtcy5nc3RSYXRlIHx8IDUpIC8gMikudG9GaXhlZCgxKX0lIENHU1QgKyAkeyhOdW1iZXIocGFyYW1zLmdzdFJhdGUgfHwgNSkgLyAyKS50b0ZpeGVkKDEpfSUgU0dTVDsgaW50ZXItc3RhdGUgb3JkZXJzIGNoYXJnZSAke051bWJlcihwYXJhbXMuZ3N0UmF0ZSB8fCA1KX0lIElHU1QuYFxuICAgICAgICAgICAgOiAnUHJvZHVjdCBpcyBleGVtcHQvbm9uLXRheGFibGUgKDAlIEdTVCkuJ31cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgU2F2ZSB0YXggc2V0dGluZ3NcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBUYXhFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcblxuZnVuY3Rpb24gY29weVRleHQodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSB8fCAhbmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KSByZXR1cm4gUHJvbWlzZS5yZWplY3QoKVxuICByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodmFsdWUpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJhem9ycGF5UGF5bWVudElkKHsgcmVjb3JkIH0pIHtcbiAgY29uc3QgcGF5bWVudElkID0gU3RyaW5nKHJlY29yZD8ucGFyYW1zPy5yYXpvcnBheVBheW1lbnRJZCB8fCAnJykudHJpbSgpXG4gIGNvbnN0IHBhaWQgPSByZWNvcmQ/LnBhcmFtcz8ucGF5bWVudFN0YXR1cyA9PT0gJ3BhaWQnXG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBpZiAoIXBhaWQgfHwgIXBheW1lbnRJZCkge1xuICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1yenAtZW1wdHlcIj7igJQ8L3NwYW4+XG4gIH1cblxuICBjb25zdCBoYW5kbGVDb3B5ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgY29weVRleHQocGF5bWVudElkKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZXRDb3BpZWQodHJ1ZSlcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gc2V0Q29waWVkKGZhbHNlKSwgMTIwMClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge30pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktcnpwLWNlbGxcIiBvbkNsaWNrPXsoZXZlbnQpID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpfT5cbiAgICAgIDxhXG4gICAgICAgIGNsYXNzTmFtZT1cInRva3JpLXJ6cC1pZFwiXG4gICAgICAgIGhyZWY9e2BodHRwczovL2Rhc2hib2FyZC5yYXpvcnBheS5jb20vYXBwL3BheW1lbnRzLyR7ZW5jb2RlVVJJQ29tcG9uZW50KHBheW1lbnRJZCl9YH1cbiAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgIHRpdGxlPVwiT3BlbiB0aGlzIHBheW1lbnQgaW4gUmF6b3JwYXlcIlxuICAgICAgPlxuICAgICAgICB7cGF5bWVudElkfVxuICAgICAgPC9hPlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwidG9rcmktcnpwLWNvcHlcIiBvbkNsaWNrPXtoYW5kbGVDb3B5fT5cbiAgICAgICAge2NvcGllZCA/ICdDb3BpZWQnIDogJ0NvcHknfVxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQge1xuICBCb3gsXG4gIEJ1dHRvbixcbiAgRm9ybUdyb3VwLFxuICBIMixcbiAgSW5wdXQsXG4gIExhYmVsLFxuICBNZXNzYWdlQm94LFxuICBUZXh0LFxufSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJ1xuXG5jb25zdCBSRU1FTUJFUkVEX0xPR0lOX0tFWSA9ICd0b2tyaV9hZG1pbl9sb2dpbidcblxuY29uc3QgTG9naW4gPSAoKSA9PiB7XG4gIGNvbnN0IHsgYWN0aW9uLCBlcnJvck1lc3NhZ2UgfSA9IHdpbmRvdy5fX0FQUF9TVEFURV9fIHx8IHt9XG4gIGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKVxuICBjb25zdCBhZG1pblJvb3QgPSBhY3Rpb24/LnJlcGxhY2UoL1xcL2xvZ2luJC8sICcnKSB8fCAnJ1xuICBjb25zdCBmb3Jnb3RQYXNzd29yZFVybCA9IGAke2FkbWluUm9vdH0vZm9yZ290LXBhc3N3b3JkYFxuICBjb25zdCBbaWRlbnRpZmllciwgc2V0SWRlbnRpZmllcl0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW3JlbWVtYmVyTG9naW4sIHNldFJlbWVtYmVyTG9naW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzaG93UGFzc3dvcmQsIHNldFNob3dQYXNzd29yZF0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHJlbWVtYmVyZWRMb2dpbiA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShSRU1FTUJFUkVEX0xPR0lOX0tFWSlcbiAgICBpZiAocmVtZW1iZXJlZExvZ2luKSB7XG4gICAgICBzZXRJZGVudGlmaWVyKHJlbWVtYmVyZWRMb2dpbilcbiAgICAgIHNldFJlbWVtYmVyTG9naW4odHJ1ZSlcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZVN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGZvcm0gPSBldmVudC5jdXJyZW50VGFyZ2V0XG4gICAgY29uc3QgZW1haWxJbnB1dCA9IGZvcm0uZWxlbWVudHMubmFtZWRJdGVtKCdlbWFpbCcpXG4gICAgY29uc3QgdmFsdWUgPVxuICAgICAgKGVtYWlsSW5wdXQgJiYgJ3ZhbHVlJyBpbiBlbWFpbElucHV0ID8gU3RyaW5nKGVtYWlsSW5wdXQudmFsdWUpIDogaWRlbnRpZmllcikudHJpbSgpXG5cbiAgICBpZiAoZW1haWxJbnB1dCAmJiAndmFsdWUnIGluIGVtYWlsSW5wdXQpIHtcbiAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSB2YWx1ZVxuICAgIH1cblxuICAgIGlmIChyZW1lbWJlckxvZ2luICYmIHZhbHVlKSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oUkVNRU1CRVJFRF9MT0dJTl9LRVksIHZhbHVlKVxuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oUkVNRU1CRVJFRF9MT0dJTl9LRVkpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBmbGV4XG4gICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgIGp1c3RpZnlDb250ZW50PVwiY2VudGVyXCJcbiAgICAgIG1pbkhlaWdodD1cIjEwMHZoXCJcbiAgICAgIGJnPVwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzAyMmMyMiwgIzA0Nzg1NylcIlxuICAgICAgcD1cInhsXCJcbiAgICA+XG4gICAgICA8Qm94XG4gICAgICAgIGJnPVwid2hpdGVcIlxuICAgICAgICB3aWR0aD17WycxMDAlJywgJzQ0MHB4J119XG4gICAgICAgIGJvcmRlclJhZGl1cz1cIjE4cHhcIlxuICAgICAgICBib3hTaGFkb3c9XCIwIDI0cHggNzBweCByZ2JhKDIsIDQ0LCAzNCwgMC4zNSlcIlxuICAgICAgICBwPVwieDNcIlxuICAgICAgPlxuICAgICAgICA8SDIgY29sb3I9XCIjMDIyYzIyXCIgbWI9XCJzbVwiPlRva3JpaWkgQ01TPC9IMj5cbiAgICAgICAgPFRleHQgY29sb3I9XCIjNjQ3NDhiXCIgbWI9XCJ4bFwiPlxuICAgICAgICAgIFNpZ24gaW4gd2l0aCB5b3VyIGFkbWluIGVtYWlsIG9yIHVzZXJuYW1lIHRvIG1hbmFnZSBwcm9kdWN0cywgb3JkZXJzLCBhbmQgY29udGVudC5cbiAgICAgICAgPC9UZXh0PlxuXG4gICAgICAgIHtlcnJvck1lc3NhZ2UgPyAoXG4gICAgICAgICAgPE1lc3NhZ2VCb3hcbiAgICAgICAgICAgIG1iPVwibGdcIlxuICAgICAgICAgICAgbWVzc2FnZT17ZXJyb3JNZXNzYWdlLnNwbGl0KCcgJykubGVuZ3RoID4gMSA/IGVycm9yTWVzc2FnZSA6IHRyYW5zbGF0ZU1lc3NhZ2UoZXJyb3JNZXNzYWdlKX1cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJkYW5nZXJcIlxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIDxCb3ggYXM9XCJmb3JtXCIgYWN0aW9uPXthY3Rpb259IG1ldGhvZD1cIlBPU1RcIiBvblN1Ym1pdD17aGFuZGxlU3VibWl0fT5cbiAgICAgICAgICA8Rm9ybUdyb3VwPlxuICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPkVtYWlsIG9yIHVzZXJuYW1lPC9MYWJlbD5cbiAgICAgICAgICAgIDxJbnB1dFxuICAgICAgICAgICAgICBuYW1lPVwiZW1haWxcIlxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIGVtYWlsIG9yIHVzZXJuYW1lXCJcbiAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwidXNlcm5hbWVcIlxuICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9e2lkZW50aWZpZXJ9XG4gICAgICAgICAgICAgIGtleT17aWRlbnRpZmllciB8fCAnbG9naW4tZW1haWwnfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0Zvcm1Hcm91cD5cblxuICAgICAgICAgIDxGb3JtR3JvdXA+XG4gICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+UGFzc3dvcmQ8L0xhYmVsPlxuICAgICAgICAgICAgPEJveCBwb3NpdGlvbj1cInJlbGF0aXZlXCIgd2lkdGg9XCIxMDAlXCI+XG4gICAgICAgICAgICAgIDxJbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9e3Nob3dQYXNzd29yZCA/ICd0ZXh0JyA6ICdwYXNzd29yZCd9XG4gICAgICAgICAgICAgICAgbmFtZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIHBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJjdXJyZW50LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nUmlnaHQ6IDQyIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzaG93UGFzc3dvcmQgPyAnSGlkZSBwYXNzd29yZCcgOiAnU2hvdyBwYXNzd29yZCd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd1Bhc3N3b3JkKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgICByaWdodDogOCxcbiAgICAgICAgICAgICAgICAgIHRvcDogJzUwJScsXG4gICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKC01MCUpJyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogMCxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMwNDc4NTcnLFxuICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxuICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICB3aWR0aDogMjYsXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6IDI2LFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogMCxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3Nob3dQYXNzd29yZCA/IChcbiAgICAgICAgICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9XCIyMFwiXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjIwXCJcbiAgICAgICAgICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9XCIyXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMyAzbDE4IDE4XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xMC42IDEwLjZBMiAyIDAgMCAwIDEzLjQgMTMuNFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNOS45IDQuMkExMC43IDEwLjcgMCAwIDEgMTIgNGM1IDAgOSA0LjUgMTAgOGExMi44IDEyLjggMCAwIDEtMi4xIDMuNlwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNNi42IDYuNkM0LjMgOCAyLjcgMTAuMiAyIDEyYzEgMy41IDUgOCAxMCA4IDEuNSAwIDIuOS0uNCA0LjEtMVwiIC8+XG4gICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPHN2Z1xuICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjIwXCJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PVwiMjBcIlxuICAgICAgICAgICAgICAgICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgICAgICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD1cIjJcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0yIDEyczQtNyAxMC03IDEwIDcgMTAgNy00IDctMTAgN1MyIDEyIDIgMTJ6XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgPC9Gb3JtR3JvdXA+XG5cbiAgICAgICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIG1iPVwibGdcIj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBpZD1cInJlbWVtYmVyLWxvZ2luXCJcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17cmVtZW1iZXJMb2dpbn1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0UmVtZW1iZXJMb2dpbihldmVudC50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgICAgIHN0eWxlPXt7IG1hcmdpblJpZ2h0OiA4IH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJyZW1lbWJlci1sb2dpblwiIHN0eWxlPXt7IGNvbG9yOiAnIzQ3NTU2OScsIGZvbnRTaXplOiAxNCB9fT5cbiAgICAgICAgICAgICAgUmVtZW1iZXIgbXkgZW1haWwgb3IgdXNlcm5hbWUgb24gdGhpcyBkZXZpY2VcbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICA8QnV0dG9uIHR5cGU9XCJzdWJtaXRcIiB2YXJpYW50PVwiY29udGFpbmVkXCIgd2lkdGg9XCIxMDAlXCIgbXQ9XCJsZ1wiPlxuICAgICAgICAgICAgU2lnbiBpblxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0JveD5cblxuICAgICAgICA8VGV4dCBtdD1cInhsXCIgdGV4dEFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgICAgPGEgaHJlZj17Zm9yZ290UGFzc3dvcmRVcmx9IHN0eWxlPXt7IGNvbG9yOiAnIzA0Nzg1NycsIGZvbnRXZWlnaHQ6IDcwMCB9fT5cbiAgICAgICAgICAgIEZvcmdvdCBwYXNzd29yZD9cbiAgICAgICAgICA8L2E+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IExvZ2luXG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b25Hcm91cCwgTWVzc2FnZUJveCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VGaWx0ZXJEcmF3ZXIsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcydcblxuZnVuY3Rpb24gYWRtaW5Sb290UGF0aCgpIHtcbiAgY29uc3QgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL14oLiopXFwvcmVzb3VyY2VzXFwvLylcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvJC8sICcnKVxufVxuXG5mdW5jdGlvbiBjYXRhbG9nQ29uZmlnKHJlc291cmNlSWQpIHtcbiAgaWYgKHJlc291cmNlSWQgPT09ICdDYXRlZ29yeScpIHtcbiAgICByZXR1cm4geyBleHBvcnRVcmw6ICdjYXRlZ29yaWVzL2V4cG9ydCcsIGltcG9ydFVybDogJ2NhdGVnb3JpZXMvaW1wb3J0JyB9XG4gIH1cbiAgaWYgKHJlc291cmNlSWQgPT09ICdQcm9kdWN0Jykge1xuICAgIHJldHVybiB7IGV4cG9ydFVybDogJ3Byb2R1Y3RzL2V4cG9ydCcsIGltcG9ydFVybDogJ3Byb2R1Y3RzL2ltcG9ydCcgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENhdGFsb2dMaXN0SGVhZGVyQWN0aW9ucyh7IHJlc291cmNlLCBvbkltcG9ydGVkIH0pIHtcbiAgY29uc3QgeyB0cmFuc2xhdGVCdXR0b24sIHRyYW5zbGF0ZUFjdGlvbiB9ID0gdXNlVHJhbnNsYXRpb24oKVxuICBjb25zdCB7IHRvZ2dsZUZpbHRlciwgZmlsdGVyc0NvdW50IH0gPSB1c2VGaWx0ZXJEcmF3ZXIoKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW21lc3NhZ2UsIHNldE1lc3NhZ2VdID0gdXNlU3RhdGUobnVsbClcbiAgY29uc3QgZmlsZVJlZiA9IHVzZVJlZihudWxsKVxuXG4gIGNvbnN0IHJlc291cmNlSWQgPSByZXNvdXJjZS5pZFxuICBjb25zdCBjb25maWcgPSBjYXRhbG9nQ29uZmlnKHJlc291cmNlSWQpXG4gIGNvbnN0IHJvb3QgPSBhZG1pblJvb3RQYXRoKClcblxuICBjb25zdCBoYW5kbGVJbXBvcnQgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJ1xuICAgIGlmICghZmlsZSB8fCAhY29uZmlnKSByZXR1cm5cblxuICAgIHNldExvYWRpbmcodHJ1ZSlcbiAgICBzZXRNZXNzYWdlKG51bGwpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSlcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtyb290fS9jYXRhbG9nLyR7Y29uZmlnLmltcG9ydFVybH1gLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEubWVzc2FnZSB8fCAnSW1wb3J0IGZhaWxlZC4nKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBlcnJvckNvdW50ID0gZGF0YS5lcnJvcnM/Lmxlbmd0aCB8fCAwXG4gICAgICBzZXRNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogZXJyb3JDb3VudCA/ICdpbmZvJyA6ICdzdWNjZXNzJyxcbiAgICAgICAgdGV4dDpcbiAgICAgICAgICBlcnJvckNvdW50ID4gMFxuICAgICAgICAgICAgPyBgSW1wb3J0IGZpbmlzaGVkLiAke2RhdGEuY3JlYXRlZH0gYWRkZWQsICR7ZGF0YS51cGRhdGVkfSB1cGRhdGVkLiAke2Vycm9yQ291bnR9IHJvdyhzKSBjb3VsZCBub3QgYmUgaW1wb3J0ZWQuIEV4aXN0aW5nIHJvd3MgYXJlIG1hdGNoZWQgYnkgc2x1Zy5gXG4gICAgICAgICAgICA6IGBJbXBvcnQgZmluaXNoZWQuICR7ZGF0YS5jcmVhdGVkfSBhZGRlZCwgJHtkYXRhLnVwZGF0ZWR9IHVwZGF0ZWQuIEV4aXN0aW5nIHJvd3MgYXJlIG1hdGNoZWQgYnkgc2x1ZyDigJQga2VlcCBzbHVnIHRoZSBzYW1lIHRvIHVwZGF0ZSBwcmljZS5gLFxuICAgICAgfSlcbiAgICAgIG9uSW1wb3J0ZWQ/LigpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZGFuZ2VyJywgdGV4dDogZXJyb3IubWVzc2FnZSB8fCAnSW1wb3J0IGZhaWxlZC4nIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgYnV0dG9ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghY29uZmlnKSByZXR1cm4gW11cblxuICAgIGNvbnN0IGl0ZW1zID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0V4cG9ydCBDU1YnLFxuICAgICAgICB2YXJpYW50OiAndGV4dCcsXG4gICAgICAgIGhyZWY6IGAke3Jvb3R9L2NhdGFsb2cvJHtjb25maWcuZXhwb3J0VXJsfWAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0V4cG9ydCBFeGNlbCcsXG4gICAgICAgIHZhcmlhbnQ6ICd0ZXh0JyxcbiAgICAgICAgaHJlZjogYCR7cm9vdH0vY2F0YWxvZy8ke2NvbmZpZy5leHBvcnRVcmx9P2Zvcm1hdD14bHN4YCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBsb2FkaW5nID8gJ0ltcG9ydGluZy4uLicgOiAnSW1wb3J0JyxcbiAgICAgICAgdmFyaWFudDogJ3RleHQnLFxuICAgICAgICBvbkNsaWNrOiBsb2FkaW5nID8gdW5kZWZpbmVkIDogKCkgPT4gZmlsZVJlZi5jdXJyZW50Py5jbGljaygpLFxuICAgICAgfSxcbiAgICBdXG5cbiAgICBjb25zdCBuZXdBY3Rpb24gPSByZXNvdXJjZS5yZXNvdXJjZUFjdGlvbnM/LmZpbmQoKGFjdGlvbikgPT4gYWN0aW9uLm5hbWUgPT09ICduZXcnKVxuICAgIGlmIChuZXdBY3Rpb24pIHtcbiAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICBpY29uOiBuZXdBY3Rpb24uaWNvbixcbiAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZUFjdGlvbihuZXdBY3Rpb24ubGFiZWwsIHJlc291cmNlSWQpLFxuICAgICAgICB2YXJpYW50OiBuZXdBY3Rpb24udmFyaWFudCxcbiAgICAgICAgaHJlZjogYCR7cm9vdH0vcmVzb3VyY2VzLyR7cmVzb3VyY2VJZH0vYWN0aW9ucy9uZXdgLFxuICAgICAgICAnZGF0YS1jc3MnOiBgJHtyZXNvdXJjZUlkfS1uZXctYnV0dG9uYCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgZmlsdGVyS2V5ID0gZmlsdGVyc0NvdW50ID4gMCA/ICdmaWx0ZXJBY3RpdmUnIDogJ2ZpbHRlcidcbiAgICBpdGVtcy5wdXNoKHtcbiAgICAgIGxhYmVsOiB0cmFuc2xhdGVCdXR0b24oZmlsdGVyS2V5LCByZXNvdXJjZUlkLCB7IGNvdW50OiBmaWx0ZXJzQ291bnQgfSksXG4gICAgICBvbkNsaWNrOiB0b2dnbGVGaWx0ZXIsXG4gICAgICBpY29uOiAnRmlsdGVyJyxcbiAgICAgICdkYXRhLWNzcyc6IGAke3Jlc291cmNlSWR9LWZpbHRlci1idXR0b25gLFxuICAgIH0pXG5cbiAgICByZXR1cm4gaXRlbXNcbiAgfSwgW1xuICAgIGNvbmZpZyxcbiAgICByb290LFxuICAgIGxvYWRpbmcsXG4gICAgcmVzb3VyY2UucmVzb3VyY2VBY3Rpb25zLFxuICAgIHJlc291cmNlSWQsXG4gICAgdHJhbnNsYXRlQWN0aW9uLFxuICAgIHRyYW5zbGF0ZUJ1dHRvbixcbiAgICBmaWx0ZXJzQ291bnQsXG4gICAgdG9nZ2xlRmlsdGVyLFxuICBdKVxuXG4gIGlmICghY29uZmlnKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxCb3hcbiAgICAgICAgbXQ9XCJ4bFwiXG4gICAgICAgIG1iPVwiZGVmYXVsdFwiXG4gICAgICAgIGRpc3BsYXk9XCJmbGV4XCJcbiAgICAgICAganVzdGlmeUNvbnRlbnQ9XCJmbGV4LWVuZFwiXG4gICAgICAgIGZsZXhTaHJpbms9ezB9XG4gICAgICAgIHB4PXtbJ2RlZmF1bHQnLCAwXX1cbiAgICAgICAgc3R5bGU9e3sgbWFyZ2luVG9wOiAnLTUycHgnIH19XG4gICAgICA+XG4gICAgICAgIDxCdXR0b25Hcm91cCBidXR0b25zPXtidXR0b25zfSAvPlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICByZWY9e2ZpbGVSZWZ9XG4gICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgIGFjY2VwdD1cIi5jc3YsLnhsc3gsdGV4dC9jc3YsYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXRcIlxuICAgICAgICAgIHN0eWxlPXt7IGRpc3BsYXk6ICdub25lJyB9fVxuICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVJbXBvcnR9XG4gICAgICAgIC8+XG4gICAgICA8L0JveD5cblxuICAgICAge21lc3NhZ2UgJiYgKFxuICAgICAgICA8Qm94IG1iPVwiZGVmYXVsdFwiIHB4PXtbJ2RlZmF1bHQnLCAwXX0+XG4gICAgICAgICAgPE1lc3NhZ2VCb3hcbiAgICAgICAgICAgIHZhcmlhbnQ9e21lc3NhZ2UudHlwZX1cbiAgICAgICAgICAgIG1lc3NhZ2U9e21lc3NhZ2UudGV4dH1cbiAgICAgICAgICAgIG9uQ2xvc2VDbGljaz17KCkgPT4gc2V0TWVzc2FnZShudWxsKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG4gICAgPC8+XG4gIClcbn1cbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBPcmlnaW5hbEFjdGlvbkhlYWRlciB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgQ2F0YWxvZ0xpc3RIZWFkZXJBY3Rpb25zIGZyb20gJy4vY2F0YWxvZy1saXN0LWhlYWRlci1hY3Rpb25zLmpzeCdcblxuY29uc3QgQ0FUQUxPR19SRVNPVVJDRVMgPSBuZXcgU2V0KFsnUHJvZHVjdCcsICdDYXRlZ29yeSddKVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBY3Rpb25IZWFkZXIocHJvcHMpIHtcbiAgY29uc3QgeyBPcmlnaW5hbENvbXBvbmVudCwgYWN0aW9uLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgQmFzZUhlYWRlciA9IE9yaWdpbmFsQ29tcG9uZW50IHx8IE9yaWdpbmFsQWN0aW9uSGVhZGVyXG4gIGNvbnN0IGlzQ2F0YWxvZ0xpc3QgPSBhY3Rpb24/Lm5hbWUgPT09ICdsaXN0JyAmJiBDQVRBTE9HX1JFU09VUkNFUy5oYXMocmVzb3VyY2U/LmlkKVxuXG4gIGlmICghaXNDYXRhbG9nTGlzdCkge1xuICAgIHJldHVybiA8QmFzZUhlYWRlciB7Li4ucHJvcHN9IC8+XG4gIH1cblxuICBjb25zdCB7IE9yaWdpbmFsQ29tcG9uZW50OiBfaWdub3JlZCwgLi4uaGVhZGVyUHJvcHMgfSA9IHByb3BzXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94PlxuICAgICAgPEJhc2VIZWFkZXIgey4uLmhlYWRlclByb3BzfSBvbWl0QWN0aW9ucyAvPlxuICAgICAgPENhdGFsb2dMaXN0SGVhZGVyQWN0aW9uc1xuICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgIG9uSW1wb3J0ZWQ9e3Byb3BzLmFjdGlvblBlcmZvcm1lZH1cbiAgICAgIC8+XG4gICAgPC9Cb3g+XG4gIClcbn1cbiIsImltcG9ydCBSZWFjdCwgeyBtZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgRm9ybUdyb3VwLCBGb3JtTWVzc2FnZSwgTGFiZWwsIFRpbnlNQ0UgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIHBsdWdpbnM6IFtcbiAgICAnY29kZScsXG4gICAgJ2xpbmsnLFxuICAgICdsaXN0cycsXG4gICAgJ2ltYWdlJyxcbiAgICAndGFibGUnLFxuICAgICdhdXRvbGluaycsXG4gICAgJ3ByZXZpZXcnLFxuICAgICdzZWFyY2hyZXBsYWNlJyxcbiAgICAnd29yZGNvdW50JyxcbiAgICAnbWVkaWEnLFxuICAgICdjb2Rlc2FtcGxlJyxcbiAgXSxcbiAgdG9vbGJhcjpcbiAgICAndW5kbyByZWRvIHwgYmxvY2tzIHwgYm9sZCBpdGFsaWMgdW5kZXJsaW5lIHN0cmlrZXRocm91Z2ggfCBhbGlnbmxlZnQgYWxpZ25jZW50ZXIgYWxpZ25yaWdodCBhbGlnbmp1c3RpZnkgfCBidWxsaXN0IG51bWxpc3Qgb3V0ZGVudCBpbmRlbnQgfCBsaW5rIGltYWdlIHRhYmxlIGNvZGVzYW1wbGUgfCBjb2RlIHwgcmVtb3ZlZm9ybWF0JyxcbiAgaGVpZ2h0OiA0MDAsXG59XG5cbmNvbnN0IFJpY2h0ZXh0RWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHByb3BlcnR5LCByZWNvcmQsIG9uQ2hhbmdlIH0gPSBwcm9wc1xuICBjb25zdCB2YWx1ZSA9IHJlY29yZC5wYXJhbXM/Lltwcm9wZXJ0eS5wYXRoXSA/PyAnJ1xuICBjb25zdCBlcnJvciA9IHJlY29yZC5lcnJvcnM/Lltwcm9wZXJ0eS5wYXRoXVxuXG4gIGNvbnN0IGhhbmRsZVVwZGF0ZSA9IHVzZUNhbGxiYWNrKFxuICAgIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV3VmFsdWUpXG4gICAgfSxcbiAgICBbb25DaGFuZ2UsIHByb3BlcnR5LnBhdGhdLFxuICApXG5cbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAuLi5ERUZBVUxUX09QVElPTlMsXG4gICAgLi4uKHByb3BlcnR5LnByb3BzIHx8IHt9KSxcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEZvcm1Hcm91cCBlcnJvcj17Qm9vbGVhbihlcnJvcil9PlxuICAgICAgPExhYmVsIHJlcXVpcmVkPXtwcm9wZXJ0eS5pc1JlcXVpcmVkfT57cHJvcGVydHkubGFiZWx9PC9MYWJlbD5cbiAgICAgIDxUaW55TUNFIHZhbHVlPXt2YWx1ZX0gb25DaGFuZ2U9e2hhbmRsZVVwZGF0ZX0gb3B0aW9ucz17b3B0aW9uc30gLz5cbiAgICAgIDxGb3JtTWVzc2FnZT57ZXJyb3I/Lm1lc3NhZ2V9PC9Gb3JtTWVzc2FnZT5cbiAgICA8L0Zvcm1Hcm91cD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBtZW1vKFJpY2h0ZXh0RWRpdClcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEljb24gfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTG9jYXRpb24sIHVzZU5hdmlnYXRlIH0gZnJvbSAncmVhY3Qtcm91dGVyJ1xuXG5mdW5jdGlvbiBhZG1pblJvb3QocGF0aG5hbWUpIHtcbiAgY29uc3QgY3V0ID0gcGF0aG5hbWUuc2VhcmNoKC9cXC8ocmVzb3VyY2VzfHBhZ2VzKShcXC98JCkvKVxuICBjb25zdCByb290ID0gY3V0ID09PSAtMSA/IHBhdGhuYW1lIDogcGF0aG5hbWUuc2xpY2UoMCwgY3V0KVxuICByZXR1cm4gcm9vdC5yZXBsYWNlKC9cXC8kLywgJycpIHx8ICcvJ1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTaWRlYmFyUmVzb3VyY2VTZWN0aW9uKHByb3BzKSB7XG4gIGNvbnN0IE9yaWdpbmFsID0gcHJvcHMuT3JpZ2luYWxDb21wb25lbnRcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKVxuICBjb25zdCBocmVmID0gYWRtaW5Sb290KGxvY2F0aW9uLnBhdGhuYW1lKVxuICBjb25zdCBzZWxlY3RlZCA9IGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcLyQvLCAnJykgPT09IGhyZWYucmVwbGFjZSgvXFwvJC8sICcnKSB8fCBsb2NhdGlvbi5wYXRobmFtZSA9PT0gYCR7aHJlZn0vYFxuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxhXG4gICAgICAgIGNsYXNzTmFtZT17YHRva3JpLXNpZGViYXItZGFzaGJvYXJkJHtzZWxlY3RlZCA/ICcgaXMtYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGhyZWY9e2hyZWZ9XG4gICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBuYXZpZ2F0ZShocmVmKVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8SWNvbiBpY29uPVwiSG9tZVwiIC8+XG4gICAgICAgIDxzcGFuPkRhc2hib2FyZDwvc3Bhbj5cbiAgICAgIDwvYT5cbiAgICAgIHtPcmlnaW5hbCA/IDxPcmlnaW5hbCByZXNvdXJjZXM9e3Byb3BzLnJlc291cmNlc30gLz4gOiBudWxsfVxuICAgIDwvPlxuICApXG59XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBMb2FkZXIsIFRhYmxlLCBUYWJsZUJvZHkgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHtcbiAgTm9SZWNvcmRzLFxuICBSZWNvcmRJbkxpc3QsXG4gIFJlY29yZHNUYWJsZUhlYWRlcixcbiAgU2VsZWN0ZWRSZWNvcmRzLFxufSBmcm9tICdhZG1pbmpzJ1xuXG5jb25zdCBnZXRSZXNvdXJjZUVsZW1lbnRDc3MgPSAocmVzb3VyY2VJZCwgc3VmZml4KSA9PiBgJHtyZXNvdXJjZUlkfS0ke3N1ZmZpeH1gXG5cbi8qKlxuICogQWRtaW5KUyBtYXJrcyB0aGUgaGVhZGVyIGNoZWNrYm94IGNoZWNrZWQgd2hlbiBBTlkgcm93IGlzIHNlbGVjdGVkLlxuICogT3ZlcnJpZGUgc286IG5vbmUgPSB1bmNoZWNrZWQsIHNvbWUgPSBpbmRldGVybWluYXRlLCBhbGwgPSBjaGVja2VkLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSZWNvcmRzVGFibGUocHJvcHMpIHtcbiAgY29uc3Qge1xuICAgIHJlc291cmNlLFxuICAgIHJlY29yZHMsXG4gICAgYWN0aW9uUGVyZm9ybWVkLFxuICAgIHNvcnRCeSxcbiAgICBkaXJlY3Rpb24sXG4gICAgaXNMb2FkaW5nLFxuICAgIG9uU2VsZWN0LFxuICAgIHNlbGVjdGVkUmVjb3JkcyxcbiAgICBvblNlbGVjdEFsbCxcbiAgfSA9IHByb3BzXG5cbiAgaWYgKCFyZWNvcmRzLmxlbmd0aCkge1xuICAgIGlmIChpc0xvYWRpbmcpIHJldHVybiA8TG9hZGVyIC8+XG4gICAgcmV0dXJuIDxOb1JlY29yZHMgcmVzb3VyY2U9e3Jlc291cmNlfSAvPlxuICB9XG5cbiAgY29uc3Qgc2VsZWN0ZWRDb3VudCA9IHNlbGVjdGVkUmVjb3Jkc1xuICAgID8gcmVjb3Jkcy5maWx0ZXIoKHJlY29yZCkgPT4gc2VsZWN0ZWRSZWNvcmRzLnNvbWUoKHNlbGVjdGVkKSA9PiBzZWxlY3RlZC5pZCA9PT0gcmVjb3JkLmlkKSkubGVuZ3RoXG4gICAgOiAwXG4gIGNvbnN0IHNlbGVjdGVkQWxsID0gc2VsZWN0ZWRDb3VudCA+IDAgJiYgc2VsZWN0ZWRDb3VudCA9PT0gcmVjb3Jkcy5sZW5ndGhcbiAgY29uc3QgaW5kZXRlcm1pbmF0ZSA9IHNlbGVjdGVkQ291bnQgPiAwICYmIHNlbGVjdGVkQ291bnQgPCByZWNvcmRzLmxlbmd0aFxuICBjb25zdCByZWNvcmRzSGF2ZUJ1bGtBY3Rpb24gPSAhIXJlY29yZHMuZmluZCgocmVjb3JkKSA9PiByZWNvcmQuYnVsa0FjdGlvbnMubGVuZ3RoKVxuXG4gIGNvbnN0IGNvbnRlbnRUYWcgPSBnZXRSZXNvdXJjZUVsZW1lbnRDc3MocmVzb3VyY2UuaWQsICd0YWJsZScpXG4gIGNvbnN0IHNlbGVjdGVkVGFnID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHJlc291cmNlLmlkLCAndGFibGUtc2VsZWN0ZWQtcmVjb3JkcycpXG4gIGNvbnN0IGJvZHlUYWcgPSBnZXRSZXNvdXJjZUVsZW1lbnRDc3MocmVzb3VyY2UuaWQsICd0YWJsZS1ib2R5JylcblxuICByZXR1cm4gKFxuICAgIDxUYWJsZSBkYXRhLWNzcz17Y29udGVudFRhZ30+XG4gICAgICA8U2VsZWN0ZWRSZWNvcmRzXG4gICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgc2VsZWN0ZWRSZWNvcmRzPXtzZWxlY3RlZFJlY29yZHN9XG4gICAgICAgIGRhdGEtY3NzPXtzZWxlY3RlZFRhZ31cbiAgICAgIC8+XG4gICAgICA8UmVjb3Jkc1RhYmxlSGVhZGVyXG4gICAgICAgIHByb3BlcnRpZXM9e3Jlc291cmNlLmxpc3RQcm9wZXJ0aWVzfVxuICAgICAgICB0aXRsZVByb3BlcnR5PXtyZXNvdXJjZS50aXRsZVByb3BlcnR5fVxuICAgICAgICBkaXJlY3Rpb249e2RpcmVjdGlvbn1cbiAgICAgICAgc29ydEJ5PXtzb3J0Qnl9XG4gICAgICAgIG9uU2VsZWN0QWxsPXtyZWNvcmRzSGF2ZUJ1bGtBY3Rpb24gPyBvblNlbGVjdEFsbCA6IHVuZGVmaW5lZH1cbiAgICAgICAgc2VsZWN0ZWRBbGw9e3NlbGVjdGVkQWxsfVxuICAgICAgICBpbmRldGVybWluYXRlPXtpbmRldGVybWluYXRlfVxuICAgICAgLz5cbiAgICAgIDxUYWJsZUJvZHkgZGF0YS1jc3M9e2JvZHlUYWd9PlxuICAgICAgICB7cmVjb3Jkcy5tYXAoKHJlY29yZCkgPT4gKFxuICAgICAgICAgIDxSZWNvcmRJbkxpc3RcbiAgICAgICAgICAgIHJlY29yZD17cmVjb3JkfVxuICAgICAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICAgICAga2V5PXtyZWNvcmQuaWR9XG4gICAgICAgICAgICBhY3Rpb25QZXJmb3JtZWQ9e2FjdGlvblBlcmZvcm1lZH1cbiAgICAgICAgICAgIGlzTG9hZGluZz17aXNMb2FkaW5nfVxuICAgICAgICAgICAgb25TZWxlY3Q9e29uU2VsZWN0fVxuICAgICAgICAgICAgaXNTZWxlY3RlZD17XG4gICAgICAgICAgICAgIHNlbGVjdGVkUmVjb3JkcyAmJiAhIXNlbGVjdGVkUmVjb3Jkcy5maW5kKChzZWxlY3RlZCkgPT4gc2VsZWN0ZWQuaWQgPT09IHJlY29yZC5pZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvVGFibGVCb2R5PlxuICAgIDwvVGFibGU+XG4gIClcbn1cbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgVGFibGVDZWxsLCBUYWJsZUhlYWQsIFRhYmxlUm93IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IFByb3BlcnR5SGVhZGVyIH0gZnJvbSAnYWRtaW5qcydcblxuY29uc3QgZ2V0UmVzb3VyY2VFbGVtZW50Q3NzID0gKHJlc291cmNlSWQsIHN1ZmZpeCkgPT4gYCR7cmVzb3VyY2VJZH0tJHtzdWZmaXh9YFxuXG5jb25zdCBkaXNwbGF5ID0gKGlzVGl0bGUpID0+IFtcbiAgaXNUaXRsZSA/ICd0YWJsZS1jZWxsJyA6ICdub25lJyxcbiAgaXNUaXRsZSA/ICd0YWJsZS1jZWxsJyA6ICdub25lJyxcbiAgJ3RhYmxlLWNlbGwnLFxuICAndGFibGUtY2VsbCcsXG5dXG5cbmZ1bmN0aW9uIFNlbGVjdEFsbENoZWNrQm94KHsgY2hlY2tlZCwgaW5kZXRlcm1pbmF0ZSwgb25DaGFuZ2UgfSkge1xuICBjb25zdCBpbnB1dFJlZiA9IHVzZVJlZihudWxsKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlucHV0UmVmLmN1cnJlbnQpIHtcbiAgICAgIGlucHV0UmVmLmN1cnJlbnQuaW5kZXRlcm1pbmF0ZSA9IEJvb2xlYW4oaW5kZXRlcm1pbmF0ZSlcbiAgICB9XG4gIH0sIFtpbmRldGVybWluYXRlLCBjaGVja2VkXSlcblxuICByZXR1cm4gKFxuICAgIDxsYWJlbFxuICAgICAgY2xhc3NOYW1lPXtgdG9rcmktc2VsZWN0LWFsbCR7aW5kZXRlcm1pbmF0ZSA/ICcgaXMtaW5kZXRlcm1pbmF0ZScgOiAnJ30ke2NoZWNrZWQgPyAnIGlzLWNoZWNrZWQnIDogJyd9YH1cbiAgICAgIHN0eWxlPXt7IG1hcmdpbkxlZnQ6IDUgfX1cbiAgICA+XG4gICAgICA8aW5wdXRcbiAgICAgICAgcmVmPXtpbnB1dFJlZn1cbiAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgY2hlY2tlZD17Qm9vbGVhbihjaGVja2VkKX1cbiAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgICBhcmlhLWNoZWNrZWQ9e2luZGV0ZXJtaW5hdGUgPyAnbWl4ZWQnIDogY2hlY2tlZCA/ICd0cnVlJyA6ICdmYWxzZSd9XG4gICAgICAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktc2VsZWN0LWFsbC1ib3hcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAge2luZGV0ZXJtaW5hdGUgPyAoXG4gICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgY2xhc3NOYW1lPVwidG9rcmktc2VsZWN0LWFsbC1pY29uXCI+XG4gICAgICAgICAgICA8bGluZSB4MT1cIjZcIiB5MT1cIjEyXCIgeDI9XCIxOFwiIHkyPVwiMTJcIiAvPlxuICAgICAgICAgIDwvc3ZnPlxuICAgICAgICApIDogY2hlY2tlZCA/IChcbiAgICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBjbGFzc05hbWU9XCJ0b2tyaS1zZWxlY3QtYWxsLWljb25cIj5cbiAgICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9XCIyMCA2IDkgMTcgNCAxMlwiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zcGFuPlxuICAgIDwvbGFiZWw+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUmVjb3Jkc1RhYmxlSGVhZGVyKHByb3BzKSB7XG4gIGNvbnN0IHtcbiAgICB0aXRsZVByb3BlcnR5LFxuICAgIHByb3BlcnRpZXMsXG4gICAgc29ydEJ5LFxuICAgIGRpcmVjdGlvbixcbiAgICBvblNlbGVjdEFsbCxcbiAgICBzZWxlY3RlZEFsbCxcbiAgICBpbmRldGVybWluYXRlLFxuICB9ID0gcHJvcHNcblxuICBjb25zdCBjb250ZW50VGFnID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHRpdGxlUHJvcGVydHkucmVzb3VyY2VJZCwgJ3RhYmxlLWhlYWQnKVxuICBjb25zdCByb3dUYWcgPSBgJHt0aXRsZVByb3BlcnR5LnJlc291cmNlSWR9LXRhYmxlLWhlYWQtcm93YFxuICBjb25zdCBjaGVja2JveENzcyA9IGAke3RpdGxlUHJvcGVydHkucmVzb3VyY2VJZH0tY2hlY2tib3gtdGFibGUtY2VsbGBcblxuICByZXR1cm4gKFxuICAgIDxUYWJsZUhlYWQgZGF0YS1jc3M9e2NvbnRlbnRUYWd9PlxuICAgICAgPFRhYmxlUm93IGRhdGEtY3NzPXtyb3dUYWd9PlxuICAgICAgICA8VGFibGVDZWxsIGRhdGEtY3NzPXtjaGVja2JveENzc30+XG4gICAgICAgICAge29uU2VsZWN0QWxsID8gKFxuICAgICAgICAgICAgPFNlbGVjdEFsbENoZWNrQm94XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoKSA9PiBvblNlbGVjdEFsbCgpfVxuICAgICAgICAgICAgICBjaGVja2VkPXtCb29sZWFuKHNlbGVjdGVkQWxsKX1cbiAgICAgICAgICAgICAgaW5kZXRlcm1pbmF0ZT17Qm9vbGVhbihpbmRldGVybWluYXRlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvVGFibGVDZWxsPlxuICAgICAgICB7cHJvcGVydGllcy5tYXAoKHByb3BlcnR5KSA9PiAoXG4gICAgICAgICAgPFByb3BlcnR5SGVhZGVyXG4gICAgICAgICAgICBkaXNwbGF5PXtkaXNwbGF5KHByb3BlcnR5LmlzVGl0bGUpfVxuICAgICAgICAgICAga2V5PXtwcm9wZXJ0eS5wcm9wZXJ0eVBhdGh9XG4gICAgICAgICAgICB0aXRsZVByb3BlcnR5PXt0aXRsZVByb3BlcnR5fVxuICAgICAgICAgICAgcHJvcGVydHk9e3Byb3BlcnR5fVxuICAgICAgICAgICAgc29ydEJ5PXtzb3J0Qnl9XG4gICAgICAgICAgICBkaXJlY3Rpb249e2RpcmVjdGlvbn1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgICAgPFRhYmxlQ2VsbCBrZXk9XCJhY3Rpb25zXCIgc3R5bGU9e3sgd2lkdGg6IDgwIH19IC8+XG4gICAgICA8L1RhYmxlUm93PlxuICAgIDwvVGFibGVIZWFkPlxuICApXG59XG4iLCJBZG1pbkpTLlVzZXJDb21wb25lbnRzID0ge31cbmltcG9ydCBEYXNoYm9hcmQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvZGFzaGJvYXJkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5EYXNoYm9hcmQgPSBEYXNoYm9hcmRcbmltcG9ydCBQcm9kdWN0RWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9wcm9kdWN0LWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlByb2R1Y3RFZGl0ID0gUHJvZHVjdEVkaXRcbmltcG9ydCBDYXRlZ29yeUVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY2F0ZWdvcnktZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQ2F0ZWdvcnlFZGl0ID0gQ2F0ZWdvcnlFZGl0XG5pbXBvcnQgQ21zTGlzdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jbXMtbGlzdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQ21zTGlzdCA9IENtc0xpc3RcbmltcG9ydCBSZXZpZXdFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3Jldmlldy1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5SZXZpZXdFZGl0ID0gUmV2aWV3RWRpdFxuaW1wb3J0IEJsb2dFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2Jsb2ctZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQmxvZ0VkaXQgPSBCbG9nRWRpdFxuaW1wb3J0IFNldHRpbmdzRWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9zZXR0aW5ncy1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TZXR0aW5nc0VkaXQgPSBTZXR0aW5nc0VkaXRcbmltcG9ydCBDb3Vwb25FZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2NvdXBvbi1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Db3Vwb25FZGl0ID0gQ291cG9uRWRpdFxuaW1wb3J0IE9yZGVyRGV0YWlsIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWRldGFpbCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuT3JkZXJEZXRhaWwgPSBPcmRlckRldGFpbFxuaW1wb3J0IENoYW5nZVBhc3N3b3JkIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2NoYW5nZS1wYXNzd29yZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQ2hhbmdlUGFzc3dvcmQgPSBDaGFuZ2VQYXNzd29yZFxuaW1wb3J0IFBhcnRuZXJFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3BhcnRuZXItZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUGFydG5lckVkaXQgPSBQYXJ0bmVyRWRpdFxuaW1wb3J0IFBpbmNvZGVFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3BpbmNvZGUtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUGluY29kZUVkaXQgPSBQaW5jb2RlRWRpdFxuaW1wb3J0IFN0YXR1c1RvZ2dsZSBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9zdGF0dXMtdG9nZ2xlJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TdGF0dXNUb2dnbGUgPSBTdGF0dXNUb2dnbGVcbmltcG9ydCBDdXN0b21lckVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY3VzdG9tZXItZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQ3VzdG9tZXJFZGl0ID0gQ3VzdG9tZXJFZGl0XG5pbXBvcnQgVGVhbUVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGVhbS1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5UZWFtRWRpdCA9IFRlYW1FZGl0XG5pbXBvcnQgTWVkaWFMaWJyYXJ5IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL21lZGlhLWxpYnJhcnknXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk1lZGlhTGlicmFyeSA9IE1lZGlhTGlicmFyeVxuaW1wb3J0IFRheEVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGF4LWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlRheEVkaXQgPSBUYXhFZGl0XG5pbXBvcnQgUmF6b3JwYXlQYXltZW50SWQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmF6b3JwYXktcGF5bWVudC1pZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUmF6b3JwYXlQYXltZW50SWQgPSBSYXpvcnBheVBheW1lbnRJZFxuaW1wb3J0IE9yZGVyTGlzdEJhZGdlIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWxpc3QtYmFkZ2VzJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlckxpc3RCYWRnZSA9IE9yZGVyTGlzdEJhZGdlXG5pbXBvcnQgTG9naW4gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvbG9naW4nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkxvZ2luID0gTG9naW5cbmltcG9ydCBBY3Rpb25IZWFkZXIgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvYWN0aW9uLWhlYWRlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQWN0aW9uSGVhZGVyID0gQWN0aW9uSGVhZGVyXG5pbXBvcnQgRGVmYXVsdFJpY2h0ZXh0RWRpdFByb3BlcnR5IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JpY2h0ZXh0LWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkRlZmF1bHRSaWNodGV4dEVkaXRQcm9wZXJ0eSA9IERlZmF1bHRSaWNodGV4dEVkaXRQcm9wZXJ0eVxuaW1wb3J0IFNpZGViYXJSZXNvdXJjZVNlY3Rpb24gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvc2lkZWJhci1kYXNoYm9hcmQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNpZGViYXJSZXNvdXJjZVNlY3Rpb24gPSBTaWRlYmFyUmVzb3VyY2VTZWN0aW9uXG5pbXBvcnQgUmVjb3Jkc1RhYmxlIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JlY29yZHMtdGFibGUnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJlY29yZHNUYWJsZSA9IFJlY29yZHNUYWJsZVxuaW1wb3J0IFJlY29yZHNUYWJsZUhlYWRlciBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZWNvcmRzLXRhYmxlLWhlYWRlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUmVjb3Jkc1RhYmxlSGVhZGVyID0gUmVjb3Jkc1RhYmxlSGVhZGVyIl0sIm5hbWVzIjpbInVzZUFuY2hvcmVkTWVudSIsIm9wZW4iLCJ3cmFwUmVmIiwidXNlUmVmIiwib3BlblVwIiwic2V0T3BlblVwIiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJ1bmRlZmluZWQiLCJ1cGRhdGUiLCJub2RlIiwiY3VycmVudCIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJzcGFjZUJlbG93Iiwid2luZG93IiwiaW5uZXJIZWlnaHQiLCJib3R0b20iLCJ0b3AiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIlNlYXJjaGFibGVNdWx0aVNlbGVjdCIsIm9wdGlvbnMiLCJzZWxlY3RlZCIsIm9uQ2hhbmdlIiwicGxhY2Vob2xkZXIiLCJzZWFyY2hQbGFjZWhvbGRlciIsInNldE9wZW4iLCJxdWVyeSIsInNldFF1ZXJ5Iiwib25Eb2NDbGljayIsImV2ZW50IiwiY29udGFpbnMiLCJ0YXJnZXQiLCJkb2N1bWVudCIsInNlbGVjdGVkU2V0IiwidXNlTWVtbyIsIlNldCIsInNlbGVjdGVkT3B0aW9ucyIsImZpbHRlciIsIml0ZW0iLCJoYXMiLCJ2YWx1ZSIsImZpbHRlcmVkIiwibGFiZWwiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwidHJpbSIsInRvZ2dsZSIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsInJlZiIsInR5cGUiLCJvbkNsaWNrIiwibGVuZ3RoIiwibWFwIiwia2V5Iiwicm9sZSIsInRhYkluZGV4Iiwic3RvcFByb3BhZ2F0aW9uIiwiYXV0b0ZvY3VzIiwiY2hlY2tlZCIsIkZsYWdDYXJkIiwidGl0bGUiLCJoaW50IiwiaXNGbGFnT24iLCJTdGF0dXNTd2l0Y2giLCJkaXNhYmxlZCIsImNvbXBhY3QiLCJvbkxhYmVsIiwib2ZmTGFiZWwiLCJwcmV2ZW50RGVmYXVsdCIsIlNlYXJjaGFibGVTZWxlY3QiLCJqdXN0UGlja2VkIiwiZmluZCIsImFjdGl2ZSIsIm9uTW91c2VEb3duIiwic2V0VGltZW91dCIsIkxvY2FsU2VsZWN0IiwiU3RyaW5nIiwiYXBpIiwiQXBpQ2xpZW50IiwiUkFOR0VTIiwiV0lER0VUUyIsImluciIsIk51bWJlciIsInRvTG9jYWxlU3RyaW5nIiwibWF4aW11bUZyYWN0aW9uRGlnaXRzIiwiUmFuZ2VTZWxlY3QiLCJheGlzTWF4IiwicGFkZGVkIiwibWFnbml0dWRlIiwiTWF0aCIsImZsb29yIiwibG9nMTAiLCJub3JtYWxpemVkIiwibmljZSIsIkxpbmVDaGFydCIsInNlcmllcyIsImhvdmVyIiwic2V0SG92ZXIiLCJ3aWR0aCIsImhlaWdodCIsInBhZExlZnQiLCJwYWRSaWdodCIsInBhZFRvcCIsInBhZEJvdHRvbSIsIm1heCIsInBvaW50Iiwib3JkZXJWYWx1ZSIsInBsb3RXaWR0aCIsInBsb3RIZWlnaHQiLCJiYXNlbGluZSIsInlGb3IiLCJzdGVwIiwiY29vcmRzIiwiaW5kZXgiLCJ4IiwieSIsImxpbmUiLCJqb2luIiwiYXJlYSIsImxhYmVsRXZlcnkiLCJjZWlsIiwidGlja3MiLCJyYXRpbyIsInJvdW5kIiwib25Nb3VzZUxlYXZlIiwidmlld0JveCIsInRpY2siLCJ4MSIsIngyIiwieTEiLCJ5MiIsInRleHRBbmNob3IiLCJkIiwiZmlsbCIsIm9wYWNpdHkiLCJzdHJva2UiLCJzdHJva2VXaWR0aCIsInN0cm9rZUxpbmVqb2luIiwic3Ryb2tlTGluZWNhcCIsImRhdGUiLCJjeCIsImN5IiwiciIsIm9uTW91c2VFbnRlciIsInBvaW50ZXJFdmVudHMiLCJzdHlsZSIsImxlZnQiLCJQYWdlciIsInBhZ2UiLCJwYWdlU2l6ZSIsInRvdGFsIiwicGFnZXMiLCJudW1iZXJzIiwibnVtYmVyIiwicHVzaCIsIkRhc2hib2FyZCIsInJlcXVlc3RzIiwicmFuZ2VzIiwic2V0UmFuZ2VzIiwib3JkZXJzIiwiY3VzdG9tZXJzIiwicHJvZHVjdHMiLCJkYXRhIiwic2V0RGF0YSIsInNldFBhZ2VzIiwiYnVzeSIsInNldEJ1c3kiLCJsb2FkV2lkZ2V0Iiwid2lkZ2V0IiwicmFuZ2UiLCJ0aWNrZXQiLCJnZXREYXNoYm9hcmQiLCJwYXJhbXMiLCJ0aGVuIiwicmVzcG9uc2UiLCJmaW5hbGx5IiwiZm9yRWFjaCIsImNoYW5nZVJhbmdlIiwiY2hhbmdlUGFnZSIsIkJveCIsInZhcmlhbnQiLCJIMiIsIm1iIiwiSDUiLCJUZXh0Iiwib3JkZXJDb3VudCIsInJvd3MiLCJyb3ciLCJpZCIsIm9yZGVyTm8iLCJuYW1lIiwiYW1vdW50IiwicGxhY2VkQXQiLCJwaG9uZSIsImRhdGVPZkJpcnRoIiwicmVnaXN0ZXJlZEF0Iiwibm9ybWFsaXplU2x1Z0lucHV0IiwicmVwbGFjZSIsIndpdGhvdXRUcmFpbGluZ1NsYXNoIiwicGFyc2VTbHVncyIsInJhdyIsIkFycmF5IiwiaXNBcnJheSIsIkJvb2xlYW4iLCJwYXJzZWQiLCJKU09OIiwicGFyc2UiLCJzcGxpdCIsIlByb2R1Y3RFZGl0IiwicHJvcHMiLCJyZWNvcmQiLCJpbml0aWFsUmVjb3JkIiwicmVzb3VyY2UiLCJoYW5kbGVDaGFuZ2UiLCJzdWJtaXQiLCJoYW5kbGVTdWJtaXQiLCJsb2FkaW5nIiwidXNlUmVjb3JkIiwiYWRkTm90aWNlIiwidXNlTm90aWNlIiwiZmlsZVJlZiIsInVwbG9hZGluZyIsInNldFVwbG9hZGluZyIsInNsdWdFZGl0ZWQiLCJzZXRTbHVnRWRpdGVkIiwic2x1ZyIsInByZXZpZXdVcmwiLCJzZXRQcmV2aWV3VXJsIiwiY2F0ZWdvcmllcyIsInNldENhdGVnb3JpZXMiLCJjdXN0b20iLCJhcGlCYXNlVXJsIiwicHJvZHVjdFVybEJhc2UiLCJsb2NhdGlvbiIsIm9yaWdpbiIsInNsdWdJbnB1dCIsInByZXZpZXdTbHVnIiwicHJvZHVjdFVybCIsInNlbGVjdGVkQ2F0ZWdvcnlTbHVncyIsImNhdGVnb3J5SWRzIiwiaW1hZ2VVcmwiLCJpbWFnZSIsInRlc3QiLCJhcHBVcmwiLCJkaXNwbGF5ZWRJbWFnZVVybCIsInN0YXJ0c1dpdGgiLCJVUkwiLCJyZXZva2VPYmplY3RVUkwiLCJpZ25vcmUiLCJmZXRjaCIsImpzb24iLCJjYXRjaCIsInNldEZpZWxkIiwib25Qcm9wZXJ0eUNoYW5nZSIsInByb3BlcnR5UGF0aCIsInJlc3QiLCJzZXRTZWxlY3RlZENhdGVnb3JpZXMiLCJzbHVncyIsInN0cmluZ2lmeSIsInVwbG9hZEltYWdlIiwiZmlsZSIsImZpbGVzIiwiZm9ybURhdGEiLCJGb3JtRGF0YSIsImFwcGVuZCIsImxvY2FsUHJldmlld1VybCIsImNyZWF0ZU9iamVjdFVSTCIsIm1ldGhvZCIsImJvZHkiLCJvayIsImVycm9yIiwiRXJyb3IiLCJtZXNzYWdlIiwibWVkaWEiLCJwYXRoIiwibm90aWNlIiwiZGVzY3JpcHRpb25Qcm9wZXJ0eSIsImVkaXRQcm9wZXJ0aWVzIiwicHJvcGVydHkiLCJhcyIsIm9uU3VibWl0IiwiSDMiLCJjb2xvciIsInJlcXVpcmVkIiwibXQiLCJocmVmIiwicmVsIiwibWluIiwicHJpY2VWYWx1ZSIsIm9sZFByaWNlVmFsdWUiLCJ3ZWlnaHQiLCJiYWRnZSIsInN0b2NrIiwic29ydE9yZGVyIiwibWFyZ2luQm90dG9tIiwiaXNUYXhhYmxlIiwibmV4dCIsImdzdFJhdGUiLCJoc25Db2RlIiwic3JjIiwiYWx0IiwiYWNjZXB0IiwiaXNCZXN0U2VsbGVyIiwiaXNJbXBvcnRlZCIsImlzRmVhdHVyZWQiLCJpc0FjdGl2ZSIsIm1pbkhlaWdodCIsIkJhc2VQcm9wZXJ0eUNvbXBvbmVudCIsIndoZXJlIiwiQnV0dG9uIiwiSWNvbiIsImljb24iLCJzcGluIiwiQ2F0ZWdvcnlFZGl0IiwiYmFubmVyRmlsZVJlZiIsImJhbm5lclVwbG9hZGluZyIsInNldEJhbm5lclVwbG9hZGluZyIsImJhbm5lclByZXZpZXdVcmwiLCJzZXRCYW5uZXJQcmV2aWV3VXJsIiwiY2F0ZWdvcnlVcmxCYXNlIiwiY2F0ZWdvcnlVcmwiLCJiYW5uZXJJbWFnZVVybCIsImJhbm5lckltYWdlIiwiZGlzcGxheWVkQmFubmVyVXJsIiwidXBsb2FkVG8iLCJmaWVsZCIsInNldExvY2FsUHJldmlldyIsInN1Y2Nlc3NNZXNzYWdlIiwic3VidGl0bGUiLCJtYXJnaW5Ub3AiLCJkaXNwbGF5IiwiUEVSX1BBR0VfT1BUSU9OUyIsIkNtc0xpc3QiLCJzZXRUYWciLCJ0aXRsZVByb3AiLCJ0aXRsZVByb3BlcnR5Iiwic3RvcmVQYXJhbXMiLCJmaWx0ZXJzIiwicGFyc2VkUXVlcnkiLCJ1c2VRdWVyeVBhcmFtcyIsInJlY29yZHMiLCJkaXJlY3Rpb24iLCJzb3J0QnkiLCJmZXRjaERhdGEiLCJwZXJQYWdlIiwidXNlUmVjb3JkcyIsInNlbGVjdGVkUmVjb3JkcyIsImhhbmRsZVNlbGVjdCIsImhhbmRsZVNlbGVjdEFsbCIsInNldFNlbGVjdGVkUmVjb3JkcyIsInVzZVNlbGVjdGVkUmVjb3JkcyIsInEiLCJkZWJvdW5jZVJlZiIsInN0b3JlUGFyYW1zUmVmIiwidG9TdHJpbmciLCJoYW5kbGVRdWVyeUNoYW5nZSIsImNsZWFyVGltZW91dCIsInRyaW1tZWQiLCJoYW5kbGVBY3Rpb25QZXJmb3JtZWQiLCJjdXJyZW50UGFnZSIsInJvd3NQZXJQYWdlIiwidG90YWxSb3dzIiwidG90YWxQYWdlcyIsImZyb20iLCJ0byIsImdvVG9QYWdlIiwibmV4dFBhZ2UiLCJzYWZlIiwiY2hhbmdlUGVyUGFnZSIsInBhZ2VOdW1iZXJzIiwid2luZG93U2l6ZSIsInN0YXJ0IiwiZW5kIiwicG9zaXRpb24iLCJtYXhXaWR0aCIsInRyYW5zZm9ybSIsIklucHV0IiwicGFkZGluZ0xlZnQiLCJSZWNvcmRzVGFibGUiLCJhY3Rpb25QZXJmb3JtZWQiLCJvblNlbGVjdCIsIm9uU2VsZWN0QWxsIiwiaXNMb2FkaW5nIiwib3B0aW9uIiwicmVzb2x2ZUltYWdlVXJsIiwiRmllbGRFcnJvciIsIlJldmlld0VkaXQiLCJhY3Rpb24iLCJpc05ldyIsImVycm9ycyIsInJhdGluZyIsImlzQXBwcm92ZWQiLCJjb250ZW50IiwiRURJVE9SX09QVElPTlMiLCJwbHVnaW5zIiwidG9vbGJhciIsImRhdGVJbnB1dFZhbHVlIiwiRGF0ZSIsImlzTmFOIiwiZ2V0VGltZSIsInNsaWNlIiwieWVhciIsImdldEZ1bGxZZWFyIiwibW9udGgiLCJnZXRNb250aCIsInBhZFN0YXJ0IiwiZGF5IiwiZ2V0RGF0ZSIsInBhZCIsInBhcnNlRGF0ZVZhbHVlIiwidGV4dCIsIm1hdGNoIiwidG9EYXRlVmFsdWUiLCJEYXRlRmllbGQiLCJtb250aERhdGUiLCJzZXRNb250aERhdGUiLCJmaXJzdERheSIsImdldERheSIsInRvdGFsRGF5cyIsImNlbGxzIiwic2VsZWN0ZWREYXkiLCJjaG9vc2UiLCJ0b0xvY2FsZURhdGVTdHJpbmciLCJ0b2RheSIsIkJsb2dFZGl0IiwiaXNQdWJsaXNoZWQiLCJhdXRob3IiLCJjb3ZlckltYWdlIiwiY2F0ZWdvcnkiLCJwdWJsaXNoZWRBdCIsImV4Y2VycHQiLCJUaW55TUNFIiwiVEFCUyIsImZpZWxkcyIsIkltYWdlVXBsb2FkZXIiLCJvblVwbG9hZCIsIndpZGUiLCJkaXNwbGF5ZWQiLCJOT1RJRklDQVRJT05fU0VDVElPTlMiLCJpbnRybyIsIkZpZWxkVGlwIiwib25Qb2ludGVyRG93biIsInRpbWVyIiwiTm90aWZ5SW5wdXQiLCJpc1doYXRzYXBwTnVtYmVyIiwibG9ja2VkIiwic2V0TG9ja2VkIiwicmVhZE9ubHkiLCJpbnB1dE1vZGUiLCJtYXhMZW5ndGgiLCJhdXRvQ29tcGxldGUiLCJhdXRvQ29ycmVjdCIsInNwZWxsQ2hlY2siLCJvbkZvY3VzIiwiTm90aWZpY2F0aW9uc0ZpZWxkcyIsInNlY3Rpb24iLCJTZXR0aW5nc0VkaXQiLCJhY3RpdmVUYWIiLCJzZXRBY3RpdmVUYWIiLCJtb2JpbGVCYW5uZXJGaWxlUmVmIiwiaGlnaGxpZ2h0RmlsZVJlZiIsImJhbm5lclByZXZpZXciLCJzZXRCYW5uZXJQcmV2aWV3IiwibW9iaWxlQmFubmVyUHJldmlldyIsInNldE1vYmlsZUJhbm5lclByZXZpZXciLCJoaWdobGlnaHRQcmV2aWV3Iiwic2V0SGlnaGxpZ2h0UHJldmlldyIsIm1vYmlsZUJhbm5lclVwbG9hZGluZyIsInNldE1vYmlsZUJhbm5lclVwbG9hZGluZyIsImhpZ2hsaWdodFVwbG9hZGluZyIsInNldEhpZ2hsaWdodFVwbG9hZGluZyIsImhvbWVGZWF0dXJlZENhdGVnb3J5U2x1Z3MiLCJob21lQmFubmVySW1hZ2UiLCJtb2JpbGVCYW5uZXJJbWFnZVVybCIsImhvbWVNb2JpbGVCYW5uZXJJbWFnZSIsImhpZ2hsaWdodEltYWdlVXJsIiwiaG9tZUhpZ2hsaWdodEltYWdlIiwiaGFzaCIsInNvbWUiLCJ0YWIiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwic2V0UHJldmlldyIsImZsZXgiLCJmbGV4RGlyZWN0aW9uIiwiRHJhd2VyQ29udGVudCIsInByb3BlcnRpZXMiLCJwIiwiSDQiLCJtb3JuaW5nRGVsaXZlcnlUaXRsZSIsIm1vcm5pbmdEZWxpdmVyeVN1YnRpdGxlIiwibW9ybmluZ1NoaXBwaW5nRmVlIiwibW9ybmluZ0ZyZWVBYm92ZSIsImV4cHJlc3NEZWxpdmVyeVRpdGxlIiwiZXhwcmVzc0RlbGl2ZXJ5U3VidGl0bGUiLCJleHByZXNzU2hpcHBpbmdGZWUiLCJleHByZXNzRnJlZUFib3ZlIiwiaGFuZGxpbmdGZWUiLCJEcmF3ZXJGb290ZXIiLCJudW0iLCJ0b0RhdGV0aW1lVmFsdWUiLCJnZXRIb3VycyIsImdldE1pbnV0ZXMiLCJmb3JtYXREYXRldGltZUxhYmVsIiwiaG91ciIsIm1pbnV0ZSIsIkNob2ljZUNhcmQiLCJBbmNob3JlZFNlbGVjdCIsIkRhdGVUaW1lUGlja2VyIiwidmFsaWQiLCJob3VycyIsInNldEhvdXJzIiwibWludXRlcyIsInNldE1pbnV0ZXMiLCJpIiwiYXBwbHkiLCJuZXh0SG91cnMiLCJuZXh0TWludXRlcyIsIkNvdXBvbkVkaXQiLCJzZXRQcm9kdWN0cyIsInNlbGVjdGVkU2x1Z3MiLCJ0YXJnZXRTbHVncyIsInRhcmdldFR5cGUiLCJhcHBseU9uIiwidXNhZ2VUeXBlIiwiY291cG9uVHlwZSIsImxvYWRDYXRhbG9nIiwiY2F0ZWdvcnlEYXRhIiwiYWxsUHJvZHVjdHMiLCJoYXNNb3JlIiwicHJvZHVjdERhdGEiLCJzZXRTZWxlY3RlZFNsdWdzIiwicHJvZHVjdE9wdGlvbnMiLCJjYXRlZ29yeU9wdGlvbnMiLCJjb2RlIiwidG9VcHBlckNhc2UiLCJtaW5DYXJ0IiwibWF4RGlzY291bnQiLCJ1c2FnZUxpbWl0IiwidXNlZENvdW50Iiwic3RhcnRzQXQiLCJleHBpcmVzQXQiLCJGVUxGSUxMTUVOVCIsInBlbmRpbmciLCJ0b25lIiwicGFpZCIsInBhY2tlZCIsInNoaXBwZWQiLCJkZWxpdmVyZWQiLCJjYW5jZWxsZWQiLCJpc09ubGluZU9yZGVyIiwibW9kZSIsInBheW1lbnRNb2RlIiwicmF6b3JwYXlQYXltZW50SWQiLCJyYXpvcnBheU9yZGVySWQiLCJwYXltZW50QmFkZ2UiLCJvbmxpbmUiLCJzdGF0dXMiLCJwYXltZW50U3RhdHVzIiwiUGlsbCIsImdldEZ1bGZpbGxtZW50QmFkZ2UiLCJnZXRQYXltZW50QmFkZ2UiLCJGdWxmaWxsbWVudEJhZGdlIiwiUGF5bWVudEJhZGdlIiwiT3JkZXJMaXN0QmFkZ2UiLCJQQVlNRU5UX09QVElPTlMiLCJDb3B5SWQiLCJjb3BpZWQiLCJzZXRDb3BpZWQiLCJuYXZpZ2F0b3IiLCJjbGlwYm9hcmQiLCJ3cml0ZVRleHQiLCJmb3JtYXRNb25leSIsImZvcm1hdERhdGVUaW1lIiwiZGF0ZVN0eWxlIiwidGltZVN0eWxlIiwicmVzb2x2ZUltYWdlIiwiTW9yZU1lbnUiLCJ1bnBhaWQiLCJjYW5TeW5jUmF6b3JwYXkiLCJvbkNhc2giLCJvblFyIiwib25TeW5jUmF6b3JwYXkiLCJvblJlc2VuZFBhcnRuZXIiLCJGcmFnbWVudCIsInNuYXBzaG90IiwiZGVsaXZlcnlQYXJ0bmVySWQiLCJjb250YWN0TmFtZSIsImNvbnRhY3RQaG9uZSIsImFkZHJlc3NMaW5lMSIsImFkZHJlc3NMaW5lMiIsImFkZHJlc3NDaXR5IiwiYWRkcmVzc1N0YXRlIiwiYWRkcmVzc1BpbmNvZGUiLCJhZGRyZXNzTGFuZG1hcmsiLCJPcmRlckRldGFpbCIsInNldFJlY29yZCIsInNhdmluZyIsInNldFNhdmluZyIsImFjdGlvbkJ1c3kiLCJzZXRBY3Rpb25CdXN5IiwicGFydG5lcnMiLCJzZXRQYXJ0bmVycyIsInNldEJhc2VsaW5lIiwiZWRpdENvbnRhY3QiLCJzZXRFZGl0Q29udGFjdCIsImVkaXRBZGRyZXNzIiwic2V0RWRpdEFkZHJlc3MiLCJwYXRobmFtZSIsInJlc291cmNlQWN0aW9uIiwicmVzb3VyY2VJZCIsImFjdGlvbk5hbWUiLCJpdGVtcyIsIml0ZW1zSnNvbiIsImRpcnR5IiwiT2JqZWN0Iiwia2V5cyIsImxpc3RVcmwiLCJyZWNvcmRBY3Rpb24iLCJyZWNvcmRJZCIsImhhbmRsZVNhdmUiLCJwaW4iLCJydW5QYXltZW50QWN0aW9uIiwiY29uZmlybSIsImZ1bGZpbGxtZW50IiwicGF5bWVudCIsInN0YXR1c0xhYmVsIiwicmVzdG9yZUZpZWxkcyIsImNsb3NlIiwiYWRkcmVzc1RleHQiLCJwYXltZW50TGFiZWwiLCJwYXJ0bmVyTmFtZSIsImRlbGl2ZXJ5UGFydG5lck5hbWUiLCJkZWxpdmVyeVBhcnRuZXJQaG9uZSIsIml0ZW1Db3VudCIsInJlZHVjZSIsInN1bSIsInF1YW50aXR5IiwiY3JlYXRlZEF0IiwibGluZVRvdGFsIiwicGF5bWVudE1ldGhvZCIsIml0ZW1zVG90YWwiLCJkZWxpdmVyeU9wdGlvbiIsImZyZWVEZWxpdmVyeUFwcGxpZWQiLCJkZWxpdmVyeUNoYXJnZSIsImhhbmRsaW5nQ2hhcmdlIiwidGF4VG90YWwiLCJpc0ludGVyU3RhdGUiLCJzbWFsbENhcnRDaGFyZ2UiLCJkaXNjb3VudCIsImNvdXBvbkNvZGUiLCJncmFuZFRvdGFsIiwicGF5bWVudENvbGxlY3RlZEFzIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicmF6b3JwYXlRclVybCIsIkV5ZUljb24iLCJoaWRkZW4iLCJQYXNzd29yZEZpZWxkIiwidmlzaWJsZSIsIm9uVG9nZ2xlIiwiTGFiZWwiLCJodG1sRm9yIiwicGFkZGluZ1JpZ2h0IiwicmlnaHQiLCJib3JkZXIiLCJiYWNrZ3JvdW5kIiwiY3Vyc29yIiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwicGFkZGluZyIsIkNoYW5nZVBhc3N3b3JkIiwicGFzc3dvcmQiLCJzZXRQYXNzd29yZCIsImNvbmZpcm1QYXNzd29yZCIsInNldENvbmZpcm1QYXNzd29yZCIsInNob3dQYXNzd29yZCIsInNldFNob3dQYXNzd29yZCIsInNob3dDb25maXJtIiwic2V0U2hvd0NvbmZpcm0iLCJzZXRFcnJvciIsImJhY2siLCJzYXZlIiwicmVkaXJlY3RVcmwiLCJlcnIiLCJpbnNldCIsInpJbmRleCIsImJnIiwiYm9yZGVyUmFkaXVzIiwiYm94U2hhZG93IiwiZW1haWwiLCJnYXAiLCJJTkRJQV9TVEFURVMiLCJWRUhJQ0xFX1RZUEVTIiwiU1RBVEVfT1BUSU9OUyIsIlBhcnRuZXJFZGl0IiwiaGFzUGFzc3dvcmQiLCJmYXRoZXJOYW1lIiwicGFuTnVtYmVyIiwiYWFkaGFhck51bWJlciIsImNpdHkiLCJwaW5jb2RlIiwic3RhdGUiLCJwZXJtYW5lbnRBZGRyZXNzIiwiZW1lcmdlbmN5TmFtZSIsImVtZXJnZW5jeVBob25lIiwidmVoaWNsZVR5cGUiLCJ2ZWhpY2xlTnVtYmVyIiwiYWNjb3VudEhvbGRlck5hbWUiLCJhY2NvdW50TnVtYmVyIiwiaWZzY0NvZGUiLCJub3RlcyIsIlBpbmNvZGVFZGl0IiwibW9ybmluZ0VuYWJsZWQiLCJleHByZXNzRW5hYmxlZCIsInBhcnRuZXJJZCIsInBhcnRuZXIiLCJtYXJnaW4iLCJhcmVhTGFiZWwiLCJzdGF0ZUNvZGUiLCJTdGF0dXNUb2dnbGUiLCJzZXRDaGVja2VkIiwicGVyc2lzdCIsInNhdmVkIiwiZGVzY3JpcHRpb24iLCJ0b0RhdGVJbnB1dCIsImZvcm1hdFdoZW4iLCJwYXJzZUFkZHJlc3NlcyIsImFkZHJlc3NlcyIsImdyb3VwZWQiLCJlbnRyaWVzIiwic29ydCIsImEiLCJiIiwiYWRkcmVzc0xpbmVzIiwiYWRkcmVzcyIsImxpbmUxIiwibGluZTIiLCJsYW5kbWFyayIsIkN1c3RvbWVyRWRpdCIsIlJPTEVTIiwiUEVSTUlTU0lPTlMiLCJzZXRWaXNpYmxlIiwiVGVhbUVkaXQiLCJwZXJtaXNzaW9uT24iLCJ1c2VybmFtZSIsIkZPTERFUlMiLCJmb3JtYXRTaXplIiwiYnl0ZXMiLCJzaXplIiwidG9GaXhlZCIsInJlc29sdmVVcmwiLCJNZWRpYUxpYnJhcnkiLCJidXN5SWQiLCJzZXRCdXN5SWQiLCJmb2xkZXIiLCJ1cGxvYWRGb2xkZXIiLCJvcmlnaW5hbE5hbWUiLCJmaWxlbmFtZSIsInVybCIsInNldEZvbGRlciIsInVwbG9hZEZpbGVzIiwibGlzdCIsImNvcHlQYXRoIiwicmVtb3ZlIiwib25EcmFnT3ZlciIsIm9uRHJvcCIsImRhdGFUcmFuc2ZlciIsIm11bHRpcGxlIiwiVGF4RWRpdCIsImlzVGF4YWJsZUJvb2wiLCJoYW5kbGVUYXhhYmxlVG9nZ2xlIiwicHJvZHVjdE5hbWUiLCJjYXRlZ29yeU5hbWUiLCJmb250U2l6ZSIsImNvcHlUZXh0IiwiUHJvbWlzZSIsInJlamVjdCIsIlJhem9ycGF5UGF5bWVudElkIiwicGF5bWVudElkIiwiaGFuZGxlQ29weSIsIlJFTUVNQkVSRURfTE9HSU5fS0VZIiwiTG9naW4iLCJlcnJvck1lc3NhZ2UiLCJfX0FQUF9TVEFURV9fIiwidHJhbnNsYXRlTWVzc2FnZSIsInVzZVRyYW5zbGF0aW9uIiwiYWRtaW5Sb290IiwiZm9yZ290UGFzc3dvcmRVcmwiLCJpZGVudGlmaWVyIiwic2V0SWRlbnRpZmllciIsInJlbWVtYmVyTG9naW4iLCJzZXRSZW1lbWJlckxvZ2luIiwicmVtZW1iZXJlZExvZ2luIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImZvcm0iLCJjdXJyZW50VGFyZ2V0IiwiZW1haWxJbnB1dCIsImVsZW1lbnRzIiwibmFtZWRJdGVtIiwic2V0SXRlbSIsInJlbW92ZUl0ZW0iLCJNZXNzYWdlQm94IiwiRm9ybUdyb3VwIiwiZGVmYXVsdFZhbHVlIiwibWFyZ2luUmlnaHQiLCJ0ZXh0QWxpZ24iLCJmb250V2VpZ2h0IiwiYWRtaW5Sb290UGF0aCIsImNhdGFsb2dDb25maWciLCJleHBvcnRVcmwiLCJpbXBvcnRVcmwiLCJDYXRhbG9nTGlzdEhlYWRlckFjdGlvbnMiLCJvbkltcG9ydGVkIiwidHJhbnNsYXRlQnV0dG9uIiwidHJhbnNsYXRlQWN0aW9uIiwidG9nZ2xlRmlsdGVyIiwiZmlsdGVyc0NvdW50IiwidXNlRmlsdGVyRHJhd2VyIiwic2V0TG9hZGluZyIsInNldE1lc3NhZ2UiLCJjb25maWciLCJyb290IiwiaGFuZGxlSW1wb3J0IiwiY3JlZGVudGlhbHMiLCJlcnJvckNvdW50IiwiY3JlYXRlZCIsInVwZGF0ZWQiLCJidXR0b25zIiwiY2xpY2siLCJuZXdBY3Rpb24iLCJyZXNvdXJjZUFjdGlvbnMiLCJmaWx0ZXJLZXkiLCJjb3VudCIsImZsZXhTaHJpbmsiLCJweCIsIkJ1dHRvbkdyb3VwIiwib25DbG9zZUNsaWNrIiwiQ0FUQUxPR19SRVNPVVJDRVMiLCJBY3Rpb25IZWFkZXIiLCJPcmlnaW5hbENvbXBvbmVudCIsIkJhc2VIZWFkZXIiLCJPcmlnaW5hbEFjdGlvbkhlYWRlciIsImlzQ2F0YWxvZ0xpc3QiLCJfaWdub3JlZCIsImhlYWRlclByb3BzIiwiX2V4dGVuZHMiLCJvbWl0QWN0aW9ucyIsIkRFRkFVTFRfT1BUSU9OUyIsIlJpY2h0ZXh0RWRpdCIsImhhbmRsZVVwZGF0ZSIsInVzZUNhbGxiYWNrIiwibmV3VmFsdWUiLCJpc1JlcXVpcmVkIiwiRm9ybU1lc3NhZ2UiLCJtZW1vIiwiY3V0Iiwic2VhcmNoIiwiU2lkZWJhclJlc291cmNlU2VjdGlvbiIsIk9yaWdpbmFsIiwidXNlTG9jYXRpb24iLCJuYXZpZ2F0ZSIsInVzZU5hdmlnYXRlIiwicmVzb3VyY2VzIiwiZ2V0UmVzb3VyY2VFbGVtZW50Q3NzIiwic3VmZml4IiwiTG9hZGVyIiwiTm9SZWNvcmRzIiwic2VsZWN0ZWRDb3VudCIsInNlbGVjdGVkQWxsIiwiaW5kZXRlcm1pbmF0ZSIsInJlY29yZHNIYXZlQnVsa0FjdGlvbiIsImJ1bGtBY3Rpb25zIiwiY29udGVudFRhZyIsInNlbGVjdGVkVGFnIiwiYm9keVRhZyIsIlRhYmxlIiwiU2VsZWN0ZWRSZWNvcmRzIiwiUmVjb3Jkc1RhYmxlSGVhZGVyIiwibGlzdFByb3BlcnRpZXMiLCJUYWJsZUJvZHkiLCJSZWNvcmRJbkxpc3QiLCJpc1NlbGVjdGVkIiwiaXNUaXRsZSIsIlNlbGVjdEFsbENoZWNrQm94IiwiaW5wdXRSZWYiLCJtYXJnaW5MZWZ0IiwicG9pbnRzIiwicm93VGFnIiwiY2hlY2tib3hDc3MiLCJUYWJsZUhlYWQiLCJUYWJsZVJvdyIsIlRhYmxlQ2VsbCIsIlByb3BlcnR5SGVhZGVyIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIiwiRGVmYXVsdFJpY2h0ZXh0RWRpdFByb3BlcnR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0VBRU8sU0FBU0EsaUJBQWVBLENBQUNDLElBQUksRUFBRTtFQUNwQyxFQUFBLE1BQU1DLE9BQU8sR0FBR0MsWUFBTSxDQUFDLElBQUksQ0FBQztJQUM1QixNQUFNLENBQUNDLE1BQU0sRUFBRUMsU0FBUyxDQUFDLEdBQUdDLGNBQVEsQ0FBQyxLQUFLLENBQUM7RUFFM0NDLEVBQUFBLGVBQVMsQ0FBQyxNQUFNO0VBQ2QsSUFBQSxJQUFJLENBQUNOLElBQUksRUFBRSxPQUFPTyxTQUFTO01BRTNCLE1BQU1DLE1BQU0sR0FBR0EsTUFBTTtFQUNuQixNQUFBLE1BQU1DLElBQUksR0FBR1IsT0FBTyxDQUFDUyxPQUFPO1FBQzVCLElBQUks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
