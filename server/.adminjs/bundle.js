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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9mb3JtLWNvbnRyb2xzLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9wcm9kdWN0LWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY2F0ZWdvcnktZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jbXMtbGlzdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZXZpZXctZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9ibG9nLWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvc2V0dGluZ3MtZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9hcHAtcmVsZWFzZS1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2NvdXBvbi1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWxpc3QtYmFkZ2VzLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWRldGFpbC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jaGFuZ2UtcGFzc3dvcmQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvaW5kaWEtc3RhdGVzLmpzIiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcGFydG5lci1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3BpbmNvZGUtZWRpdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9zdGF0dXMtdG9nZ2xlLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2N1c3RvbWVyLWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGVhbS1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL21lZGlhLWxpYnJhcnkuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGF4LWVkaXQuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmF6b3JwYXktcGF5bWVudC1pZC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9sb2dpbi5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jYXRhbG9nLWxpc3QtaGVhZGVyLWFjdGlvbnMuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvYWN0aW9uLWhlYWRlci5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yaWNodGV4dC1lZGl0LmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3NpZGViYXItZGFzaGJvYXJkLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JlY29yZHMtdGFibGUuanN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmVjb3Jkcy10YWJsZS1oZWFkZXIuanN4IiwiZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlQW5jaG9yZWRNZW51KG9wZW4pIHtcbiAgY29uc3Qgd3JhcFJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbb3BlblVwLCBzZXRPcGVuVXBdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSB3cmFwUmVmLmN1cnJlbnRcbiAgICAgIGlmICghbm9kZSkgcmV0dXJuXG4gICAgICBjb25zdCByZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3Qgc3BhY2VCZWxvdyA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3QuYm90dG9tXG4gICAgICBzZXRPcGVuVXAoc3BhY2VCZWxvdyA8IDI0MCAmJiByZWN0LnRvcCA+IHNwYWNlQmVsb3cpXG4gICAgfVxuXG4gICAgdXBkYXRlKClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB1cGRhdGUsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdXBkYXRlLCB0cnVlKVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHJldHVybiB7IHdyYXBSZWYsIG9wZW5VcCB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hhYmxlTXVsdGlTZWxlY3QoeyBvcHRpb25zLCBzZWxlY3RlZCwgb25DaGFuZ2UsIHBsYWNlaG9sZGVyLCBzZWFyY2hQbGFjZWhvbGRlciB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIGNvbnN0IHNlbGVjdGVkU2V0ID0gdXNlTWVtbygoKSA9PiBuZXcgU2V0KHNlbGVjdGVkKSwgW3NlbGVjdGVkXSlcbiAgY29uc3Qgc2VsZWN0ZWRPcHRpb25zID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+IHNlbGVjdGVkU2V0LmhhcyhpdGVtLnZhbHVlKSlcbiAgY29uc3QgZmlsdGVyZWQgPSBvcHRpb25zLmZpbHRlcigoaXRlbSkgPT5cbiAgICBgJHtpdGVtLmxhYmVsfSAke2l0ZW0udmFsdWV9YC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpKSxcbiAgKVxuXG4gIGNvbnN0IHRvZ2dsZSA9ICh2YWx1ZSkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFNldC5oYXModmFsdWUpKSBvbkNoYW5nZShzZWxlY3RlZC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IHZhbHVlKSlcbiAgICBlbHNlIG9uQ2hhbmdlKFsuLi5zZWxlY3RlZCwgdmFsdWVdKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0XCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNvbnRyb2xcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKCh2YWx1ZSkgPT4gIXZhbHVlKX0+XG4gICAgICAgIHtzZWxlY3RlZE9wdGlvbnMubGVuZ3RoID8gKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNoaXBzXCI+XG4gICAgICAgICAgICB7c2VsZWN0ZWRPcHRpb25zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8c3BhbiBrZXk9e2l0ZW0udmFsdWV9IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNoaXBcIj5cbiAgICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgcm9sZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICB0b2dnbGUoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgw5dcbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1wbGFjZWhvbGRlclwiPntwbGFjZWhvbGRlcn08L3NwYW4+XG4gICAgICAgICl9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNhcmV0XCI+e29wZW4gPyAn4pa0JyA6ICfilr4nfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cXVlcnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRRdWVyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3NlYXJjaFBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICAgIHtmaWx0ZXJlZC5sZW5ndGggPyAoXG4gICAgICAgICAgICAgIGZpbHRlcmVkLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSBzZWxlY3RlZFNldC5oYXMoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGtleT17aXRlbS52YWx1ZX0gY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3Qtb3B0aW9uJHtjaGVja2VkID8gJyBpcy1zZWxlY3RlZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e2NoZWNrZWR9IG9uQ2hhbmdlPXsoKSA9PiB0b2dnbGUoaXRlbS52YWx1ZSl9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1lbXB0eVwiPk5vIG1hdGNoZXM8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZsYWdDYXJkKHsgc2VsZWN0ZWQsIHRpdGxlLCBoaW50LCBvbkNsaWNrIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YHRva3JpLWNob2ljZS1jYXJkJHtzZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgPlxuICAgICAgPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+XG4gICAgICA8c3Bhbj57aGludH08L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmxhZ09uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gJ3RydWUnIHx8IHZhbHVlID09PSAnb24nIHx8IHZhbHVlID09PSAxIHx8IHZhbHVlID09PSAnMSdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0YXR1c1N3aXRjaCh7XG4gIGNoZWNrZWQsXG4gIG9uQ2hhbmdlLFxuICBkaXNhYmxlZCxcbiAgdGl0bGUsXG4gIGhpbnQsXG4gIGNvbXBhY3QgPSBmYWxzZSxcbiAgb25MYWJlbCA9ICdBY3RpdmUnLFxuICBvZmZMYWJlbCA9ICdJbmFjdGl2ZScsXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B0b2tyaS1zd2l0Y2gke2NoZWNrZWQgPyAnIGlzLW9uJyA6ICcnfSR7Y29tcGFjdCA/ICcgaXMtY29tcGFjdCcgOiAnJ31gfVxuICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgYXJpYS1wcmVzc2VkPXtjaGVja2VkfVxuICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgaWYgKCFkaXNhYmxlZCkgb25DaGFuZ2UoIWNoZWNrZWQpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXN3aXRjaC10cmFja1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1zd2l0Y2gtdGh1bWJcIiAvPlxuICAgICAgPC9zcGFuPlxuICAgICAge3RpdGxlIHx8IGhpbnQgPyAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXN3aXRjaC1jb3B5XCI+XG4gICAgICAgICAge3RpdGxlID8gPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+IDogbnVsbH1cbiAgICAgICAgICB7aGludCA/IDxzcGFuPntoaW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApIDogKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0b2tyaS1zdGF0dXMtcGlsbCR7Y2hlY2tlZCA/ICcgaXMtb24nIDogJyd9YH0+XG4gICAgICAgICAge2NoZWNrZWQgPyBvbkxhYmVsIDogb2ZmTGFiZWx9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICl9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNlYXJjaGFibGVTZWxlY3QoeyB2YWx1ZSwgb3B0aW9ucywgb25DaGFuZ2UsIHBsYWNlaG9sZGVyLCBzZWFyY2hQbGFjZWhvbGRlciwgZGlzYWJsZWQgfSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuICBjb25zdCBqdXN0UGlja2VkID0gdXNlUmVmKGZhbHNlKVxuICBjb25zdCBzZWxlY3RlZCA9IG9wdGlvbnMuZmluZCgoaXRlbSkgPT4gaXRlbS52YWx1ZSA9PT0gdmFsdWUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIGNvbnN0IGZpbHRlcmVkID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+XG4gICAgYCR7aXRlbS5sYWJlbH0gJHtpdGVtLnZhbHVlfWAudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKSksXG4gIClcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3RcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY29udHJvbFwiXG4gICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGlmIChqdXN0UGlja2VkLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGp1c3RQaWNrZWQuY3VycmVudCA9IGZhbHNlXG4gICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghZGlzYWJsZWQpIHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3NlbGVjdGVkID8gJycgOiAndG9rcmktbXVsdGlzZWxlY3QtcGxhY2Vob2xkZXInfT5cbiAgICAgICAgICB7c2VsZWN0ZWQ/LmxhYmVsIHx8IHBsYWNlaG9sZGVyfVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNhcmV0XCI+e29wZW4gPyAn4pa0JyA6ICfilr4nfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cXVlcnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRRdWVyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3NlYXJjaFBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICAgIHtmaWx0ZXJlZC5sZW5ndGggPyAoXG4gICAgICAgICAgICAgIGZpbHRlcmVkLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2ZSA9IGl0ZW0udmFsdWUgPT09IHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZSB8fCAnZW1wdHknfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1tdWx0aXNlbGVjdC1vcHRpb24ke2FjdGl2ZSA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgIGp1c3RQaWNrZWQuY3VycmVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZShpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgc2V0UXVlcnkoJycpXG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAganVzdFBpY2tlZC5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICB9LCAwKVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWVtcHR5XCI+Tm8gbWF0Y2hlczwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTG9jYWxTZWxlY3QoeyB2YWx1ZSwgb3B0aW9ucywgb25DaGFuZ2UsIGRpc2FibGVkIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHsgd3JhcFJlZiwgb3BlblVwIH0gPSB1c2VBbmNob3JlZE1lbnUob3BlbilcbiAgY29uc3Qgc2VsZWN0ZWQgPSBvcHRpb25zLmZpbmQoKGl0ZW0pID0+IFN0cmluZyhpdGVtLnZhbHVlKSA9PT0gU3RyaW5nKHZhbHVlKSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9uRG9jQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghd3JhcFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICB9LCBbd3JhcFJlZl0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxvY2FsLXNlbGVjdFwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1sb2NhbC1zZWxlY3QtY29udHJvbFwiXG4gICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGlmICghZGlzYWJsZWQpIHNldE9wZW4oKGN1cnJlbnQpID0+ICFjdXJyZW50KVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3Bhbj57c2VsZWN0ZWQ/LmxhYmVsIHx8IHZhbHVlfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktbXVsdGlzZWxlY3QtY2FyZXRcIj57b3BlbiA/ICfilrQnIDogJ+KWvid9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b2tyaS1sb2NhbC1zZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICB7b3B0aW9ucy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGtleT17aXRlbS52YWx1ZX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3Qtb3B0aW9uJHtTdHJpbmcoaXRlbS52YWx1ZSkgPT09IFN0cmluZyh2YWx1ZSkgPyAnIGlzLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpdGVtLnZhbHVlKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEFwaUNsaWVudCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBCb3gsIEgyLCBINSwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBMb2NhbFNlbGVjdCB9IGZyb20gJy4vZm9ybS1jb250cm9scydcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5jb25zdCBSQU5HRVMgPSBbXG4gIHsgdmFsdWU6ICc3ZCcsIGxhYmVsOiAnNyBkYXlzJyB9LFxuICB7IHZhbHVlOiAndGhpc01vbnRoJywgbGFiZWw6ICdUaGlzIG1vbnRoJyB9LFxuICB7IHZhbHVlOiAnbGFzdE1vbnRoJywgbGFiZWw6ICdMYXN0IG1vbnRoJyB9LFxuICB7IHZhbHVlOiAnOTBkJywgbGFiZWw6ICczIG1vbnRocycgfSxcbl1cbmNvbnN0IFdJREdFVFMgPSBbJ29yZGVyVmFsdWUnLCAnb3JkZXJzJywgJ2N1c3RvbWVycycsICdwcm9kdWN0cyddXG5cbmNvbnN0IGluciA9ICh2YWx1ZSkgPT5cbiAgYOKCuSR7TnVtYmVyKHZhbHVlIHx8IDApLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHsgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAwIH0pfWBcblxuZnVuY3Rpb24gUmFuZ2VTZWxlY3QoeyB2YWx1ZSwgb25DaGFuZ2UgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktcmFuZ2Utc2VsZWN0XCI+XG4gICAgICA8TG9jYWxTZWxlY3QgdmFsdWU9e3ZhbHVlfSBvcHRpb25zPXtSQU5HRVN9IG9uQ2hhbmdlPXtvbkNoYW5nZX0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBheGlzTWF4KHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA8PSAwKSByZXR1cm4gMTAwMFxuICBjb25zdCBwYWRkZWQgPSB2YWx1ZSAqIDEuMVxuICBjb25zdCBtYWduaXR1ZGUgPSAxMCAqKiBNYXRoLmZsb29yKE1hdGgubG9nMTAocGFkZGVkKSlcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHBhZGRlZCAvIG1hZ25pdHVkZVxuICBjb25zdCBuaWNlID0gbm9ybWFsaXplZCA8PSAxID8gMSA6IG5vcm1hbGl6ZWQgPD0gMiA/IDIgOiBub3JtYWxpemVkIDw9IDUgPyA1IDogMTBcbiAgcmV0dXJuIG5pY2UgKiBtYWduaXR1ZGVcbn1cblxuZnVuY3Rpb24gTGluZUNoYXJ0KHsgc2VyaWVzIH0pIHtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZShudWxsKVxuICBjb25zdCB3aWR0aCA9IDEyMDBcbiAgY29uc3QgaGVpZ2h0ID0gMzIwXG4gIGNvbnN0IHBhZExlZnQgPSA4NlxuICBjb25zdCBwYWRSaWdodCA9IDE4XG4gIGNvbnN0IHBhZFRvcCA9IDE4XG4gIGNvbnN0IHBhZEJvdHRvbSA9IDM2XG4gIGNvbnN0IG1heCA9IGF4aXNNYXgoTWF0aC5tYXgoLi4uc2VyaWVzLm1hcCgocG9pbnQpID0+IHBvaW50Lm9yZGVyVmFsdWUpLCAwKSlcbiAgY29uc3QgcGxvdFdpZHRoID0gd2lkdGggLSBwYWRMZWZ0IC0gcGFkUmlnaHRcbiAgY29uc3QgcGxvdEhlaWdodCA9IGhlaWdodCAtIHBhZFRvcCAtIHBhZEJvdHRvbVxuICBjb25zdCBiYXNlbGluZSA9IHBhZFRvcCArIHBsb3RIZWlnaHRcbiAgY29uc3QgeUZvciA9ICh2YWx1ZSkgPT4gYmFzZWxpbmUgLSAodmFsdWUgLyBtYXgpICogcGxvdEhlaWdodFxuICBjb25zdCBzdGVwID0gc2VyaWVzLmxlbmd0aCA+IDEgPyBwbG90V2lkdGggLyAoc2VyaWVzLmxlbmd0aCAtIDEpIDogcGxvdFdpZHRoXG4gIGNvbnN0IGNvb3JkcyA9IHNlcmllcy5tYXAoKHBvaW50LCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHggPSBzZXJpZXMubGVuZ3RoID09PSAxID8gcGFkTGVmdCArIHBsb3RXaWR0aCAvIDIgOiBwYWRMZWZ0ICsgaW5kZXggKiBzdGVwXG4gICAgcmV0dXJuIHsgeCwgeTogeUZvcihwb2ludC5vcmRlclZhbHVlKSwgcG9pbnQgfVxuICB9KVxuICBjb25zdCBsaW5lID0gY29vcmRzLm1hcCgoaXRlbSwgaW5kZXgpID0+IGAke2luZGV4ID8gJ0wnIDogJ00nfSR7aXRlbS54fSwke2l0ZW0ueX1gKS5qb2luKCcgJylcbiAgY29uc3QgYXJlYSA9IGNvb3Jkcy5sZW5ndGhcbiAgICA/IGAke2xpbmV9IEwke2Nvb3Jkc1tjb29yZHMubGVuZ3RoIC0gMV0ueH0sJHtiYXNlbGluZX0gTCR7Y29vcmRzWzBdLnh9LCR7YmFzZWxpbmV9IFpgXG4gICAgOiAnJ1xuICBjb25zdCBsYWJlbEV2ZXJ5ID0gc2VyaWVzLmxlbmd0aCA+IDIwID8gTWF0aC5jZWlsKHNlcmllcy5sZW5ndGggLyA4KSA6IHNlcmllcy5sZW5ndGggPiAxMCA/IDQgOiAxXG4gIGNvbnN0IHRpY2tzID0gWzAsIDAuMjUsIDAuNSwgMC43NSwgMV0ubWFwKChyYXRpbykgPT4gKHtcbiAgICB2YWx1ZTogTWF0aC5yb3VuZChtYXggKiByYXRpbyksXG4gICAgeTogeUZvcihtYXggKiByYXRpbyksXG4gIH0pKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1wbG90XCIgb25Nb3VzZUxlYXZlPXsoKSA9PiBzZXRIb3ZlcihudWxsKX0+XG4gICAgICA8c3ZnIHZpZXdCb3g9e2AwIDAgJHt3aWR0aH0gJHtoZWlnaHR9YH0gY2xhc3NOYW1lPVwidG9rcmktY2hhcnRcIiByb2xlPVwiaW1nXCI+XG4gICAgICAgIHt0aWNrcy5tYXAoKHRpY2spID0+IChcbiAgICAgICAgICA8ZyBrZXk9e3RpY2sudmFsdWV9PlxuICAgICAgICAgICAgPGxpbmUgeDE9e3BhZExlZnR9IHgyPXt3aWR0aCAtIHBhZFJpZ2h0fSB5MT17dGljay55fSB5Mj17dGljay55fSBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1ncmlkbGluZVwiIC8+XG4gICAgICAgICAgICA8dGV4dCB4PXtwYWRMZWZ0IC0gMTB9IHk9e3RpY2sueSArIDR9IHRleHRBbmNob3I9XCJlbmRcIiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1heGlzXCI+XG4gICAgICAgICAgICAgIHtpbnIodGljay52YWx1ZSl9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9nPlxuICAgICAgICApKX1cbiAgICAgICAgPHBhdGggZD17YXJlYX0gZmlsbD1cIiMwNDc4NTdcIiBvcGFjaXR5PVwiMC4xNlwiIC8+XG4gICAgICAgIDxwYXRoIGQ9e2xpbmV9IGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiIzA0Nzg1N1wiIHN0cm9rZVdpZHRoPVwiM1wiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiAvPlxuICAgICAgICB7Y29vcmRzLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgIDxnIGtleT17aXRlbS5wb2ludC5kYXRlfT5cbiAgICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgICAgY3g9e2l0ZW0ueH1cbiAgICAgICAgICAgICAgY3k9e2l0ZW0ueX1cbiAgICAgICAgICAgICAgcj1cIjE0XCJcbiAgICAgICAgICAgICAgZmlsbD1cInRyYW5zcGFyZW50XCJcbiAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiBzZXRIb3ZlcihpdGVtKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Y2lyY2xlIGN4PXtpdGVtLnh9IGN5PXtpdGVtLnl9IHI9XCI0LjVcIiBmaWxsPVwiI2ZmZlwiIHN0cm9rZT1cIiMwNDc4NTdcIiBzdHJva2VXaWR0aD1cIjJcIiBwb2ludGVyRXZlbnRzPVwibm9uZVwiIC8+XG4gICAgICAgICAgPC9nPlxuICAgICAgICApKX1cbiAgICAgICAge2Nvb3Jkcy5tYXAoKGl0ZW0sIGluZGV4KSA9PlxuICAgICAgICAgIGluZGV4ICUgbGFiZWxFdmVyeSA9PT0gMCA/IChcbiAgICAgICAgICAgIDx0ZXh0IGtleT17YCR7aXRlbS5wb2ludC5kYXRlfS1sYWJlbGB9IHg9e2l0ZW0ueH0geT17aGVpZ2h0IC0gOH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWxhYmVsXCI+XG4gICAgICAgICAgICAgIHtpdGVtLnBvaW50LmxhYmVsfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICkgOiBudWxsLFxuICAgICAgICApfVxuICAgICAgPC9zdmc+XG4gICAgICB7aG92ZXIgPyAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2B0b2tyaS1jaGFydC10aXAke2hvdmVyLnkgPCA5MCA/ICcgaXMtYmVsb3cnIDogJyd9YH1cbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBgJHsoaG92ZXIueCAvIHdpZHRoKSAqIDEwMH0lYCwgdG9wOiBgJHsoaG92ZXIueSAvIGhlaWdodCkgKiAxMDB9JWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuPntob3Zlci5wb2ludC5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgPHN0cm9uZz57aW5yKGhvdmVyLnBvaW50Lm9yZGVyVmFsdWUpfTwvc3Ryb25nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIFBhZ2VyKHsgcGFnZSwgcGFnZVNpemUsIHRvdGFsLCBvbkNoYW5nZSB9KSB7XG4gIGNvbnN0IHBhZ2VzID0gTWF0aC5tYXgoMSwgTWF0aC5jZWlsKCh0b3RhbCB8fCAwKSAvIHBhZ2VTaXplKSlcbiAgaWYgKHBhZ2VzIDw9IDEpIHJldHVybiBudWxsXG4gIGNvbnN0IG51bWJlcnMgPSBbXVxuICBmb3IgKGxldCBudW1iZXIgPSAxOyBudW1iZXIgPD0gcGFnZXM7IG51bWJlciArPSAxKSBudW1iZXJzLnB1c2gobnVtYmVyKVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktd2lkZ2V0LXBhZ2VzXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxpc3QtcGFnaW5hdGlvbi1wYWdlc1wiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17cGFnZSA8PSAxfSBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZShwYWdlIC0gMSl9PlxuICAgICAgICAgIFByZXZcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIHtudW1iZXJzLm1hcCgobnVtYmVyKSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBrZXk9e251bWJlcn1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17bnVtYmVyID09PSBwYWdlID8gJ2lzLWN1cnJlbnQnIDogJyd9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZShudW1iZXIpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtudW1iZXJ9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17cGFnZSA+PSBwYWdlc30gb25DbGljaz17KCkgPT4gb25DaGFuZ2UocGFnZSArIDEpfT5cbiAgICAgICAgICBOZXh0XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgRGFzaGJvYXJkID0gKCkgPT4ge1xuICBjb25zdCByZXF1ZXN0cyA9IHVzZVJlZih7fSlcbiAgY29uc3QgW3Jhbmdlcywgc2V0UmFuZ2VzXSA9IHVzZVN0YXRlKHtcbiAgICBvcmRlclZhbHVlOiAnN2QnLFxuICAgIG9yZGVyczogJzdkJyxcbiAgICBjdXN0b21lcnM6ICc3ZCcsXG4gICAgcHJvZHVjdHM6ICc3ZCcsXG4gIH0pXG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKHt9KVxuICBjb25zdCBbcGFnZXMsIHNldFBhZ2VzXSA9IHVzZVN0YXRlKHsgb3JkZXJzOiAxLCBjdXN0b21lcnM6IDEgfSlcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoe1xuICAgIG9yZGVyVmFsdWU6IHRydWUsXG4gICAgb3JkZXJzOiB0cnVlLFxuICAgIGN1c3RvbWVyczogdHJ1ZSxcbiAgICBwcm9kdWN0czogdHJ1ZSxcbiAgfSlcblxuICBjb25zdCBsb2FkV2lkZ2V0ID0gKHdpZGdldCwgcmFuZ2UsIHBhZ2UgPSAxKSA9PiB7XG4gICAgY29uc3QgdGlja2V0ID0gKHJlcXVlc3RzLmN1cnJlbnRbd2lkZ2V0XSB8fCAwKSArIDFcbiAgICByZXF1ZXN0cy5jdXJyZW50W3dpZGdldF0gPSB0aWNrZXRcbiAgICBzZXRCdXN5KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBbd2lkZ2V0XTogdHJ1ZSB9KSlcbiAgICBhcGlcbiAgICAgIC5nZXREYXNoYm9hcmQoeyBwYXJhbXM6IHsgd2lkZ2V0LCByYW5nZSwgcGFnZSB9IH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlcXVlc3RzLmN1cnJlbnRbd2lkZ2V0XSAhPT0gdGlja2V0KSByZXR1cm5cbiAgICAgICAgc2V0RGF0YSgoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgLi4ucmVzcG9uc2UuZGF0YSB9KSlcbiAgICAgIH0pXG4gICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgIGlmIChyZXF1ZXN0cy5jdXJyZW50W3dpZGdldF0gIT09IHRpY2tldCkgcmV0dXJuXG4gICAgICAgIHNldEJ1c3koKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiBmYWxzZSB9KSlcbiAgICAgIH0pXG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIFdJREdFVFMuZm9yRWFjaCgod2lkZ2V0KSA9PiBsb2FkV2lkZ2V0KHdpZGdldCwgJzdkJykpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGNoYW5nZVJhbmdlID0gKHdpZGdldCwgcmFuZ2UpID0+IHtcbiAgICBzZXRSYW5nZXMoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiByYW5nZSB9KSlcbiAgICBpZiAod2lkZ2V0ID09PSAnb3JkZXJzJyB8fCB3aWRnZXQgPT09ICdjdXN0b21lcnMnKSB7XG4gICAgICBzZXRQYWdlcygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgW3dpZGdldF06IDEgfSkpXG4gICAgfVxuICAgIGxvYWRXaWRnZXQod2lkZ2V0LCByYW5nZSwgMSlcbiAgfVxuXG4gIGNvbnN0IGNoYW5nZVBhZ2UgPSAod2lkZ2V0LCBwYWdlKSA9PiB7XG4gICAgc2V0UGFnZXMoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIFt3aWRnZXRdOiBwYWdlIH0pKVxuICAgIGxvYWRXaWRnZXQod2lkZ2V0LCByYW5nZXNbd2lkZ2V0XSwgcGFnZSlcbiAgfVxuXG4gIGNvbnN0IG9yZGVyVmFsdWUgPSBkYXRhLm9yZGVyVmFsdWVcbiAgY29uc3Qgb3JkZXJzID0gZGF0YS5vcmRlcnNcbiAgY29uc3QgY3VzdG9tZXJzID0gZGF0YS5jdXN0b21lcnNcbiAgY29uc3QgcHJvZHVjdHMgPSBkYXRhLnByb2R1Y3RzXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHZhcmlhbnQ9XCJ0cmFuc3BhcmVudFwiIGNsYXNzTmFtZT1cInRva3JpLWFuYWx5dGljc1wiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1hbmFseXRpY3MtaGVhZFwiPlxuICAgICAgICA8SDIgbWI9XCJzbVwiPkRhc2hib2FyZDwvSDI+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY2hhcnQtY2FyZCB0b2tyaS1jaGFydC1jYXJkLXdpZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS13aWRnZXQtaGVhZFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8SDUgbWI9XCJzbVwiPk9yZGVyIFZhbHVlPC9INT5cbiAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgIHtidXN5Lm9yZGVyVmFsdWUgJiYgIW9yZGVyVmFsdWVcbiAgICAgICAgICAgICAgICA/ICdMb2FkaW5n4oCmJ1xuICAgICAgICAgICAgICAgIDogYCR7aW5yKG9yZGVyVmFsdWU/LnRvdGFsKX0gZnJvbSAke29yZGVyVmFsdWU/Lm9yZGVyQ291bnQgfHwgMH0gb3JkZXJzYH1cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8UmFuZ2VTZWxlY3QgdmFsdWU9e3Jhbmdlcy5vcmRlclZhbHVlfSBvbkNoYW5nZT17KHZhbHVlKSA9PiBjaGFuZ2VSYW5nZSgnb3JkZXJWYWx1ZScsIHZhbHVlKX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtvcmRlclZhbHVlPy5zZXJpZXM/Lmxlbmd0aCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWZyYW1lXCI+XG4gICAgICAgICAgICA8TGluZUNoYXJ0IHNlcmllcz17b3JkZXJWYWx1ZS5zZXJpZXN9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXNwbGl0XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWNhcmRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXdpZGdldC1oZWFkXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8SDUgbWI9XCJzbVwiPk9yZGVyIEFtb3VudDwvSDU+XG4gICAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgICAge2J1c3kub3JkZXJzICYmICFvcmRlcnMgPyAnTG9hZGluZ+KApicgOiBgJHtvcmRlcnM/LnRvdGFsIHx8IDB9IG9yZGVyc2B9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPFJhbmdlU2VsZWN0IHZhbHVlPXtyYW5nZXMub3JkZXJzfSBvbkNoYW5nZT17KHZhbHVlKSA9PiBjaGFuZ2VSYW5nZSgnb3JkZXJzJywgdmFsdWUpfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtvcmRlcnM/LnJvd3M/Lmxlbmd0aCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktdGFibGUtd3JhcFwiPlxuICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidG9rcmktZGF0YS10YWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPk9yZGVyIG51bWJlcjwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkFtb3VudDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5QbGFjZWQ8L3RoPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgIHtvcmRlcnMucm93cy5tYXAoKHJvdykgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtyb3cuaWR9PlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57cm93Lm9yZGVyTm99PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntpbnIocm93LmFtb3VudCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5wbGFjZWRBdH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8VGV4dCBvcGFjaXR5PXswLjd9PntidXN5Lm9yZGVycyA/ICdMb2FkaW5n4oCmJyA6ICdObyBvcmRlcnMgaW4gdGhpcyBwZXJpb2QuJ308L1RleHQ+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8UGFnZXJcbiAgICAgICAgICAgIHBhZ2U9e29yZGVycz8ucGFnZSB8fCBwYWdlcy5vcmRlcnN9XG4gICAgICAgICAgICBwYWdlU2l6ZT17b3JkZXJzPy5wYWdlU2l6ZSB8fCAxMH1cbiAgICAgICAgICAgIHRvdGFsPXtvcmRlcnM/LnRvdGFsIHx8IDB9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHBhZ2UpID0+IGNoYW5nZVBhZ2UoJ29yZGVycycsIHBhZ2UpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFydC1jYXJkXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS13aWRnZXQtaGVhZFwiPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPEg1IG1iPVwic21cIj5OZXcgQ3VzdG9tZXJzPC9INT5cbiAgICAgICAgICAgICAgPFRleHQgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgICAgICB7YnVzeS5jdXN0b21lcnMgJiYgIWN1c3RvbWVycyA/ICdMb2FkaW5n4oCmJyA6IGAke2N1c3RvbWVycz8udG90YWwgfHwgMH0gcGVvcGxlIHJlZ2lzdGVyZWRgfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxSYW5nZVNlbGVjdCB2YWx1ZT17cmFuZ2VzLmN1c3RvbWVyc30gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gY2hhbmdlUmFuZ2UoJ2N1c3RvbWVycycsIHZhbHVlKX0gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7Y3VzdG9tZXJzPy5yb3dzPy5sZW5ndGggPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInRva3JpLWRhdGEtdGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlBob25lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkRhdGUgb2YgYmlydGg8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+Q3JlYXRlZDwvdGg+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAge2N1c3RvbWVycy5yb3dzLm1hcCgocm93KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e3Jvdy5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cubmFtZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD4rOTEge3Jvdy5waG9uZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD57cm93LmRhdGVPZkJpcnRofTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cucmVnaXN0ZXJlZEF0fTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+e2J1c3kuY3VzdG9tZXJzID8gJ0xvYWRpbmfigKYnIDogJ05vIG5ldyBjdXN0b21lcnMgaW4gdGhpcyBwZXJpb2QuJ308L1RleHQ+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8UGFnZXJcbiAgICAgICAgICAgIHBhZ2U9e2N1c3RvbWVycz8ucGFnZSB8fCBwYWdlcy5jdXN0b21lcnN9XG4gICAgICAgICAgICBwYWdlU2l6ZT17Y3VzdG9tZXJzPy5wYWdlU2l6ZSB8fCAxMH1cbiAgICAgICAgICAgIHRvdGFsPXtjdXN0b21lcnM/LnRvdGFsIHx8IDB9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHBhZ2UpID0+IGNoYW5nZVBhZ2UoJ2N1c3RvbWVycycsIHBhZ2UpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXNwbGl0XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNoYXJ0LWNhcmRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXdpZGdldC1oZWFkXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8SDUgbWI9XCJzbVwiPkJlc3QgU2VsbGluZyBQcm9kdWN0czwvSDU+XG4gICAgICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICAgICAge2J1c3kucHJvZHVjdHMgJiYgIXByb2R1Y3RzID8gJ0xvYWRpbmfigKYnIDogJ1RvcCA1IGJ5IG51bWJlciBvZiBvcmRlcnMnfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxSYW5nZVNlbGVjdCB2YWx1ZT17cmFuZ2VzLnByb2R1Y3RzfSBvbkNoYW5nZT17KHZhbHVlKSA9PiBjaGFuZ2VSYW5nZSgncHJvZHVjdHMnLCB2YWx1ZSl9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Byb2R1Y3RzPy5yb3dzPy5sZW5ndGggPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInRva3JpLWRhdGEtdGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5Qcm9kdWN0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPk9yZGVyczwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5BbW91bnQ8L3RoPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgIHtwcm9kdWN0cy5yb3dzLm1hcCgocm93KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e3Jvdy5uYW1lfT5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3Jvdy5uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntyb3cub3JkZXJzfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPntpbnIocm93LmFtb3VudCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPFRleHQgb3BhY2l0eT17MC43fT57YnVzeS5wcm9kdWN0cyA/ICdMb2FkaW5n4oCmJyA6ICdObyBwcm9kdWN0cyBzb2xkIGluIHRoaXMgcGVyaW9kLid9PC9UZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IERhc2hib2FyZFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEJhc2VQcm9wZXJ0eUNvbXBvbmVudCwgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgRmxhZ0NhcmQsIGlzRmxhZ09uLCBTZWFyY2hhYmxlTXVsdGlTZWxlY3QsIFN0YXR1c1N3aXRjaCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IG5vcm1hbGl6ZVNsdWdJbnB1dCA9ICh2YWx1ZSkgPT5cbiAgU3RyaW5nKHZhbHVlIHx8ICcnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnRyaW0oKVxuICAgIC5yZXBsYWNlKC9bJ1wiXS9nLCAnJylcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tK3wtKyQvZywgJycpXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmZ1bmN0aW9uIHBhcnNlU2x1Z3MocmF3KSB7XG4gIGlmICghcmF3KSByZXR1cm4gW11cbiAgaWYgKEFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIHJhdy5tYXAoKGl0ZW0pID0+IFN0cmluZyhpdGVtKS50cmltKCkpLmZpbHRlcihCb29sZWFuKVxuICBpZiAodHlwZW9mIHJhdyA9PT0gJ3N0cmluZycpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJzZWQpKSByZXR1cm4gcGFyc2VTbHVncyhwYXJzZWQpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmVcbiAgICB9XG4gICAgcmV0dXJuIHJhd1xuICAgICAgLnNwbGl0KCcsJylcbiAgICAgIC5tYXAoKGl0ZW0pID0+IGl0ZW0udHJpbSgpKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICB9XG4gIHJldHVybiBbXVxufVxuXG5jb25zdCBQcm9kdWN0RWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFt1cGxvYWRpbmcsIHNldFVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NsdWdFZGl0ZWQsIHNldFNsdWdFZGl0ZWRdID0gdXNlU3RhdGUoQm9vbGVhbihpbml0aWFsUmVjb3JkPy5wYXJhbXM/LnNsdWcpKVxuICBjb25zdCBbcHJldmlld1VybCwgc2V0UHJldmlld1VybF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2NhdGVnb3JpZXMsIHNldENhdGVnb3JpZXNdID0gdXNlU3RhdGUoW10pXG5cbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgY3VzdG9tID0gcmVzb3VyY2U/Lm9wdGlvbnM/LmN1c3RvbSB8fCB7fVxuICBjb25zdCBhcGlCYXNlVXJsID0gd2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwaUJhc2VVcmwgfHwgJy9hcGkvdjEnKVxuICBjb25zdCBwcm9kdWN0VXJsQmFzZSA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoKFxuICAgIGN1c3RvbS5wcm9kdWN0VXJsQmFzZSB8fCBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9wcm9kdWN0YCxcbiAgKVxuICBjb25zdCBzbHVnSW5wdXQgPSBwYXJhbXMuc2x1ZyA/PyAnJ1xuICBjb25zdCBwcmV2aWV3U2x1ZyA9IG5vcm1hbGl6ZVNsdWdJbnB1dChzbHVnSW5wdXQpIHx8IG5vcm1hbGl6ZVNsdWdJbnB1dChwYXJhbXMubmFtZSlcbiAgY29uc3QgcHJvZHVjdFVybCA9IHByZXZpZXdTbHVnID8gYCR7cHJvZHVjdFVybEJhc2V9LyR7cHJldmlld1NsdWd9YCA6IG51bGxcbiAgY29uc3Qgc2VsZWN0ZWRDYXRlZ29yeVNsdWdzID0gcGFyc2VTbHVncyhwYXJhbXMuY2F0ZWdvcnlJZHMpXG4gIGNvbnN0IGlzQWN0aXZlID0gcGFyYW1zLmlzQWN0aXZlICE9PSBmYWxzZSAmJiBwYXJhbXMuaXNBY3RpdmUgIT09ICdmYWxzZSdcblxuICBjb25zdCBpbWFnZVVybCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghcGFyYW1zLmltYWdlKSByZXR1cm4gJydcbiAgICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGFyYW1zLmltYWdlKSkgcmV0dXJuIHBhcmFtcy5pbWFnZVxuICAgIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGFyYW1zLmltYWdlfWBcbiAgfSwgW2N1c3RvbS5hcHBVcmwsIHBhcmFtcy5pbWFnZV0pXG5cbiAgY29uc3QgZGlzcGxheWVkSW1hZ2VVcmwgPSBwcmV2aWV3VXJsIHx8IGltYWdlVXJsXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHByZXZpZXdVcmw/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwocHJldmlld1VybClcbiAgICB9XG4gIH0sIFtwcmV2aWV3VXJsXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBpZ25vcmUgPSBmYWxzZVxuICAgIGZldGNoKGAke2FwaUJhc2VVcmx9L2NhdGVnb3JpZXNgKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0Q2F0ZWdvcmllcyhBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFtdKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGlmICghaWdub3JlKSBzZXRDYXRlZ29yaWVzKFtdKVxuICAgICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWdub3JlID0gdHJ1ZVxuICAgIH1cbiAgfSwgW2FwaUJhc2VVcmxdKVxuXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IG9uUHJvcGVydHlDaGFuZ2UgPSAocHJvcGVydHlQYXRoLCB2YWx1ZSwgLi4ucmVzdCkgPT4ge1xuICAgIGlmIChwcm9wZXJ0eVBhdGggPT09ICdzbHVnJykge1xuICAgICAgc2V0U2x1Z0VkaXRlZCh0cnVlKVxuICAgICAgaGFuZGxlQ2hhbmdlKHByb3BlcnR5UGF0aCwgbm9ybWFsaXplU2x1Z0lucHV0KHZhbHVlKSwgLi4ucmVzdClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBoYW5kbGVDaGFuZ2UocHJvcGVydHlQYXRoLCB2YWx1ZSwgLi4ucmVzdClcbiAgICBpZiAocHJvcGVydHlQYXRoID09PSAnbmFtZScgJiYgIXNsdWdFZGl0ZWQpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnc2x1ZycsIG5vcm1hbGl6ZVNsdWdJbnB1dCh2YWx1ZSkpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc2V0U2VsZWN0ZWRDYXRlZ29yaWVzID0gKHNsdWdzKSA9PiBzZXRGaWVsZCgnY2F0ZWdvcnlJZHMnLCBKU09OLnN0cmluZ2lmeShzbHVncykpXG5cbiAgY29uc3QgdXBsb2FkSW1hZ2UgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICBpZiAoIWZpbGUpIHJldHVyblxuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZm9sZGVyJywgJ3Byb2R1Y3RzJylcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIGNvbnN0IGxvY2FsUHJldmlld1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSlcbiAgICBzZXRQcmV2aWV3VXJsKGxvY2FsUHJldmlld1VybClcbiAgICBzZXRVcGxvYWRpbmcodHJ1ZSlcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L21lZGlhL3VwbG9hZGAsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgfSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UgfHwgJ0ltYWdlIHVwbG9hZCBmYWlsZWQnKVxuICAgICAgfVxuICAgICAgY29uc3QgbWVkaWEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIGhhbmRsZUNoYW5nZSgnaW1hZ2UnLCBtZWRpYS5wYXRoKVxuICAgICAgaGFuZGxlQ2hhbmdlKCdtZWRpYUlkJywgbWVkaWEuaWQpXG4gICAgICBzZXRQcmV2aWV3VXJsKFxuICAgICAgICAvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChtZWRpYS5wYXRoKVxuICAgICAgICAgID8gbWVkaWEucGF0aFxuICAgICAgICAgIDogYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke21lZGlhLnBhdGh9YCxcbiAgICAgIClcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdJbWFnZSB1cGxvYWRlZCBzdWNjZXNzZnVsbHknLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IHVwbG9hZCBpbWFnZScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0VXBsb2FkaW5nKGZhbHNlKVxuICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCkgZmlsZVJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgcHJvZHVjdCcsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnUHJvZHVjdCBzYXZlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSBwcm9kdWN0JywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgfVxuXG4gIGNvbnN0IGRlc2NyaXB0aW9uUHJvcGVydHkgPSByZXNvdXJjZS5lZGl0UHJvcGVydGllcy5maW5kKFxuICAgIChwcm9wZXJ0eSkgPT4gcHJvcGVydHkucHJvcGVydHlQYXRoID09PSAnZGVzY3JpcHRpb24nLFxuICApXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e3BhcmFtcy5uYW1lIHx8ICdOZXcgcHJvZHVjdCd9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPkFkZCBwaG90b3MsIHByaWNlcywgYW5kIG9uZSBvciBtb3JlIGNhdGVnb3JpZXMgZm9yIHRoZSB3ZWJzaXRlIGFuZCBhcHAuPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+UHJvZHVjdCBkZXRhaWxzPC9oND5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBOYW1lXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5uYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblByb3BlcnR5Q2hhbmdlKCduYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBbHBob25zbyBNYW5nb1wiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgU2x1Z1xuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtzbHVnSW5wdXR9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uUHJvcGVydHlDaGFuZ2UoJ3NsdWcnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImF1dG8tZ2VuZXJhdGVkIGZyb20gbmFtZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPFRleHQgbXQ9XCJzbVwiIG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICBQcmV2aWV3OnsnICd9XG4gICAgICAgICAgICB7cHJvZHVjdFVybCA/IChcbiAgICAgICAgICAgICAgPGEgaHJlZj17cHJvZHVjdFVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlclwiPlxuICAgICAgICAgICAgICAgIHtwcm9kdWN0VXJsfVxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAnR2VuZXJhdGVkIGZyb20gcHJvZHVjdCBuYW1lIHdoZW4gc2F2ZWQnXG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgUHJpY2UgKOKCuSlcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5wcmljZVZhbHVlID8/ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdwcmljZVZhbHVlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgT2xkIHByaWNlICjigrkpXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMub2xkUHJpY2VWYWx1ZSA/PyAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnb2xkUHJpY2VWYWx1ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJPcHRpb25hbFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBXZWlnaHRcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLndlaWdodCB8fCAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnd2VpZ2h0JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjEga2dcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgQmFkZ2VcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmJhZGdlIHx8ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdiYWRnZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJGcmVzaFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBTdG9ja1xuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuc3RvY2sgPz8gMTAwfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdzdG9jaycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBTb3J0IG9yZGVyXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zb3J0T3JkZXIgPz8gMH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnc29ydE9yZGVyJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5UYXggJiBHU1Q8L2g0PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxMiB9fT5cbiAgICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgICAgY2hlY2tlZD17aXNGbGFnT24ocGFyYW1zLmlzVGF4YWJsZSl9XG4gICAgICAgICAgICAgIHRpdGxlPVwiVGF4YWJsZVwiXG4gICAgICAgICAgICAgIGhpbnQ9e2lzRmxhZ09uKHBhcmFtcy5pc1RheGFibGUpID8gJ0dTVCB3aWxsIGJlIGNoYXJnZWQgYXQgY2hlY2tvdXQnIDogJ05vIEdTVCBvbiB0aGlzIHByb2R1Y3QnfVxuICAgICAgICAgICAgICBvbkxhYmVsPVwiWWVzXCJcbiAgICAgICAgICAgICAgb2ZmTGFiZWw9XCJOb1wiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdpc1RheGFibGUnLCBuZXh0KVxuICAgICAgICAgICAgICAgIGlmIChuZXh0ICYmIE51bWJlcihwYXJhbXMuZ3N0UmF0ZSB8fCAwKSA9PT0gMCkgc2V0RmllbGQoJ2dzdFJhdGUnLCA1KVxuICAgICAgICAgICAgICAgIGlmICghbmV4dCkgc2V0RmllbGQoJ2dzdFJhdGUnLCAwKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgSFNOIENvZGVcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmhzbkNvZGUgPz8gJzA4MDgnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdoc25Db2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjA4MDIgb3IgMDgwOFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBHU1QgJVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmdzdFJhdGUgPz8gMH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZ3N0UmF0ZScsIE51bWJlcihldmVudC50YXJnZXQudmFsdWUpIHx8IDApfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiNVwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+UHJvZHVjdCBpbWFnZTwvaDQ+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLXVwbG9hZC1kcm9wXCI+XG4gICAgICAgICAgICB7ZGlzcGxheWVkSW1hZ2VVcmwgPyAoXG4gICAgICAgICAgICAgIDxpbWcgc3JjPXtkaXNwbGF5ZWRJbWFnZVVybH0gYWx0PXtwYXJhbXMubmFtZSB8fCAnUHJvZHVjdCBwcmV2aWV3J30gLz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxzcGFuPkNsaWNrIHRvIHVwbG9hZCBhIHNxdWFyZSBwcm9kdWN0IHBob3RvPC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDxpbnB1dCByZWY9e2ZpbGVSZWZ9IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIG9uQ2hhbmdlPXt1cGxvYWRJbWFnZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxUZXh0IG10PVwic21cIiBvcGFjaXR5PXswLjd9PlxuICAgICAgICAgICAgSlBHLCBQTkcsIEdJRiwgb3IgV2ViUCB1cCB0byA1TUIuXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L0JveD5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkNhdGVnb3JpZXM8L2g0PlxuICAgICAgICA8cD5BIHByb2R1Y3QgY2FuIGFwcGVhciBpbiBtb3JlIHRoYW4gb25lIGNhdGVnb3J5IG9uIHRoZSB3ZWJzaXRlIGFuZCBhcHAuPC9wPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgU2VsZWN0IGNhdGVnb3JpZXNcbiAgICAgICAgICA8U2VhcmNoYWJsZU11bHRpU2VsZWN0XG4gICAgICAgICAgICBvcHRpb25zPXtjYXRlZ29yaWVzLm1hcCgoaXRlbSkgPT4gKHsgdmFsdWU6IGl0ZW0uc2x1ZywgbGFiZWw6IGl0ZW0ubGFiZWwgfSkpfVxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkQ2F0ZWdvcnlTbHVnc31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTZWxlY3RlZENhdGVnb3JpZXN9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBhbmQgc2VsZWN0IGNhdGVnb3JpZXNcIlxuICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggY2F0ZWdvcmllc1wiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlN0b3JlIHBsYWNlbWVudDwvaDQ+XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxMiB9fT5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgIHRpdGxlPXtpc0FjdGl2ZSA/ICdBY3RpdmUnIDogJ0luYWN0aXZlJ31cbiAgICAgICAgICAgIGhpbnQ9e2lzQWN0aXZlID8gJ1Zpc2libGUgdG8gY3VzdG9tZXJzJyA6ICdIaWRkZW4gZnJvbSB0aGUgd2Vic2l0ZSBhbmQgYXBwJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzQWN0aXZlJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hvaWNlLXJvd1wiPlxuICAgICAgICAgIDxGbGFnQ2FyZFxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3BhcmFtcy5pc0Jlc3RTZWxsZXIgPT09IHRydWUgfHwgcGFyYW1zLmlzQmVzdFNlbGxlciA9PT0gJ3RydWUnfVxuICAgICAgICAgICAgdGl0bGU9XCJCZXN0c2VsbGVyXCJcbiAgICAgICAgICAgIGhpbnQ9XCJTaG93IGluIGJlc3RzZWxsZXJzXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCdpc0Jlc3RTZWxsZXInLCAhKHBhcmFtcy5pc0Jlc3RTZWxsZXIgPT09IHRydWUgfHwgcGFyYW1zLmlzQmVzdFNlbGxlciA9PT0gJ3RydWUnKSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8RmxhZ0NhcmRcbiAgICAgICAgICAgIHNlbGVjdGVkPXtwYXJhbXMuaXNJbXBvcnRlZCA9PT0gdHJ1ZSB8fCBwYXJhbXMuaXNJbXBvcnRlZCA9PT0gJ3RydWUnfVxuICAgICAgICAgICAgdGl0bGU9XCJJbXBvcnRlZFwiXG4gICAgICAgICAgICBoaW50PVwiU2hvdyBpbiBpbXBvcnRlZCBmcnVpdHNcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ2lzSW1wb3J0ZWQnLCAhKHBhcmFtcy5pc0ltcG9ydGVkID09PSB0cnVlIHx8IHBhcmFtcy5pc0ltcG9ydGVkID09PSAndHJ1ZScpKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGbGFnQ2FyZFxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3BhcmFtcy5pc0ZlYXR1cmVkID09PSB0cnVlIHx8IHBhcmFtcy5pc0ZlYXR1cmVkID09PSAndHJ1ZSd9XG4gICAgICAgICAgICB0aXRsZT1cIkZlYXR1cmVkXCJcbiAgICAgICAgICAgIGhpbnQ9XCJIaWdobGlnaHQgdGhpcyBmcnVpdFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgnaXNGZWF0dXJlZCcsICEocGFyYW1zLmlzRmVhdHVyZWQgPT09IHRydWUgfHwgcGFyYW1zLmlzRmVhdHVyZWQgPT09ICd0cnVlJykpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+RGVzY3JpcHRpb248L2g0PlxuICAgICAgICB7ZGVzY3JpcHRpb25Qcm9wZXJ0eSA/IChcbiAgICAgICAgICA8Qm94IHN0eWxlPXt7IG1pbkhlaWdodDogMjIwIH19PlxuICAgICAgICAgICAgPEJhc2VQcm9wZXJ0eUNvbXBvbmVudFxuICAgICAgICAgICAgICB3aGVyZT1cImVkaXRcIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17b25Qcm9wZXJ0eUNoYW5nZX1cbiAgICAgICAgICAgICAgcHJvcGVydHk9e2Rlc2NyaXB0aW9uUHJvcGVydHl9XG4gICAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmcgfHwgdXBsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyB8fCB1cGxvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgU2F2ZSBwcm9kdWN0XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJvZHVjdEVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBCYXNlUHJvcGVydHlDb21wb25lbnQsIHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IEZsYWdDYXJkIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuY29uc3Qgbm9ybWFsaXplU2x1Z0lucHV0ID0gKHZhbHVlKSA9PlxuICBTdHJpbmcodmFsdWUgfHwgJycpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAudHJpbSgpXG4gICAgLnJlcGxhY2UoL1snXCJdL2csICcnKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi0rfC0rJC9nLCAnJylcblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuY29uc3QgQ2F0ZWdvcnlFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IGZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgYmFubmVyRmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbdXBsb2FkaW5nLCBzZXRVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtiYW5uZXJVcGxvYWRpbmcsIHNldEJhbm5lclVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NsdWdFZGl0ZWQsIHNldFNsdWdFZGl0ZWRdID0gdXNlU3RhdGUoQm9vbGVhbihpbml0aWFsUmVjb3JkPy5wYXJhbXM/LnNsdWcpKVxuICBjb25zdCBbcHJldmlld1VybCwgc2V0UHJldmlld1VybF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2Jhbm5lclByZXZpZXdVcmwsIHNldEJhbm5lclByZXZpZXdVcmxdID0gdXNlU3RhdGUoJycpXG5cbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgY3VzdG9tID0gcmVzb3VyY2U/Lm9wdGlvbnM/LmN1c3RvbSB8fCB7fVxuICBjb25zdCBhcGlCYXNlVXJsID0gd2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwaUJhc2VVcmwgfHwgJy9hcGkvdjEnKVxuICBjb25zdCBjYXRlZ29yeVVybEJhc2UgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChcbiAgICBjdXN0b20uY2F0ZWdvcnlVcmxCYXNlIHx8IGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59L2NhdGVnb3J5YCxcbiAgKVxuICBjb25zdCBzbHVnSW5wdXQgPSBwYXJhbXMuc2x1ZyA/PyAnJ1xuICBjb25zdCBwcmV2aWV3U2x1ZyA9IG5vcm1hbGl6ZVNsdWdJbnB1dChzbHVnSW5wdXQpIHx8IG5vcm1hbGl6ZVNsdWdJbnB1dChwYXJhbXMubGFiZWwpXG4gIGNvbnN0IGNhdGVnb3J5VXJsID0gcHJldmlld1NsdWcgPyBgJHtjYXRlZ29yeVVybEJhc2V9LyR7cHJldmlld1NsdWd9YCA6IG51bGxcblxuICBjb25zdCBpbWFnZVVybCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghcGFyYW1zLmltYWdlKSByZXR1cm4gJydcbiAgICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QocGFyYW1zLmltYWdlKSkgcmV0dXJuIHBhcmFtcy5pbWFnZVxuICAgIHJldHVybiBgJHt3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGFyYW1zLmltYWdlfWBcbiAgfSwgW2N1c3RvbS5hcHBVcmwsIHBhcmFtcy5pbWFnZV0pXG5cbiAgY29uc3QgZGlzcGxheWVkSW1hZ2VVcmwgPSBwcmV2aWV3VXJsIHx8IGltYWdlVXJsXG5cbiAgY29uc3QgYmFubmVySW1hZ2VVcmwgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIXBhcmFtcy5iYW5uZXJJbWFnZSkgcmV0dXJuICcnXG4gICAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhcmFtcy5iYW5uZXJJbWFnZSkpIHJldHVybiBwYXJhbXMuYmFubmVySW1hZ2VcbiAgICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke3BhcmFtcy5iYW5uZXJJbWFnZX1gXG4gIH0sIFtjdXN0b20uYXBwVXJsLCBwYXJhbXMuYmFubmVySW1hZ2VdKVxuXG4gIGNvbnN0IGRpc3BsYXllZEJhbm5lclVybCA9IGJhbm5lclByZXZpZXdVcmwgfHwgYmFubmVySW1hZ2VVcmxcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAocHJldmlld1VybD8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChwcmV2aWV3VXJsKVxuICAgIH1cbiAgfSwgW3ByZXZpZXdVcmxdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChiYW5uZXJQcmV2aWV3VXJsPy5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKGJhbm5lclByZXZpZXdVcmwpXG4gICAgfVxuICB9LCBbYmFubmVyUHJldmlld1VybF0pXG5cbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgb25Qcm9wZXJ0eUNoYW5nZSA9IChwcm9wZXJ0eVBhdGgsIHZhbHVlLCAuLi5yZXN0KSA9PiB7XG4gICAgaWYgKHByb3BlcnR5UGF0aCA9PT0gJ3NsdWcnKSB7XG4gICAgICBzZXRTbHVnRWRpdGVkKHRydWUpXG4gICAgICBoYW5kbGVDaGFuZ2UocHJvcGVydHlQYXRoLCBub3JtYWxpemVTbHVnSW5wdXQodmFsdWUpLCAuLi5yZXN0KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGhhbmRsZUNoYW5nZShwcm9wZXJ0eVBhdGgsIHZhbHVlLCAuLi5yZXN0KVxuICAgIGlmIChwcm9wZXJ0eVBhdGggPT09ICdsYWJlbCcgJiYgIXNsdWdFZGl0ZWQpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnc2x1ZycsIG5vcm1hbGl6ZVNsdWdJbnB1dCh2YWx1ZSkpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgdXBsb2FkVG8gPSBhc3luYyAoZmlsZSwgZmllbGQsIHNldExvY2FsUHJldmlldywgc2V0QnVzeSwgc3VjY2Vzc01lc3NhZ2UpID0+IHtcbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmb2xkZXInLCAnY2F0ZWdvcmllcycpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSlcbiAgICBzZXRMb2NhbFByZXZpZXcoVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKSlcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vbWVkaWEvdXBsb2FkYCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogZm9ybURhdGEsXG4gICAgICB9KVxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJvciA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSB8fCAnSW1hZ2UgdXBsb2FkIGZhaWxlZCcpXG4gICAgICB9XG4gICAgICBjb25zdCBtZWRpYSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgICAgb25Qcm9wZXJ0eUNoYW5nZShmaWVsZCwgbWVkaWEucGF0aClcbiAgICAgIHNldExvY2FsUHJldmlldyhcbiAgICAgICAgL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QobWVkaWEucGF0aClcbiAgICAgICAgICA/IG1lZGlhLnBhdGhcbiAgICAgICAgICA6IGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpbil9JHttZWRpYS5wYXRofWAsXG4gICAgICApXG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBzdWNjZXNzTWVzc2FnZSwgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCB1cGxvYWQgaW1hZ2UnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIGNhdGVnb3J5JywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDYXRlZ29yeSBzYXZlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSBjYXRlZ29yeScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gIH1cblxuICBjb25zdCBkZXNjcmlwdGlvblByb3BlcnR5ID0gcmVzb3VyY2UuZWRpdFByb3BlcnRpZXMuZmluZChcbiAgICAocHJvcGVydHkpID0+IHByb3BlcnR5LnByb3BlcnR5UGF0aCA9PT0gJ2Rlc2NyaXB0aW9uJyxcbiAgKVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntwYXJhbXMubGFiZWwgfHwgJ05ldyBjYXRlZ29yeSd9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPkNyZWF0ZSBhIHNob3Agc2VjdGlvbiB3aXRoIGEgdGh1bWJuYWlsLCBiYW5uZXIsIGFuZCBwYWdlIGNvcHkuPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+Q2F0ZWdvcnkgZGV0YWlsczwvaDQ+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgTGFiZWxcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmxhYmVsIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblByb3BlcnR5Q2hhbmdlKCdsYWJlbCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRnJlc2ggRnJ1aXRzXCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQYWdlIGhlYWRpbmdcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnRpdGxlIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgndGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNhbWUgYXMgbGFiZWwgaWYgZW1wdHlcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFN1YnRpdGxlXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zdWJ0aXRsZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3N1YnRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTaG9ydCBsaW5lIHVuZGVyIHRoZSBoZWFkaW5nXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBTbHVnXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3NsdWdJbnB1dH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25Qcm9wZXJ0eUNoYW5nZSgnc2x1ZycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiYXV0by1nZW5lcmF0ZWQgZnJvbSBsYWJlbFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPFRleHQgbXQ9XCJzbVwiIG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICBQcmV2aWV3OnsnICd9XG4gICAgICAgICAgICB7Y2F0ZWdvcnlVcmwgPyAoXG4gICAgICAgICAgICAgIDxhIGhyZWY9e2NhdGVnb3J5VXJsfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyXCI+XG4gICAgICAgICAgICAgICAge2NhdGVnb3J5VXJsfVxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAnR2VuZXJhdGVkIGZyb20gY2F0ZWdvcnkgbGFiZWwgd2hlbiBzYXZlZCdcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICBTb3J0IG9yZGVyXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zb3J0T3JkZXIgPz8gMH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnc29ydE9yZGVyJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIFN0YXR1c1xuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNob2ljZS1yb3dcIiBzdHlsZT17eyBtYXJnaW5Ub3A6IDYgfX0+XG4gICAgICAgICAgICAgICAgPEZsYWdDYXJkXG4gICAgICAgICAgICAgICAgICBzZWxlY3RlZD17cGFyYW1zLmlzQWN0aXZlICE9PSBmYWxzZSAmJiBwYXJhbXMuaXNBY3RpdmUgIT09ICdmYWxzZSd9XG4gICAgICAgICAgICAgICAgICB0aXRsZT1cIkFjdGl2ZVwiXG4gICAgICAgICAgICAgICAgICBoaW50PVwiU2hvd24gb24gd2Vic2l0ZSBhbmQgYXBwXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+XG4gICAgICAgICAgICAgICAgICAgIHNldEZpZWxkKCdpc0FjdGl2ZScsICEocGFyYW1zLmlzQWN0aXZlICE9PSBmYWxzZSAmJiBwYXJhbXMuaXNBY3RpdmUgIT09ICdmYWxzZScpKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkNhdGVnb3J5IGltYWdlPC9oND5cbiAgICAgICAgICA8cD5TcXVhcmUgdGh1bWJuYWlsIHVzZWQgaW4gdGhlIGhvbWUgY2F0ZWdvcnkgZ3JpZC48L3A+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLXVwbG9hZC1kcm9wXCI+XG4gICAgICAgICAgICB7ZGlzcGxheWVkSW1hZ2VVcmwgPyAoXG4gICAgICAgICAgICAgIDxpbWcgc3JjPXtkaXNwbGF5ZWRJbWFnZVVybH0gYWx0PXtwYXJhbXMubGFiZWwgfHwgJ0NhdGVnb3J5IHByZXZpZXcnfSAvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPHNwYW4+Q2xpY2sgdG8gdXBsb2FkIGNhdGVnb3J5IGltYWdlPC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICByZWY9e2ZpbGVSZWZ9XG4gICAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICAgICAgYWNjZXB0PVwiaW1hZ2UvKlwiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICAgICAgICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgICAgICAgdXBsb2FkVG8oZmlsZSwgJ2ltYWdlJywgc2V0UHJldmlld1VybCwgc2V0VXBsb2FkaW5nLCAnSW1hZ2UgdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5JylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJydcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5DYXRlZ29yeSBiYW5uZXI8L2g0PlxuICAgICAgICA8cD5XaWRlIGltYWdlIHNob3duIGF0IHRoZSB0b3Agb2YgdGhlIGNhdGVnb3J5IHBhZ2UuPC9wPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktdXBsb2FkLWRyb3AgdG9rcmktdXBsb2FkLWRyb3Atd2lkZVwiPlxuICAgICAgICAgIHtkaXNwbGF5ZWRCYW5uZXJVcmwgPyAoXG4gICAgICAgICAgICA8aW1nIHNyYz17ZGlzcGxheWVkQmFubmVyVXJsfSBhbHQ9e3BhcmFtcy5sYWJlbCB8fCAnQ2F0ZWdvcnkgYmFubmVyJ30gLz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPHNwYW4+Q2xpY2sgdG8gdXBsb2FkIGEgd2lkZSBiYW5uZXIgKDE2MDDDlzQwMCByZWNvbW1lbmRlZCk8L3NwYW4+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHJlZj17YmFubmVyRmlsZVJlZn1cbiAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICAgIGFjY2VwdD1cImltYWdlLypcIlxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICAgICAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgICAgICB1cGxvYWRUbyhcbiAgICAgICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgICAgICAnYmFubmVySW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgc2V0QmFubmVyUHJldmlld1VybCxcbiAgICAgICAgICAgICAgICAgIHNldEJhbm5lclVwbG9hZGluZyxcbiAgICAgICAgICAgICAgICAgICdCYW5uZXIgdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJydcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkRlc2NyaXB0aW9uPC9oND5cbiAgICAgICAge2Rlc2NyaXB0aW9uUHJvcGVydHkgPyAoXG4gICAgICAgICAgPEJveCBzdHlsZT17eyBtaW5IZWlnaHQ6IDIyMCB9fT5cbiAgICAgICAgICAgIDxCYXNlUHJvcGVydHlDb21wb25lbnRcbiAgICAgICAgICAgICAgd2hlcmU9XCJlZGl0XCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9e29uUHJvcGVydHlDaGFuZ2V9XG4gICAgICAgICAgICAgIHByb3BlcnR5PXtkZXNjcmlwdGlvblByb3BlcnR5fVxuICAgICAgICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgICAgICAgIHJlY29yZD17cmVjb3JkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ25vbmUnIH19IGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICB7cmVzb3VyY2UuZWRpdFByb3BlcnRpZXNcbiAgICAgICAgICAuZmlsdGVyKChwcm9wZXJ0eSkgPT4gWydpbWFnZScsICdiYW5uZXJJbWFnZSddLmluY2x1ZGVzKHByb3BlcnR5LnByb3BlcnR5UGF0aCkpXG4gICAgICAgICAgLm1hcCgocHJvcGVydHkpID0+IChcbiAgICAgICAgICAgIDxCYXNlUHJvcGVydHlDb21wb25lbnRcbiAgICAgICAgICAgICAga2V5PXtwcm9wZXJ0eS5wcm9wZXJ0eVBhdGh9XG4gICAgICAgICAgICAgIHdoZXJlPVwiZWRpdFwiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtvblByb3BlcnR5Q2hhbmdlfVxuICAgICAgICAgICAgICBwcm9wZXJ0eT17cHJvcGVydHl9XG4gICAgICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpfVxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nIHx8IHVwbG9hZGluZyB8fCBiYW5uZXJVcGxvYWRpbmd9PlxuICAgICAgICAgIHtsb2FkaW5nIHx8IHVwbG9hZGluZyB8fCBiYW5uZXJVcGxvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgU2F2ZSBjYXRlZ29yeVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IENhdGVnb3J5RWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBJY29uLCBJbnB1dCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQge1xuICBSZWNvcmRzVGFibGUsXG4gIHVzZVF1ZXJ5UGFyYW1zLFxuICB1c2VSZWNvcmRzLFxuICB1c2VTZWxlY3RlZFJlY29yZHMsXG59IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBMb2NhbFNlbGVjdCB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IFBFUl9QQUdFX09QVElPTlMgPSBbMTAsIDI1LCA1MF1cblxuY29uc3QgQ21zTGlzdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlc291cmNlLCBzZXRUYWcgfSA9IHByb3BzXG4gIGNvbnN0IHRpdGxlUHJvcCA9IHJlc291cmNlLnRpdGxlUHJvcGVydHk/Lm5hbWUgfHwgcmVzb3VyY2UudGl0bGVQcm9wZXJ0eT8ucHJvcGVydHlQYXRoIHx8ICdpZCdcblxuICBjb25zdCB7IHN0b3JlUGFyYW1zLCBmaWx0ZXJzLCBwYXJzZWRRdWVyeSB9ID0gdXNlUXVlcnlQYXJhbXMoKVxuICBjb25zdCB7XG4gICAgcmVjb3JkcyxcbiAgICBsb2FkaW5nLFxuICAgIGRpcmVjdGlvbixcbiAgICBzb3J0QnksXG4gICAgcGFnZSxcbiAgICB0b3RhbCxcbiAgICBmZXRjaERhdGEsXG4gICAgcGVyUGFnZSxcbiAgfSA9IHVzZVJlY29yZHMocmVzb3VyY2UuaWQpXG4gIGNvbnN0IHtcbiAgICBzZWxlY3RlZFJlY29yZHMsXG4gICAgaGFuZGxlU2VsZWN0LFxuICAgIGhhbmRsZVNlbGVjdEFsbCxcbiAgICBzZXRTZWxlY3RlZFJlY29yZHMsXG4gIH0gPSB1c2VTZWxlY3RlZFJlY29yZHMocmVjb3JkcylcblxuICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9IHVzZVN0YXRlKCgpID0+IFN0cmluZyhwYXJzZWRRdWVyeT8ucSB8fCBmaWx0ZXJzPy5bdGl0bGVQcm9wXSB8fCAnJykpXG4gIGNvbnN0IGRlYm91bmNlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0b3JlUGFyYW1zUmVmID0gdXNlUmVmKHN0b3JlUGFyYW1zKVxuICBzdG9yZVBhcmFtc1JlZi5jdXJyZW50ID0gc3RvcmVQYXJhbXNcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFF1ZXJ5KFN0cmluZyhwYXJzZWRRdWVyeT8ucSB8fCBmaWx0ZXJzPy5bdGl0bGVQcm9wXSB8fCAnJykpXG4gICAgc2V0U2VsZWN0ZWRSZWNvcmRzKFtdKVxuICB9LCBbcmVzb3VyY2UuaWQsIHRpdGxlUHJvcCwgc2V0U2VsZWN0ZWRSZWNvcmRzXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZXRUYWcpIHNldFRhZyh0b3RhbC50b1N0cmluZygpKVxuICB9LCBbdG90YWwsIHNldFRhZ10pXG5cbiAgY29uc3QgaGFuZGxlUXVlcnlDaGFuZ2UgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgIHNldFF1ZXJ5KHZhbHVlKVxuXG4gICAgaWYgKGRlYm91bmNlUmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChkZWJvdW5jZVJlZi5jdXJyZW50KVxuICAgIGRlYm91bmNlUmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnN0IHRyaW1tZWQgPSB2YWx1ZS50cmltKClcbiAgICAgIHN0b3JlUGFyYW1zUmVmLmN1cnJlbnQoe1xuICAgICAgICBwYWdlOiAnMScsXG4gICAgICAgIHE6IHRyaW1tZWQgfHwgdW5kZWZpbmVkLFxuICAgICAgfSlcbiAgICB9LCAzMDApXG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoZGVib3VuY2VSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KGRlYm91bmNlUmVmLmN1cnJlbnQpXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBoYW5kbGVBY3Rpb25QZXJmb3JtZWQgPSAoKSA9PiBmZXRjaERhdGEoKVxuXG4gIGNvbnN0IGN1cnJlbnRQYWdlID0gTnVtYmVyKHBhZ2UpIHx8IDFcbiAgY29uc3Qgcm93c1BlclBhZ2UgPSBOdW1iZXIocGVyUGFnZSkgfHwgMTBcbiAgY29uc3QgdG90YWxSb3dzID0gTnVtYmVyKHRvdGFsKSB8fCAwXG4gIGNvbnN0IHRvdGFsUGFnZXMgPSBNYXRoLm1heCgxLCBNYXRoLmNlaWwodG90YWxSb3dzIC8gcm93c1BlclBhZ2UpIHx8IDEpXG4gIGNvbnN0IGZyb20gPSB0b3RhbFJvd3MgPT09IDAgPyAwIDogKGN1cnJlbnRQYWdlIC0gMSkgKiByb3dzUGVyUGFnZSArIDFcbiAgY29uc3QgdG8gPSBNYXRoLm1pbihjdXJyZW50UGFnZSAqIHJvd3NQZXJQYWdlLCB0b3RhbFJvd3MpXG5cbiAgY29uc3QgZ29Ub1BhZ2UgPSAobmV4dFBhZ2UpID0+IHtcbiAgICBjb25zdCBzYWZlID0gTWF0aC5taW4oTWF0aC5tYXgoMSwgbmV4dFBhZ2UpLCB0b3RhbFBhZ2VzKVxuICAgIHN0b3JlUGFyYW1zKHtcbiAgICAgIHBhZ2U6IFN0cmluZyhzYWZlKSxcbiAgICAgIHE6IHBhcnNlZFF1ZXJ5Py5xIHx8IGZpbHRlcnM/Llt0aXRsZVByb3BdIHx8IHVuZGVmaW5lZCxcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY2hhbmdlUGVyUGFnZSA9IChuZXh0KSA9PiB7XG4gICAgc3RvcmVQYXJhbXMoe1xuICAgICAgcGFnZTogJzEnLFxuICAgICAgcGVyUGFnZTogU3RyaW5nKG5leHQpLFxuICAgICAgcTogcGFyc2VkUXVlcnk/LnEgfHwgZmlsdGVycz8uW3RpdGxlUHJvcF0gfHwgdW5kZWZpbmVkLFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBwYWdlTnVtYmVycyA9IFtdXG4gIGNvbnN0IHdpbmRvd1NpemUgPSA1XG4gIGxldCBzdGFydCA9IE1hdGgubWF4KDEsIGN1cnJlbnRQYWdlIC0gTWF0aC5mbG9vcih3aW5kb3dTaXplIC8gMikpXG4gIGxldCBlbmQgPSBNYXRoLm1pbih0b3RhbFBhZ2VzLCBzdGFydCArIHdpbmRvd1NpemUgLSAxKVxuICBzdGFydCA9IE1hdGgubWF4KDEsIGVuZCAtIHdpbmRvd1NpemUgKyAxKVxuICBmb3IgKGxldCBudW1iZXIgPSBzdGFydDsgbnVtYmVyIDw9IGVuZDsgbnVtYmVyICs9IDEpIHBhZ2VOdW1iZXJzLnB1c2gobnVtYmVyKVxuXG4gIHJldHVybiAoXG4gICAgPEJveCB2YXJpYW50PVwiZ3JleVwiPlxuICAgICAgPEJveCBtYj1cImxnXCIgc3R5bGU9e3sgcG9zaXRpb246ICdyZWxhdGl2ZScsIG1heFdpZHRoOiA0MjAgfX0+XG4gICAgICAgIDxCb3hcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICB0b3A6ICc1MCUnLFxuICAgICAgICAgICAgbGVmdDogMTIsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKC01MCUpJyxcbiAgICAgICAgICAgIHBvaW50ZXJFdmVudHM6ICdub25lJyxcbiAgICAgICAgICAgIG9wYWNpdHk6IDAuNixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEljb24gaWNvbj1cIlNlYXJjaFwiIC8+XG4gICAgICAgIDwvQm94PlxuICAgICAgICA8SW5wdXRcbiAgICAgICAgICB2YWx1ZT17cXVlcnl9XG4gICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZVF1ZXJ5Q2hhbmdlfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXtgU2VhcmNoIGFsbCAke3Jlc291cmNlLm5hbWV9Li4uYH1cbiAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nTGVmdDogMzYgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IHZhcmlhbnQ9XCJjb250YWluZXJcIj5cbiAgICAgICAgPFJlY29yZHNUYWJsZVxuICAgICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgICByZWNvcmRzPXtyZWNvcmRzfVxuICAgICAgICAgIGFjdGlvblBlcmZvcm1lZD17aGFuZGxlQWN0aW9uUGVyZm9ybWVkfVxuICAgICAgICAgIG9uU2VsZWN0PXtoYW5kbGVTZWxlY3R9XG4gICAgICAgICAgb25TZWxlY3RBbGw9e2hhbmRsZVNlbGVjdEFsbH1cbiAgICAgICAgICBzZWxlY3RlZFJlY29yZHM9e3NlbGVjdGVkUmVjb3Jkc31cbiAgICAgICAgICBkaXJlY3Rpb249e2RpcmVjdGlvbn1cbiAgICAgICAgICBzb3J0Qnk9e3NvcnRCeX1cbiAgICAgICAgICBpc0xvYWRpbmc9e2xvYWRpbmd9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1saXN0LXBhZ2luYXRpb25cIj5cbiAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0b2tyaS1saXN0LXBhZ2luYXRpb24tc3VtbWFyeVwiPlxuICAgICAgICAgICAge3RvdGFsUm93cyA9PT0gMCA/ICdObyByZWNvcmRzJyA6IGBTaG93aW5nICR7ZnJvbX3igJMke3RvfSBvZiAke3RvdGFsUm93c31gfVxuICAgICAgICAgIDwvVGV4dD5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbGlzdC1wYWdpbmF0aW9uLXNpemVcIj5cbiAgICAgICAgICAgIDxzcGFuPlJvd3M8L3NwYW4+XG4gICAgICAgICAgICA8TG9jYWxTZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e1N0cmluZyhyb3dzUGVyUGFnZSl9XG4gICAgICAgICAgICAgIG9wdGlvbnM9e1BFUl9QQUdFX09QVElPTlMubWFwKChvcHRpb24pID0+ICh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IFN0cmluZyhvcHRpb24pLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBTdHJpbmcob3B0aW9uKSxcbiAgICAgICAgICAgICAgfSkpfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IGNoYW5nZVBlclBhZ2UoTnVtYmVyKG5leHQpKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWxpc3QtcGFnaW5hdGlvbi1wYWdlc1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGlzYWJsZWQ9e2N1cnJlbnRQYWdlIDw9IDF9IG9uQ2xpY2s9eygpID0+IGdvVG9QYWdlKGN1cnJlbnRQYWdlIC0gMSl9PlxuICAgICAgICAgICAgICBQcmV2XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIHtwYWdlTnVtYmVycy5tYXAoKG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAga2V5PXtudW1iZXJ9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtudW1iZXIgPT09IGN1cnJlbnRQYWdlID8gJ2lzLWN1cnJlbnQnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZ29Ub1BhZ2UobnVtYmVyKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtudW1iZXJ9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPj0gdG90YWxQYWdlc30gb25DbGljaz17KCkgPT4gZ29Ub1BhZ2UoY3VycmVudFBhZ2UgKyAxKX0+XG4gICAgICAgICAgICAgIE5leHRcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IENtc0xpc3RcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBMb2NhbFNlbGVjdCwgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmZ1bmN0aW9uIHJlc29sdmVJbWFnZVVybChwYXRoLCBhcHBVcmwpIHtcbiAgaWYgKCFwYXRoKSByZXR1cm4gJydcbiAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhdGgpKSByZXR1cm4gcGF0aFxuICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGF0aH1gXG59XG5cbmZ1bmN0aW9uIEZpZWxkRXJyb3IoeyBlcnJvciB9KSB7XG4gIGlmICghZXJyb3I/Lm1lc3NhZ2UpIHJldHVybiBudWxsXG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPntlcnJvci5tZXNzYWdlfTwvc3Bhbj5cbn1cblxuY29uc3QgUmV2aWV3RWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IGZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgW3VwbG9hZGluZywgc2V0VXBsb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcHJldmlld1VybCwgc2V0UHJldmlld1VybF0gPSB1c2VTdGF0ZSgnJylcblxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBpc05ldyA9IGFjdGlvbj8ubmFtZSA9PT0gJ25ldycgfHwgIXJlY29yZD8uaWRcbiAgY29uc3QgY3VzdG9tID0gcmVzb3VyY2U/Lm9wdGlvbnM/LmN1c3RvbSB8fCB7fVxuICBjb25zdCBhcGlCYXNlVXJsID0gd2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwaUJhc2VVcmwgfHwgJy9hcGkvdjEnKVxuICBjb25zdCBhcHBVcmwgPSBjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW5cbiAgY29uc3QgZXJyb3JzID0gdXNlTWVtbygoKSA9PiByZWNvcmQ/LmVycm9ycyB8fCB7fSwgW3JlY29yZD8uZXJyb3JzXSlcbiAgY29uc3QgcmF0aW5nID0gTWF0aC5taW4oNSwgTWF0aC5tYXgoMSwgTnVtYmVyKHBhcmFtcy5yYXRpbmcpIHx8IDUpKVxuICBjb25zdCBpc0FwcHJvdmVkID1cbiAgICBpc05ldyAmJiAocGFyYW1zLmlzQXBwcm92ZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBcHByb3ZlZCA9PT0gJycpXG4gICAgICA/IHRydWVcbiAgICAgIDogaXNGbGFnT24ocGFyYW1zLmlzQXBwcm92ZWQpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5pc0FwcHJvdmVkID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQXBwcm92ZWQgPT09ICcnKSkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdpc0FwcHJvdmVkJywgdHJ1ZSlcbiAgICB9XG4gICAgaWYgKGlzTmV3ICYmICFwYXJhbXMucmF0aW5nKSBoYW5kbGVDaGFuZ2UoJ3JhdGluZycsIDUpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbaXNOZXddKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChwcmV2aWV3VXJsPy5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKHByZXZpZXdVcmwpXG4gICAgfVxuICB9LCBbcHJldmlld1VybF0pXG5cbiAgY29uc3QgaW1hZ2VVcmwgPSB1c2VNZW1vKFxuICAgICgpID0+IHJlc29sdmVJbWFnZVVybChwYXJhbXMuaW1hZ2UsIGFwcFVybCksXG4gICAgW2FwcFVybCwgcGFyYW1zLmltYWdlXSxcbiAgKVxuICBjb25zdCBkaXNwbGF5ZWRJbWFnZVVybCA9IHByZXZpZXdVcmwgfHwgaW1hZ2VVcmxcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3QgdXBsb2FkSW1hZ2UgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF1cbiAgICBpZiAoIWZpbGUpIHJldHVyblxuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZm9sZGVyJywgJ3Jldmlld3MnKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpXG4gICAgY29uc3QgbG9jYWxQcmV2aWV3VXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKVxuICAgIHNldFByZXZpZXdVcmwobG9jYWxQcmV2aWV3VXJsKVxuICAgIHNldFVwbG9hZGluZyh0cnVlKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vbWVkaWEvdXBsb2FkYCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogZm9ybURhdGEsXG4gICAgICB9KVxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJvciA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSB8fCAnSW1hZ2UgdXBsb2FkIGZhaWxlZCcpXG4gICAgICB9XG4gICAgICBjb25zdCBtZWRpYSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgICAgc2V0RmllbGQoJ2ltYWdlJywgbWVkaWEucGF0aClcbiAgICAgIHNldFByZXZpZXdVcmwocmVzb2x2ZUltYWdlVXJsKG1lZGlhLnBhdGgsIGFwcFVybCkpXG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnUGhvdG8gdXBsb2FkZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IHVwbG9hZCBpbWFnZScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0VXBsb2FkaW5nKGZhbHNlKVxuICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCkgZmlsZVJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgcmV2aWV3JywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGlzTmV3ID8gJ1JldmlldyBjcmVhdGVkJyA6ICdSZXZpZXcgdXBkYXRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSByZXZpZXcuIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntpc05ldyA/ICdBZGQgaG9tZXBhZ2UgcmV2aWV3JyA6IHBhcmFtcy50aXRsZSB8fCAnUmV2aWV3J308L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgQXBwcm92ZWQgcmV2aWV3cyBhcHBlYXIgb24gdGhlIHdlYnNpdGUgaG9tZXBhZ2UuIEhpZGRlbiByZXZpZXdzIHN0YXkgaW4gQ01TIG9ubHkuXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PldlYnNpdGUgdmlzaWJpbGl0eTwvaDQ+XG4gICAgICAgICAgPHA+VHVybiB0aGlzIG9mZiB0byBoaWRlIHRoZSByZXZpZXcgd2l0aG91dCBkZWxldGluZyBpdC48L3A+XG4gICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgY2hlY2tlZD17aXNBcHByb3ZlZH1cbiAgICAgICAgICAgIG9uTGFiZWw9XCJBcHByb3ZlZFwiXG4gICAgICAgICAgICBvZmZMYWJlbD1cIkhpZGRlblwiXG4gICAgICAgICAgICB0aXRsZT17aXNBcHByb3ZlZCA/ICdBcHByb3ZlZCcgOiAnSGlkZGVuJ31cbiAgICAgICAgICAgIGhpbnQ9e2lzQXBwcm92ZWQgPyAnVmlzaWJsZSBvbiB0aGUgaG9tZXBhZ2UnIDogJ0hpZGRlbiB1bnRpbCB5b3UgYXBwcm92ZSBpdCd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdpc0FwcHJvdmVkJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlJhdGluZzwvaDQ+XG4gICAgICAgICAgPHA+U2hvd24gYXMgc3RhcnMgb24gdGhlIGhvbWVwYWdlIHJldmlldyBjYXJkLjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBTdGFyc1xuICAgICAgICAgICAgPExvY2FsU2VsZWN0XG4gICAgICAgICAgICAgIHZhbHVlPXtyYXRpbmd9XG4gICAgICAgICAgICAgIG9wdGlvbnM9e1s1LCA0LCAzLCAyLCAxXS5tYXAoKHZhbHVlKSA9PiAoe1xuICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBgJHt2YWx1ZX0gc3RhciR7dmFsdWUgPT09IDEgPyAnJyA6ICdzJ31gLFxuICAgICAgICAgICAgICB9KSl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ3JhdGluZycsIE51bWJlcihuZXh0KSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+UmV2aWV3IHRleHQ8L2g0PlxuICAgICAgICA8cD5LZWVwIGl0IHNob3J0LiBUaGlzIGlzIHdoYXQgY3VzdG9tZXJzIHJlYWQgb24gdGhlIGhvbWVwYWdlLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgVGl0bGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnRpdGxlIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgndGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlN1cGVyIGZyZXNoIGZydWl0c1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy50aXRsZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFJldmlld2VyIG5hbWVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm5hbWUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCduYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJQcml5YSBTaGFybWFcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMubmFtZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIFJldmlld1xuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHJvd3M9ezR9XG4gICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jb250ZW50IHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2NvbnRlbnQnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBbHdheXMgZnJlc2ggYW5kIGRlbGl2ZXJlZCByaWdodCBvbiB0aW1lLlwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmNvbnRlbnR9IC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5SZXZpZXdlciBwaG90bzwvaDQ+XG4gICAgICAgIDxwPk9wdGlvbmFsLiBJZiBlbXB0eSwgdGhlIHdlYnNpdGUgc2hvd3MgaW5pdGlhbHMgaW5zdGVhZC48L3A+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBQaG90b1xuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXVwbG9hZC1kcm9wIHRva3JpLXVwbG9hZC1kcm9wLXJvdW5kXCI+XG4gICAgICAgICAgICB7ZGlzcGxheWVkSW1hZ2VVcmwgPyAoXG4gICAgICAgICAgICAgIDxpbWcgc3JjPXtkaXNwbGF5ZWRJbWFnZVVybH0gYWx0PXtwYXJhbXMubmFtZSB8fCAnUmV2aWV3ZXInfSAvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPHNwYW4+e3VwbG9hZGluZyA/ICdVcGxvYWRpbmfigKYnIDogJ0NsaWNrIHRvIHVwbG9hZCBhIHBob3RvJ308L3NwYW4+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGlucHV0IHJlZj17ZmlsZVJlZn0gdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgb25DaGFuZ2U9e3VwbG9hZEltYWdlfSAvPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+SlBHLCBQTkcsIEdJRiwgb3IgV2ViUCB1cCB0byA1TUI8L3NwYW4+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nIHx8IHVwbG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgfHwgdXBsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIHtpc05ldyA/ICdDcmVhdGUgcmV2aWV3JyA6ICdTYXZlIHJldmlldyd9XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUmV2aWV3RWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0LCBUaW55TUNFIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IFN0YXR1c1N3aXRjaCwgaXNGbGFnT24gfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5jb25zdCB3aXRob3V0VHJhaWxpbmdTbGFzaCA9ICh2YWx1ZSkgPT4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9cXC8rJC8sICcnKVxuXG5jb25zdCBFRElUT1JfT1BUSU9OUyA9IHtcbiAgcGx1Z2luczogWydsaW5rJywgJ2xpc3RzJywgJ2ltYWdlJywgJ2F1dG9saW5rJywgJ2NvZGUnLCAnd29yZGNvdW50J10sXG4gIHRvb2xiYXI6ICd1bmRvIHJlZG8gfCBibG9ja3MgfCBib2xkIGl0YWxpYyB1bmRlcmxpbmUgfCBidWxsaXN0IG51bWxpc3QgfCBsaW5rIGltYWdlIHwgcmVtb3ZlZm9ybWF0JyxcbiAgaGVpZ2h0OiA0MjAsXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVJbWFnZVVybChwYXRoLCBhcHBVcmwpIHtcbiAgaWYgKCFwYXRoKSByZXR1cm4gJydcbiAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhdGgpKSByZXR1cm4gcGF0aFxuICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGF0aH1gXG59XG5cbmZ1bmN0aW9uIGRhdGVJbnB1dFZhbHVlKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gU3RyaW5nKHZhbHVlKS5zbGljZSgwLCAxMClcbiAgY29uc3QgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKVxuICBjb25zdCBtb250aCA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpXG4gIGNvbnN0IGRheSA9IFN0cmluZyhkYXRlLmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKVxuICByZXR1cm4gYCR7eWVhcn0tJHttb250aH0tJHtkYXl9YFxufVxuXG5mdW5jdGlvbiBwYWQodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucGFkU3RhcnQoMiwgJzAnKVxufVxuXG5mdW5jdGlvbiBwYXJzZURhdGVWYWx1ZSh2YWx1ZSkge1xuICBjb25zdCB0ZXh0ID0gU3RyaW5nKHZhbHVlIHx8ICcnKS50cmltKClcbiAgaWYgKCF0ZXh0KSByZXR1cm4gbnVsbFxuICBjb25zdCBtYXRjaCA9IHRleHQubWF0Y2goL14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KS8pXG4gIGlmIChtYXRjaCkge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShOdW1iZXIobWF0Y2hbMV0pLCBOdW1iZXIobWF0Y2hbMl0pIC0gMSwgTnVtYmVyKG1hdGNoWzNdKSlcbiAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSA/IG51bGwgOiBkYXRlXG4gIH1cbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRleHQpXG4gIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpID8gbnVsbCA6IGRhdGVcbn1cblxuZnVuY3Rpb24gdG9EYXRlVmFsdWUoZGF0ZSkge1xuICByZXR1cm4gYCR7ZGF0ZS5nZXRGdWxsWWVhcigpfS0ke3BhZChkYXRlLmdldE1vbnRoKCkgKyAxKX0tJHtwYWQoZGF0ZS5nZXREYXRlKCkpfWBcbn1cblxuZnVuY3Rpb24gRGF0ZUZpZWxkKHsgdmFsdWUsIG9uQ2hhbmdlIH0pIHtcbiAgY29uc3Qgc2VsZWN0ZWQgPSBwYXJzZURhdGVWYWx1ZSh2YWx1ZSlcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFttb250aERhdGUsIHNldE1vbnRoRGF0ZV0gPSB1c2VTdGF0ZShzZWxlY3RlZCB8fCBuZXcgRGF0ZSgpKVxuICBjb25zdCB3cmFwUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IFtvcGVuVXAsIHNldE9wZW5VcF0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghb3BlbikgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHJlY3QgPSB3cmFwUmVmLmN1cnJlbnQ/LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBpZiAoIXJlY3QpIHJldHVyblxuICAgICAgY29uc3Qgc3BhY2VCZWxvdyA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3QuYm90dG9tXG4gICAgICBzZXRPcGVuVXAoc3BhY2VCZWxvdyA8IDMyMCAmJiByZWN0LnRvcCA+IHNwYWNlQmVsb3cpXG4gICAgfVxuICAgIHVwZGF0ZSgpXG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdXBkYXRlLCB0cnVlKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkRvY0NsaWNrKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB1cGRhdGUsIHRydWUpXG4gICAgfVxuICB9LCBbb3Blbl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWQpIHNldE1vbnRoRGF0ZShzZWxlY3RlZClcbiAgfSwgW3ZhbHVlXSlcblxuICBjb25zdCB5ZWFyID0gbW9udGhEYXRlLmdldEZ1bGxZZWFyKClcbiAgY29uc3QgbW9udGggPSBtb250aERhdGUuZ2V0TW9udGgoKVxuICBjb25zdCBmaXJzdERheSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxKS5nZXREYXkoKVxuICBjb25zdCB0b3RhbERheXMgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLmdldERhdGUoKVxuICBjb25zdCBjZWxscyA9IFtdXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBmaXJzdERheTsgaW5kZXggKz0gMSkgY2VsbHMucHVzaChudWxsKVxuICBmb3IgKGxldCBkYXkgPSAxOyBkYXkgPD0gdG90YWxEYXlzOyBkYXkgKz0gMSkgY2VsbHMucHVzaChkYXkpXG4gIGNvbnN0IHNlbGVjdGVkRGF5ID0gc2VsZWN0ZWQgJiYgc2VsZWN0ZWQuZ2V0RnVsbFllYXIoKSA9PT0geWVhciAmJiBzZWxlY3RlZC5nZXRNb250aCgpID09PSBtb250aFxuICAgID8gc2VsZWN0ZWQuZ2V0RGF0ZSgpXG4gICAgOiBudWxsXG5cbiAgY29uc3QgY2hvb3NlID0gKGRheSkgPT4ge1xuICAgIG9uQ2hhbmdlKHRvRGF0ZVZhbHVlKG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXkpKSlcbiAgICBzZXRPcGVuKGZhbHNlKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXJcIiByZWY9e3dyYXBSZWZ9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1jb250cm9sXCIgb25DbGljaz17KCkgPT4gc2V0T3BlbigoY3VycmVudCkgPT4gIWN1cnJlbnQpfT5cbiAgICAgICAgPHNwYW4+e3NlbGVjdGVkID8gc2VsZWN0ZWQudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1HQicpIDogJ1NlbGVjdCBhIGRhdGUnfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+8J+ThTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktZGF0ZXBpY2tlci1wb3Ake29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLW5hdlwiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0TW9udGhEYXRlKG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgMSkpfT7igLk8L2J1dHRvbj5cbiAgICAgICAgICAgIDxzdHJvbmc+e21vbnRoRGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLVVTJywgeyBtb250aDogJ2xvbmcnLCB5ZWFyOiAnbnVtZXJpYycgfSl9PC9zdHJvbmc+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb250aERhdGUobmV3IERhdGUoeWVhciwgbW9udGggKyAxLCAxKSl9PuKAujwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci13ZWVrXCI+XG4gICAgICAgICAgICB7WydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ10ubWFwKChsYWJlbCwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgPHNwYW4ga2V5PXtgJHtsYWJlbH0tJHtpbmRleH1gfT57bGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWdyaWRcIj5cbiAgICAgICAgICAgIHtjZWxscy5tYXAoKGRheSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgZGF5ID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIGtleT17YCR7eWVhcn0tJHttb250aH0tJHtkYXl9YH1cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzZWxlY3RlZERheSA9PT0gZGF5ID8gJ2lzLXNlbGVjdGVkJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY2hvb3NlKGRheSl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2RheX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IDxzcGFuIGtleT17YGVtcHR5LSR7aW5kZXh9YH0gLz5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci1hY3Rpb25zXCI+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWNsZWFyXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKCcnKVxuICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIENsZWFyXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItY2xlYXJcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgICAgICAgc2V0TW9udGhEYXRlKHRvZGF5KVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKHRvRGF0ZVZhbHVlKHRvZGF5KSlcbiAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBUb2RheVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gRmllbGRFcnJvcih7IGVycm9yIH0pIHtcbiAgaWYgKCFlcnJvcj8ubWVzc2FnZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9yLm1lc3NhZ2V9PC9zcGFuPlxufVxuXG5jb25zdCBCbG9nRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChpbml0aWFsUmVjb3JkLCByZXNvdXJjZS5pZClcbiAgY29uc3QgZmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbdXBsb2FkaW5nLCBzZXRVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtwcmV2aWV3VXJsLCBzZXRQcmV2aWV3VXJsXSA9IHVzZVN0YXRlKCcnKVxuXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzTmV3ID0gYWN0aW9uPy5uYW1lID09PSAnbmV3JyB8fCAhcmVjb3JkPy5pZFxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG4gIGNvbnN0IGFwcFVybCA9IGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICBjb25zdCBlcnJvcnMgPSB1c2VNZW1vKCgpID0+IHJlY29yZD8uZXJyb3JzIHx8IHt9LCBbcmVjb3JkPy5lcnJvcnNdKVxuICBjb25zdCBpc1B1Ymxpc2hlZCA9IGlzTmV3ICYmIChwYXJhbXMuaXNQdWJsaXNoZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNQdWJsaXNoZWQgPT09ICcnKVxuICAgID8gdHJ1ZVxuICAgIDogaXNGbGFnT24ocGFyYW1zLmlzUHVibGlzaGVkKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzTmV3ICYmIChwYXJhbXMuaXNQdWJsaXNoZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNQdWJsaXNoZWQgPT09ICcnKSkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdpc1B1Ymxpc2hlZCcsIHRydWUpXG4gICAgfVxuICAgIGlmIChpc05ldyAmJiAhcGFyYW1zLmF1dGhvcikgaGFuZGxlQ2hhbmdlKCdhdXRob3InLCAnVG9rcmlpaScpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbaXNOZXddKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKHByZXZpZXdVcmw/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwocHJldmlld1VybClcbiAgfSwgW3ByZXZpZXdVcmxdKVxuXG4gIGNvbnN0IGltYWdlVXJsID0gdXNlTWVtbyhcbiAgICAoKSA9PiByZXNvbHZlSW1hZ2VVcmwocGFyYW1zLmNvdmVySW1hZ2UsIGFwcFVybCksXG4gICAgW2FwcFVybCwgcGFyYW1zLmNvdmVySW1hZ2VdLFxuICApXG4gIGNvbnN0IGRpc3BsYXllZEltYWdlVXJsID0gcHJldmlld1VybCB8fCBpbWFnZVVybFxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcblxuICBjb25zdCB1cGxvYWRJbWFnZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXVxuICAgIGlmICghZmlsZSkgcmV0dXJuXG5cbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmb2xkZXInLCAnYmxvZycpXG4gICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSlcbiAgICBjb25zdCBsb2NhbFByZXZpZXdVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpXG4gICAgc2V0UHJldmlld1VybChsb2NhbFByZXZpZXdVcmwpXG4gICAgc2V0VXBsb2FkaW5nKHRydWUpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS91cGxvYWRgLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIH0pXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdJbWFnZSB1cGxvYWQgZmFpbGVkJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1lZGlhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICBzZXRGaWVsZCgnY292ZXJJbWFnZScsIG1lZGlhLnBhdGgpXG4gICAgICBzZXRQcmV2aWV3VXJsKHJlc29sdmVJbWFnZVVybChtZWRpYS5wYXRoLCBhcHBVcmwpKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdmVyIGltYWdlIHVwbG9hZGVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCB1cGxvYWQgaW1hZ2UnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFVwbG9hZGluZyhmYWxzZSlcbiAgICAgIGlmIChmaWxlUmVmLmN1cnJlbnQpIGZpbGVSZWYuY3VycmVudC52YWx1ZSA9ICcnXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIGJsb2cgcG9zdCcsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBpc05ldyA/ICdCbG9nIHBvc3QgY3JlYXRlZCcgOiAnQmxvZyBwb3N0IHVwZGF0ZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291bGQgbm90IHNhdmUgdGhlIGJsb2cgcG9zdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e2lzTmV3ID8gJ05ldyBibG9nIHBvc3QnIDogcGFyYW1zLnRpdGxlIHx8ICdCbG9nIHBvc3QnfTwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5cbiAgICAgICAgICBQdWJsaXNoZWQgcG9zdHMgYXBwZWFyIG9uIHRoZSB3ZWJzaXRlIGF0IC9ibG9nLiBIaWRkZW4gcG9zdHMgc3RheSBpbiB0aGUgYWRtaW4gb25seS5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5XZWJzaXRlIHZpc2liaWxpdHk8L2g0PlxuICAgICAgICA8cD5UdXJuIHRoaXMgb2ZmIHRvIGtlZXAgYSBkcmFmdCB3aXRob3V0IGRlbGV0aW5nIGl0LjwvcD5cbiAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgIGNoZWNrZWQ9e2lzUHVibGlzaGVkfVxuICAgICAgICAgIG9uTGFiZWw9XCJQdWJsaXNoZWRcIlxuICAgICAgICAgIG9mZkxhYmVsPVwiRHJhZnRcIlxuICAgICAgICAgIHRpdGxlPXtpc1B1Ymxpc2hlZCA/ICdQdWJsaXNoZWQnIDogJ0RyYWZ0J31cbiAgICAgICAgICBoaW50PXtpc1B1Ymxpc2hlZCA/ICdWaXNpYmxlIG9uIHRoZSBibG9nJyA6ICdIaWRkZW4gdW50aWwgeW91IHB1Ymxpc2ggaXQnfVxuICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2lzUHVibGlzaGVkJywgbmV4dCl9XG4gICAgICAgIC8+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5Qb3N0PC9oND5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgVGl0bGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnRpdGxlIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgndGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkhvdyB3ZSBwYWNrIGEgbW9ybmluZyBUb2tyaWlpXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnRpdGxlfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgVVJMIHNsdWdcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnNsdWcgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdzbHVnJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJMZWF2ZSBibGFuayB0byB1c2UgdGhlIHRpdGxlXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+VGhlIHBhZ2Ugd2lsbCBiZSAvYmxvZy90aGlzLXNsdWc8L3NwYW4+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnNsdWd9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEF1dGhvclxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYXV0aG9yIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnYXV0aG9yJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUb2tyaWlpXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDYXRlZ29yeVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY2F0ZWdvcnkgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdjYXRlZ29yeScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiR3VpZGVzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+U2hvd24gYWJvdmUgdGhlIHRpdGxlIG9uIHRoZSBibG9nIGxpc3RpbmcgYW5kIHRoZSBzdG9yeSBwYWdlLjwvc3Bhbj5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFB1Ymxpc2ggZGF0ZVxuICAgICAgICAgICAgPERhdGVGaWVsZFxuICAgICAgICAgICAgICB2YWx1ZT17ZGF0ZUlucHV0VmFsdWUocGFyYW1zLnB1Ymxpc2hlZEF0KX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgncHVibGlzaGVkQXQnLCBuZXh0KX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+TGVhdmUgYmxhbmsgdG8gdXNlIHRvZGF5IHdoZW4gdGhlIHBvc3QgaXMgcHVibGlzaGVkLjwvc3Bhbj5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIFNob3J0IHN1bW1hcnlcbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICByb3dzPXszfVxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5leGNlcnB0IHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2V4Y2VycHQnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJPbmUgb3IgdHdvIGxpbmVzIGZvciB0aGUgYmxvZyBsaXN0aW5nLlwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+SWYgeW91IGxlYXZlIHRoaXMgZW1wdHksIHRoZSBmaXJzdCBsaW5lcyBvZiB0aGUgcG9zdCBhcmUgdXNlZC48L3NwYW4+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5Db3ZlciBpbWFnZTwvaDQ+XG4gICAgICAgIDxwPlNob3duIG9uIHRoZSBibG9nIGxpc3RpbmcgYW5kIGF0IHRoZSB0b3Agb2YgdGhlIHN0b3J5LjwvcD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIENvdmVyXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktdXBsb2FkLWRyb3BcIj5cbiAgICAgICAgICAgIHtkaXNwbGF5ZWRJbWFnZVVybCA/IChcbiAgICAgICAgICAgICAgPGltZyBzcmM9e2Rpc3BsYXllZEltYWdlVXJsfSBhbHQ9e3BhcmFtcy50aXRsZSB8fCAnQ292ZXInfSAvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPHNwYW4+e3VwbG9hZGluZyA/ICdVcGxvYWRpbmfigKYnIDogJ0NsaWNrIHRvIHVwbG9hZCBhIGNvdmVyIGltYWdlJ308L3NwYW4+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGlucHV0IHJlZj17ZmlsZVJlZn0gdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgb25DaGFuZ2U9e3VwbG9hZEltYWdlfSAvPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+SlBHLCBQTkcsIEdJRiwgb3IgV2ViUCB1cCB0byA1TUI8L3NwYW4+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIHtkaXNwbGF5ZWRJbWFnZVVybCA/IChcbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICAgIG10PVwiZGVmYXVsdFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldEZpZWxkKCdjb3ZlckltYWdlJywgJycpXG4gICAgICAgICAgICAgIHNldFByZXZpZXdVcmwoJycpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFJlbW92ZSBjb3ZlclxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlN0b3J5PC9oND5cbiAgICAgICAgPFRpbnlNQ0VcbiAgICAgICAgICB2YWx1ZT17cGFyYW1zLmJvZHkgfHwgJyd9XG4gICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnYm9keScsIG5leHQpfVxuICAgICAgICAgIG9wdGlvbnM9e0VESVRPUl9PUFRJT05TfVxuICAgICAgICAvPlxuICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmJvZHl9IC8+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nIHx8IHVwbG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgfHwgdXBsb2FkaW5nID8gPEljb24gaWNvbj1cIkxvYWRlclwiIHNwaW4gLz4gOiBudWxsfVxuICAgICAgICAgIHtpc05ldyA/ICdQdWJsaXNoIHBvc3QnIDogJ1NhdmUgcG9zdCd9XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQmxvZ0VkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7XG4gIEJveCxcbiAgQnV0dG9uLFxuICBEcmF3ZXJDb250ZW50LFxuICBEcmF3ZXJGb290ZXIsXG4gIEg0LFxuICBJY29uLFxuICBUZXh0LFxufSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgQmFzZVByb3BlcnR5Q29tcG9uZW50LCB1c2VSZWNvcmQsIHVzZU5vdGljZSB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBpc0ZsYWdPbiwgU2VhcmNoYWJsZU11bHRpU2VsZWN0LCBTdGF0dXNTd2l0Y2ggfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5jb25zdCBUQUJTID0gW1xuICB7XG4gICAgaWQ6ICdnZW5lcmFsJyxcbiAgICBsYWJlbDogJ0dlbmVyYWwnLFxuICAgIGZpZWxkczogW1xuICAgICAgJ3N0b3JlTmFtZScsXG4gICAgICAnc3RvcmVUYWdsaW5lJyxcbiAgICAgICdzdG9yZUVtYWlsJyxcbiAgICAgICdzdG9yZVBob25lMScsXG4gICAgICAnc3RvcmVQaG9uZTInLFxuICAgICAgJ3N0b3JlQWRkcmVzcycsXG4gICAgICAncHJvbW9CYW5uZXInLFxuICAgICAgJ2Vhcmx5RGVsaXZlcnknLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ3NvY2lhbCcsXG4gICAgbGFiZWw6ICdTb2NpYWwnLFxuICAgIGZpZWxkczogW10sXG4gIH0sXG4gIHtcbiAgICBpZDogJ2NoYXJnZXMnLFxuICAgIGxhYmVsOiAnQ2hhcmdlcycsXG4gICAgZmllbGRzOiBbXG4gICAgICAnbW9ybmluZ0RlbGl2ZXJ5VGl0bGUnLFxuICAgICAgJ21vcm5pbmdEZWxpdmVyeVN1YnRpdGxlJyxcbiAgICAgICdtb3JuaW5nU2hpcHBpbmdGZWUnLFxuICAgICAgJ21vcm5pbmdGcmVlQWJvdmUnLFxuICAgICAgJ2V4cHJlc3NEZWxpdmVyeVRpdGxlJyxcbiAgICAgICdleHByZXNzRGVsaXZlcnlTdWJ0aXRsZScsXG4gICAgICAnZXhwcmVzc1NoaXBwaW5nRmVlJyxcbiAgICAgICdleHByZXNzRnJlZUFib3ZlJyxcbiAgICAgICdoYW5kbGluZ0ZlZScsXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnaG9tZXBhZ2UnLFxuICAgIGxhYmVsOiAnSG9tZXBhZ2UnLFxuICAgIGZpZWxkczogW1xuICAgICAgJ2hvbWVCYW5uZXJJbWFnZScsXG4gICAgICAnaG9tZU1vYmlsZUJhbm5lckltYWdlJyxcbiAgICAgICdob21lSGlnaGxpZ2h0SW1hZ2UnLFxuICAgICAgJ2hvbWVGZWF0dXJlZENhdGVnb3J5U2x1Z3MnLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ3BheW1lbnRzJyxcbiAgICBsYWJlbDogJ1BheW1lbnRzJyxcbiAgICBmaWVsZHM6IFsncmF6b3JwYXlFbmFibGVkJywgJ3Jhem9ycGF5S2V5SWQnLCAncmF6b3JwYXlLZXlTZWNyZXQnLCAnY29kRW5hYmxlZCddLFxuICB9LFxuICB7XG4gICAgaWQ6ICdub3RpZmljYXRpb25zJyxcbiAgICBsYWJlbDogJ05vdGlmaWNhdGlvbnMnLFxuICAgIGZpZWxkczogW1xuICAgICAgJ21zZzkxRW5hYmxlZCcsXG4gICAgICAnbXNnOTFBdXRoS2V5JyxcbiAgICAgICdtc2c5MVNlbmRlcklkJyxcbiAgICAgICdtc2c5MU90cFRlbXBsYXRlSWQnLFxuICAgICAgJ21zZzkxT3JkZXJUZW1wbGF0ZUlkJyxcbiAgICAgICdtc2c5MVdoYXRzYXBwRW5hYmxlZCcsXG4gICAgICAnbXNnOTFXaGF0c2FwcE51bWJlcicsXG4gICAgICAnbXNnOTFXaGF0c2FwcE5hbWVzcGFjZScsXG4gICAgICAnbXNnOTFXaGF0c2FwcE90cEVuYWJsZWQnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBPdHBUZW1wbGF0ZScsXG4gICAgICAnbXNnOTFXaGF0c2FwcE90cEJ1dHRvbicsXG4gICAgICAnbXNnOTFXaGF0c2FwcE9yZGVyRW5hYmxlZCcsXG4gICAgICAnbXNnOTFXaGF0c2FwcE9yZGVyVGVtcGxhdGUnLFxuICAgICAgJ21zZzkxV2hhdHNhcHBQYXJ0bmVyRW5hYmxlZCcsXG4gICAgICAnbXNnOTFXaGF0c2FwcFBhcnRuZXJUZW1wbGF0ZScsXG4gICAgXSxcbiAgfSxcbl1cblxuY29uc3Qgd2l0aG91dFRyYWlsaW5nU2xhc2ggPSAodmFsdWUpID0+IFN0cmluZyh2YWx1ZSB8fCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJylcblxuZnVuY3Rpb24gcGFyc2VTbHVncyhyYXcpIHtcbiAgaWYgKCFyYXcpIHJldHVybiBbXVxuICBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSByZXR1cm4gcmF3Lm1hcCgoaXRlbSkgPT4gU3RyaW5nKGl0ZW0pLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pXG4gIGlmICh0eXBlb2YgcmF3ID09PSAnc3RyaW5nJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdylcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcnNlZCkpIHJldHVybiBwYXJzZVNsdWdzKHBhcnNlZClcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGlnbm9yZVxuICAgIH1cbiAgICByZXR1cm4gcmF3XG4gICAgICAuc3BsaXQoJywnKVxuICAgICAgLm1hcCgoaXRlbSkgPT4gaXRlbS50cmltKCkpXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gIH1cbiAgcmV0dXJuIFtdXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVJbWFnZVVybChwYXRoLCBhcHBVcmwpIHtcbiAgaWYgKCFwYXRoKSByZXR1cm4gJydcbiAgaWYgKC9eKGh0dHBzPzp8ZGF0YTp8YmxvYjopLy50ZXN0KHBhdGgpKSByZXR1cm4gcGF0aFxuICByZXR1cm4gYCR7d2l0aG91dFRyYWlsaW5nU2xhc2goYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pfSR7cGF0aH1gXG59XG5cbmZ1bmN0aW9uIEltYWdlVXBsb2FkZXIoe1xuICBsYWJlbCxcbiAgaGludCxcbiAgdmFsdWUsXG4gIHByZXZpZXdVcmwsXG4gIHVwbG9hZGluZyxcbiAgZmlsZVJlZixcbiAgb25VcGxvYWQsXG4gIHdpZGUsXG59KSB7XG4gIGNvbnN0IGRpc3BsYXllZCA9IHByZXZpZXdVcmwgfHwgdmFsdWVcblxuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgIHtsYWJlbH1cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRva3JpLXVwbG9hZC1kcm9wJHt3aWRlID8gJyB0b2tyaS11cGxvYWQtZHJvcC13aWRlJyA6ICcnfWB9PlxuICAgICAgICB7ZGlzcGxheWVkID8gKFxuICAgICAgICAgIDxpbWcgc3JjPXtkaXNwbGF5ZWR9IGFsdD17YCR7bGFiZWx9IHByZXZpZXdgfSAvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxzcGFuPnt1cGxvYWRpbmcgPyAnVXBsb2FkaW5n4oCmJyA6ICdDbGljayB0byB1cGxvYWQgYW4gaW1hZ2UnfTwvc3Bhbj5cbiAgICAgICAgKX1cbiAgICAgICAgPGlucHV0IHJlZj17ZmlsZVJlZn0gdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgb25DaGFuZ2U9e29uVXBsb2FkfSAvPlxuICAgICAgPC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPntoaW50fTwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmNvbnN0IE5PVElGSUNBVElPTl9TRUNUSU9OUyA9IFtcbiAge1xuICAgIGlkOiAnc21zJyxcbiAgICB0aXRsZTogJ1NNUycsXG4gICAgaW50cm86ICdMb2dpbiBPVFAgYW5kIG9yZGVyIGNvbmZpcm1hdGlvbiB0aHJvdWdoIE1TRzkxIFNNUy4nLFxuICAgIGZpZWxkczogW1xuICAgICAgeyBrZXk6ICdtc2c5MUVuYWJsZWQnLCB0eXBlOiAnc3dpdGNoJywgbGFiZWw6ICdFbmFibGUgTVNHOTEgU01TJyB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MUF1dGhLZXknLFxuICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICBsYWJlbDogJ01TRzkxIEF1dGggS2V5JyxcbiAgICAgICAgaGludDogJ0xlYXZlIGJsYW5rIHRvIGtlZXAgdGhlIGN1cnJlbnQga2V5JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxU2VuZGVySWQnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnU2VuZGVyIElEJyxcbiAgICAgICAgaGludDogJzYtY2hhcmFjdGVyIERMVCBhcHByb3ZlZCBoZWFkZXIsIGUuZy4gVE9LUklJJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxT3RwVGVtcGxhdGVJZCcsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdMb2dpbiBPVFAgdGVtcGxhdGUgSUQnLFxuICAgICAgICBoaW50OiAnTVNHOTEgVGVtcGxhdGUgSUQgZnJvbSB0aGUgY29weSBpY29uLCBlLmcuIDZhYWU5NzQ4YTMzN2Q3MTg5MTBkMzFmMy4gRG8gbm90IHBhc3RlIHRoZSAxOS1kaWdpdCBBaXJ0ZWwgRExUIElELicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MU9yZGVyVGVtcGxhdGVJZCcsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdPcmRlciBjb25maXJtYXRpb24gdGVtcGxhdGUgSUQnLFxuICAgICAgICBoaW50OiAnTVNHOTEgVGVtcGxhdGUgSUQgZnJvbSB0aGUgY29weSBpY29uLCBlLmcuIDZhYWU5NzhiMWQwZDZhMTIxNzBiOTNmNC4gRG8gbm90IHBhc3RlIHRoZSAxOS1kaWdpdCBBaXJ0ZWwgRExUIElELicsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ3doYXRzYXBwJyxcbiAgICB0aXRsZTogJ1doYXRzQXBwJyxcbiAgICBpbnRybzogJ1NoYXJlZCBudW1iZXIgYW5kIG5hbWVzcGFjZSBmb3IgZXZlcnkgV2hhdHNBcHAgdGVtcGxhdGUuJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcEVuYWJsZWQnLFxuICAgICAgICB0eXBlOiAnc3dpdGNoJyxcbiAgICAgICAgbGFiZWw6ICdFbmFibGUgTVNHOTEgV2hhdHNBcHAnLFxuICAgICAgICBoaW50OiAnVXNlZCB3aGVuIFNNUyBpcyBvZmYgb3IgdGhlIFNNUyBnYXRld2F5IHJlamVjdHMgYSBtZXNzYWdlJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBOdW1iZXInLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnV2hhdHNBcHAgYnVzaW5lc3MgbnVtYmVyJyxcbiAgICAgICAgaGludDogJ1RoZSBudW1iZXIgb24geW91ciBNU0c5MSBXaGF0c0FwcCBhY2NvdW50LiBBIDEwLWRpZ2l0IEluZGlhbiBtb2JpbGUgZ2V0cyA5MSBhZGRlZCBhdXRvbWF0aWNhbGx5LicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwTmFtZXNwYWNlJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBsYWJlbDogJ1doYXRzQXBwIHRlbXBsYXRlIG5hbWVzcGFjZScsXG4gICAgICAgIGhpbnQ6ICdSZXF1aXJlZCBieSBNU0c5MS4gRGVsaXZlcnkgYW5kIE9UUCB0ZW1wbGF0ZXMgYXJlIHRvbGQgYXBhcnQgYnkgdGhpcyBuYW1lc3BhY2UuJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnb3RwJyxcbiAgICB0aXRsZTogJ09UUCBtZXNzYWdlJyxcbiAgICBpbnRybzogJ0xvZ2luIGNvZGUgc2VudCB0byB0aGUgY3VzdG9tZXIgb24gV2hhdHNBcHAuJyxcbiAgICBmaWVsZHM6IFtcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcE90cEVuYWJsZWQnLFxuICAgICAgICB0eXBlOiAnc3dpdGNoJyxcbiAgICAgICAgbGFiZWw6ICdTZW5kIE9UUCBXaGF0c0FwcCcsXG4gICAgICAgIGhpbnQ6ICdMb2dpbiBPVFAgdG8gdGhlIGN1c3RvbWVyJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBPdHBUZW1wbGF0ZScsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdPVFAgdGVtcGxhdGUgbmFtZScsXG4gICAgICAgIGhpbnQ6ICdBcHByb3ZlZCBNU0c5MSB0ZW1wbGF0ZSB3aXRoIDEgYm9keSB2YXJpYWJsZTogdGhlIE9UUCBjb2RlJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBPdHBCdXR0b24nLFxuICAgICAgICB0eXBlOiAnc3dpdGNoJyxcbiAgICAgICAgbGFiZWw6ICdPVFAgdGVtcGxhdGUgaGFzIGEgY29weS1jb2RlIGJ1dHRvbicsXG4gICAgICAgIGhpbnQ6ICdUdXJuIG9uIG9ubHkgaWYgeW91ciBXaGF0c0FwcCBPVFAgdGVtcGxhdGUgaW5jbHVkZXMgdGhlIGNvcHktY29kZSBidXR0b24nLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICdvcmRlcicsXG4gICAgdGl0bGU6ICdPcmRlciBtZXNzYWdlJyxcbiAgICBpbnRybzogJ0N1c3RvbWVyIGNvbmZpcm1hdGlvbiBhZnRlciBDT0QgaXMgcGxhY2VkIG9yIG9ubGluZSBwYXltZW50IGlzIGNvbmZpcm1lZC4nLFxuICAgIGZpZWxkczogW1xuICAgICAge1xuICAgICAgICBrZXk6ICdtc2c5MVdoYXRzYXBwT3JkZXJFbmFibGVkJyxcbiAgICAgICAgdHlwZTogJ3N3aXRjaCcsXG4gICAgICAgIGxhYmVsOiAnU2VuZCBvcmRlciBXaGF0c0FwcCcsXG4gICAgICAgIGhpbnQ6ICdDdXN0b21lciBjb25maXJtYXRpb24gYWZ0ZXIgQ09EIGlzIHBsYWNlZCBvciBvbmxpbmUgcGF5bWVudCBpcyBjb25maXJtZWQnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcE9yZGVyVGVtcGxhdGUnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGxhYmVsOiAnT3JkZXIgdGVtcGxhdGUgbmFtZScsXG4gICAgICAgIGhpbnQ6ICdBcHByb3ZlZCB0ZW1wbGF0ZSB3aXRoIDMgYm9keSB2YXJpYWJsZXM6IG5hbWUsIG9yZGVyIG51bWJlciwgYW1vdW50JyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAncGFydG5lcicsXG4gICAgdGl0bGU6ICdEZWxpdmVyeSBwYXJ0bmVyIG1lc3NhZ2UnLFxuICAgIGludHJvOiAnU2VudCBhZnRlciBDT0QgaXMgcGxhY2VkIG9yIG9ubGluZSBwYXltZW50IGlzIGNvbmZpcm1lZCwgaWYgYSBwYXJ0bmVyIGlzIGFzc2lnbmVkLicsXG4gICAgZmllbGRzOiBbXG4gICAgICB7XG4gICAgICAgIGtleTogJ21zZzkxV2hhdHNhcHBQYXJ0bmVyRW5hYmxlZCcsXG4gICAgICAgIHR5cGU6ICdzd2l0Y2gnLFxuICAgICAgICBsYWJlbDogJ1NlbmQgZGVsaXZlcnktcGFydG5lciBXaGF0c0FwcCcsXG4gICAgICAgIGhpbnQ6ICdTZW50IGFmdGVyIENPRCBpcyBwbGFjZWQgb3Igb25saW5lIHBheW1lbnQgaXMgY29uZmlybWVkLCBpZiBhIHBhcnRuZXIgaXMgYXNzaWduZWQnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbXNnOTFXaGF0c2FwcFBhcnRuZXJUZW1wbGF0ZScsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgbGFiZWw6ICdEZWxpdmVyeS1wYXJ0bmVyIHRlbXBsYXRlIG5hbWUnLFxuICAgICAgICBoaW50OiAnQXBwcm92ZWQgdGVtcGxhdGUgdG9rcmlpaV9kZWxpdmVyeV9hc3NpZ25lZCB3aXRoIDggYm9keSB2YXJpYWJsZXMgYW5kIGEgU2VhcmNoIGluIG1hcCBidXR0b24uIEJ1dHRvbiBVUkw6IGh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vbWFwcy9zZWFyY2gvP2FwaT0xJnF1ZXJ5PXt7MX19JyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbl1cblxuZnVuY3Rpb24gRmllbGRUaXAoeyB0ZXh0IH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHJlZiA9IHVzZVJlZihudWxsKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3Qgb25Qb2ludGVyRG93biA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCFyZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgY29uc3QgdGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG9uUG9pbnRlckRvd24pXG4gICAgfSwgMClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lcilcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgb25Qb2ludGVyRG93bilcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICByZXR1cm4gKFxuICAgIDxzcGFuXG4gICAgICBjbGFzc05hbWU9e2B0b2tyaS1oaW50JHtvcGVuID8gJyBpcy1vcGVuJyA6ICcnfWB9XG4gICAgICByZWY9e3JlZn1cbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9XG4gICAgPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktaGludC10cmlnZ2VyXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIkZpZWxkIGhlbHBcIlxuICAgICAgICBhcmlhLWV4cGFuZGVkPXtvcGVufVxuICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBzZXRPcGVuKChjdXJyZW50KSA9PiAhY3VycmVudClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgP1xuICAgICAgPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1oaW50LXBvcFwiIHJvbGU9XCJ0b29sdGlwXCI+XG4gICAgICAgIHt0ZXh0fVxuICAgICAgPC9zcGFuPlxuICAgIDwvc3Bhbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBOb3RpZnlJbnB1dCh7IGZpZWxkLCB2YWx1ZSwgb25DaGFuZ2UgfSkge1xuICBjb25zdCBpc1doYXRzYXBwTnVtYmVyID0gZmllbGQua2V5ID09PSAnbXNnOTFXaGF0c2FwcE51bWJlcidcbiAgY29uc3QgW2xvY2tlZCwgc2V0TG9ja2VkXSA9IHVzZVN0YXRlKGZpZWxkLnR5cGUgPT09ICdwYXNzd29yZCcpXG5cbiAgcmV0dXJuIChcbiAgICA8aW5wdXRcbiAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICB0eXBlPXtmaWVsZC50eXBlID09PSAncGFzc3dvcmQnID8gJ3Bhc3N3b3JkJyA6ICd0ZXh0J31cbiAgICAgIG5hbWU9e2B0b2tyaS0ke2ZpZWxkLmtleX1gfVxuICAgICAgdmFsdWU9e2lzV2hhdHNhcHBOdW1iZXIgPyBTdHJpbmcodmFsdWUgPz8gJycpLnJlcGxhY2UoL1xcRC9nLCAnJykgOiB2YWx1ZX1cbiAgICAgIHJlYWRPbmx5PXtsb2NrZWR9XG4gICAgICBpbnB1dE1vZGU9e2lzV2hhdHNhcHBOdW1iZXIgPyAnbnVtZXJpYycgOiB1bmRlZmluZWR9XG4gICAgICBtYXhMZW5ndGg9e2lzV2hhdHNhcHBOdW1iZXIgPyAxNSA6IHVuZGVmaW5lZH1cbiAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICBhdXRvQ29ycmVjdD1cIm9mZlwiXG4gICAgICBzcGVsbENoZWNrPXtmYWxzZX1cbiAgICAgIHBsYWNlaG9sZGVyPXtcbiAgICAgICAgZmllbGQudHlwZSA9PT0gJ3Bhc3N3b3JkJ1xuICAgICAgICAgID8gJ0xlYXZlIGJsYW5rIHRvIGtlZXAgdGhlIGN1cnJlbnQga2V5J1xuICAgICAgICAgIDogaXNXaGF0c2FwcE51bWJlclxuICAgICAgICAgICAgPyAnTVNHOTEgV2hhdHNBcHAgbnVtYmVyJ1xuICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIG9uRm9jdXM9eygpID0+IHNldExvY2tlZChmYWxzZSl9XG4gICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICBvbkNoYW5nZShcbiAgICAgICAgICBmaWVsZC5rZXksXG4gICAgICAgICAgaXNXaGF0c2FwcE51bWJlciA/IGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXEQvZywgJycpLnNsaWNlKDAsIDE1KSA6IGV2ZW50LnRhcmdldC52YWx1ZSxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIC8+XG4gIClcbn1cblxuY29uc3QgU09DSUFMX0ZJRUxEUyA9IFtcbiAgeyBrZXk6ICdmYWNlYm9vaycsIGxhYmVsOiAnRmFjZWJvb2snLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8vZmFjZWJvb2suY29tL3Rva3JpaWknIH0sXG4gIHsga2V5OiAnaW5zdGFncmFtJywgbGFiZWw6ICdJbnN0YWdyYW0nLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8vaW5zdGFncmFtLmNvbS90b2tyaWlpJyB9LFxuICB7IGtleTogJ3RocmVhZHMnLCBsYWJlbDogJ1RocmVhZHMnLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8vd3d3LnRocmVhZHMubmV0L0B0b2tyaWlpJyB9LFxuICB7IGtleTogJ3gnLCBsYWJlbDogJ1gnLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8veC5jb20vdG9rcmlpaScgfSxcbiAgeyBrZXk6ICdsaW5rZWRpbicsIGxhYmVsOiAnTGlua2VkSW4nLCBwbGFjZWhvbGRlcjogJ2h0dHBzOi8vd3d3LmxpbmtlZGluLmNvbS9jb21wYW55L3Rva3JpaWknIH0sXG5dXG5cbmZ1bmN0aW9uIHJlYWRTb2NpYWxMaW5rcyhyYXcpIHtcbiAgY29uc3QgbGlua3MgPSBPYmplY3QuZnJvbUVudHJpZXMoU09DSUFMX0ZJRUxEUy5tYXAoKGZpZWxkKSA9PiBbZmllbGQua2V5LCAnJ10pKVxuICBsZXQgdmFsdWUgPSByYXdcbiAgaWYgKCFyYXcpIHJldHVybiBsaW5rc1xuICBpZiAodHlwZW9mIHJhdyA9PT0gJ3N0cmluZycpIHtcbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSBKU09OLnBhcnNlKHJhdylcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBsaW5rc1xuICAgIH1cbiAgfVxuICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybiBsaW5rc1xuICBmb3IgKGNvbnN0IGZpZWxkIG9mIFNPQ0lBTF9GSUVMRFMpIHtcbiAgICBsaW5rc1tmaWVsZC5rZXldID0gdHlwZW9mIHZhbHVlW2ZpZWxkLmtleV0gPT09ICdzdHJpbmcnID8gdmFsdWVbZmllbGQua2V5XSA6ICcnXG4gIH1cbiAgcmV0dXJuIGxpbmtzXG59XG5cbmZ1bmN0aW9uIFNvY2lhbEZpZWxkcyh7IHZhbHVlLCBvbkNoYW5nZSB9KSB7XG4gIGNvbnN0IGxpbmtzID0gcmVhZFNvY2lhbExpbmtzKHZhbHVlKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1ub3RpZnktZmllbGRzXCI+XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+Rm9vdGVyIGljb25zPC9oND5cbiAgICAgICAgPHA+VGhlc2UgbGlua3MgYXBwZWFyIHVuZGVyIHRoZSBhZGRyZXNzIG9uIHRoZSB3ZWJzaXRlLiBMZWF2ZSBhIGJveCBlbXB0eSB0byBoaWRlIHRoYXQgaWNvbi48L3A+XG4gICAgICAgIHtTT0NJQUxfRklFTERTLm1hcCgoZmllbGQpID0+IChcbiAgICAgICAgICA8bGFiZWwga2V5PXtmaWVsZC5rZXl9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAge2ZpZWxkLmxhYmVsfVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJ1cmxcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJ1cmxcIlxuICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICBzcGVsbENoZWNrPXtmYWxzZX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e2ZpZWxkLnBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICB2YWx1ZT17bGlua3NbZmllbGQua2V5XX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICBvbkNoYW5nZShcbiAgICAgICAgICAgICAgICAgICdzb2NpYWxMaW5rcycsXG4gICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7IC4uLmxpbmtzLCBbZmllbGQua2V5XTogZXZlbnQudGFyZ2V0LnZhbHVlIH0pLFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICApKX1cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBOb3RpZmljYXRpb25zRmllbGRzKHsgcGFyYW1zLCBvbkNoYW5nZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1ub3RpZnktZmllbGRzXCI+XG4gICAgICB7Tk9USUZJQ0FUSU9OX1NFQ1RJT05TLm1hcCgoc2VjdGlvbikgPT4gKFxuICAgICAgICA8c2VjdGlvbiBrZXk9e3NlY3Rpb24uaWR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PntzZWN0aW9uLnRpdGxlfTwvaDQ+XG4gICAgICAgICAgPHA+e3NlY3Rpb24uaW50cm99PC9wPlxuICAgICAgICAgIHtzZWN0aW9uLmZpZWxkcy5tYXAoKGZpZWxkKSA9PlxuICAgICAgICAgICAgZmllbGQudHlwZSA9PT0gJ3N3aXRjaCcgPyAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtmaWVsZC5rZXl9IGNsYXNzTmFtZT1cInRva3JpLW5vdGlmeS1zd2l0Y2hcIj5cbiAgICAgICAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICAgICAgICBjaGVja2VkPXtpc0ZsYWdPbihwYXJhbXNbZmllbGQua2V5XSl9XG4gICAgICAgICAgICAgICAgICB0aXRsZT17ZmllbGQubGFiZWx9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IG9uQ2hhbmdlKGZpZWxkLmtleSwgbmV4dCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7ZmllbGQuaGludCA/IDxGaWVsZFRpcCB0ZXh0PXtmaWVsZC5oaW50fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGxhYmVsIGtleT17ZmllbGQua2V5fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1sYWJlbC1saW5lXCI+XG4gICAgICAgICAgICAgICAgICB7ZmllbGQubGFiZWx9XG4gICAgICAgICAgICAgICAgICB7ZmllbGQuaGludCA/IDxGaWVsZFRpcCB0ZXh0PXtmaWVsZC5oaW50fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxOb3RpZnlJbnB1dFxuICAgICAgICAgICAgICAgICAgZmllbGQ9e2ZpZWxkfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtc1tmaWVsZC5rZXldID8/ICcnfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICApLFxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IFNldHRpbmdzRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnZ2VuZXJhbCcpXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBiYW5uZXJGaWxlUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IG1vYmlsZUJhbm5lckZpbGVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgaGlnaGxpZ2h0RmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbYmFubmVyUHJldmlldywgc2V0QmFubmVyUHJldmlld10gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW21vYmlsZUJhbm5lclByZXZpZXcsIHNldE1vYmlsZUJhbm5lclByZXZpZXddID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtoaWdobGlnaHRQcmV2aWV3LCBzZXRIaWdobGlnaHRQcmV2aWV3XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbYmFubmVyVXBsb2FkaW5nLCBzZXRCYW5uZXJVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFttb2JpbGVCYW5uZXJVcGxvYWRpbmcsIHNldE1vYmlsZUJhbm5lclVwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2hpZ2hsaWdodFVwbG9hZGluZywgc2V0SGlnaGxpZ2h0VXBsb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY2F0ZWdvcmllcywgc2V0Q2F0ZWdvcmllc10gPSB1c2VTdGF0ZShbXSlcblxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBjdXN0b20gPSByZXNvdXJjZT8ub3B0aW9ucz8uY3VzdG9tIHx8IHt9XG4gIGNvbnN0IGFwaUJhc2VVcmwgPSB3aXRob3V0VHJhaWxpbmdTbGFzaChjdXN0b20uYXBpQmFzZVVybCB8fCAnL2FwaS92MScpXG4gIGNvbnN0IGFwcFVybCA9IGN1c3RvbS5hcHBVcmwgfHwgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICBjb25zdCBzZWxlY3RlZENhdGVnb3J5U2x1Z3MgPSBwYXJzZVNsdWdzKHBhcmFtcy5ob21lRmVhdHVyZWRDYXRlZ29yeVNsdWdzKVxuXG4gIGNvbnN0IGJhbm5lckltYWdlVXJsID0gdXNlTWVtbyhcbiAgICAoKSA9PiByZXNvbHZlSW1hZ2VVcmwocGFyYW1zLmhvbWVCYW5uZXJJbWFnZSwgYXBwVXJsKSxcbiAgICBbYXBwVXJsLCBwYXJhbXMuaG9tZUJhbm5lckltYWdlXSxcbiAgKVxuICBjb25zdCBtb2JpbGVCYW5uZXJJbWFnZVVybCA9IHVzZU1lbW8oXG4gICAgKCkgPT4gcmVzb2x2ZUltYWdlVXJsKHBhcmFtcy5ob21lTW9iaWxlQmFubmVySW1hZ2UsIGFwcFVybCksXG4gICAgW2FwcFVybCwgcGFyYW1zLmhvbWVNb2JpbGVCYW5uZXJJbWFnZV0sXG4gIClcbiAgY29uc3QgaGlnaGxpZ2h0SW1hZ2VVcmwgPSB1c2VNZW1vKFxuICAgICgpID0+IHJlc29sdmVJbWFnZVVybChwYXJhbXMuaG9tZUhpZ2hsaWdodEltYWdlLCBhcHBVcmwpLFxuICAgIFthcHBVcmwsIHBhcmFtcy5ob21lSGlnaGxpZ2h0SW1hZ2VdLFxuICApXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKVxuICAgIGlmIChoYXNoID09PSAnYXBwZWFyYW5jZScpIHtcbiAgICAgIHNldEFjdGl2ZVRhYignY2hhcmdlcycpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKGhhc2ggJiYgVEFCUy5zb21lKCh0YWIpID0+IHRhYi5pZCA9PT0gaGFzaCkpIHtcbiAgICAgIHNldEFjdGl2ZVRhYihoYXNoKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgJycsIGAjJHthY3RpdmVUYWJ9YClcbiAgfSwgW2FjdGl2ZVRhYl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGJhbm5lclByZXZpZXc/LnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIFVSTC5yZXZva2VPYmplY3RVUkwoYmFubmVyUHJldmlldylcbiAgICB9XG4gIH0sIFtiYW5uZXJQcmV2aWV3XSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9iaWxlQmFubmVyUHJldmlldz8uc3RhcnRzV2l0aCgnYmxvYjonKSkgVVJMLnJldm9rZU9iamVjdFVSTChtb2JpbGVCYW5uZXJQcmV2aWV3KVxuICAgIH1cbiAgfSwgW21vYmlsZUJhbm5lclByZXZpZXddKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChoaWdobGlnaHRQcmV2aWV3Py5zdGFydHNXaXRoKCdibG9iOicpKSBVUkwucmV2b2tlT2JqZWN0VVJMKGhpZ2hsaWdodFByZXZpZXcpXG4gICAgfVxuICB9LCBbaGlnaGxpZ2h0UHJldmlld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgaWdub3JlID0gZmFsc2VcbiAgICBmZXRjaChgJHthcGlCYXNlVXJsfS9jYXRlZ29yaWVzYClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgaWYgKCFpZ25vcmUpIHNldENhdGVnb3JpZXMoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbXSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0Q2F0ZWdvcmllcyhbXSlcbiAgICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlnbm9yZSA9IHRydWVcbiAgICB9XG4gIH0sIFthcGlCYXNlVXJsXSlcblxuICBjb25zdCB1cGxvYWRJbWFnZSA9IGFzeW5jIChldmVudCwgZmllbGQsIHNldFByZXZpZXcsIHNldEJ1c3ksIGZpbGVSZWYsIHN1Y2Nlc3NNZXNzYWdlKSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdXG4gICAgaWYgKCFmaWxlKSByZXR1cm5cblxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZvbGRlcicsICdnZW5lcmFsJylcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIGNvbnN0IGxvY2FsUHJldmlld1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSlcbiAgICBzZXRQcmV2aWV3KGxvY2FsUHJldmlld1VybClcbiAgICBzZXRCdXN5KHRydWUpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9tZWRpYS91cGxvYWRgLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIH0pXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdJbWFnZSB1cGxvYWQgZmFpbGVkJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1lZGlhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICBoYW5kbGVDaGFuZ2UoZmllbGQsIG1lZGlhLnBhdGgpXG4gICAgICBzZXRQcmV2aWV3KHJlc29sdmVJbWFnZVVybChtZWRpYS5wYXRoLCBhcHBVcmwpKVxuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogc3VjY2Vzc01lc3NhZ2UsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgdXBsb2FkIGltYWdlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCkgZmlsZVJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgICBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgc2V0dGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKG5vdGljZT8udHlwZSA9PT0gJ3N1Y2Nlc3MnIHx8IHJlc3BvbnNlPy5kYXRhPy5yZWNvcmQpIHtcbiAgICAgICAgICBhZGROb3RpY2Uoe1xuICAgICAgICAgICAgbWVzc2FnZTogJ1NldHRpbmdzIHNhdmVkIHN1Y2Nlc3NmdWxseScsXG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHNldHRpbmdzLiBQbGVhc2UgdHJ5IGFnYWluLicsXG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBmbGV4IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBjbGFzc05hbWU9XCJ0b2tyaS1zZXR0aW5ncy1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLXNldHRpbmdzLXRhYnNcIiBtYj1cInhsXCI+XG4gICAgICAgIHtUQUJTLm1hcCgodGFiKSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAga2V5PXt0YWIuaWR9XG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17YHRva3JpLXNldHRpbmdzLXRhYiR7YWN0aXZlVGFiID09PSB0YWIuaWQgPyAnIGlzLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKHRhYi5pZCl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3RhYi5sYWJlbH1cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKSl9XG4gICAgICA8L0JveD5cblxuICAgICAgPERyYXdlckNvbnRlbnQ+XG4gICAgICAgIHtUQUJTLm1hcCgodGFiKSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHJlc291cmNlLmVkaXRQcm9wZXJ0aWVzLmZpbHRlcigocHJvcGVydHkpID0+XG4gICAgICAgICAgICB0YWIuZmllbGRzLmluY2x1ZGVzKHByb3BlcnR5LnByb3BlcnR5UGF0aCksXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAga2V5PXt0YWIuaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLXNldHRpbmdzLXBhbmVsXCJcbiAgICAgICAgICAgICAgcD1cInhsXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogYWN0aXZlVGFiID09PSB0YWIuaWQgPyAnYmxvY2snIDogJ25vbmUnIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxINCBtYj1cInNtXCI+e3RhYi5sYWJlbH08L0g0PlxuICAgICAgICAgICAgICA8VGV4dCBtYj1cInhsXCIgb3BhY2l0eT17MC43NX0+XG4gICAgICAgICAgICAgICAge3RhYi5pZCA9PT0gJ2NoYXJnZXMnXG4gICAgICAgICAgICAgICAgICA/ICdTZXQgY29weSBhbmQgcHJpY2VzIGZvciBNb3JuaW5nIGFuZCBFeHByZXNzIGRlbGl2ZXJ5LiBIYW5kbGluZyBmZWUgaXMgYWRkZWQgdG8gZXZlcnkgb3JkZXIuJ1xuICAgICAgICAgICAgICAgICAgOiB0YWIuaWQgPT09ICdob21lcGFnZSdcbiAgICAgICAgICAgICAgICAgICAgPyAnVGhlc2UgaW1hZ2VzIGFuZCBjYXRlZ29yaWVzIGFwcGVhciBvbiB0aGUgd2Vic2l0ZSBob21lcGFnZS4gQ2xpY2sgU2F2ZSBjaGFuZ2VzIGFmdGVyIHVwbG9hZGluZy4nXG4gICAgICAgICAgICAgICAgICAgIDogdGFiLmlkID09PSAnc29jaWFsJ1xuICAgICAgICAgICAgICAgICAgICAgID8gJ1Bhc3RlIGVhY2ggcGFnZSBsaW5rLiBBIGxpbmsgd2l0aG91dCBodHRwczovLyBpcyBjb21wbGV0ZWQgZm9yIHlvdS4gU2F2ZSBjaGFuZ2VzIHdoZW4geW91IGFyZSBkb25lLidcbiAgICAgICAgICAgICAgICAgICAgICA6IHRhYi5pZCA9PT0gJ25vdGlmaWNhdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgICAgPyAnQXV0aCBrZXksIFdoYXRzQXBwIG51bWJlciwgYW5kIG5hbWVzcGFjZSBhcmUgc2hhcmVkLiBFYWNoIHRlbXBsYXRlIGhhcyBpdHMgb3duIG5hbWUgYW5kIG9uL29mZiB0b2dnbGUuIE9yZGVyIGFuZCBwYXJ0bmVyIG1lc3NhZ2VzIHNlbmQgb25seSBhZnRlciBDT0QgaXMgcGxhY2VkIG9yIHRoZSBvbmxpbmUgcGF5bWVudCBpcyBjb25maXJtZWQuJ1xuICAgICAgICAgICAgICAgICAgICAgIDogJ1VwZGF0ZSB5b3VyIHN0b3JlIHNldHRpbmdzIGFuZCBjbGljayBTYXZlIGNoYW5nZXMgYmVsb3cuJ31cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICB7dGFiLmlkID09PSAnY2hhcmdlcycgPyAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaGFyZ2VzLWZpZWxkc1wiPlxuICAgICAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGg0Pk1vcm5pbmcgZGVsaXZlcnk8L2g0PlxuICAgICAgICAgICAgICAgICAgICA8cD5TaG93biBhdCBjaGVja291dCB3aGVuIHRoaXMgb3B0aW9uIGlzIG9uIGZvciB0aGUgcGluY29kZS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICBUaXRsZVxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8ubW9ybmluZ0RlbGl2ZXJ5VGl0bGUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdEZWxpdmVyeVRpdGxlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRmxhd2xlc3MgTW9ybmluZyBEZWxpdmVyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIFN1YnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5tb3JuaW5nRGVsaXZlcnlTdWJ0aXRsZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnbW9ybmluZ0RlbGl2ZXJ5U3VidGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJGcmVzaG5lc3MgR3VhcmFudGVlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgU2hpcHBpbmcgZmVlICjigrkpXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8ubW9ybmluZ1NoaXBwaW5nRmVlID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdTaGlwcGluZ0ZlZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgRnJlZSBhYm92ZSAo4oK5KVxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/Lm1vcm5pbmdGcmVlQWJvdmUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnbW9ybmluZ0ZyZWVBYm92ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPjAgbWVhbnMgbm8gZnJlZSBkZWxpdmVyeTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoND5FeHByZXNzIGRlbGl2ZXJ5PC9oND5cbiAgICAgICAgICAgICAgICAgICAgPHA+U2hvd24gYXQgY2hlY2tvdXQuIERpc2FibGVkIHBpbmNvZGVzIHN0aWxsIHNlZSB0aGlzIGFzIGNvbWluZyBzb29uLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIFRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5leHByZXNzRGVsaXZlcnlUaXRsZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc0RlbGl2ZXJ5VGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTYW1lIGRheVwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIFN1YnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5leHByZXNzRGVsaXZlcnlTdWJ0aXRsZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc0RlbGl2ZXJ5U3VidGl0bGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJPbi1EZW1hbmQgTHV4dXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBTaGlwcGluZyBmZWUgKOKCuSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlY29yZD8ucGFyYW1zPy5leHByZXNzU2hpcHBpbmdGZWUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnZXhwcmVzc1NoaXBwaW5nRmVlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBGcmVlIGFib3ZlICjigrkpXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZWNvcmQ/LnBhcmFtcz8uZXhwcmVzc0ZyZWVBYm92ZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdleHByZXNzRnJlZUFib3ZlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+MCBtZWFucyBubyBmcmVlIGRlbGl2ZXJ5PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbCB0b2tyaS1jaGFyZ2VzLWhhbmRsaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgIEhhbmRsaW5nIGNoYXJnZSAo4oK5KVxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmVjb3JkPy5wYXJhbXM/LmhhbmRsaW5nRmVlID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnaGFuZGxpbmdGZWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+Q2FydCBoYW5kbGluZyBmZWUgYWRkZWQgdG8gZXZlcnkgb3JkZXI8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApIDogdGFiLmlkID09PSAnaG9tZXBhZ2UnID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktaG9tZXBhZ2UtZmllbGRzXCI+XG4gICAgICAgICAgICAgICAgICA8SW1hZ2VVcGxvYWRlclxuICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIkhvbWUgYmFubmVyIGltYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgaGludD1cIkRlc2t0b3AgLyBsYXJnZS1zY3JlZW4gaGVybyBiYW5uZXIuIEpQRywgUE5HLCBHSUYsIG9yIFdlYlAgdXAgdG8gNU1CLlwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtiYW5uZXJJbWFnZVVybH1cbiAgICAgICAgICAgICAgICAgICAgcHJldmlld1VybD17YmFubmVyUHJldmlld31cbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkaW5nPXtiYW5uZXJVcGxvYWRpbmd9XG4gICAgICAgICAgICAgICAgICAgIGZpbGVSZWY9e2Jhbm5lckZpbGVSZWZ9XG4gICAgICAgICAgICAgICAgICAgIHdpZGVcbiAgICAgICAgICAgICAgICAgICAgb25VcGxvYWQ9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICB1cGxvYWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2hvbWVCYW5uZXJJbWFnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRCYW5uZXJQcmV2aWV3LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0QmFubmVyVXBsb2FkaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYmFubmVyRmlsZVJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICdCYW5uZXIgaW1hZ2UgdXBsb2FkZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDxJbWFnZVVwbG9hZGVyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPVwiSG9tZSBtb2JpbGUgYmFubmVyIGltYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgaGludD1cIlNob3duIG9uIHBob25lcy4gSWYgZW1wdHksIHRoZSBkZXNrdG9wIGJhbm5lciBpcyB1c2VkIGluc3RlYWQuXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e21vYmlsZUJhbm5lckltYWdlVXJsfVxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3VXJsPXttb2JpbGVCYW5uZXJQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRpbmc9e21vYmlsZUJhbm5lclVwbG9hZGluZ31cbiAgICAgICAgICAgICAgICAgICAgZmlsZVJlZj17bW9iaWxlQmFubmVyRmlsZVJlZn1cbiAgICAgICAgICAgICAgICAgICAgb25VcGxvYWQ9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICB1cGxvYWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2hvbWVNb2JpbGVCYW5uZXJJbWFnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRNb2JpbGVCYW5uZXJQcmV2aWV3LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0TW9iaWxlQmFubmVyVXBsb2FkaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9iaWxlQmFubmVyRmlsZVJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICdNb2JpbGUgYmFubmVyIGltYWdlIHVwbG9hZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8SW1hZ2VVcGxvYWRlclxuICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIkZydWl0IGhpZ2hsaWdodCBpbWFnZVwiXG4gICAgICAgICAgICAgICAgICAgIGhpbnQ9XCJSZXBsYWNlcyB0aGUga2l3aSBpbWFnZSBpbiDigJxUaGUgU21hbGwgRnJ1aXQgd2l0aCBhIEJpZyBQdW5jaOKAnSBvbiB0aGUgd2Vic2l0ZS5cIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17aGlnaGxpZ2h0SW1hZ2VVcmx9XG4gICAgICAgICAgICAgICAgICAgIHByZXZpZXdVcmw9e2hpZ2hsaWdodFByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZGluZz17aGlnaGxpZ2h0VXBsb2FkaW5nfVxuICAgICAgICAgICAgICAgICAgICBmaWxlUmVmPXtoaWdobGlnaHRGaWxlUmVmfVxuICAgICAgICAgICAgICAgICAgICBvblVwbG9hZD17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIHVwbG9hZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaG9tZUhpZ2hsaWdodEltYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEhpZ2hsaWdodFByZXZpZXcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRIaWdobGlnaHRVcGxvYWRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRGaWxlUmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0hpZ2hsaWdodCBpbWFnZSB1cGxvYWRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICBIb21lcGFnZSBjYXRlZ29yaWVzXG4gICAgICAgICAgICAgICAgICAgIDxTZWFyY2hhYmxlTXVsdGlTZWxlY3RcbiAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zPXtjYXRlZ29yaWVzLm1hcCgoaXRlbSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLnNsdWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogaXRlbS5sYWJlbCB8fCBpdGVtLnRpdGxlIHx8IGl0ZW0uc2x1ZyxcbiAgICAgICAgICAgICAgICAgICAgICB9KSl9XG4gICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkQ2F0ZWdvcnlTbHVnc31cbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHNsdWdzKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlQ2hhbmdlKCdob21lRmVhdHVyZWRDYXRlZ29yeVNsdWdzJywgSlNPTi5zdHJpbmdpZnkoc2x1Z3MpKVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBhbmQgc2VsZWN0IGNhdGVnb3JpZXNcIlxuICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIGNhdGVnb3JpZXNcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgVGhlc2UgY2F0ZWdvcmllcyBsb2FkIG9uIHRoZSB3ZWJzaXRlIGFmdGVyIHRoZSBmcnVpdCBoaWdobGlnaHQgc2VjdGlvbiwgb25lIGF0XG4gICAgICAgICAgICAgICAgICAgICAgYSB0aW1lIGFzIHRoZSB2aXNpdG9yIHNjcm9sbHMuXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiB0YWIuaWQgPT09ICdub3RpZmljYXRpb25zJyA/IChcbiAgICAgICAgICAgICAgICA8Tm90aWZpY2F0aW9uc0ZpZWxkcyBwYXJhbXM9e3BhcmFtc30gb25DaGFuZ2U9e2hhbmRsZUNoYW5nZX0gLz5cbiAgICAgICAgICAgICAgKSA6IHRhYi5pZCA9PT0gJ3NvY2lhbCcgPyAoXG4gICAgICAgICAgICAgICAgPFNvY2lhbEZpZWxkcyB2YWx1ZT17cGFyYW1zLnNvY2lhbExpbmtzfSBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlfSAvPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMubWFwKChwcm9wZXJ0eSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPEJhc2VQcm9wZXJ0eUNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICBrZXk9e3Byb3BlcnR5LnByb3BlcnR5UGF0aH1cbiAgICAgICAgICAgICAgICAgICAgd2hlcmU9XCJlZGl0XCJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk9e3Byb3BlcnR5fVxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgICAgICAgICAgICAgIHJlY29yZD17cmVjb3JkfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICAgIDwvRHJhd2VyQ29udGVudD5cblxuICAgICAgPERyYXdlckZvb3Rlcj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICBTYXZlIGNoYW5nZXNcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0RyYXdlckZvb3Rlcj5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBTZXR0aW5nc0VkaXRcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBTdGF0dXNTd2l0Y2gsIGlzRmxhZ09uIH0gZnJvbSAnLi9mb3JtLWNvbnRyb2xzLmpzeCdcblxuZnVuY3Rpb24gRmllbGRFcnJvcih7IGVycm9yIH0pIHtcbiAgaWYgKCFlcnJvcj8ubWVzc2FnZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9yLm1lc3NhZ2V9PC9zcGFuPlxufVxuXG5jb25zdCBBcHBSZWxlYXNlRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UuaWQpXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGVycm9ycyA9IHJlY29yZD8uZXJyb3JzIHx8IHt9XG4gIGNvbnN0IHBsYXRmb3JtID0gcGFyYW1zLnBsYXRmb3JtIHx8IHJlY29yZD8uaWQgfHwgJ2FwcCdcbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlKSBhZGROb3RpY2Uobm90aWNlKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgdGhlIGFwcCB1cGRhdGUgcnVsZScsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57cGxhdGZvcm0gPT09ICdpb3MnID8gJ2lQaG9uZScgOiAnQW5kcm9pZCd9IHVwZGF0ZTwvSDM+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIj5cbiAgICAgICAgICBMZWF2ZSB0aGlzIG9mZiB1bnRpbCB0aGUgbmV3IGFwcCBpcyBhY3R1YWxseSBhdmFpbGFibGUgaW4gdGhlIHN0b3JlLiBSYWlzaW5nIHRoZSBtaW5pbXVtXG4gICAgICAgICAgYmVmb3JlIHRoYXQgc2VuZHMgcGVvcGxlIHRvIGEgc3RvcmUgcGFnZSB3aXRoIG5vdGhpbmcgdG8gZG93bmxvYWQuXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+VHVybiB0aGlzIHBsYXRmb3JtIG9uPC9oND5cbiAgICAgICAgPHA+T2ZmIG1lYW5zIHRoZSBhcHAgb3BlbnMgbm9ybWFsbHksIGV2ZW4gaWYgdGhlIG51bWJlcnMgYmVsb3cgYXJlIGZpbGxlZCBpbi48L3A+XG4gICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICBjaGVja2VkPXtpc0ZsYWdPbihwYXJhbXMuZW5hYmxlZCl9XG4gICAgICAgICAgb25MYWJlbD1cIk9uXCJcbiAgICAgICAgICBvZmZMYWJlbD1cIk9mZlwiXG4gICAgICAgICAgdGl0bGU9e2lzRmxhZ09uKHBhcmFtcy5lbmFibGVkKSA/ICdDaGVja2luZyB2ZXJzaW9ucycgOiAnTm90IGNoZWNraW5nJ31cbiAgICAgICAgICBoaW50PXtpc0ZsYWdPbihwYXJhbXMuZW5hYmxlZCkgPyAnVGhlIGFwcCB3aWxsIHJlYWQgdGhlc2UgcnVsZXMnIDogJ05vIHVwZGF0ZSBzY3JlZW4gaXMgc2hvd24nfVxuICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2VuYWJsZWQnLCBuZXh0KX1cbiAgICAgICAgLz5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkJ1aWxkIG51bWJlcnM8L2g0PlxuICAgICAgICA8cD5Vc2UgdGhlIGJ1aWxkIG51bWJlciwgbm90IHRoZSBuYW1lIDEuMC4zLiBBbmRyb2lkIGNhbGxzIGl0IHZlcnNpb24gY29kZS4gaVBob25lIHVzZXMgdGhlIGJ1aWxkIG51bWJlci48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIExhdGVzdCBidWlsZFxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmxhdGVzdEJ1aWxkID8/IDB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdsYXRlc3RCdWlsZCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPk9sZGVyIGJ1aWxkcyBzZWUgVXBkYXRlIGFuZCBOb3Qgbm93Ljwvc3Bhbj5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMubGF0ZXN0QnVpbGR9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBNaW5pbXVtIGJ1aWxkXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubWluaW11bUJ1aWxkID8/IDB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdtaW5pbXVtQnVpbGQnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5Bbnl0aGluZyBvbGRlciBtdXN0IHVwZGF0ZS4gVXNlIDAgd2hpbGUgeW91IGFyZSBub3QgZm9yY2luZyBhbnlvbmUuPC9zcGFuPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5taW5pbXVtQnVpbGR9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBCbG9ja2VkIGJ1aWxkc1xuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYmxvY2tlZEJ1aWxkcyB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdibG9ja2VkQnVpbGRzJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiNywgOVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+T25seSB0aGVzZSBleGFjdCBidWlsZHMgYXJlIHN0b3BwZWQuIE90aGVyIG9sZGVyIGJ1aWxkcyBjYW4ga2VlcCB3b3JraW5nLjwvc3Bhbj5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIEFzayBhZ2FpbiBhZnRlciAoaG91cnMpXG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnJlbWluZEFmdGVySG91cnMgPz8gMjR9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgncmVtaW5kQWZ0ZXJIb3VycycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1oaW50XCI+QWZ0ZXIgTm90IG5vdywgdGhlIHNvZnQgcHJvbXB0IHN0YXlzIHF1aWV0IGZvciB0aGlzIGxvbmcuPC9zcGFuPlxuICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMucmVtaW5kQWZ0ZXJIb3Vyc30gLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PlVwZGF0ZSBtZXNzYWdlPC9oND5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIFRpdGxlXG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy50aXRsZSB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd0aXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIE1lc3NhZ2VcbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICByb3dzPXszfVxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5tZXNzYWdlIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ21lc3NhZ2UnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5QYXVzZSB0aGUgYXBwPC9oND5cbiAgICAgICAgPHA+VXNlIHRoaXMgZm9yIGFuIG91dGFnZS4gSXQgZG9lcyBub3Qgc2VuZCBhbnlvbmUgdG8gdGhlIHN0b3JlLjwvcD5cbiAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgIGNoZWNrZWQ9e2lzRmxhZ09uKHBhcmFtcy5tYWludGVuYW5jZSl9XG4gICAgICAgICAgb25MYWJlbD1cIlBhdXNlZFwiXG4gICAgICAgICAgb2ZmTGFiZWw9XCJPcGVuXCJcbiAgICAgICAgICB0aXRsZT17aXNGbGFnT24ocGFyYW1zLm1haW50ZW5hbmNlKSA/ICdBcHAgaXMgcGF1c2VkJyA6ICdBcHAgaXMgb3Blbid9XG4gICAgICAgICAgaGludD17aXNGbGFnT24ocGFyYW1zLm1haW50ZW5hbmNlKSA/ICdQZW9wbGUgc2VlIHRoaXMgbWVzc2FnZSBpbnN0ZWFkIG9mIHRoZSBzaG9wJyA6ICdNYWludGVuYW5jZSBzY3JlZW4gaXMgaGlkZGVuJ31cbiAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdtYWludGVuYW5jZScsIG5leHQpfVxuICAgICAgICAvPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgUGF1c2UgdGl0bGVcbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm1haW50ZW5hbmNlVGl0bGUgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbWFpbnRlbmFuY2VUaXRsZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIFBhdXNlIG1lc3NhZ2VcbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICByb3dzPXszfVxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5tYWludGVuYW5jZU1lc3NhZ2UgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbWFpbnRlbmFuY2VNZXNzYWdlJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgU2F2ZSBydWxlXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwUmVsZWFzZUVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmZ1bmN0aW9uIHBhcnNlU2x1Z3MocmF3KSB7XG4gIGlmICghcmF3KSByZXR1cm4gW11cbiAgaWYgKEFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIHJhdy5tYXAoKGl0ZW0pID0+IFN0cmluZyhpdGVtKS50cmltKCkpLmZpbHRlcihCb29sZWFuKVxuICBpZiAodHlwZW9mIHJhdyA9PT0gJ3N0cmluZycpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJzZWQpKSByZXR1cm4gcGFyc2VTbHVncyhwYXJzZWQpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmVcbiAgICB9XG4gICAgcmV0dXJuIHJhd1xuICAgICAgLnNwbGl0KCcsJylcbiAgICAgIC5tYXAoKGl0ZW0pID0+IGl0ZW0udHJpbSgpKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICB9XG4gIHJldHVybiBbXVxufVxuXG5mdW5jdGlvbiBwYWQobnVtKSB7XG4gIHJldHVybiBTdHJpbmcobnVtKS5wYWRTdGFydCgyLCAnMCcpXG59XG5cbmZ1bmN0aW9uIHRvRGF0ZXRpbWVWYWx1ZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJydcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxuICBpZiAoTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuICcnXG4gIHJldHVybiBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9LSR7cGFkKGRhdGUuZ2V0TW9udGgoKSArIDEpfS0ke3BhZChkYXRlLmdldERhdGUoKSl9VCR7cGFkKGRhdGUuZ2V0SG91cnMoKSl9OiR7cGFkKGRhdGUuZ2V0TWludXRlcygpKX1gXG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGV0aW1lTGFiZWwodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcbiAgaWYgKE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiAnJ1xuICByZXR1cm4gZGF0ZS50b0xvY2FsZVN0cmluZygnZW4tSU4nLCB7XG4gICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgbW9udGg6ICdzaG9ydCcsXG4gICAgeWVhcjogJ251bWVyaWMnLFxuICAgIGhvdXI6ICcyLWRpZ2l0JyxcbiAgICBtaW51dGU6ICcyLWRpZ2l0JyxcbiAgfSlcbn1cblxuZnVuY3Rpb24gdXNlQW5jaG9yZWRNZW51KG9wZW4pIHtcbiAgY29uc3Qgd3JhcFJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbb3BlblVwLCBzZXRPcGVuVXBdID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSB3cmFwUmVmLmN1cnJlbnRcbiAgICAgIGlmICghbm9kZSkgcmV0dXJuXG4gICAgICBjb25zdCByZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3Qgc3BhY2VCZWxvdyA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3QuYm90dG9tXG4gICAgICBzZXRPcGVuVXAoc3BhY2VCZWxvdyA8IDI0MCAmJiByZWN0LnRvcCA+IHNwYWNlQmVsb3cpXG4gICAgfVxuXG4gICAgdXBkYXRlKClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB1cGRhdGUsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdXBkYXRlLCB0cnVlKVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHJldHVybiB7IHdyYXBSZWYsIG9wZW5VcCB9XG59XG5cbmZ1bmN0aW9uIENob2ljZUNhcmQoeyBzZWxlY3RlZCwgdGl0bGUsIGhpbnQsIG9uQ2xpY2sgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgdG9rcmktY2hvaWNlLWNhcmQke3NlbGVjdGVkID8gJyBpcy1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICA+XG4gICAgICA8c3Ryb25nPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgIDxzcGFuPntoaW50fTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBBbmNob3JlZFNlbGVjdCh7IHZhbHVlLCBvcHRpb25zLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgfSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuICBjb25zdCBzZWxlY3RlZCA9IG9wdGlvbnMuZmluZCgoaXRlbSkgPT4gaXRlbS52YWx1ZSA9PT0gdmFsdWUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdFwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1jb250cm9sXCIgb25DbGljaz17KCkgPT4gc2V0T3BlbigoY3VycmVudCkgPT4gIWN1cnJlbnQpfT5cbiAgICAgICAgPHNwYW4+e3NlbGVjdGVkPy5sYWJlbCB8fCBwbGFjZWhvbGRlcn08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNhcmV0XCI+e29wZW4gPyAn4pa0JyA6ICfilr4nfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICB7b3B0aW9ucy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAga2V5PXtpdGVtLnZhbHVlfVxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3Qtb3B0aW9uJHtpdGVtLnZhbHVlID09PSB2YWx1ZSA/ICcgaXMtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKGl0ZW0udmFsdWUpXG4gICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBTZWFyY2hhYmxlTXVsdGlTZWxlY3QoeyBvcHRpb25zLCBzZWxlY3RlZCwgb25DaGFuZ2UsIHBsYWNlaG9sZGVyLCBzZWFyY2hQbGFjZWhvbGRlciB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIGNvbnN0IHNlbGVjdGVkU2V0ID0gdXNlTWVtbygoKSA9PiBuZXcgU2V0KHNlbGVjdGVkKSwgW3NlbGVjdGVkXSlcbiAgY29uc3Qgc2VsZWN0ZWRPcHRpb25zID0gb3B0aW9ucy5maWx0ZXIoKGl0ZW0pID0+IHNlbGVjdGVkU2V0LmhhcyhpdGVtLnZhbHVlKSlcbiAgY29uc3QgZmlsdGVyZWQgPSBvcHRpb25zLmZpbHRlcigoaXRlbSkgPT5cbiAgICBgJHtpdGVtLmxhYmVsfSAke2l0ZW0udmFsdWV9YC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpKSxcbiAgKVxuXG4gIGNvbnN0IHRvZ2dsZSA9ICh2YWx1ZSkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFNldC5oYXModmFsdWUpKSBvbkNoYW5nZShzZWxlY3RlZC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IHZhbHVlKSlcbiAgICBlbHNlIG9uQ2hhbmdlKFsuLi5zZWxlY3RlZCwgdmFsdWVdKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0XCIgcmVmPXt3cmFwUmVmfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNvbnRyb2xcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKCh2YWx1ZSkgPT4gIXZhbHVlKX0+XG4gICAgICAgIHtzZWxlY3RlZE9wdGlvbnMubGVuZ3RoID8gKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNoaXBzXCI+XG4gICAgICAgICAgICB7c2VsZWN0ZWRPcHRpb25zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8c3BhbiBrZXk9e2l0ZW0udmFsdWV9IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNoaXBcIj5cbiAgICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgcm9sZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICB0b2dnbGUoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgw5dcbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1wbGFjZWhvbGRlclwiPntwbGFjZWhvbGRlcn08L3NwYW4+XG4gICAgICAgICl9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWNhcmV0XCI+e29wZW4gPyAn4pa0JyA6ICfilr4nfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3QtbWVudSR7b3BlblVwID8gJyBpcy11cCcgOiAnJ31gfT5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICB2YWx1ZT17cXVlcnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRRdWVyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3NlYXJjaFBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW11bHRpc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICAgIHtmaWx0ZXJlZC5sZW5ndGggPyAoXG4gICAgICAgICAgICAgIGZpbHRlcmVkLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSBzZWxlY3RlZFNldC5oYXMoaXRlbS52YWx1ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGtleT17aXRlbS52YWx1ZX0gY2xhc3NOYW1lPXtgdG9rcmktbXVsdGlzZWxlY3Qtb3B0aW9uJHtjaGVja2VkID8gJyBpcy1zZWxlY3RlZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e2NoZWNrZWR9IG9uQ2hhbmdlPXsoKSA9PiB0b2dnbGUoaXRlbS52YWx1ZSl9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tdWx0aXNlbGVjdC1lbXB0eVwiPk5vIG1hdGNoZXM8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gRGF0ZVRpbWVQaWNrZXIoeyB2YWx1ZSwgb25DaGFuZ2UsIHBsYWNlaG9sZGVyIH0pIHtcbiAgY29uc3QgcGFyc2VkID0gdmFsdWUgPyBuZXcgRGF0ZSh2YWx1ZSkgOiBudWxsXG4gIGNvbnN0IHZhbGlkID0gcGFyc2VkICYmICFOdW1iZXIuaXNOYU4ocGFyc2VkLmdldFRpbWUoKSkgPyBwYXJzZWQgOiBudWxsXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbW9udGhEYXRlLCBzZXRNb250aERhdGVdID0gdXNlU3RhdGUodmFsaWQgfHwgbmV3IERhdGUoKSlcbiAgY29uc3QgW2hvdXJzLCBzZXRIb3Vyc10gPSB1c2VTdGF0ZSh2YWxpZCA/IHBhZCh2YWxpZC5nZXRIb3VycygpKSA6ICcwMCcpXG4gIGNvbnN0IFttaW51dGVzLCBzZXRNaW51dGVzXSA9IHVzZVN0YXRlKHZhbGlkID8gcGFkKHZhbGlkLmdldE1pbnV0ZXMoKSkgOiAnMDAnKVxuICBjb25zdCB7IHdyYXBSZWYsIG9wZW5VcCB9ID0gdXNlQW5jaG9yZWRNZW51KG9wZW4pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvY0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXdyYXBSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Eb2NDbGljaylcbiAgfSwgW3dyYXBSZWZdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCF2YWxpZCkgcmV0dXJuXG4gICAgc2V0TW9udGhEYXRlKHZhbGlkKVxuICAgIHNldEhvdXJzKHBhZCh2YWxpZC5nZXRIb3VycygpKSlcbiAgICBzZXRNaW51dGVzKHBhZCh2YWxpZC5nZXRNaW51dGVzKCkpKVxuICB9LCBbdmFsdWVdKVxuXG4gIGNvbnN0IHllYXIgPSBtb250aERhdGUuZ2V0RnVsbFllYXIoKVxuICBjb25zdCBtb250aCA9IG1vbnRoRGF0ZS5nZXRNb250aCgpXG4gIGNvbnN0IGZpcnN0RGF5ID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpLmdldERheSgpXG4gIGNvbnN0IHRvdGFsRGF5cyA9IG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMCkuZ2V0RGF0ZSgpXG4gIGNvbnN0IGNlbGxzID0gW11cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaXJzdERheTsgaSArPSAxKSBjZWxscy5wdXNoKG51bGwpXG4gIGZvciAobGV0IGRheSA9IDE7IGRheSA8PSB0b3RhbERheXM7IGRheSArPSAxKSBjZWxscy5wdXNoKGRheSlcblxuICBjb25zdCBhcHBseSA9IChkYXksIG5leHRIb3VycyA9IGhvdXJzLCBuZXh0TWludXRlcyA9IG1pbnV0ZXMpID0+IHtcbiAgICBjb25zdCBuZXh0ID0gYCR7eWVhcn0tJHtwYWQobW9udGggKyAxKX0tJHtwYWQoZGF5KX1UJHtwYWQoTnVtYmVyKG5leHRIb3VycykgfHwgMCl9OiR7cGFkKE51bWJlcihuZXh0TWludXRlcykgfHwgMCl9YFxuICAgIG9uQ2hhbmdlKG5leHQpXG4gIH1cblxuICBjb25zdCBzZWxlY3RlZERheSA9XG4gICAgdmFsaWQgJiYgdmFsaWQuZ2V0RnVsbFllYXIoKSA9PT0geWVhciAmJiB2YWxpZC5nZXRNb250aCgpID09PSBtb250aCA/IHZhbGlkLmdldERhdGUoKSA6IG51bGxcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlclwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWNvbnRyb2xcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKChjdXJyZW50KSA9PiAhY3VycmVudCl9PlxuICAgICAgICA8c3Bhbj57dmFsaWQgPyBmb3JtYXREYXRldGltZUxhYmVsKHZhbGlkKSA6IHBsYWNlaG9sZGVyfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4+8J+ThTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdG9rcmktZGF0ZXBpY2tlci1wb3Ake29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLW5hdlwiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0TW9udGhEYXRlKG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgMSkpfT5cbiAgICAgICAgICAgICAg4oC5XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxzdHJvbmc+XG4gICAgICAgICAgICAgIHttb250aERhdGUudG9Mb2NhbGVTdHJpbmcoJ2VuLUlOJywgeyBtb250aDogJ2xvbmcnLCB5ZWFyOiAnbnVtZXJpYycgfSl9XG4gICAgICAgICAgICA8L3N0cm9uZz5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE1vbnRoRGF0ZShuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDEpKX0+XG4gICAgICAgICAgICAgIOKAulxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLXdlZWtcIj5cbiAgICAgICAgICAgIHtbJ1N1JywgJ01vJywgJ1R1JywgJ1dlJywgJ1RoJywgJ0ZyJywgJ1NhJ10ubWFwKChsYWJlbCkgPT4gKFxuICAgICAgICAgICAgICA8c3BhbiBrZXk9e2xhYmVsfT57bGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1kYXRlcGlja2VyLWdyaWRcIj5cbiAgICAgICAgICAgIHtjZWxscy5tYXAoKGRheSwgaW5kZXgpID0+XG4gICAgICAgICAgICAgIGRheSA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICBrZXk9e2Ake3llYXJ9LSR7bW9udGh9LSR7ZGF5fWB9XG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2VsZWN0ZWREYXkgPT09IGRheSA/ICdpcy1zZWxlY3RlZCcgOiAnJ31cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGFwcGx5KGRheSl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2RheX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8c3BhbiBrZXk9e2BlbXB0eS0ke2luZGV4fWB9IC8+XG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktZGF0ZXBpY2tlci10aW1lXCI+XG4gICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgIEhvdXJcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgbWF4PVwiMjNcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtob3Vyc31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gcGFkKE1hdGgubWluKDIzLCBNYXRoLm1heCgwLCBOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKSB8fCAwKSkpXG4gICAgICAgICAgICAgICAgICBzZXRIb3VycyhuZXh0KVxuICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkRGF5KSBhcHBseShzZWxlY3RlZERheSwgbmV4dCwgbWludXRlcylcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgICAgTWludXRlXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIG1heD1cIjU5XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17bWludXRlc31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gcGFkKE1hdGgubWluKDU5LCBNYXRoLm1heCgwLCBOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKSB8fCAwKSkpXG4gICAgICAgICAgICAgICAgICBzZXRNaW51dGVzKG5leHQpXG4gICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWREYXkpIGFwcGx5KHNlbGVjdGVkRGF5LCBob3VycywgbmV4dClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWRhdGVwaWNrZXItY2xlYXJcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoJycpXG4gICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgQ2xlYXJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IENvdXBvbkVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgY3VzdG9tID0gcmVzb3VyY2U/Lm9wdGlvbnM/LmN1c3RvbSB8fCB7fVxuICBjb25zdCBhcGlCYXNlVXJsID0gd2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwaUJhc2VVcmwgfHwgJy9hcGkvdjEnKVxuXG4gIGNvbnN0IFtwcm9kdWN0cywgc2V0UHJvZHVjdHNdID0gdXNlU3RhdGUoW10pXG4gIGNvbnN0IFtjYXRlZ29yaWVzLCBzZXRDYXRlZ29yaWVzXSA9IHVzZVN0YXRlKFtdKVxuXG4gIGNvbnN0IHNlbGVjdGVkU2x1Z3MgPSBwYXJzZVNsdWdzKHBhcmFtcy50YXJnZXRTbHVncylcbiAgY29uc3QgdGFyZ2V0VHlwZSA9IHBhcmFtcy50YXJnZXRUeXBlIHx8ICdhbGwnXG4gIGNvbnN0IGFwcGx5T24gPSBwYXJhbXMuYXBwbHlPbiB8fCAnY2FydCdcbiAgY29uc3QgdXNhZ2VUeXBlID0gcGFyYW1zLnVzYWdlVHlwZSB8fCAndW5saW1pdGVkJ1xuICBjb25zdCBjb3Vwb25UeXBlID0gcGFyYW1zLnR5cGUgfHwgJ3BlcmNlbnQnXG4gIGNvbnN0IGlzQWN0aXZlID0gcGFyYW1zLmlzQWN0aXZlICE9PSBmYWxzZSAmJiBwYXJhbXMuaXNBY3RpdmUgIT09ICdmYWxzZSdcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBpZ25vcmUgPSBmYWxzZVxuXG4gICAgYXN5bmMgZnVuY3Rpb24gbG9hZENhdGFsb2coKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjYXRlZ29yeURhdGEgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlVXJsfS9jYXRlZ29yaWVzYCkudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSlcbiAgICAgICAgY29uc3QgYWxsUHJvZHVjdHMgPSBbXVxuICAgICAgICBsZXQgcGFnZSA9IDFcbiAgICAgICAgbGV0IGhhc01vcmUgPSB0cnVlXG4gICAgICAgIHdoaWxlIChoYXNNb3JlICYmIHBhZ2UgPD0gMjApIHtcbiAgICAgICAgICBjb25zdCBwcm9kdWN0RGF0YSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L3Byb2R1Y3RzP3BhZ2U9JHtwYWdlfSZsaW1pdD0xMDBgKS50aGVuKChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgIHJlc3BvbnNlLmpzb24oKSxcbiAgICAgICAgICApXG4gICAgICAgICAgYWxsUHJvZHVjdHMucHVzaCguLi4ocHJvZHVjdERhdGEucHJvZHVjdHMgfHwgW10pKVxuICAgICAgICAgIGhhc01vcmUgPSBCb29sZWFuKHByb2R1Y3REYXRhLmhhc01vcmUpXG4gICAgICAgICAgcGFnZSArPSAxXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlnbm9yZSkgcmV0dXJuXG4gICAgICAgIHNldFByb2R1Y3RzKGFsbFByb2R1Y3RzKVxuICAgICAgICBzZXRDYXRlZ29yaWVzKEFycmF5LmlzQXJyYXkoY2F0ZWdvcnlEYXRhKSA/IGNhdGVnb3J5RGF0YSA6IFtdKVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGlmICghaWdub3JlKSB7XG4gICAgICAgICAgc2V0UHJvZHVjdHMoW10pXG4gICAgICAgICAgc2V0Q2F0ZWdvcmllcyhbXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRDYXRhbG9nKClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWdub3JlID0gdHJ1ZVxuICAgIH1cbiAgfSwgW2FwaUJhc2VVcmxdKVxuXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IHNldFNlbGVjdGVkU2x1Z3MgPSAobmV4dCkgPT4gc2V0RmllbGQoJ3RhcmdldFNsdWdzJywgSlNPTi5zdHJpbmdpZnkobmV4dCkpXG5cbiAgY29uc3QgcHJvZHVjdE9wdGlvbnMgPSB1c2VNZW1vKFxuICAgICgpID0+IHByb2R1Y3RzLm1hcCgoaXRlbSkgPT4gKHsgdmFsdWU6IGl0ZW0uc2x1ZywgbGFiZWw6IGl0ZW0ubmFtZSB9KSksXG4gICAgW3Byb2R1Y3RzXSxcbiAgKVxuICBjb25zdCBjYXRlZ29yeU9wdGlvbnMgPSB1c2VNZW1vKFxuICAgICgpID0+IGNhdGVnb3JpZXMubWFwKChpdGVtKSA9PiAoeyB2YWx1ZTogaXRlbS5zbHVnLCBsYWJlbDogaXRlbS5sYWJlbCB9KSksXG4gICAgW2NhdGVnb3JpZXNdLFxuICApXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZVN1Ym1pdCgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2U/LmRhdGE/Lm5vdGljZVxuICAgICAgICBpZiAobm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogbm90aWNlLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzYXZlIGNvdXBvbicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ291cG9uIHNhdmVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIGNvdXBvbi4gUGxlYXNlIHRyeSBhZ2Fpbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+Q3JlYXRlIGEgc3RvcmUgY291cG9uPC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIFNldCB3aG8gZ2V0cyB0aGUgZGlzY291bnQsIHdoZXJlIGl0IGFwcGxpZXMsIGFuZCBob3cgbWFueSB0aW1lcyBpdCBjYW4gYmUgdXNlZC5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+Q291cG9uIGNvZGU8L2g0PlxuICAgICAgICAgIDxwPkN1c3RvbWVycyB3aWxsIHR5cGUgdGhpcyBhdCBjaGVja291dCBvbiB0aGUgd2Vic2l0ZSBhbmQgYXBwLjwvcD5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dCB0b2tyaS1jb3Vwb24tY29kZVwiXG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNvZGUgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnY29kZScsIGV2ZW50LnRhcmdldC52YWx1ZS50b1VwcGVyQ2FzZSgpKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiV0VMQ09NRTEwXCJcbiAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXRvZ2dsZVwiPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgIGNoZWNrZWQ9e2lzQWN0aXZlfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnaXNBY3RpdmUnLCBldmVudC50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgQ291cG9uIGlzIGFjdGl2ZVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5EaXNjb3VudDwvaDQ+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jaG9pY2Utcm93XCI+XG4gICAgICAgICAgICA8Q2hvaWNlQ2FyZFxuICAgICAgICAgICAgICBzZWxlY3RlZD17Y291cG9uVHlwZSA9PT0gJ3BlcmNlbnQnfVxuICAgICAgICAgICAgICB0aXRsZT1cIlBlcmNlbnQgb2ZmXCJcbiAgICAgICAgICAgICAgaGludD1cImUuZy4gMTAlIG9mZlwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCd0eXBlJywgJ3BlcmNlbnQnKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Q2hvaWNlQ2FyZFxuICAgICAgICAgICAgICBzZWxlY3RlZD17Y291cG9uVHlwZSA9PT0gJ2ZsYXQnfVxuICAgICAgICAgICAgICB0aXRsZT1cIkZsYXQgYW1vdW50XCJcbiAgICAgICAgICAgICAgaGludD1cImUuZy4g4oK5NTAgb2ZmXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ3R5cGUnLCAnZmxhdCcpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICB7Y291cG9uVHlwZSA9PT0gJ3BlcmNlbnQnID8gJ1BlcmNlbnQgdmFsdWUnIDogJ0Ftb3VudCAo4oK5KSd9XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICBzdGVwPVwiMC4wMVwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudmFsdWUgPz8gJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd2YWx1ZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIE1pbiBjYXJ0ICjigrkpXG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgICAgc3RlcD1cIjAuMDFcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubWluQ2FydCA/PyAnJ31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbWluQ2FydCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIwXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIE1heCBkaXNjb3VudCAo4oK5KVxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm1heERpc2NvdW50ID8/ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdtYXhEaXNjb3VudCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJObyBjYXBcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5BcHBseSBkaXNjb3VudCBvbjwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hvaWNlLXJvd1wiPlxuICAgICAgICAgIDxDaG9pY2VDYXJkXG4gICAgICAgICAgICBzZWxlY3RlZD17YXBwbHlPbiA9PT0gJ2NhcnQnfVxuICAgICAgICAgICAgdGl0bGU9XCJDYXJ0IHRvdGFsXCJcbiAgICAgICAgICAgIGhpbnQ9XCJSZWR1Y2UgdGhlIGl0ZW1zIHN1YnRvdGFsXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCdhcHBseU9uJywgJ2NhcnQnKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxDaG9pY2VDYXJkXG4gICAgICAgICAgICBzZWxlY3RlZD17YXBwbHlPbiA9PT0gJ3NoaXBwaW5nJ31cbiAgICAgICAgICAgIHRpdGxlPVwiU2hpcHBpbmcgZmVlXCJcbiAgICAgICAgICAgIGhpbnQ9XCJSZWR1Y2UgZGVsaXZlcnkgY2hhcmdlc1wiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWVsZCgnYXBwbHlPbicsICdzaGlwcGluZycpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+V2hvIGNhbiBnZXQgdGhpcyBkaXNjb3VudDwvaDQ+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBBcHBseSB0b1xuICAgICAgICAgIDxBbmNob3JlZFNlbGVjdFxuICAgICAgICAgICAgdmFsdWU9e3RhcmdldFR5cGV9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkNob29zZSB3aG8gdGhpcyBjb3Vwb24gYXBwbGllcyB0b1wiXG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHtcbiAgICAgICAgICAgICAgc2V0RmllbGQoJ3RhcmdldFR5cGUnLCBuZXh0KVxuICAgICAgICAgICAgICBzZXRTZWxlY3RlZFNsdWdzKFtdKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9wdGlvbnM9e1tcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsIHByb2R1Y3RzJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAncHJvZHVjdHMnLCBsYWJlbDogJ1NlbGVjdGVkIHByb2R1Y3RzJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAnY2F0ZWdvcmllcycsIGxhYmVsOiAnU2VsZWN0ZWQgY2F0ZWdvcmllcycgfSxcbiAgICAgICAgICAgIF19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cblxuICAgICAgICB7dGFyZ2V0VHlwZSA9PT0gJ3Byb2R1Y3RzJyA/IChcbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQcm9kdWN0c1xuICAgICAgICAgICAgPFNlYXJjaGFibGVNdWx0aVNlbGVjdFxuICAgICAgICAgICAgICBvcHRpb25zPXtwcm9kdWN0T3B0aW9uc31cbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkU2x1Z3N9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTZWxlY3RlZFNsdWdzfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlbGVjdCBwcm9kdWN0c1wiXG4gICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIHByb2R1Y3RzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAge3RhcmdldFR5cGUgPT09ICdjYXRlZ29yaWVzJyA/IChcbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDYXRlZ29yaWVzXG4gICAgICAgICAgICA8U2VhcmNoYWJsZU11bHRpU2VsZWN0XG4gICAgICAgICAgICAgIG9wdGlvbnM9e2NhdGVnb3J5T3B0aW9uc31cbiAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkU2x1Z3N9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTZWxlY3RlZFNsdWdzfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlbGVjdCBjYXRlZ29yaWVzXCJcbiAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggY2F0ZWdvcmllc1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlVzYWdlPC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNob2ljZS1yb3dcIj5cbiAgICAgICAgICAgIDxDaG9pY2VDYXJkXG4gICAgICAgICAgICAgIHNlbGVjdGVkPXt1c2FnZVR5cGUgPT09ICd1bmxpbWl0ZWQnfVxuICAgICAgICAgICAgICB0aXRsZT1cIlVubGltaXRlZFwiXG4gICAgICAgICAgICAgIGhpbnQ9XCJDdXN0b21lcnMgY2FuIHJldXNlIGl0XCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ3VzYWdlVHlwZScsICd1bmxpbWl0ZWQnKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Q2hvaWNlQ2FyZFxuICAgICAgICAgICAgICBzZWxlY3RlZD17dXNhZ2VUeXBlID09PSAnc2luZ2xlJ31cbiAgICAgICAgICAgICAgdGl0bGU9XCJTaW5nbGUgdXNlXCJcbiAgICAgICAgICAgICAgaGludD1cIk9uZSB1c2UgcGVyIGN1c3RvbWVyXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmllbGQoJ3VzYWdlVHlwZScsICdzaW5nbGUnKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3VzYWdlVHlwZSA9PT0gJ3VubGltaXRlZCcgPyAoXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIE9wdGlvbmFsIGdsb2JhbCBjYXBcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBtaW49XCIxXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnVzYWdlTGltaXQgPz8gJyd9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3VzYWdlTGltaXQnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTGVhdmUgYmxhbmsgZm9yIHVubGltaXRlZFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8VGV4dD5FYWNoIGxvZ2dlZC1pbiBjdXN0b21lciBjYW4gdXNlIHRoaXMgY291cG9uIG9uY2UuPC9UZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgICAge3BhcmFtcy51c2VkQ291bnQgPyA8VGV4dCBtdD1cImRlZmF1bHRcIj5Vc2VkIHtwYXJhbXMudXNlZENvdW50fSB0aW1lKHMpIHNvIGZhci48L1RleHQ+IDogbnVsbH1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlNjaGVkdWxlPC9oND5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBTdGFydHMgYXRcbiAgICAgICAgICAgIDxEYXRlVGltZVBpY2tlclxuICAgICAgICAgICAgICB2YWx1ZT17dG9EYXRldGltZVZhbHVlKHBhcmFtcy5zdGFydHNBdCl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ3N0YXJ0c0F0JywgbmV4dCB8fCBudWxsKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3Qgc3RhcnQgZGF0ZSBhbmQgdGltZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgRXhwaXJlcyBhdFxuICAgICAgICAgICAgPERhdGVUaW1lUGlja2VyXG4gICAgICAgICAgICAgIHZhbHVlPXt0b0RhdGV0aW1lVmFsdWUocGFyYW1zLmV4cGlyZXNBdCl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ2V4cGlyZXNBdCcsIG5leHQgfHwgbnVsbCl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VsZWN0IGV4cGlyeSBkYXRlIGFuZCB0aW1lXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICBTYXZlIGNvdXBvblxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IENvdXBvbkVkaXRcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcblxuY29uc3QgRlVMRklMTE1FTlQgPSB7XG4gIHBlbmRpbmc6IHsgbGFiZWw6ICdXYWl0aW5nIGZvciBmdWxmaWxsbWVudCcsIHRvbmU6ICdwZW5kaW5nJyB9LFxuICBwYWlkOiB7IGxhYmVsOiAnUHJvY2Vzc2luZycsIHRvbmU6ICdwcm9jZXNzaW5nJyB9LFxuICBwYWNrZWQ6IHsgbGFiZWw6ICdQYWNrZWQnLCB0b25lOiAncGFja2VkJyB9LFxuICBzaGlwcGVkOiB7IGxhYmVsOiAnU2hpcHBlZCcsIHRvbmU6ICdzaGlwcGVkJyB9LFxuICBkZWxpdmVyZWQ6IHsgbGFiZWw6ICdEZWxpdmVyZWQnLCB0b25lOiAnZGVsaXZlcmVkJyB9LFxuICBjYW5jZWxsZWQ6IHsgbGFiZWw6ICdDYW5jZWxsZWQnLCB0b25lOiAnY2FuY2VsbGVkJyB9LFxufVxuXG5mdW5jdGlvbiBpc09ubGluZU9yZGVyKHBhcmFtcyA9IHt9KSB7XG4gIGNvbnN0IG1vZGUgPSBTdHJpbmcocGFyYW1zLnBheW1lbnRNb2RlIHx8ICcnKS50b0xvd2VyQ2FzZSgpXG4gIGlmIChtb2RlID09PSAnb25saW5lJykgcmV0dXJuIHRydWVcbiAgaWYgKG1vZGUgPT09ICdjb2QnKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIEJvb2xlYW4ocGFyYW1zLnJhem9ycGF5UGF5bWVudElkIHx8IHBhcmFtcy5yYXpvcnBheU9yZGVySWQpXG59XG5cbmZ1bmN0aW9uIHBheW1lbnRCYWRnZShwYXJhbXMgPSB7fSkge1xuICBjb25zdCBvbmxpbmUgPSBpc09ubGluZU9yZGVyKHBhcmFtcylcbiAgY29uc3QgbWV0aG9kID0gb25saW5lID8gJ09ubGluZScgOiAnQ09EJ1xuICBjb25zdCBzdGF0dXMgPSBTdHJpbmcocGFyYW1zLnBheW1lbnRTdGF0dXMgfHwgJ3BlbmRpbmcnKS50b0xvd2VyQ2FzZSgpXG5cbiAgaWYgKHN0YXR1cyA9PT0gJ3BhaWQnKSByZXR1cm4geyBsYWJlbDogYCR7bWV0aG9kfSDCtyBQYWlkYCwgdG9uZTogJ3BhaWQnIH1cbiAgaWYgKHN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHJldHVybiB7IGxhYmVsOiBgJHttZXRob2R9IMK3IEZhaWxlZGAsIHRvbmU6ICdmYWlsZWQnIH1cbiAgaWYgKHN0YXR1cyA9PT0gJ3JlZnVuZGVkJykgcmV0dXJuIHsgbGFiZWw6IGAke21ldGhvZH0gwrcgUmVmdW5kZWRgLCB0b25lOiAncmVmdW5kZWQnIH1cbiAgaWYgKG9ubGluZSkgcmV0dXJuIHsgbGFiZWw6ICdPbmxpbmUgwrcgV2FpdGluZycsIHRvbmU6ICd3YWl0aW5nJyB9XG4gIHJldHVybiB7IGxhYmVsOiAnQ09EIMK3IFVucGFpZCcsIHRvbmU6ICdwZW5kaW5nJyB9XG59XG5cbmZ1bmN0aW9uIFBpbGwoeyBsYWJlbCwgdG9uZSB9KSB7XG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2B0b2tyaS1vcmRlci1waWxsIHRva3JpLWxpc3QtcGlsbCBpcy0ke3RvbmV9YH0+e2xhYmVsfTwvc3Bhbj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZ1bGZpbGxtZW50QmFkZ2Uoc3RhdHVzKSB7XG4gIGNvbnN0IGtleSA9IFN0cmluZyhzdGF0dXMgfHwgJ3BlbmRpbmcnKS50b0xvd2VyQ2FzZSgpXG4gIHJldHVybiBGVUxGSUxMTUVOVFtrZXldIHx8IEZVTEZJTExNRU5ULnBlbmRpbmdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBheW1lbnRCYWRnZShwYXJhbXMpIHtcbiAgcmV0dXJuIHBheW1lbnRCYWRnZShwYXJhbXMpXG59XG5cbmZ1bmN0aW9uIEZ1bGZpbGxtZW50QmFkZ2UoeyByZWNvcmQgfSkge1xuICBjb25zdCBiYWRnZSA9IGdldEZ1bGZpbGxtZW50QmFkZ2UocmVjb3JkPy5wYXJhbXM/LnN0YXR1cylcbiAgcmV0dXJuIDxQaWxsIGxhYmVsPXtiYWRnZS5sYWJlbH0gdG9uZT17YmFkZ2UudG9uZX0gLz5cbn1cblxuZnVuY3Rpb24gUGF5bWVudEJhZGdlKHsgcmVjb3JkIH0pIHtcbiAgY29uc3QgYmFkZ2UgPSBnZXRQYXltZW50QmFkZ2UocmVjb3JkPy5wYXJhbXMpXG4gIHJldHVybiA8UGlsbCBsYWJlbD17YmFkZ2UubGFiZWx9IHRvbmU9e2JhZGdlLnRvbmV9IC8+XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9yZGVyTGlzdEJhZGdlKHsgcmVjb3JkLCBwcm9wZXJ0eSB9KSB7XG4gIGNvbnN0IHBhdGggPSBwcm9wZXJ0eT8ucGF0aCB8fCBwcm9wZXJ0eT8ucHJvcGVydHlQYXRoIHx8ICcnXG4gIGlmIChwYXRoID09PSAnc3RhdHVzJykgcmV0dXJuIDxGdWxmaWxsbWVudEJhZGdlIHJlY29yZD17cmVjb3JkfSAvPlxuICByZXR1cm4gPFBheW1lbnRCYWRnZSByZWNvcmQ9e3JlY29yZH0gLz5cbn1cbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBBcGlDbGllbnQsIHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IExvY2FsU2VsZWN0LCBTZWFyY2hhYmxlU2VsZWN0LCB1c2VBbmNob3JlZE1lbnUgfSBmcm9tICcuL2Zvcm0tY29udHJvbHMnXG5pbXBvcnQgeyBnZXRGdWxmaWxsbWVudEJhZGdlLCBnZXRQYXltZW50QmFkZ2UgfSBmcm9tICcuL29yZGVyLWxpc3QtYmFkZ2VzLmpzeCdcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5cbmNvbnN0IEZVTEZJTExNRU5UID0gW1xuICB7IHZhbHVlOiAncGVuZGluZycsIGxhYmVsOiAnV2FpdGluZyBmb3IgZnVsZmlsbG1lbnQnIH0sXG4gIHsgdmFsdWU6ICdwYWlkJywgbGFiZWw6ICdQcm9jZXNzaW5nJyB9LFxuICB7IHZhbHVlOiAncGFja2VkJywgbGFiZWw6ICdQYWNrZWQnIH0sXG4gIHsgdmFsdWU6ICdzaGlwcGVkJywgbGFiZWw6ICdTaGlwcGVkJyB9LFxuICB7IHZhbHVlOiAnZGVsaXZlcmVkJywgbGFiZWw6ICdEZWxpdmVyZWQnIH0sXG4gIHsgdmFsdWU6ICdjYW5jZWxsZWQnLCBsYWJlbDogJ0NhbmNlbGxlZCcgfSxcbl1cblxuY29uc3QgUEFZTUVOVF9PUFRJT05TID0gW1xuICB7IHZhbHVlOiAncGVuZGluZycsIGxhYmVsOiAnUGVuZGluZycgfSxcbiAgeyB2YWx1ZTogJ3BhaWQnLCBsYWJlbDogJ1BhaWQnIH0sXG4gIHsgdmFsdWU6ICdmYWlsZWQnLCBsYWJlbDogJ0ZhaWxlZCcgfSxcbiAgeyB2YWx1ZTogJ3JlZnVuZGVkJywgbGFiZWw6ICdSZWZ1bmRlZCcgfSxcbl1cblxuZnVuY3Rpb24gQ29weUlkKHsgbGFiZWwsIHZhbHVlLCBocmVmIH0pIHtcbiAgY29uc3QgW2NvcGllZCwgc2V0Q29waWVkXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBpZiAoIXZhbHVlKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcnpwLXJvd1wiPlxuICAgICAgPHNwYW4+e2xhYmVsfTwvc3Bhbj5cbiAgICAgIDxjb2RlPnt2YWx1ZX08L2NvZGU+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KHZhbHVlKT8udGhlbigoKSA9PiB7XG4gICAgICAgICAgICBzZXRDb3BpZWQodHJ1ZSlcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDEyMDApXG4gICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge30pXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtjb3BpZWQgPyAnQ29waWVkJyA6ICdDb3B5J31cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge2hyZWYgPyAoXG4gICAgICAgIDxhIGhyZWY9e2hyZWZ9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIj5cbiAgICAgICAgICBPcGVuIGluIFJhem9ycGF5XG4gICAgICAgIDwvYT5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIGRlbGl2ZXJ5Q2hvaWNlTGFiZWwob3B0aW9uKSB7XG4gIGlmIChvcHRpb24gPT09ICdleHByZXNzJykgcmV0dXJuICdFeHByZXNzJ1xuICBpZiAob3B0aW9uID09PSAnbW9ybmluZycpIHJldHVybiAnTW9ybmluZydcbiAgcmV0dXJuICcnXG59XG5cbmZ1bmN0aW9uIGZvcm1hdEV4cGVjdGVkRGF0ZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJydcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxuICBpZiAoTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuICcnXG4gIHJldHVybiBkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tR0InLCB7XG4gICAgZGF5OiAnbnVtZXJpYycsXG4gICAgbW9udGg6ICdzaG9ydCcsXG4gICAgeWVhcjogJ251bWVyaWMnLFxuICAgIHRpbWVab25lOiAnQXNpYS9Lb2xrYXRhJyxcbiAgfSlcbn1cblxuY29uc3QgZm9ybWF0TW9uZXkgPSAodmFsdWUpID0+IHtcbiAgY29uc3QgYW1vdW50ID0gTnVtYmVyKHZhbHVlKVxuICBpZiAoTnVtYmVyLmlzTmFOKGFtb3VudCkpIHJldHVybiAn4oK5MCdcbiAgcmV0dXJuIGDigrkke2Ftb3VudC50b0xvY2FsZVN0cmluZygnZW4tSU4nLCB7IG1heGltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gXG59XG5cbmNvbnN0IGZvcm1hdERhdGVUaW1lID0gKHZhbHVlKSA9PiB7XG4gIGlmICghdmFsdWUpIHJldHVybiAn4oCUJ1xuICByZXR1cm4gbmV3IERhdGUodmFsdWUpLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicsIHtcbiAgICBkYXRlU3R5bGU6ICdtZWRpdW0nLFxuICAgIHRpbWVTdHlsZTogJ3Nob3J0JyxcbiAgfSlcbn1cblxuY29uc3QgcmVzb2x2ZUltYWdlID0gKHZhbHVlKSA9PiB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICBpZiAoL14oaHR0cHM/OnxkYXRhOnxibG9iOikvLnRlc3QodmFsdWUpKSByZXR1cm4gdmFsdWVcbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJy8nKSkgcmV0dXJuIGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59JHt2YWx1ZX1gXG4gIHJldHVybiB2YWx1ZVxufVxuXG5mdW5jdGlvbiBNb3JlTWVudSh7IHVucGFpZCwgY2FuU3luY1Jhem9ycGF5LCBidXN5LCBvbkNhc2gsIG9uUXIsIG9uU3luY1Jhem9ycGF5LCBvblJlc2VuZFBhcnRuZXIgfSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgeyB3cmFwUmVmLCBvcGVuVXAgfSA9IHVzZUFuY2hvcmVkTWVudShvcGVuKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF3cmFwUmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG9jQ2xpY2spXG4gIH0sIFt3cmFwUmVmXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItbW9yZVwiIHJlZj17d3JhcFJlZn0+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKCh2YWx1ZSkgPT4gIXZhbHVlKX0+XG4gICAgICAgIE1vcmUgYWN0aW9uc1xuICAgICAgICA8c3Bhbj57b3BlbiA/ICfilrQnIDogJ+KWvid9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b2tyaS1vcmRlci1tb3JlLW1lbnUke29wZW5VcCA/ICcgaXMtdXAnIDogJyd9YH0+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBkaXNhYmxlZD17Qm9vbGVhbihidXN5KX1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgb25SZXNlbmRQYXJ0bmVyKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2J1c3kgPT09ICdyZXNlbmRQYXJ0bmVyV2hhdHNhcHAnID8gJ1NlbmRpbmfigKYnIDogJ1Jlc2VuZCBtZXNzYWdlIHRvIGRlbGl2ZXJ5IHBhcnRuZXInfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIHt1bnBhaWQgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e0Jvb2xlYW4oYnVzeSl9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgICAgIG9uQ2FzaCgpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtidXN5ID09PSAnY29sbGVjdENhc2gnID8gJ1NhdmluZ+KApicgOiAnTWFyayBjYXNoIGNvbGxlY3RlZCd9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e0Jvb2xlYW4oYnVzeSl9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgICAgIG9uUXIoKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7YnVzeSA9PT0gJ2dlbmVyYXRlUXInID8gJ0NyZWF0aW5n4oCmJyA6ICdHZW5lcmF0ZSBwYXltZW50IFFSJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7Y2FuU3luY1Jhem9ycGF5ID8gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e0Jvb2xlYW4oYnVzeSl9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgIG9uU3luY1Jhem9ycGF5KClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2J1c3kgPT09ICdzeW5jUmF6b3JwYXknID8gJ0NoZWNraW5nIFJhem9ycGF54oCmJyA6ICdTeW5jIFJhem9ycGF5IHBheW1lbnQnfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gc25hcHNob3QocGFyYW1zID0ge30pIHtcbiAgcmV0dXJuIHtcbiAgICBzdGF0dXM6IHBhcmFtcy5zdGF0dXMgfHwgJycsXG4gICAgcGF5bWVudFN0YXR1czogcGFyYW1zLnBheW1lbnRTdGF0dXMgfHwgJycsXG4gICAgZGVsaXZlcnlQYXJ0bmVySWQ6IHBhcmFtcy5kZWxpdmVyeVBhcnRuZXJJZCB8fCAnJyxcbiAgICBjb250YWN0TmFtZTogcGFyYW1zLmNvbnRhY3ROYW1lIHx8ICcnLFxuICAgIGNvbnRhY3RQaG9uZTogcGFyYW1zLmNvbnRhY3RQaG9uZSB8fCAnJyxcbiAgICBhZGRyZXNzTGluZTE6IHBhcmFtcy5hZGRyZXNzTGluZTEgfHwgJycsXG4gICAgYWRkcmVzc0xpbmUyOiBwYXJhbXMuYWRkcmVzc0xpbmUyIHx8ICcnLFxuICAgIGFkZHJlc3NDaXR5OiBwYXJhbXMuYWRkcmVzc0NpdHkgfHwgJycsXG4gICAgYWRkcmVzc1N0YXRlOiBwYXJhbXMuYWRkcmVzc1N0YXRlIHx8ICcnLFxuICAgIGFkZHJlc3NQaW5jb2RlOiBwYXJhbXMuYWRkcmVzc1BpbmNvZGUgfHwgJycsXG4gICAgYWRkcmVzc0xhbmRtYXJrOiBwYXJhbXMuYWRkcmVzc0xhbmRtYXJrIHx8ICcnLFxuICB9XG59XG5cbmNvbnN0IE9yZGVyRGV0YWlsID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSwgYWN0aW9uIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQsIGxvYWRpbmcsIHNldFJlY29yZCB9ID0gdXNlUmVjb3JkKGluaXRpYWxSZWNvcmQsIHJlc291cmNlLmlkKVxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFthY3Rpb25CdXN5LCBzZXRBY3Rpb25CdXN5XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbcGFydG5lcnMsIHNldFBhcnRuZXJzXSA9IHVzZVN0YXRlKFt7IHZhbHVlOiAnJywgbGFiZWw6ICdVbmFzc2lnbmVkJyB9XSlcbiAgY29uc3QgW2Jhc2VsaW5lLCBzZXRCYXNlbGluZV0gPSB1c2VTdGF0ZSgoKSA9PiBzbmFwc2hvdChpbml0aWFsUmVjb3JkPy5wYXJhbXMpKVxuICBjb25zdCBbZWRpdENvbnRhY3QsIHNldEVkaXRDb250YWN0XSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZWRpdEFkZHJlc3MsIHNldEVkaXRBZGRyZXNzXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGFjdGlvbj8ubmFtZSAhPT0gJ3Nob3cnKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3QgbmV4dCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9zaG93XFwvPyQvLCAnL2VkaXQnKVxuICAgIGlmIChuZXh0ICE9PSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKG5leHQpXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9LCBbYWN0aW9uPy5uYW1lXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBpZ25vcmUgPSBmYWxzZVxuICAgIGFwaVxuICAgICAgLnJlc291cmNlQWN0aW9uKHsgcmVzb3VyY2VJZDogJ0RlbGl2ZXJ5UGFydG5lcicsIGFjdGlvbk5hbWU6ICdsaXN0JywgcGFyYW1zOiB7IHBlclBhZ2U6IDIwMCB9IH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKGlnbm9yZSkgcmV0dXJuXG4gICAgICAgIGNvbnN0IHJlY29yZHMgPSByZXNwb25zZS5kYXRhPy5yZWNvcmRzIHx8IFtdXG4gICAgICAgIHNldFBhcnRuZXJzKFtcbiAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdVbmFzc2lnbmVkJyB9LFxuICAgICAgICAgIC4uLnJlY29yZHMubWFwKChpdGVtKSA9PiAoe1xuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uaWQgfHwgaXRlbS5wYXJhbXM/LmlkLFxuICAgICAgICAgICAgbGFiZWw6IGl0ZW0ucGFyYW1zPy5pc0FjdGl2ZSA9PT0gZmFsc2VcbiAgICAgICAgICAgICAgPyBgJHtpdGVtLnBhcmFtcz8ubmFtZSB8fCAnUGFydG5lcid9IChpbmFjdGl2ZSlgXG4gICAgICAgICAgICAgIDogaXRlbS5wYXJhbXM/Lm5hbWUgfHwgJ1BhcnRuZXInLFxuICAgICAgICAgIH0pKSxcbiAgICAgICAgXSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0UGFydG5lcnMoW3sgdmFsdWU6ICcnLCBsYWJlbDogJ1VuYXNzaWduZWQnIH1dKVxuICAgICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWdub3JlID0gdHJ1ZVxuICAgIH1cbiAgfSwgW10pXG5cbiAgY29uc3QgaXRlbXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShwYXJhbXMuaXRlbXNKc29uIHx8ICdbXScpXG4gICAgICByZXR1cm4gcGFyc2VkLm1hcCgoaXRlbSkgPT4gKHsgLi4uaXRlbSwgaW1hZ2U6IHJlc29sdmVJbWFnZShpdGVtLmltYWdlKSB9KSlcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgfSwgW3BhcmFtcy5pdGVtc0pzb25dKVxuXG4gIGNvbnN0IGN1cnJlbnQgPSBzbmFwc2hvdChwYXJhbXMpXG4gIGNvbnN0IGRpcnR5ID0gT2JqZWN0LmtleXMoY3VycmVudCkuc29tZSgoa2V5KSA9PiBjdXJyZW50W2tleV0gIT09IGJhc2VsaW5lW2tleV0pXG4gIGNvbnN0IGxpc3RVcmwgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvcmVjb3Jkc1xcLy4qJC8sICcnKVxuICBjb25zdCB1bnBhaWQgPSBwYXJhbXMucGF5bWVudFN0YXR1cyAhPT0gJ3BhaWQnXG4gIGNvbnN0IGNhblN5bmNSYXpvcnBheSA9IHVucGFpZCAmJiBwYXJhbXMucGF5bWVudE1vZGUgPT09ICdvbmxpbmUnXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWNhblN5bmNSYXpvcnBheSB8fCAhcmVjb3JkPy5pZCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGxldCBpZ25vcmUgPSBmYWxzZVxuICAgIGFwaVxuICAgICAgLnJlY29yZEFjdGlvbih7XG4gICAgICAgIHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuICAgICAgICByZWNvcmRJZDogcmVjb3JkLmlkLFxuICAgICAgICBhY3Rpb25OYW1lOiAnc3luY1Jhem9ycGF5JyxcbiAgICAgIH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKGlnbm9yZSkgcmV0dXJuXG4gICAgICAgIGlmIChyZXNwb25zZS5kYXRhPy5yZWNvcmQpIHtcbiAgICAgICAgICBzZXRSZWNvcmQocmVzcG9uc2UuZGF0YS5yZWNvcmQpXG4gICAgICAgICAgc2V0QmFzZWxpbmUoc25hcHNob3QocmVzcG9uc2UuZGF0YS5yZWNvcmQucGFyYW1zKSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZS5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ3N1Y2Nlc3MnKSBhZGROb3RpY2Uobm90aWNlKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7fSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWdub3JlID0gdHJ1ZVxuICAgIH1cbiAgfSwgW2NhblN5bmNSYXpvcnBheSwgcmVjb3JkPy5pZCwgcmVzb3VyY2UuaWQsIHNldFJlY29yZF0pXG5cbiAgY29uc3QgaGFuZGxlU2F2ZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBjb25zdCBwaG9uZSA9IFN0cmluZyhwYXJhbXMuY29udGFjdFBob25lIHx8ICcnKS5yZXBsYWNlKC9cXEQvZywgJycpXG4gICAgY29uc3QgcGluID0gU3RyaW5nKHBhcmFtcy5hZGRyZXNzUGluY29kZSB8fCAnJykucmVwbGFjZSgvXFxEL2csICcnKVxuICAgIGlmICghU3RyaW5nKHBhcmFtcy5jb250YWN0TmFtZSB8fCAnJykudHJpbSgpIHx8IHBob25lLmxlbmd0aCA8IDEwKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnRW50ZXIgdGhlIGN1c3RvbWVyIG5hbWUgYW5kIGEgMTAtZGlnaXQgY29udGFjdCBudW1iZXIuJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICghU3RyaW5nKHBhcmFtcy5hZGRyZXNzTGluZTEgfHwgJycpLnRyaW0oKSB8fCAhU3RyaW5nKHBhcmFtcy5hZGRyZXNzQ2l0eSB8fCAnJykudHJpbSgpIHx8ICFTdHJpbmcocGFyYW1zLmFkZHJlc3NTdGF0ZSB8fCAnJykudHJpbSgpIHx8IHBpbi5sZW5ndGggIT09IDYpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdFbnRlciB0aGUgaG91c2UsIGNpdHksIHN0YXRlLCBhbmQgYSA2LWRpZ2l0IHBpbmNvZGUuJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNldFNhdmluZyh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHN1Ym1pdCgpXG4gICAgICBjb25zdCBuZXh0ID0gcmVzcG9uc2U/LmRhdGE/LnJlY29yZD8ucGFyYW1zXG4gICAgICBpZiAobmV4dCkge1xuICAgICAgICBzZXRCYXNlbGluZShzbmFwc2hvdChuZXh0KSlcbiAgICAgICAgc2V0RWRpdENvbnRhY3QoZmFsc2UpXG4gICAgICAgIHNldEVkaXRBZGRyZXNzKGZhbHNlKVxuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRTYXZpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgcnVuUGF5bWVudEFjdGlvbiA9IGFzeW5jIChhY3Rpb25OYW1lKSA9PiB7XG4gICAgaWYgKGFjdGlvbk5hbWUgPT09ICdjb2xsZWN0Q2FzaCcgJiYgIXdpbmRvdy5jb25maXJtKCdNYXJrIHRoaXMgb3JkZXIgYXMgcGFpZCBpbiBjYXNoPycpKSByZXR1cm5cbiAgICBzZXRBY3Rpb25CdXN5KGFjdGlvbk5hbWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnJlY29yZEFjdGlvbih7XG4gICAgICAgIHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuICAgICAgICByZWNvcmRJZDogcmVjb3JkLmlkLFxuICAgICAgICBhY3Rpb25OYW1lLFxuICAgICAgfSlcbiAgICAgIGlmIChyZXNwb25zZS5kYXRhPy5yZWNvcmQpIHtcbiAgICAgICAgc2V0UmVjb3JkKHJlc3BvbnNlLmRhdGEucmVjb3JkKVxuICAgICAgICBzZXRCYXNlbGluZShzbmFwc2hvdChyZXNwb25zZS5kYXRhLnJlY29yZC5wYXJhbXMpKVxuICAgICAgfVxuICAgICAgYWRkTm90aWNlKHJlc3BvbnNlLmRhdGE/Lm5vdGljZSB8fCB7IG1lc3NhZ2U6ICdVcGRhdGVkLicsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgY29tcGxldGUgdGhpcyBhY3Rpb24uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRBY3Rpb25CdXN5KCcnKVxuICAgIH1cbiAgfVxuXG4gIGlmIChhY3Rpb24/Lm5hbWUgPT09ICdzaG93JykgcmV0dXJuIG51bGxcblxuICBjb25zdCBmdWxmaWxsbWVudCA9IGdldEZ1bGZpbGxtZW50QmFkZ2UocGFyYW1zLnN0YXR1cylcbiAgY29uc3QgcGF5bWVudCA9IGdldFBheW1lbnRCYWRnZShwYXJhbXMpXG4gIGNvbnN0IHN0YXR1c0xhYmVsID0gZnVsZmlsbG1lbnQubGFiZWxcbiAgY29uc3QgcmVzdG9yZUZpZWxkcyA9IChrZXlzLCBjbG9zZSkgPT4ge1xuICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCBiYXNlbGluZVtrZXldIHx8ICcnKSlcbiAgICBjbG9zZShmYWxzZSlcbiAgfVxuICBjb25zdCBhZGRyZXNzVGV4dCA9IFtcbiAgICBwYXJhbXMuYWRkcmVzc0xpbmUxLFxuICAgIHBhcmFtcy5hZGRyZXNzTGluZTIsXG4gICAgW3BhcmFtcy5hZGRyZXNzQ2l0eSwgcGFyYW1zLmFkZHJlc3NTdGF0ZSwgcGFyYW1zLmFkZHJlc3NQaW5jb2RlXS5maWx0ZXIoQm9vbGVhbikuam9pbignLCAnKSxcbiAgICBwYXJhbXMuYWRkcmVzc0xhbmRtYXJrID8gYExhbmRtYXJrOiAke3BhcmFtcy5hZGRyZXNzTGFuZG1hcmt9YCA6ICcnLFxuICBdLmZpbHRlcihCb29sZWFuKVxuICBjb25zdCBwYXltZW50TGFiZWwgPSBwYXltZW50LmxhYmVsXG4gIGNvbnN0IHBhcnRuZXJOYW1lID0gcGFyYW1zLmRlbGl2ZXJ5UGFydG5lck5hbWVcbiAgICA/IGAke3BhcmFtcy5kZWxpdmVyeVBhcnRuZXJOYW1lfSR7cGFyYW1zLmRlbGl2ZXJ5UGFydG5lclBob25lID8gYCDCtyAke3BhcmFtcy5kZWxpdmVyeVBhcnRuZXJQaG9uZX1gIDogJyd9YFxuICAgIDogJ05vIGRlbGl2ZXJ5IHBhcnRuZXIgeWV0J1xuICBjb25zdCBpdGVtQ291bnQgPSBpdGVtcy5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4gc3VtICsgTnVtYmVyKGl0ZW0ucXVhbnRpdHkgfHwgMCksIDApXG4gIGNvbnN0IGRlbGl2ZXJ5TmFtZSA9IGRlbGl2ZXJ5Q2hvaWNlTGFiZWwocGFyYW1zLmRlbGl2ZXJ5T3B0aW9uKVxuICBjb25zdCBleHBlY3RlZERlbGl2ZXJ5ID0gZm9ybWF0RXhwZWN0ZWREYXRlKHBhcmFtcy5leHBlY3RlZERlbGl2ZXJ5RGF0ZSlcblxuICByZXR1cm4gKFxuICAgIDxmb3JtIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyXCIgb25TdWJtaXQ9e2hhbmRsZVNhdmV9PlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10b3BcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci10aXRsZVwiPlxuICAgICAgICAgIDxhIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWJhY2tcIiBocmVmPXtsaXN0VXJsfSBhcmlhLWxhYmVsPVwiQmFjayB0byBvcmRlcnNcIj7ihpA8L2E+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItdGl0bGUtcm93XCI+XG4gICAgICAgICAgICAgIDxoMj4je3BhcmFtcy5vcmRlck5vfTwvaDI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRva3JpLW9yZGVyLXBpbGwgaXMtJHtwYXltZW50LnRvbmV9YH0+e3BheW1lbnRMYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRva3JpLW9yZGVyLXBpbGwgaXMtJHtmdWxmaWxsbWVudC50b25lfWB9PntzdGF0dXNMYWJlbH08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxwPntmb3JtYXREYXRlVGltZShwYXJhbXMuY3JlYXRlZEF0KX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWFjdGlvbnNcIj5cbiAgICAgICAgICA8YVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItaW52b2ljZVwiXG4gICAgICAgICAgICBocmVmPXtgL3Rva3JpLWJhY2tvZmZpY2Uvb3JkZXJzLyR7cmVjb3JkLmlkfS9pbnZvaWNlP2Rvd25sb2FkPTFgfVxuICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICAgICAgdGl0bGU9XCJEb3dubG9hZCBQREYgaW52b2ljZVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgRG93bmxvYWQgSW52b2ljZVxuICAgICAgICAgIDwvYT5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXNhdmVcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9eyFkaXJ0eSB8fCBsb2FkaW5nIHx8IHNhdmluZ30+XG4gICAgICAgICAgICB7c2F2aW5nID8gJ1NhdmluZ+KApicgOiAnU2F2ZSd9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPE1vcmVNZW51XG4gICAgICAgICAgICB1bnBhaWQ9e3VucGFpZH1cbiAgICAgICAgICAgIGNhblN5bmNSYXpvcnBheT17Y2FuU3luY1Jhem9ycGF5fVxuICAgICAgICAgICAgYnVzeT17YWN0aW9uQnVzeX1cbiAgICAgICAgICAgIG9uQ2FzaD17KCkgPT4gcnVuUGF5bWVudEFjdGlvbignY29sbGVjdENhc2gnKX1cbiAgICAgICAgICAgIG9uUXI9eygpID0+IHJ1blBheW1lbnRBY3Rpb24oJ2dlbmVyYXRlUXInKX1cbiAgICAgICAgICAgIG9uU3luY1Jhem9ycGF5PXsoKSA9PiBydW5QYXltZW50QWN0aW9uKCdzeW5jUmF6b3JwYXknKX1cbiAgICAgICAgICAgIG9uUmVzZW5kUGFydG5lcj17KCkgPT4gcnVuUGF5bWVudEFjdGlvbigncmVzZW5kUGFydG5lcldoYXRzYXBwJyl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1sYXlvdXRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1tYWluXCI+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItY2FyZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkLWhlYWRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktb3JkZXItbWFyayBpcy0ke2Z1bGZpbGxtZW50LnRvbmV9YH0gLz5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPntzdGF0dXNMYWJlbH08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8c3Bhbj57aXRlbUNvdW50fSB7aXRlbUNvdW50ID09PSAxID8gJ2l0ZW0nIDogJ2l0ZW1zJ30gwrcge3BhcnRuZXJOYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItc2VsZWN0XCI+XG4gICAgICAgICAgICAgICAgPExvY2FsU2VsZWN0XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnN0YXR1cyB8fCAncGVuZGluZyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXtGVUxGSUxMTUVOVH1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IGhhbmRsZUNoYW5nZSgnc3RhdHVzJywgdmFsdWUpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7aXRlbXMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lbXB0eVwiPk5vIGl0ZW1zIG9uIHRoaXMgb3JkZXIuPC9wPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pdGVtc1wiPlxuICAgICAgICAgICAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgICAgIDxhcnRpY2xlIGtleT17aXRlbS5pZH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItdGh1bWItd3JhcFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtpdGVtLmltYWdlID8gPGltZyBzcmM9e2l0ZW0uaW1hZ2V9IGFsdD1cIlwiIC8+IDogPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItdGh1bWJcIiAvPn1cbiAgICAgICAgICAgICAgICAgICAgICA8ZW0+e2l0ZW0ucXVhbnRpdHl9PC9lbT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz57aXRlbS5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgIHtpdGVtLndlaWdodCA/IDxzcGFuPntpdGVtLndlaWdodH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXF0eVwiPntmb3JtYXRNb25leShpdGVtLnByaWNlVmFsdWUpfSDDlyB7aXRlbS5xdWFudGl0eX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxiPntmb3JtYXRNb25leShpdGVtLmxpbmVUb3RhbCl9PC9iPlxuICAgICAgICAgICAgICAgICAgPC9hcnRpY2xlPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItY2FyZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1jYXJkLWhlYWRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdG9rcmktb3JkZXItbWFyayBpcy0ke3BheW1lbnQudG9uZX1gfSAvPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e3BheW1lbnRMYWJlbH08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8c3Bhbj57cGFyYW1zLnBheW1lbnRNZXRob2QgfHwgJ0Nhc2ggb24gZGVsaXZlcnknfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItc2VsZWN0XCI+XG4gICAgICAgICAgICAgICAgPExvY2FsU2VsZWN0XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBheW1lbnRTdGF0dXMgfHwgJ3BlbmRpbmcnfVxuICAgICAgICAgICAgICAgICAgb3B0aW9ucz17UEFZTUVOVF9PUFRJT05TfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKCdwYXltZW50U3RhdHVzJywgdmFsdWUpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGwgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItdG90YWxzXCI+XG4gICAgICAgICAgICAgIDxkaXY+PGR0PlN1YnRvdGFsPC9kdD48ZGQ+e2l0ZW1Db3VudH0ge2l0ZW1Db3VudCA9PT0gMSA/ICdpdGVtJyA6ICdpdGVtcyd9PC9kZD48ZGQ+e2Zvcm1hdE1vbmV5KHBhcmFtcy5pdGVtc1RvdGFsKX08L2RkPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkdD5EZWxpdmVyeXtkZWxpdmVyeU5hbWUgPyBgIC0gJHtkZWxpdmVyeU5hbWV9YCA6ICcnfTwvZHQ+XG4gICAgICAgICAgICAgICAgPGRkPntleHBlY3RlZERlbGl2ZXJ5ID8gYEV4cGVjdGVkICR7ZXhwZWN0ZWREZWxpdmVyeX1gIDogJyd9PC9kZD5cbiAgICAgICAgICAgICAgICA8ZGQ+e3BhcmFtcy5mcmVlRGVsaXZlcnlBcHBsaWVkIHx8IE51bWJlcihwYXJhbXMuZGVsaXZlcnlDaGFyZ2UpID09PSAwID8gJ0ZyZWUgKFdlbGNvbWUgb2ZmZXIpJyA6IGZvcm1hdE1vbmV5KHBhcmFtcy5kZWxpdmVyeUNoYXJnZSl9PC9kZD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+PGR0PkhhbmRsaW5nPC9kdD48ZGQgLz48ZGQ+e2Zvcm1hdE1vbmV5KHBhcmFtcy5oYW5kbGluZ0NoYXJnZSl9PC9kZD48L2Rpdj5cbiAgICAgICAgICAgICAge051bWJlcihwYXJhbXMudGF4VG90YWwpID4gMCA/IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGR0PlRheGVzIChHU1Qpe3BhcmFtcy5pc0ludGVyU3RhdGUgPyAnIMK3IElHU1QnIDogJyDCtyBDR1NUK1NHU1QnfTwvZHQ+XG4gICAgICAgICAgICAgICAgICA8ZGQgLz5cbiAgICAgICAgICAgICAgICAgIDxkZD57Zm9ybWF0TW9uZXkocGFyYW1zLnRheFRvdGFsKX08L2RkPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge051bWJlcihwYXJhbXMuc21hbGxDYXJ0Q2hhcmdlKSA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGRpdj48ZHQ+U21hbGwgY2FydDwvZHQ+PGRkIC8+PGRkPntmb3JtYXRNb25leShwYXJhbXMuc21hbGxDYXJ0Q2hhcmdlKX08L2RkPjwvZGl2PlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge051bWJlcihwYXJhbXMuZGlzY291bnQpID4gMCA/IChcbiAgICAgICAgICAgICAgICA8ZGl2PjxkdD5EaXNjb3VudHtwYXJhbXMuY291cG9uQ29kZSA/IGAgwrcgJHtwYXJhbXMuY291cG9uQ29kZX1gIDogJyd9PC9kdD48ZGQgLz48ZGQ+LXtmb3JtYXRNb25leShwYXJhbXMuZGlzY291bnQpfTwvZGQ+PC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlzLXRvdGFsXCI+PGR0PlRvdGFsPC9kdD48ZGQgLz48ZGQ+e2Zvcm1hdE1vbmV5KHBhcmFtcy5ncmFuZFRvdGFsKX08L2RkPjwvZGl2PlxuICAgICAgICAgICAgPC9kbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItY29sbGVjdGVkXCI+XG4gICAgICAgICAgICAgIDxzcGFuPntwYXJhbXMucGF5bWVudFN0YXR1cyA9PT0gJ3BhaWQnID8gJ1BhaWQgYnkgY3VzdG9tZXInIDogJ1N0aWxsIHRvIGNvbGxlY3QnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPGI+e2Zvcm1hdE1vbmV5KHBhcmFtcy5ncmFuZFRvdGFsKX08L2I+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtwYXJhbXMucGF5bWVudENvbGxlY3RlZEFzID8gPHAgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItbWV0YVwiPkNvbGxlY3RlZCBhcyB7cGFyYW1zLnBheW1lbnRDb2xsZWN0ZWRBc308L3A+IDogbnVsbH1cbiAgICAgICAgICAgIHtwYXJhbXMucGF5bWVudE1vZGUgPT09ICdvbmxpbmUnIHx8IHBhcmFtcy5yYXpvcnBheVBheW1lbnRJZCB8fCBwYXJhbXMucmF6b3JwYXlPcmRlcklkID8gKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXJ6cFwiPlxuICAgICAgICAgICAgICAgIDxDb3B5SWRcbiAgICAgICAgICAgICAgICAgIGxhYmVsPVwiUGF5bWVudCBJRFwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnJhem9ycGF5UGF5bWVudElkfVxuICAgICAgICAgICAgICAgICAgaHJlZj17cGFyYW1zLnJhem9ycGF5UGF5bWVudElkXG4gICAgICAgICAgICAgICAgICAgID8gYGh0dHBzOi8vZGFzaGJvYXJkLnJhem9ycGF5LmNvbS9hcHAvcGF5bWVudHMvJHtlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnJhem9ycGF5UGF5bWVudElkKX1gXG4gICAgICAgICAgICAgICAgICAgIDogJyd9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8Q29weUlkXG4gICAgICAgICAgICAgICAgICBsYWJlbD1cIlJhem9ycGF5IG9yZGVyXCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucmF6b3JwYXlPcmRlcklkfVxuICAgICAgICAgICAgICAgICAgaHJlZj17cGFyYW1zLnJhem9ycGF5T3JkZXJJZFxuICAgICAgICAgICAgICAgICAgICA/IGBodHRwczovL2Rhc2hib2FyZC5yYXpvcnBheS5jb20vYXBwL29yZGVycy8ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXMucmF6b3JwYXlPcmRlcklkKX1gXG4gICAgICAgICAgICAgICAgICAgIDogJyd9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7IXBhcmFtcy5yYXpvcnBheVBheW1lbnRJZCA/IChcbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLW1ldGFcIj5ObyBSYXpvcnBheSBwYXltZW50IElEIHlldC4gVXNlIFN5bmMgUmF6b3JwYXkgcGF5bWVudCBpZiBtb25leSB3YXMgY2FwdHVyZWQuPC9wPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAge3BhcmFtcy5yYXpvcnBheVFyVXJsID8gKFxuICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXFyXCIgc3JjPXtwYXJhbXMucmF6b3JwYXlRclVybH0gYWx0PVwiRG9vcnN0ZXAgcGF5bWVudCBRUlwiIC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxhc2lkZSBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zaWRlXCI+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktb3JkZXItY2FyZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWN0aW9uLWhlYWRcIj5cbiAgICAgICAgICAgICAgPGgzPkN1c3RvbWVyPC9oMz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWN0aW9uLWhlYWRcIj5cbiAgICAgICAgICAgICAgPGg0PkNvbnRhY3Q8L2g0PlxuICAgICAgICAgICAgICB7ZWRpdENvbnRhY3QgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0XCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHJlc3RvcmVGaWVsZHMoWydjb250YWN0TmFtZScsICdjb250YWN0UGhvbmUnXSwgc2V0RWRpdENvbnRhY3QpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWVkaXRcIiBvbkNsaWNrPXsoKSA9PiBzZXRFZGl0Q29udGFjdCh0cnVlKX0+XG4gICAgICAgICAgICAgICAgICBFZGl0XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtlZGl0Q29udGFjdCA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0LWZpZWxkc1wiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgTmFtZVxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5jb250YWN0TmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdjb250YWN0TmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICBQaG9uZSBudW1iZXJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIGlucHV0TW9kZT1cIm51bWVyaWNcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNvbnRhY3RQaG9uZSB8fCAnJ31cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdjb250YWN0UGhvbmUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItcmVhZFwiPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e3BhcmFtcy5jb250YWN0TmFtZSB8fCAn4oCUJ308L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8cD57cGFyYW1zLmNvbnRhY3RQaG9uZSA/IGArOTEgJHtwYXJhbXMuY29udGFjdFBob25lfWAgOiAn4oCUJ308L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1zZWN0aW9uLWhlYWRcIj5cbiAgICAgICAgICAgICAgPGg0PlNoaXBwaW5nIGFkZHJlc3M8L2g0PlxuICAgICAgICAgICAgICB7ZWRpdEFkZHJlc3MgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0XCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHJlc3RvcmVGaWVsZHMoXG4gICAgICAgICAgICAgICAgICAgIFsnYWRkcmVzc0xpbmUxJywgJ2FkZHJlc3NMaW5lMicsICdhZGRyZXNzQ2l0eScsICdhZGRyZXNzU3RhdGUnLCAnYWRkcmVzc1BpbmNvZGUnLCAnYWRkcmVzc0xhbmRtYXJrJ10sXG4gICAgICAgICAgICAgICAgICAgIHNldEVkaXRBZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1lZGl0XCIgb25DbGljaz17KCkgPT4gc2V0RWRpdEFkZHJlc3ModHJ1ZSl9PlxuICAgICAgICAgICAgICAgICAgRWRpdFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7ZWRpdEFkZHJlc3MgPyAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZWRpdC1maWVsZHNcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZmllbGRcIj5cbiAgICAgICAgICAgICAgICAgIEhvdXNlIC8gZmxhdFxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzTGluZTEgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnYWRkcmVzc0xpbmUxJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktb3JkZXItZmllbGRcIj5cbiAgICAgICAgICAgICAgICAgIFN0cmVldCAvIGFyZWFcbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWRkcmVzc0xpbmUyIHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBoYW5kbGVDaGFuZ2UoJ2FkZHJlc3NMaW5lMicsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1hZGRyZXNzLWdyaWRcIj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICBDaXR5XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NDaXR5IHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnYWRkcmVzc0NpdHknLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICBTdGF0ZVxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzU3RhdGUgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzU3RhdGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICBQaW5jb2RlXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NQaW5jb2RlIHx8ICcnfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUNoYW5nZSgnYWRkcmVzc1BpbmNvZGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICBMYW5kbWFya1xuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1vcmRlci1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzTGFuZG1hcmsgfHwgJyd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlQ2hhbmdlKCdhZGRyZXNzTGFuZG1hcmsnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLW9yZGVyLXJlYWRcIj5cbiAgICAgICAgICAgICAgICB7YWRkcmVzc1RleHQubGVuZ3RoID8gYWRkcmVzc1RleHQubWFwKChsaW5lKSA9PiA8cCBrZXk9e2xpbmV9PntsaW5lfTwvcD4pIDogPHA+4oCUPC9wPn1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGg0PkRlbGl2ZXJ5IHBhcnRuZXI8L2g0PlxuICAgICAgICAgICAgPFNlYXJjaGFibGVTZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5kZWxpdmVyeVBhcnRuZXJJZCB8fCAnJ31cbiAgICAgICAgICAgICAgb3B0aW9ucz17cGFydG5lcnN9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IGhhbmRsZUNoYW5nZSgnZGVsaXZlcnlQYXJ0bmVySWQnLCB2YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVW5hc3NpZ25lZFwiXG4gICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIHBhcnRuZXJzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8L2FzaWRlPlxuICAgICAgPC9kaXY+XG4gICAgPC9mb3JtPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IE9yZGVyRGV0YWlsXG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSW5wdXQsIExhYmVsLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEFwaUNsaWVudCwgdXNlTm90aWNlIH0gZnJvbSAnYWRtaW5qcydcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5cbmNvbnN0IEV5ZUljb24gPSAoeyBoaWRkZW4gfSkgPT5cbiAgaGlkZGVuID8gKFxuICAgIDxzdmcgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0zIDNsMTggMThcIiAvPlxuICAgICAgPHBhdGggZD1cIk0xMC42IDEwLjZBMiAyIDAgMCAwIDEzLjQgMTMuNFwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkuOSA0LjJBMTAuNyAxMC43IDAgMCAxIDEyIDRjNSAwIDkgNC41IDEwIDhhMTIuOCAxMi44IDAgMCAxLTIuMSAzLjZcIiAvPlxuICAgICAgPHBhdGggZD1cIk02LjYgNi42QzQuMyA4IDIuNyAxMC4yIDIgMTJjMSAzLjUgNSA4IDEwIDggMS41IDAgMi45LS40IDQuMS0xXCIgLz5cbiAgICA8L3N2Zz5cbiAgKSA6IChcbiAgICA8c3ZnIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMiAxMnM0LTcgMTAtNyAxMCA3IDEwIDctNCA3LTEwIDdTMiAxMiAyIDEyelwiIC8+XG4gICAgICA8Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjNcIiAvPlxuICAgIDwvc3ZnPlxuICApXG5cbmZ1bmN0aW9uIFBhc3N3b3JkRmllbGQoeyBpZCwgbGFiZWwsIHZhbHVlLCBvbkNoYW5nZSwgdmlzaWJsZSwgb25Ub2dnbGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxCb3ggbWI9XCJsZ1wiPlxuICAgICAgPExhYmVsIGh0bWxGb3I9e2lkfSByZXF1aXJlZD57bGFiZWx9PC9MYWJlbD5cbiAgICAgIDxCb3ggcG9zaXRpb249XCJyZWxhdGl2ZVwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICA8SW5wdXRcbiAgICAgICAgICBpZD17aWR9XG4gICAgICAgICAgdHlwZT17dmlzaWJsZSA/ICd0ZXh0JyA6ICdwYXNzd29yZCd9XG4gICAgICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uQ2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nUmlnaHQ6IDQyIH19XG4gICAgICAgIC8+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPXt2aXNpYmxlID8gJ0hpZGUgcGFzc3dvcmQnIDogJ1Nob3cgcGFzc3dvcmQnfVxuICAgICAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHJpZ2h0OiA4LFxuICAgICAgICAgICAgdG9wOiAnNTAlJyxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoLTUwJSknLFxuICAgICAgICAgICAgYm9yZGVyOiAwLFxuICAgICAgICAgICAgYmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgIGNvbG9yOiAnIzA0Nzg1NycsXG4gICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAyNixcbiAgICAgICAgICAgIGhlaWdodDogMjYsXG4gICAgICAgICAgICBwYWRkaW5nOiAwLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8RXllSWNvbiBoaWRkZW49e3Zpc2libGV9IC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuY29uc3QgQ2hhbmdlUGFzc3dvcmQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCBbcGFzc3dvcmQsIHNldFBhc3N3b3JkXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbY29uZmlybVBhc3N3b3JkLCBzZXRDb25maXJtUGFzc3dvcmRdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtzaG93UGFzc3dvcmQsIHNldFNob3dQYXNzd29yZF0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Nob3dDb25maXJtLCBzZXRTaG93Q29uZmlybV0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKCcnKVxuXG4gIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuICB9XG5cbiAgY29uc3Qgc2F2ZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBzZXRFcnJvcignJylcbiAgICBpZiAoIXBhc3N3b3JkIHx8IHBhc3N3b3JkLmxlbmd0aCA8IDYpIHtcbiAgICAgIHNldEVycm9yKCdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDYgY2hhcmFjdGVycy4nKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChwYXNzd29yZCAhPT0gY29uZmlybVBhc3N3b3JkKSB7XG4gICAgICBzZXRFcnJvcignTmV3IHBhc3N3b3JkIGFuZCBjb25maXJtIHBhc3N3b3JkIG11c3QgYmUgdGhlIHNhbWUuJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHNldFNhdmluZyh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuICAgICAgICByZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcbiAgICAgICAgcmVjb3JkSWQ6IHJlY29yZC5pZCxcbiAgICAgICAgYWN0aW9uTmFtZTogJ2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgIGRhdGE6IHsgcGFzc3dvcmQsIGNvbmZpcm1QYXNzd29yZCB9LFxuICAgICAgfSlcbiAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlLmRhdGE/Lm5vdGljZVxuICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICBzZXRFcnJvcihub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgcGFzc3dvcmQuJylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAobm90aWNlKSBhZGROb3RpY2Uobm90aWNlKVxuICAgICAgY29uc3QgcmVkaXJlY3RVcmwgPSByZXNwb25zZS5kYXRhPy5yZWRpcmVjdFVybFxuICAgICAgaWYgKHJlZGlyZWN0VXJsKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVkaXJlY3RVcmxcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjbG9zZSgpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgcGFzc3dvcmQuJylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0U2F2aW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgIGluc2V0OiAwLFxuICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSgyLCAxMiwgOCwgMC42MiknLFxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgIHpJbmRleDogODAsXG4gICAgICAgIHBhZGRpbmc6IDE2LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8Qm94XG4gICAgICAgIGFzPVwiZm9ybVwiXG4gICAgICAgIG9uU3VibWl0PXtzYXZlfVxuICAgICAgICBiZz1cIndoaXRlXCJcbiAgICAgICAgd2lkdGg9e1snMTAwJScsICc0MjBweCddfVxuICAgICAgICBwPVwieGxcIlxuICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDE2LCBib3hTaGFkb3c6ICcwIDI0cHggNzBweCByZ2JhKDIsIDQ0LCAzNCwgMC4yOCknIH19XG4gICAgICA+XG4gICAgICAgIDxIMyBtYj1cInNtXCI+Q2hhbmdlIHBhc3N3b3JkPC9IMz5cbiAgICAgICAgPFRleHQgbWI9XCJ4bFwiIGNvbG9yPVwiIzY0NzQ4YlwiPlxuICAgICAgICAgIFNldCBhIG5ldyBwYXNzd29yZCBmb3Ige3JlY29yZD8ucGFyYW1zPy5uYW1lIHx8IHJlY29yZD8ucGFyYW1zPy5lbWFpbCB8fCAndGhpcyB1c2VyJ30uXG4gICAgICAgIDwvVGV4dD5cblxuICAgICAgICA8UGFzc3dvcmRGaWVsZFxuICAgICAgICAgIGlkPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICBsYWJlbD1cIk5ldyBwYXNzd29yZFwiXG4gICAgICAgICAgdmFsdWU9e3Bhc3N3b3JkfVxuICAgICAgICAgIG9uQ2hhbmdlPXtzZXRQYXNzd29yZH1cbiAgICAgICAgICB2aXNpYmxlPXtzaG93UGFzc3dvcmR9XG4gICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldFNob3dQYXNzd29yZCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgIC8+XG4gICAgICAgIDxQYXNzd29yZEZpZWxkXG4gICAgICAgICAgaWQ9XCJjb25maXJtLXBhc3N3b3JkXCJcbiAgICAgICAgICBsYWJlbD1cIkNvbmZpcm0gcGFzc3dvcmRcIlxuICAgICAgICAgIHZhbHVlPXtjb25maXJtUGFzc3dvcmR9XG4gICAgICAgICAgb25DaGFuZ2U9e3NldENvbmZpcm1QYXNzd29yZH1cbiAgICAgICAgICB2aXNpYmxlPXtzaG93Q29uZmlybX1cbiAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0U2hvd0NvbmZpcm0oKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAvPlxuXG4gICAgICAgIHtlcnJvciA/IChcbiAgICAgICAgICA8VGV4dCBtYj1cImxnXCIgY29sb3I9XCIjZGMyNjI2XCI+e2Vycm9yfTwvVGV4dD5cbiAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgPEJveCBkaXNwbGF5PVwiZmxleFwiIGp1c3RpZnlDb250ZW50PVwiZmxleC1lbmRcIiBzdHlsZT17eyBnYXA6IDEwIH19PlxuICAgICAgICAgIDxCdXR0b24gdHlwZT1cImJ1dHRvblwiIHZhcmlhbnQ9XCJ0ZXh0XCIgb25DbGljaz17Y2xvc2V9IGRpc2FibGVkPXtzYXZpbmd9PlxuICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiB0eXBlPVwic3VibWl0XCIgdmFyaWFudD1cImNvbnRhaW5lZFwiIGRpc2FibGVkPXtzYXZpbmd9PlxuICAgICAgICAgICAge3NhdmluZyA/ICdTYXZpbmfigKYnIDogJ1NhdmUgcGFzc3dvcmQnfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0JveD5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IENoYW5nZVBhc3N3b3JkXG4iLCIvKiogSVNPIDMxNjYtMjpJTiBjb2Rlcy4gS2VwdCBuZXh0IHRvIHRoZSBBZG1pbkpTIGZvcm0gc28gdGhlIGRyb3Bkb3duIGFsd2F5cyBoYXMgZXZlcnkgc3RhdGUuICovXG5leHBvcnQgY29uc3QgSU5ESUFfU1RBVEVTID0gW1xuICB7IGNvZGU6ICdBTicsIG5hbWU6ICdBbmRhbWFuIGFuZCBOaWNvYmFyIElzbGFuZHMnIH0sXG4gIHsgY29kZTogJ0FQJywgbmFtZTogJ0FuZGhyYSBQcmFkZXNoJyB9LFxuICB7IGNvZGU6ICdBUicsIG5hbWU6ICdBcnVuYWNoYWwgUHJhZGVzaCcgfSxcbiAgeyBjb2RlOiAnQVMnLCBuYW1lOiAnQXNzYW0nIH0sXG4gIHsgY29kZTogJ0JSJywgbmFtZTogJ0JpaGFyJyB9LFxuICB7IGNvZGU6ICdDSCcsIG5hbWU6ICdDaGFuZGlnYXJoJyB9LFxuICB7IGNvZGU6ICdDVCcsIG5hbWU6ICdDaGhhdHRpc2dhcmgnIH0sXG4gIHsgY29kZTogJ0RIJywgbmFtZTogJ0RhZHJhIGFuZCBOYWdhciBIYXZlbGkgYW5kIERhbWFuIGFuZCBEaXUnIH0sXG4gIHsgY29kZTogJ0RMJywgbmFtZTogJ0RlbGhpJyB9LFxuICB7IGNvZGU6ICdHQScsIG5hbWU6ICdHb2EnIH0sXG4gIHsgY29kZTogJ0dKJywgbmFtZTogJ0d1amFyYXQnIH0sXG4gIHsgY29kZTogJ0hSJywgbmFtZTogJ0hhcnlhbmEnIH0sXG4gIHsgY29kZTogJ0hQJywgbmFtZTogJ0hpbWFjaGFsIFByYWRlc2gnIH0sXG4gIHsgY29kZTogJ0pLJywgbmFtZTogJ0phbW11IGFuZCBLYXNobWlyJyB9LFxuICB7IGNvZGU6ICdKSCcsIG5hbWU6ICdKaGFya2hhbmQnIH0sXG4gIHsgY29kZTogJ0tBJywgbmFtZTogJ0thcm5hdGFrYScgfSxcbiAgeyBjb2RlOiAnS0wnLCBuYW1lOiAnS2VyYWxhJyB9LFxuICB7IGNvZGU6ICdMQScsIG5hbWU6ICdMYWRha2gnIH0sXG4gIHsgY29kZTogJ0xEJywgbmFtZTogJ0xha3NoYWR3ZWVwJyB9LFxuICB7IGNvZGU6ICdNUCcsIG5hbWU6ICdNYWRoeWEgUHJhZGVzaCcgfSxcbiAgeyBjb2RlOiAnTUgnLCBuYW1lOiAnTWFoYXJhc2h0cmEnIH0sXG4gIHsgY29kZTogJ01OJywgbmFtZTogJ01hbmlwdXInIH0sXG4gIHsgY29kZTogJ01MJywgbmFtZTogJ01lZ2hhbGF5YScgfSxcbiAgeyBjb2RlOiAnTVonLCBuYW1lOiAnTWl6b3JhbScgfSxcbiAgeyBjb2RlOiAnTkwnLCBuYW1lOiAnTmFnYWxhbmQnIH0sXG4gIHsgY29kZTogJ09SJywgbmFtZTogJ09kaXNoYScgfSxcbiAgeyBjb2RlOiAnUFknLCBuYW1lOiAnUHVkdWNoZXJyeScgfSxcbiAgeyBjb2RlOiAnUEInLCBuYW1lOiAnUHVuamFiJyB9LFxuICB7IGNvZGU6ICdSSicsIG5hbWU6ICdSYWphc3RoYW4nIH0sXG4gIHsgY29kZTogJ1NLJywgbmFtZTogJ1Npa2tpbScgfSxcbiAgeyBjb2RlOiAnVE4nLCBuYW1lOiAnVGFtaWwgTmFkdScgfSxcbiAgeyBjb2RlOiAnVEcnLCBuYW1lOiAnVGVsYW5nYW5hJyB9LFxuICB7IGNvZGU6ICdUUicsIG5hbWU6ICdUcmlwdXJhJyB9LFxuICB7IGNvZGU6ICdVUCcsIG5hbWU6ICdVdHRhciBQcmFkZXNoJyB9LFxuICB7IGNvZGU6ICdVVCcsIG5hbWU6ICdVdHRhcmFraGFuZCcgfSxcbiAgeyBjb2RlOiAnV0InLCBuYW1lOiAnV2VzdCBCZW5nYWwnIH0sXG5dXG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSDMsIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgTG9jYWxTZWxlY3QsIFNlYXJjaGFibGVTZWxlY3QsIFN0YXR1c1N3aXRjaCwgaXNGbGFnT24gfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuaW1wb3J0IHsgSU5ESUFfU1RBVEVTIH0gZnJvbSAnLi9pbmRpYS1zdGF0ZXMuanMnXG5cbmNvbnN0IFZFSElDTEVfVFlQRVMgPSBbXG4gIHsgdmFsdWU6ICdCaWtlJywgbGFiZWw6ICdCaWtlJyB9LFxuICB7IHZhbHVlOiAnU2Nvb3RlcicsIGxhYmVsOiAnU2Nvb3RlcicgfSxcbiAgeyB2YWx1ZTogJ0VsZWN0cmljIGJpa2UnLCBsYWJlbDogJ0VsZWN0cmljIGJpa2UnIH0sXG4gIHsgdmFsdWU6ICdDeWNsZScsIGxhYmVsOiAnQ3ljbGUnIH0sXG4gIHsgdmFsdWU6ICdWYW4nLCBsYWJlbDogJ1ZhbicgfSxcbiAgeyB2YWx1ZTogJ090aGVyJywgbGFiZWw6ICdPdGhlcicgfSxcbl1cblxuY29uc3QgU1RBVEVfT1BUSU9OUyA9IElORElBX1NUQVRFUy5tYXAoKGl0ZW0pID0+ICh7XG4gIHZhbHVlOiBpdGVtLm5hbWUsXG4gIGxhYmVsOiBpdGVtLm5hbWUsXG59KSlcblxuZnVuY3Rpb24gRmllbGRFcnJvcih7IGVycm9yIH0pIHtcbiAgaWYgKCFlcnJvcj8ubWVzc2FnZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9yLm1lc3NhZ2V9PC9zcGFuPlxufVxuXG5jb25zdCBQYXJ0bmVyRWRpdCA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZDogaW5pdGlhbFJlY29yZCwgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG4gIGNvbnN0IGlzTmV3ID0gYWN0aW9uPy5uYW1lID09PSAnbmV3JyB8fCAhcmVjb3JkPy5pZFxuICBjb25zdCByZWFkT25seSA9IGFjdGlvbj8ubmFtZSA9PT0gJ3Nob3cnXG4gIGNvbnN0IGhhc1Bhc3N3b3JkID0gQm9vbGVhbihwYXJhbXMuaGFzUGFzc3dvcmQpXG4gIGNvbnN0IGlzQWN0aXZlID0gaXNOZXcgJiYgKHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJycpXG4gICAgPyB0cnVlXG4gICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNBY3RpdmUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5pc0FjdGl2ZSA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5pc0FjdGl2ZSA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ2lzQWN0aXZlJywgdHJ1ZSlcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbaXNOZXddKVxuXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBwYXJ0bmVyJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgbWVzc2FnZTogaXNOZXdcbiAgICAgICAgICAgID8gJ1BhcnRuZXIgc2F2ZWQuIEEgcGFzc3dvcmQgZW1haWwgd2lsbCBiZSBzZW50IGlmIHRoZXkgZG8gbm90IGhhdmUgYSBwYXNzd29yZCB5ZXQuJ1xuICAgICAgICAgICAgOiAnUGFydG5lciB1cGRhdGVkJyxcbiAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHBhcnRuZXIuIFBsZWFzZSB0cnkgYWdhaW4uJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBhcz1cImZvcm1cIiBvblN1Ym1pdD17c3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVyb1wiPlxuICAgICAgICA8SDMgY29sb3I9XCJ3aGl0ZVwiPntpc05ldyA/ICdBZGQgZGVsaXZlcnkgcGFydG5lcicgOiBwYXJhbXMubmFtZSB8fCAnRGVsaXZlcnkgcGFydG5lcid9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIENvbGxlY3QgZnVsbCBLWUMgYW5kIGNvbnRhY3QgZGV0YWlscy4gVGhleSBsb2cgaW4gdG8gdGhlIFRva3JpaWkgUGFydG5lciBhcHAgd2l0aCB0aGlzIGVtYWlsXG4gICAgICAgICAgYWZ0ZXIgc2V0dGluZyBhIHBhc3N3b3JkIGZyb20gdGhlIGludml0ZSBtYWlsLlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5BY2NvdW50IHN0YXR1czwvaDQ+XG4gICAgICAgICAgPHA+SW5hY3RpdmUgcGFydG5lcnMgY2Fubm90IGxvZyBpbiwgZXZlbiBpZiB0aGV5IGFscmVhZHkgc2V0IGEgcGFzc3dvcmQuPC9wPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2lzQWN0aXZlfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgdGl0bGU9e2lzQWN0aXZlID8gJ0FjdGl2ZScgOiAnSW5hY3RpdmUnfVxuICAgICAgICAgICAgaGludD17aXNBY3RpdmUgPyAnQ2FuIHNpZ24gaW4gdG8gdGhlIHBhcnRuZXIgYXBwJyA6ICdMb2dpbiBpcyBibG9ja2VkIHVudGlsIHlvdSB0dXJuIHRoaXMgb24nfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnaXNBY3RpdmUnLCBuZXh0KX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHshaXNOZXcgPyAoXG4gICAgICAgICAgICA8VGV4dCBtdD1cImxnXCIgb3BhY2l0eT17MC43fT5cbiAgICAgICAgICAgICAge2hhc1Bhc3N3b3JkID8gJ1Bhc3N3b3JkIGlzIGFscmVhZHkgc2V0LicgOiAnTm8gcGFzc3dvcmQgeWV0IOKAlCBzZW5kIHRoZSBpbnZpdGUgZW1haWwgYWZ0ZXIgc2F2aW5nLid9XG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Mb2dpbiBkZXRhaWxzPC9oND5cbiAgICAgICAgICA8cD5FbWFpbCBpcyB1c2VkIHRvIGNyZWF0ZSBhbmQgcmVzZXQgdGhlIHBhcnRuZXIgcGFzc3dvcmQuIE5vIFNNUyBpcyBzZW50LjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBFbWFpbFxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJlbWFpbFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5lbWFpbCB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2VtYWlsJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJwYXJ0bmVyQGV4YW1wbGUuY29tXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7ZXJyb3JzLmVtYWlsID8gPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5lbWFpbH0gLz4gOiAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5QYXNzd29yZCBsaW5rIGlzIHNlbnQgdG8gdGhpcyBpbmJveDwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBNb2JpbGUgbnVtYmVyXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgIG1heExlbmd0aD17MTB9XG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5waG9uZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ3Bob25lJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgMTApKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIxMC1kaWdpdCBudW1iZXJcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMucGhvbmV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5QZXJzb25hbCBkZXRhaWxzPC9oND5cbiAgICAgICAgPHA+TmFtZSBpcyBzaG93biBvbiBvcmRlcnMuIEZhdGhlciZhcG9zO3MgbmFtZSBhbmQgRE9CIGhlbHAgd2l0aCBLWUMgcmVjb3Jkcy48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEZ1bGwgbmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5uYW1lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUGFydG5lciBmdWxsIG5hbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMubmFtZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEZhdGhlciZhcG9zO3MgLyBndWFyZGlhbiBuYW1lIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZmF0aGVyTmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2ZhdGhlck5hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFzIG9uIEFhZGhhYXIgLyBkb2N1bWVudHNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgIERhdGUgb2YgYmlydGggPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZGF0ZU9mQmlydGggfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnZGF0ZU9mQmlydGgnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5LWUMgZG9jdW1lbnRzPC9oND5cbiAgICAgICAgPHA+UEFOIGFuZCBBYWRoYWFyIGFyZSByZXF1aXJlZCBmb3IgcGFydG5lciBvbmJvYXJkaW5nLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgUEFOIG51bWJlclxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMH1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5wYW5OdW1iZXIgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgc2V0RmllbGQoJ3Bhbk51bWJlcicsIGV2ZW50LnRhcmdldC52YWx1ZS50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoL1teQS1aMC05XS9nLCAnJykuc2xpY2UoMCwgMTApKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQUJDREUxMjM0RlwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5wYW5OdW1iZXJ9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBYWRoYWFyIG51bWJlclxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXG4gICAgICAgICAgICAgIG1heExlbmd0aD17MTJ9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYWFkaGFhck51bWJlciB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgICBzZXRGaWVsZCgnYWFkaGFhck51bWJlcicsIGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXEQvZywgJycpLnNsaWNlKDAsIDEyKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjEyLWRpZ2l0IEFhZGhhYXJcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuYWFkaGFhck51bWJlcn0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkN1cnJlbnQgYWRkcmVzczwvaDQ+XG4gICAgICAgIDxwPldoZXJlIHRoZSBwYXJ0bmVyIGN1cnJlbnRseSBsaXZlcyAvIG9wZXJhdGVzIGZyb20uPC9wPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBZGRyZXNzIGxpbmUgMVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hZGRyZXNzTGluZTEgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdhZGRyZXNzTGluZTEnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkhvdXNlIC8gc3RyZWV0IC8gYXJlYVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5hZGRyZXNzTGluZTF9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBZGRyZXNzIGxpbmUgMiA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFkZHJlc3NMaW5lMiB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2FkZHJlc3NMaW5lMicsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTGFuZG1hcmssIGNvbG9ueVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBDaXR5XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNpdHkgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdjaXR5JywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJDaXR5XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLmNpdHl9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBQaW5jb2RlXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXs2fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBpbmNvZGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdwaW5jb2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgNikpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjYtZGlnaXQgcGluY29kZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5waW5jb2RlfSAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgU3RhdGVcbiAgICAgICAgICA8U2VhcmNoYWJsZVNlbGVjdFxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5zdGF0ZSB8fCAnJ31cbiAgICAgICAgICAgIG9wdGlvbnM9e1t7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3Qgc3RhdGUnIH0sIC4uLlNUQVRFX09QVElPTlNdfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnc3RhdGUnLCBuZXh0KX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VsZWN0IHN0YXRlXCJcbiAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIHN0YXRlc1wiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLnN0YXRlfSAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgUGVybWFuZW50IGFkZHJlc3MgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0IHRva3JpLXRleHRhcmVhXCJcbiAgICAgICAgICAgIHJvd3M9ezN9XG4gICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBlcm1hbmVudEFkZHJlc3MgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgncGVybWFuZW50QWRkcmVzcycsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIklmIGRpZmZlcmVudCBmcm9tIGN1cnJlbnQgYWRkcmVzc1wiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5FbWVyZ2VuY3kgY29udGFjdDwvaDQ+XG4gICAgICAgICAgPHA+U29tZW9uZSB3ZSBjYW4gY2FsbCBpZiB0aGUgcGFydG5lciBpcyB1bnJlYWNoYWJsZS48L3A+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQ29udGFjdCBuYW1lIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZW1lcmdlbmN5TmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2VtZXJnZW5jeU5hbWUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlJlbGF0aXZlIC8gZnJpZW5kIG5hbWVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIENvbnRhY3QgbW9iaWxlIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsxMH1cbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmVtZXJnZW5jeVBob25lIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdlbWVyZ2VuY3lQaG9uZScsIGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXEQvZywgJycpLnNsaWNlKDAsIDEwKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjEwLWRpZ2l0IG51bWJlclwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5lbWVyZ2VuY3lQaG9uZX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+VmVoaWNsZSBkZXRhaWxzPC9oND5cbiAgICAgICAgICA8cD5Vc2VkIGZvciBkZWxpdmVyeSBhc3NpZ25tZW50IGFuZCBzdXBwb3J0LjwvcD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBWZWhpY2xlIHR5cGUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDYgfX0+XG4gICAgICAgICAgICAgIDxMb2NhbFNlbGVjdFxuICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudmVoaWNsZVR5cGUgfHwgJyd9XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17W3sgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCB2ZWhpY2xlJyB9LCAuLi5WRUhJQ0xFX1RZUEVTXX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCd2ZWhpY2xlVHlwZScsIG5leHQpfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgVmVoaWNsZSBudW1iZXIgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy52ZWhpY2xlTnVtYmVyIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHNldEZpZWxkKCd2ZWhpY2xlTnVtYmVyJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCkuc2xpY2UoMCwgMjApKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiZS5nLiBNSDEyQUIxMjM0XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5CYW5rIGRldGFpbHM8L2g0PlxuICAgICAgICA8cD5Gb3IgcGF5b3V0cyBhbmQgcmVpbWJ1cnNlbWVudHMuIE9wdGlvbmFsIGZvciBub3csIGJ1dCByZWNvbW1lbmRlZC48L3A+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEFjY291bnQgaG9sZGVyIG5hbWUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5hY2NvdW50SG9sZGVyTmFtZSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2FjY291bnRIb2xkZXJOYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBcyBwZXIgYmFuayBhY2NvdW50XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBBY2NvdW50IG51bWJlciA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmFjY291bnROdW1iZXIgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdhY2NvdW50TnVtYmVyJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xccysvZywgJycpKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJCYW5rIGFjY291bnQgbnVtYmVyXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBJRlNDIGNvZGUgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgIG1heExlbmd0aD17MTF9XG4gICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmlmc2NDb2RlIHx8ICcnfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT5cbiAgICAgICAgICAgICAgc2V0RmllbGQoJ2lmc2NDb2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvW15BLVowLTldL2csICcnKS5zbGljZSgwLCAxMSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNCSU4wMDAxMjM0XCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMuaWZzY0NvZGV9IC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5JbnRlcm5hbCBub3RlczwvaDQ+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBOb3RlcyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1vcHRpb25hbFwiPihvcHRpb25hbCk8L3NwYW4+XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXQgdG9rcmktdGV4dGFyZWFcIlxuICAgICAgICAgICAgcm93cz17NH1cbiAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMubm90ZXMgfHwgJyd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnbm90ZXMnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTaGlmdCB0aW1pbmcsIGh1Yiwgb3IgYW55dGhpbmcgeW91ciB0ZWFtIHNob3VsZCByZW1lbWJlclwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAge3JlYWRPbmx5ID8gbnVsbCA6IChcbiAgICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tYWN0aW9uc1wiPlxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICAgIHtpc05ldyA/ICdDcmVhdGUgcGFydG5lcicgOiAnU2F2ZSBwYXJ0bmVyJ31cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhcnRuZXJFZGl0XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IEFwaUNsaWVudCwgdXNlTm90aWNlLCB1c2VSZWNvcmQgfSBmcm9tICdhZG1pbmpzJ1xuaW1wb3J0IHsgU2VhcmNoYWJsZVNlbGVjdCwgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5pbXBvcnQgeyBJTkRJQV9TVEFURVMgfSBmcm9tICcuL2luZGlhLXN0YXRlcy5qcydcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5cbmNvbnN0IFNUQVRFX09QVElPTlMgPSBJTkRJQV9TVEFURVMubWFwKChpdGVtKSA9PiAoe1xuICB2YWx1ZTogaXRlbS5jb2RlLFxuICBsYWJlbDogYCR7aXRlbS5uYW1lfSAoJHtpdGVtLmNvZGV9KWAsXG59KSlcblxuY29uc3QgUGluY29kZUVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlLCBhY3Rpb24gfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBpc05ldyA9IGFjdGlvbj8ubmFtZSA9PT0gJ25ldycgfHwgIXJlY29yZD8uaWRcbiAgY29uc3QgcmVhZE9ubHkgPSBhY3Rpb24/Lm5hbWUgPT09ICdzaG93J1xuICBjb25zdCBpc0FjdGl2ZSA9IGlzTmV3ICYmIChwYXJhbXMuaXNBY3RpdmUgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBY3RpdmUgPT09ICcnKVxuICAgID8gdHJ1ZVxuICAgIDogaXNGbGFnT24ocGFyYW1zLmlzQWN0aXZlKVxuICBjb25zdCBtb3JuaW5nRW5hYmxlZCA9IGlzTmV3ICYmIChwYXJhbXMubW9ybmluZ0VuYWJsZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMubW9ybmluZ0VuYWJsZWQgPT09ICcnKVxuICAgID8gdHJ1ZVxuICAgIDogaXNGbGFnT24ocGFyYW1zLm1vcm5pbmdFbmFibGVkKVxuICBjb25zdCBleHByZXNzRW5hYmxlZCA9IGlzTmV3ICYmIChwYXJhbXMuZXhwcmVzc0VuYWJsZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuZXhwcmVzc0VuYWJsZWQgPT09ICcnKVxuICAgID8gZmFsc2VcbiAgICA6IGlzRmxhZ09uKHBhcmFtcy5leHByZXNzRW5hYmxlZClcbiAgY29uc3QgW3BhcnRuZXJzLCBzZXRQYXJ0bmVyc10gPSB1c2VTdGF0ZShbXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLmlzQWN0aXZlID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQWN0aXZlID09PSAnJykpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnaXNBY3RpdmUnLCB0cnVlKVxuICAgIH1cbiAgICBpZiAoaXNOZXcgJiYgKHBhcmFtcy5tb3JuaW5nRW5hYmxlZCA9PT0gdW5kZWZpbmVkIHx8IHBhcmFtcy5tb3JuaW5nRW5hYmxlZCA9PT0gJycpKSB7XG4gICAgICBoYW5kbGVDaGFuZ2UoJ21vcm5pbmdFbmFibGVkJywgdHJ1ZSlcbiAgICB9XG4gICAgaWYgKGlzTmV3ICYmIChwYXJhbXMuZXhwcmVzc0VuYWJsZWQgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuZXhwcmVzc0VuYWJsZWQgPT09ICcnKSkge1xuICAgICAgaGFuZGxlQ2hhbmdlKCdleHByZXNzRW5hYmxlZCcsIGZhbHNlKVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtpc05ld10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgaWdub3JlID0gZmFsc2VcbiAgICBhcGlcbiAgICAgIC5yZXNvdXJjZUFjdGlvbih7IHJlc291cmNlSWQ6ICdEZWxpdmVyeVBhcnRuZXInLCBhY3Rpb25OYW1lOiAnbGlzdCcsIHBhcmFtczogeyBwZXJQYWdlOiAyMDAgfSB9KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmUpIHJldHVyblxuICAgICAgICBjb25zdCByZWNvcmRzID0gcmVzcG9uc2UuZGF0YT8ucmVjb3JkcyB8fCBbXVxuICAgICAgICBzZXRQYXJ0bmVycyhcbiAgICAgICAgICByZWNvcmRzLm1hcCgoaXRlbSkgPT4gKHtcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmlkIHx8IGl0ZW0ucGFyYW1zPy5pZCxcbiAgICAgICAgICAgIGxhYmVsOiBpc0ZsYWdPbihpdGVtLnBhcmFtcz8uaXNBY3RpdmUpXG4gICAgICAgICAgICAgID8gaXRlbS5wYXJhbXM/Lm5hbWUgfHwgJ1BhcnRuZXInXG4gICAgICAgICAgICAgIDogYCR7aXRlbS5wYXJhbXM/Lm5hbWUgfHwgJ1BhcnRuZXInfSAoaW5hY3RpdmUpYCxcbiAgICAgICAgICB9KSksXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBpZiAoIWlnbm9yZSkgc2V0UGFydG5lcnMoW10pXG4gICAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBlcnJvcnMgPSB1c2VNZW1vKCgpID0+IHJlY29yZD8uZXJyb3JzIHx8IHt9LCBbcmVjb3JkPy5lcnJvcnNdKVxuICBjb25zdCBwYXJ0bmVySWQgPSBwYXJhbXMucGFydG5lcklkIHx8IHBhcmFtcy5wYXJ0bmVyIHx8ICcnXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBwaW5jb2RlJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGlzTmV3ID8gJ1BpbmNvZGUgYWRkZWQnIDogJ1BpbmNvZGUgdXBkYXRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSBwaW5jb2RlLiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57aXNOZXcgPyAnQWRkIHNlcnZpY2VhYmxlIHBpbmNvZGUnIDogYFBJTiAke3BhcmFtcy5waW5jb2RlIHx8ICcnfWB9PC9IMz5cbiAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAwLCBjb2xvcjogJyNmZmYnLCBvcGFjaXR5OiAwLjkgfX0+XG4gICAgICAgICAgQ3VzdG9tZXJzIGNhbiBzYXZlIGFuIGFkZHJlc3MgYW5kIGNoZWNrIG91dCBvbmx5IHdoZW4gdGhpcyBwaW5jb2RlIGlzIGFjdGl2ZS5cbiAgICAgICAgPC9wPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWdyaWRcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+RGVsaXZlcnkgY292ZXJhZ2U8L2g0PlxuICAgICAgICAgIDxwPlR1cm4gdGhpcyBvZmYgdG8gc3RvcCB0YWtpbmcgb3JkZXJzIGZvciB0aGlzIFBJTiB3aXRob3V0IGRlbGV0aW5nIGl0LjwvcD5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgIHRpdGxlPXtpc0FjdGl2ZSA/ICdXZSBkZWxpdmVyIGhlcmUnIDogJ05vdCBkZWxpdmVyaW5nJ31cbiAgICAgICAgICAgIGhpbnQ9e2lzQWN0aXZlID8gJ0FkZHJlc3Mgc2F2ZSBhbmQgY2hlY2tvdXQgYXJlIGFsbG93ZWQnIDogJ0N1c3RvbWVycyB3aWxsIHNlZSB0aGF0IHRoaXMgUElOIGlzIG5vdCBzZXJ2aWNlYWJsZSd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdpc0FjdGl2ZScsIG5leHQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5EZWxpdmVyeSBvcHRpb25zPC9oND5cbiAgICAgICAgICA8cD5UdXJuIGFuIG9wdGlvbiBvZmYgdG8gc2hvdyBpdCBhcyBjb21pbmcgc29vbiBhdCBjaGVja291dC4gSWYgYm90aCBhcmUgb2ZmLCB0aGlzIFBJTiBpcyBub3QgZGVsaXZlcmFibGUuPC9wPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e21vcm5pbmdFbmFibGVkfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgb25MYWJlbD1cIk9uXCJcbiAgICAgICAgICAgIG9mZkxhYmVsPVwiT2ZmXCJcbiAgICAgICAgICAgIHRpdGxlPVwiTW9ybmluZyBkZWxpdmVyeVwiXG4gICAgICAgICAgICBoaW50PXttb3JuaW5nRW5hYmxlZCA/ICdTaG9wcGVycyBjYW4gY2hvb3NlIG1vcm5pbmcgZGVsaXZlcnknIDogJ1Nob3duIGFzIGNvbWluZyBzb29uJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4gc2V0RmllbGQoJ21vcm5pbmdFbmFibGVkJywgbmV4dCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogMTIgfX0gLz5cbiAgICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgICBjaGVja2VkPXtleHByZXNzRW5hYmxlZH1cbiAgICAgICAgICAgIGRpc2FibGVkPXtyZWFkT25seX1cbiAgICAgICAgICAgIG9uTGFiZWw9XCJPblwiXG4gICAgICAgICAgICBvZmZMYWJlbD1cIk9mZlwiXG4gICAgICAgICAgICB0aXRsZT1cIkV4cHJlc3MgZGVsaXZlcnlcIlxuICAgICAgICAgICAgaGludD17ZXhwcmVzc0VuYWJsZWQgPyAnU2hvcHBlcnMgY2FuIGNob29zZSBFeHByZXNzIGRlbGl2ZXJ5JyA6ICdTaG93biBhcyBjb21pbmcgc29vbid9XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdleHByZXNzRW5hYmxlZCcsIG5leHQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Bc3NpZ25lZCBwYXJ0bmVyPC9oND5cbiAgICAgICAgICA8cD5OZXcgb3JkZXJzIGluIHRoaXMgUElOIGFyZSBhdXRvLWFzc2lnbmVkIHRvIHRoaXMgcGFydG5lci4gWW91IGNhbiByZWFzc2lnbiBsYXRlciBvbiB0aGUgb3JkZXIuPC9wPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIERlbGl2ZXJ5IHBhcnRuZXIgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktb3B0aW9uYWxcIj4ob3B0aW9uYWwpPC9zcGFuPlxuICAgICAgICAgICAgPFNlYXJjaGFibGVTZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcnRuZXJJZH1cbiAgICAgICAgICAgICAgb3B0aW9ucz17W3sgdmFsdWU6ICcnLCBsYWJlbDogJ05vIHBhcnRuZXIgYXNzaWduZWQnIH0sIC4uLnBhcnRuZXJzXX1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3JlYWRPbmx5fVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRGaWVsZCgncGFydG5lcklkJywgbmV4dClcbiAgICAgICAgICAgICAgICBzZXRGaWVsZCgncGFydG5lcicsIG5leHQpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VsZWN0IGEgcGFydG5lclwiXG4gICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyPVwiU2VhcmNoIHBhcnRuZXJzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5Mb2NhdGlvbjwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFBpbmNvZGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoPXs2fVxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHkgfHwgIWlzTmV3fVxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnBpbmNvZGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdwaW5jb2RlJywgZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJykuc2xpY2UoMCwgNikpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjYtZGlnaXQgUElOXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7ZXJyb3JzLnBpbmNvZGUgPyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPntlcnJvcnMucGluY29kZS5tZXNzYWdlfTwvc3Bhbj4gOiAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5JbmRpYSBQSU4gY29kZSwgNiBkaWdpdHM8L3NwYW4+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQXJlYSBuYW1lIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLW9wdGlvbmFsXCI+KG9wdGlvbmFsKTwvc3Bhbj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuYXJlYUxhYmVsIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZCgnYXJlYUxhYmVsJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBbmRoZXJpIFdlc3QsIEJhbmRyYSwg4oCmXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIENpdHlcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY2l0eSB8fCAnJ31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2NpdHknLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIk11bWJhaVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge2Vycm9ycy5jaXR5ID8gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3JzLmNpdHkubWVzc2FnZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFN0YXRlXG4gICAgICAgICAgICA8U2VhcmNoYWJsZVNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLnN0YXRlQ29kZSB8fCBwYXJhbXMuc3RhdGUgfHwgJyd9XG4gICAgICAgICAgICAgIG9wdGlvbnM9e1t7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3Qgc3RhdGUnIH0sIC4uLlNUQVRFX09QVElPTlNdfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17cmVhZE9ubHl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsobmV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdzdGF0ZUNvZGUnLCBuZXh0KVxuICAgICAgICAgICAgICAgIHNldEZpZWxkKCdzdGF0ZScsIG5leHQpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VsZWN0IHN0YXRlXCJcbiAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI9XCJTZWFyY2ggc3RhdGVzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7ZXJyb3JzLnN0YXRlIHx8IGVycm9ycy5zdGF0ZUNvZGUgPyAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+XG4gICAgICAgICAgICAgICAgeyhlcnJvcnMuc3RhdGUgfHwgZXJyb3JzLnN0YXRlQ29kZSkubWVzc2FnZX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPkFsbCBJbmRpYW4gc3RhdGVzIGFuZCB1bmlvbiB0ZXJyaXRvcmllczwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIHtyZWFkT25seSA/IG51bGwgOiAoXG4gICAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgICAge2xvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgICB7aXNOZXcgPyAnQWRkIHBpbmNvZGUnIDogJ1NhdmUgcGluY29kZSd9XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvQm94PlxuICAgICAgKX1cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBQaW5jb2RlRWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEFwaUNsaWVudCwgdXNlTm90aWNlIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IFN0YXR1c1N3aXRjaCwgaXNGbGFnT24gfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuY29uc3QgU3RhdHVzVG9nZ2xlID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkLCByZXNvdXJjZSwgcHJvcGVydHksIHdoZXJlLCBvbkNoYW5nZSB9ID0gcHJvcHNcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKClcbiAgY29uc3QgZmllbGQgPSBwcm9wZXJ0eT8ucGF0aCB8fCAnaXNBY3RpdmUnXG4gIGNvbnN0IGFjdGlvbk5hbWUgPSBwcm9wZXJ0eT8uY3VzdG9tPy5hY3Rpb25OYW1lIHx8ICd0b2dnbGVBY3RpdmUnXG4gIGNvbnN0IG9uTGFiZWwgPSBwcm9wZXJ0eT8uY3VzdG9tPy5vbkxhYmVsIHx8ICdBY3RpdmUnXG4gIGNvbnN0IG9mZkxhYmVsID0gcHJvcGVydHk/LmN1c3RvbT8ub2ZmTGFiZWwgfHwgJ0luYWN0aXZlJ1xuICBjb25zdCByYXcgPSByZWNvcmQ/LnBhcmFtcz8uW2ZpZWxkXVxuICBjb25zdCBbY2hlY2tlZCwgc2V0Q2hlY2tlZF0gPSB1c2VTdGF0ZShpc0ZsYWdPbihyYXcpKVxuICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldENoZWNrZWQoaXNGbGFnT24ocmF3KSlcbiAgfSwgW3JhdywgcmVjb3JkPy5pZF0pXG5cbiAgY29uc3QgcGVyc2lzdCA9IGFzeW5jIChuZXh0KSA9PiB7XG4gICAgaWYgKCFyZWNvcmQ/LmlkKSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnJlY29yZEFjdGlvbih7XG4gICAgICAgIHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuICAgICAgICByZWNvcmRJZDogcmVjb3JkLmlkLFxuICAgICAgICBhY3Rpb25OYW1lLFxuICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgZGF0YTogeyBbZmllbGRdOiBuZXh0IH0sXG4gICAgICB9KVxuICAgICAgY29uc3Qgc2F2ZWQgPSByZXNwb25zZS5kYXRhPy5yZWNvcmQ/LnBhcmFtcz8uW2ZpZWxkXVxuICAgICAgc2V0Q2hlY2tlZChzYXZlZCA9PT0gdW5kZWZpbmVkID8gbmV4dCA6IGlzRmxhZ09uKHNhdmVkKSlcbiAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlLmRhdGE/Lm5vdGljZVxuICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgbWVzc2FnZTogbm90aWNlPy5tZXNzYWdlIHx8IChuZXh0ID8gYE1hcmtlZCAke29uTGFiZWwudG9Mb3dlckNhc2UoKX1gIDogYE1hcmtlZCAke29mZkxhYmVsLnRvTG93ZXJDYXNlKCl9YCksXG4gICAgICAgIHR5cGU6IG5vdGljZT8udHlwZSB8fCAnc3VjY2VzcycsXG4gICAgICB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgdXBkYXRlIHN0YXR1cy4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgaGFuZGxlQ2hhbmdlID0gKG5leHQpID0+IHtcbiAgICBpZiAod2hlcmUgPT09ICdlZGl0JyAmJiB0eXBlb2Ygb25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHNldENoZWNrZWQobmV4dClcbiAgICAgIG9uQ2hhbmdlKGZpZWxkLCBuZXh0KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHBlcnNpc3QobmV4dClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPFN0YXR1c1N3aXRjaFxuICAgICAgY29tcGFjdD17d2hlcmUgIT09ICdlZGl0J31cbiAgICAgIGNoZWNrZWQ9e2NoZWNrZWR9XG4gICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgIG9uTGFiZWw9e29uTGFiZWx9XG4gICAgICBvZmZMYWJlbD17b2ZmTGFiZWx9XG4gICAgICB0aXRsZT17d2hlcmUgPT09ICdlZGl0JyA/IChjaGVja2VkID8gb25MYWJlbCA6IG9mZkxhYmVsKSA6IHVuZGVmaW5lZH1cbiAgICAgIGhpbnQ9e3doZXJlID09PSAnZWRpdCcgPyBwcm9wZXJ0eT8uZGVzY3JpcHRpb24gOiB1bmRlZmluZWR9XG4gICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlfVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgU3RhdHVzVG9nZ2xlXG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlTWVtbyB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IFN0YXR1c1N3aXRjaCwgaXNGbGFnT24gfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5mdW5jdGlvbiBwYWQodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucGFkU3RhcnQoMiwgJzAnKVxufVxuXG5mdW5jdGlvbiB0b0RhdGVJbnB1dCh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJydcbiAgY29uc3QgdGV4dCA9IFN0cmluZyh2YWx1ZSlcbiAgaWYgKC9eXFxkezR9LVxcZHsyfS1cXGR7Mn0vLnRlc3QodGV4dCkpIHJldHVybiB0ZXh0LnNsaWNlKDAsIDEwKVxuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpXG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gJydcbiAgcmV0dXJuIGAke2RhdGUuZ2V0RnVsbFllYXIoKX0tJHtwYWQoZGF0ZS5nZXRNb250aCgpICsgMSl9LSR7cGFkKGRhdGUuZ2V0RGF0ZSgpKX1gXG59XG5cbmZ1bmN0aW9uIGZvcm1hdFdoZW4odmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICfigJQnXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcbiAgaWYgKE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiAn4oCUJ1xuICByZXR1cm4gZGF0ZS50b0xvY2FsZVN0cmluZygnZW4tSU4nLCB7IGRhdGVTdHlsZTogJ21lZGl1bScsIHRpbWVTdHlsZTogJ3Nob3J0JyB9KVxufVxuXG5mdW5jdGlvbiBwYXJzZUFkZHJlc3NlcyhwYXJhbXMpIHtcbiAgY29uc3QgcmF3ID0gcGFyYW1zLmFkZHJlc3Nlc1xuICBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSByZXR1cm4gcmF3LmZpbHRlcihCb29sZWFuKVxuICBpZiAocmF3ICYmIHR5cGVvZiByYXcgPT09ICdvYmplY3QnKSByZXR1cm4gW3Jhd11cbiAgaWYgKHR5cGVvZiByYXcgPT09ICdzdHJpbmcnICYmIHJhdy50cmltKCkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJzZWQpKSByZXR1cm4gcGFyc2VkLmZpbHRlcihCb29sZWFuKVxuICAgICAgaWYgKHBhcnNlZCAmJiB0eXBlb2YgcGFyc2VkID09PSAnb2JqZWN0JykgcmV0dXJuIFtwYXJzZWRdXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBmbGF0dGVuZWQgQWRtaW5KUyBwYXJhbXMgYmVsb3dcbiAgICB9XG4gIH1cblxuICBjb25zdCBncm91cGVkID0ge31cbiAgT2JqZWN0LmVudHJpZXMocGFyYW1zKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICBjb25zdCBtYXRjaCA9IGtleS5tYXRjaCgvXmFkZHJlc3Nlc1xcLihcXGQrKVxcLiguKykkLylcbiAgICBpZiAoIW1hdGNoIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSByZXR1cm5cbiAgICBjb25zdCBbLCBpbmRleCwgZmllbGRdID0gbWF0Y2hcbiAgICBncm91cGVkW2luZGV4XSA9IGdyb3VwZWRbaW5kZXhdIHx8IHt9XG4gICAgZ3JvdXBlZFtpbmRleF1bZmllbGRdID0gdmFsdWVcbiAgfSlcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGdyb3VwZWQpXG4gICAgLnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSlcbiAgICAubWFwKChrZXkpID0+IGdyb3VwZWRba2V5XSlcbn1cblxuZnVuY3Rpb24gYWRkcmVzc0xpbmVzKGFkZHJlc3MpIHtcbiAgcmV0dXJuIFtcbiAgICBhZGRyZXNzLmxpbmUxLFxuICAgIGFkZHJlc3MubGluZTIsXG4gICAgW2FkZHJlc3MuY2l0eSwgYWRkcmVzcy5zdGF0ZSwgYWRkcmVzcy5waW5jb2RlXS5maWx0ZXIoQm9vbGVhbikuam9pbignLCAnKSxcbiAgICBhZGRyZXNzLmxhbmRtYXJrID8gYExhbmRtYXJrOiAke2FkZHJlc3MubGFuZG1hcmt9YCA6ICcnLFxuICBdLmZpbHRlcihCb29sZWFuKVxufVxuXG5jb25zdCBDdXN0b21lckVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHJlY29yZCwgaGFuZGxlQ2hhbmdlLCBzdWJtaXQ6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZyB9ID0gdXNlUmVjb3JkKFxuICAgIGluaXRpYWxSZWNvcmQsXG4gICAgcmVzb3VyY2UuaWQsXG4gIClcbiAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgfHwge31cbiAgY29uc3QgaXNBY3RpdmUgPSBwYXJhbXMuaXNBY3RpdmUgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBY3RpdmUgPT09ICcnXG4gICAgPyB0cnVlXG4gICAgOiBpc0ZsYWdPbihwYXJhbXMuaXNBY3RpdmUpXG4gIGNvbnN0IGFkZHJlc3NlcyA9IHVzZU1lbW8oKCkgPT4gcGFyc2VBZGRyZXNzZXMocGFyYW1zKSwgW3BhcmFtc10pXG4gIGNvbnN0IGVycm9ycyA9IHVzZU1lbW8oKCkgPT4gcmVjb3JkPy5lcnJvcnMgfHwge30sIFtyZWNvcmQ/LmVycm9yc10pXG4gIGNvbnN0IHNldEZpZWxkID0gKGtleSwgdmFsdWUpID0+IGhhbmRsZUNoYW5nZShrZXksIHZhbHVlKVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBoYW5kbGVTdWJtaXQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGljZSA9IHJlc3BvbnNlPy5kYXRhPy5ub3RpY2VcbiAgICAgICAgaWYgKG5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IG5vdGljZS5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2F2ZSBjdXN0b21lcicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAnQ3VzdG9tZXIgdXBkYXRlZCcsIHR5cGU6ICdzdWNjZXNzJyB9KVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdDb3VsZCBub3Qgc2F2ZSBjdXN0b21lci4gUGxlYXNlIHRyeSBhZ2Fpbi4nLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICB9KVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGFzPVwiZm9ybVwiIG9uU3VibWl0PXtzdWJtaXR9IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1mb3JtXCI+XG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1oZXJvXCI+XG4gICAgICAgIDxIMyBjb2xvcj1cIndoaXRlXCI+e3BhcmFtcy5uYW1lIHx8ICdDdXN0b21lcid9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgICs5MSB7cGFyYW1zLnBob25lIHx8ICfigJQnfSDCtyBqb2luZWQge2Zvcm1hdFdoZW4ocGFyYW1zLmNyZWF0ZWRBdCl9XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1ncmlkXCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PkFjY291bnQgc3RhdHVzPC9oND5cbiAgICAgICAgICA8cD5JbmFjdGl2ZSBjdXN0b21lcnMgY2Fubm90IHNpZ24gaW4gd2l0aCB0aGlzIG1vYmlsZSBudW1iZXIuPC9wPlxuICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2lzQWN0aXZlfVxuICAgICAgICAgICAgdGl0bGU9e2lzQWN0aXZlID8gJ0FjdGl2ZScgOiAnSW5hY3RpdmUnfVxuICAgICAgICAgICAgaGludD17aXNBY3RpdmUgPyAnQ2FuIGxvZyBpbiBvbiB0aGUgd2Vic2l0ZSBhbmQgYXBwJyA6ICdMb2dpbiBpcyBibG9ja2VkIHVudGlsIHlvdSB0dXJuIHRoaXMgb24nfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhuZXh0KSA9PiBzZXRGaWVsZCgnaXNBY3RpdmUnLCBuZXh0KX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgICA8aDQ+UHJvZmlsZTwvaDQ+XG4gICAgICAgICAgPHA+UGhvbmUgY29tZXMgZnJvbSBPVFAgbG9naW4gYW5kIHN0YXlzIGFzIHRoZSBjdXN0b21lcuKAmXMgbG9naW4gaWQuPC9wPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIE5hbWVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm5hbWUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCduYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJDdXN0b21lciBuYW1lXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7ZXJyb3JzLm5hbWUgPyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1maWVsZC1lcnJvclwiPntlcnJvcnMubmFtZS5tZXNzYWdlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tdHdvXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIE1vYmlsZVxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCIgdmFsdWU9e3BhcmFtcy5waG9uZSB8fCAnJ30gcmVhZE9ubHkgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgIERhdGUgb2YgYmlydGhcbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwiZGF0ZVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3RvRGF0ZUlucHV0KHBhcmFtcy5kYXRlT2ZCaXJ0aCl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2RhdGVPZkJpcnRoJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAge2Vycm9ycy5kYXRlT2ZCaXJ0aCA/IDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWVycm9yXCI+e2Vycm9ycy5kYXRlT2ZCaXJ0aC5tZXNzYWdlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5TYXZlZCBhZGRyZXNzZXM8L2g0PlxuICAgICAgICA8cD5cbiAgICAgICAgICB7YWRkcmVzc2VzLmxlbmd0aFxuICAgICAgICAgICAgPyBgJHthZGRyZXNzZXMubGVuZ3RofSBhZGRyZXNzJHthZGRyZXNzZXMubGVuZ3RoID09PSAxID8gJycgOiAnZXMnfSBzYXZlZCBpbiB0aGUgY3VzdG9tZXIgYWNjb3VudC5gXG4gICAgICAgICAgICA6ICdUaGlzIGN1c3RvbWVyIGhhcyBub3Qgc2F2ZWQgYSBkZWxpdmVyeSBhZGRyZXNzIHlldC4nfVxuICAgICAgICA8L3A+XG4gICAgICAgIHthZGRyZXNzZXMubGVuZ3RoID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktYWRkcmVzcy1ncmlkXCI+XG4gICAgICAgICAgICB7YWRkcmVzc2VzLm1hcCgoYWRkcmVzcywgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgPGFydGljbGUga2V5PXthZGRyZXNzLmlkIHx8IGAke2FkZHJlc3MucGluY29kZX0tJHtpbmRleH1gfSBjbGFzc05hbWU9XCJ0b2tyaS1hZGRyZXNzLWNhcmRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWFkZHJlc3MtdG9wXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1hZGRyZXNzLWxhYmVsXCI+e2FkZHJlc3MubGFiZWwgfHwgJ0FkZHJlc3MnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIHthZGRyZXNzLnBpbmNvZGUgPyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1hZGRyZXNzLXBpblwiPnthZGRyZXNzLnBpbmNvZGV9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz57YWRkcmVzcy5uYW1lIHx8IHBhcmFtcy5uYW1lIHx8ICdDdXN0b21lcid9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAge2FkZHJlc3MucGhvbmUgPyA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1hZGRyZXNzLXBob25lXCI+KzkxIHthZGRyZXNzLnBob25lfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgIHthZGRyZXNzTGluZXMoYWRkcmVzcykubWFwKChsaW5lKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8cCBrZXk9e2xpbmV9PntsaW5lfTwvcD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9hcnRpY2xlPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAgU2F2ZSBjdXN0b21lclxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IEN1c3RvbWVyRWRpdFxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVJlY29yZCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBGbGFnQ2FyZCwgU3RhdHVzU3dpdGNoLCBpc0ZsYWdPbiB9IGZyb20gJy4vZm9ybS1jb250cm9scy5qc3gnXG5cbmNvbnN0IFJPTEVTID0gW1xuICB7IHZhbHVlOiAnc3RhZmYnLCB0aXRsZTogJ1N0YWZmJywgaGludDogJ0FjY2VzcyBvbmx5IHRoZSBhcmVhcyB5b3UgdGljayBiZWxvdycgfSxcbiAgeyB2YWx1ZTogJ2FkbWluJywgdGl0bGU6ICdBZG1pbicsIGhpbnQ6ICdGdWxsIGFjY2VzcyB0byB0aGUgQ01TJyB9LFxuICB7IHZhbHVlOiAnc3VwZXJfYWRtaW4nLCB0aXRsZTogJ1N1cGVyIGFkbWluJywgaGludDogJ0Z1bGwgYWNjZXNzLCBzYW1lIGFzIGFkbWluJyB9LFxuXVxuXG5jb25zdCBQRVJNSVNTSU9OUyA9IFtcbiAgeyBrZXk6ICdtYW5hZ2VQcm9kdWN0cycsIGxhYmVsOiAnUHJvZHVjdHMnLCBoaW50OiAnQWRkIGFuZCBlZGl0IHByb2R1Y3RzJyB9LFxuICB7IGtleTogJ21hbmFnZUNhdGFsb2cnLCBsYWJlbDogJ0NhdGFsb2cnLCBoaW50OiAnQ2F0ZWdvcmllcyBhbmQgY29sbGVjdGlvbnMnIH0sXG4gIHsga2V5OiAnbWFuYWdlTWVkaWEnLCBsYWJlbDogJ01lZGlhJywgaGludDogJ1VwbG9hZCBhbmQgcmVwbGFjZSBpbWFnZXMnIH0sXG4gIHsga2V5OiAnbWFuYWdlT3JkZXJzJywgbGFiZWw6ICdPcmRlcnMnLCBoaW50OiAnVmlldyBhbmQgdXBkYXRlIG9yZGVycycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VDb3Vwb25zJywgbGFiZWw6ICdDb3Vwb25zJywgaGludDogJ0NyZWF0ZSBkaXNjb3VudCBjb2RlcycgfSxcbiAgeyBrZXk6ICdtYW5hZ2VDb250ZW50JywgbGFiZWw6ICdDb250ZW50JywgaGludDogJ1BhZ2VzIGFuZCByZXZpZXdzJyB9LFxuICB7IGtleTogJ21hbmFnZVNldHRpbmdzJywgbGFiZWw6ICdTZXR0aW5ncycsIGhpbnQ6ICdTdG9yZSBhbmQgaG9tZXBhZ2Ugc2V0dGluZ3MnIH0sXG4gIHsga2V5OiAnbWFuYWdlVXNlcnMnLCBsYWJlbDogJ1RlYW0nLCBoaW50OiAnQ3JlYXRlIHVzZXJzIGFuZCBjaGFuZ2UgYWNjZXNzJyB9LFxuXVxuXG5mdW5jdGlvbiBGaWVsZEVycm9yKHsgZXJyb3IgfSkge1xuICBpZiAoIWVycm9yPy5tZXNzYWdlKSByZXR1cm4gbnVsbFxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtZXJyb3JcIj57ZXJyb3IubWVzc2FnZX08L3NwYW4+XG59XG5cbmZ1bmN0aW9uIFBhc3N3b3JkRmllbGQoeyBsYWJlbCwgdmFsdWUsIG9uQ2hhbmdlLCBlcnJvciwgcGxhY2Vob2xkZXIgfSkge1xuICBjb25zdCBbdmlzaWJsZSwgc2V0VmlzaWJsZV0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgcmV0dXJuIChcbiAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICB7bGFiZWx9XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1wYXNzd29yZC13cmFwXCI+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgdHlwZT17dmlzaWJsZSA/ICd0ZXh0JyA6ICdwYXNzd29yZCd9XG4gICAgICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uQ2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e3BsYWNlaG9sZGVyfVxuICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1wYXNzd29yZC10b2dnbGVcIlxuICAgICAgICAgIGFyaWEtbGFiZWw9e3Zpc2libGUgPyAnSGlkZSBwYXNzd29yZCcgOiAnU2hvdyBwYXNzd29yZCd9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VmlzaWJsZSgoY3VycmVudCkgPT4gIWN1cnJlbnQpfVxuICAgICAgICA+XG4gICAgICAgICAge3Zpc2libGUgPyAnSGlkZScgOiAnU2hvdyd9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9zcGFuPlxuICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9yfSAvPlxuICAgIDwvbGFiZWw+XG4gIClcbn1cblxuY29uc3QgVGVhbUVkaXQgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQ6IGluaXRpYWxSZWNvcmQsIHJlc291cmNlLCBhY3Rpb24gfSA9IHByb3BzXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHsgcmVjb3JkLCBoYW5kbGVDaGFuZ2UsIHN1Ym1pdDogaGFuZGxlU3VibWl0LCBsb2FkaW5nIH0gPSB1c2VSZWNvcmQoXG4gICAgaW5pdGlhbFJlY29yZCxcbiAgICByZXNvdXJjZS5pZCxcbiAgKVxuICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyB8fCB7fVxuICBjb25zdCBpc05ldyA9IGFjdGlvbj8ubmFtZSA9PT0gJ25ldycgfHwgIXJlY29yZD8uaWRcbiAgY29uc3Qgcm9sZSA9IHBhcmFtcy5yb2xlIHx8ICdzdGFmZidcbiAgY29uc3QgaXNBY3RpdmUgPVxuICAgIGlzTmV3ICYmIChwYXJhbXMuaXNBY3RpdmUgPT09IHVuZGVmaW5lZCB8fCBwYXJhbXMuaXNBY3RpdmUgPT09ICcnKVxuICAgICAgPyB0cnVlXG4gICAgICA6IGlzRmxhZ09uKHBhcmFtcy5pc0FjdGl2ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc05ldyAmJiAocGFyYW1zLmlzQWN0aXZlID09PSB1bmRlZmluZWQgfHwgcGFyYW1zLmlzQWN0aXZlID09PSAnJykpIHtcbiAgICAgIGhhbmRsZUNoYW5nZSgnaXNBY3RpdmUnLCB0cnVlKVxuICAgIH1cbiAgICBpZiAoaXNOZXcgJiYgIXBhcmFtcy5yb2xlKSBoYW5kbGVDaGFuZ2UoJ3JvbGUnLCAnc3RhZmYnKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW2lzTmV3XSlcblxuICBjb25zdCBlcnJvcnMgPSB1c2VNZW1vKCgpID0+IHJlY29yZD8uZXJyb3JzIHx8IHt9LCBbcmVjb3JkPy5lcnJvcnNdKVxuICBjb25zdCBzZXRGaWVsZCA9IChrZXksIHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2Uoa2V5LCB2YWx1ZSlcbiAgY29uc3QgcGVybWlzc2lvbk9uID0gKGtleSkgPT4gaXNGbGFnT24ocGFyYW1zW2BwZXJtaXNzaW9ucy4ke2tleX1gXSlcblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaGFuZGxlU3VibWl0KClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZT8uZGF0YT8ubm90aWNlXG4gICAgICAgIGlmIChub3RpY2U/LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBub3RpY2UubWVzc2FnZSB8fCAnQ291bGQgbm90IHNhdmUgdGVhbSBtZW1iZXInLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgICBtZXNzYWdlOiBpc05ldyA/ICdUZWFtIG1lbWJlciBjcmVhdGVkJyA6ICdUZWFtIG1lbWJlciB1cGRhdGVkJyxcbiAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogJ0NvdWxkIG5vdCBzYXZlIHRlYW0gbWVtYmVyLiBQbGVhc2UgdHJ5IGFnYWluLicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e3N1Ym1pdH0gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj57aXNOZXcgPyAnQWRkIHRlYW0gbWVtYmVyJyA6IHBhcmFtcy5uYW1lIHx8ICdUZWFtIG1lbWJlcid9PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIFRoZXkgc2lnbiBpbiB0byBUb2tyaWlpIENNUyB3aXRoIHVzZXJuYW1lIG9yIGVtYWlsLiBJbmFjdGl2ZSB1c2VycyBjYW5ub3QgbG9nIGluLlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5BY2NvdW50IHN0YXR1czwvaDQ+XG4gICAgICAgICAgPHA+VHVybiB0aGlzIG9mZiB0byBibG9jayBDTVMgbG9naW4gd2l0aG91dCBkZWxldGluZyB0aGUgYWNjb3VudC48L3A+XG4gICAgICAgICAgPFN0YXR1c1N3aXRjaFxuICAgICAgICAgICAgY2hlY2tlZD17aXNBY3RpdmV9XG4gICAgICAgICAgICB0aXRsZT17aXNBY3RpdmUgPyAnQWN0aXZlJyA6ICdJbmFjdGl2ZSd9XG4gICAgICAgICAgICBoaW50PXtpc0FjdGl2ZSA/ICdDYW4gc2lnbiBpbiB0byB0aGUgYWRtaW4gcGFuZWwnIDogJ0xvZ2luIGlzIGJsb2NrZWQgdW50aWwgeW91IHR1cm4gdGhpcyBvbid9XG4gICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKCdpc0FjdGl2ZScsIG5leHQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICAgIDxoND5Sb2xlPC9oND5cbiAgICAgICAgICA8cD5BZG1pbiBhbmQgc3VwZXIgYWRtaW4gZ2V0IGZ1bGwgYWNjZXNzLiBTdGFmZiBvbmx5IGdldHMgdGhlIHBlcm1pc3Npb25zIHlvdSBlbmFibGUuPC9wPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY2hvaWNlLXJvd1wiPlxuICAgICAgICAgICAge1JPTEVTLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8RmxhZ0NhcmRcbiAgICAgICAgICAgICAgICBrZXk9e2l0ZW0udmFsdWV9XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3JvbGUgPT09IGl0ZW0udmFsdWV9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2l0ZW0udGl0bGV9XG4gICAgICAgICAgICAgICAgaGludD17aXRlbS5oaW50fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpZWxkKCdyb2xlJywgaXRlbS52YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5Mb2dpbiBkZXRhaWxzPC9oND5cbiAgICAgICAgPHA+VXNlcm5hbWUgb3IgZW1haWwgY2FuIGJlIHVzZWQgb24gdGhlIENNUyBsb2dpbiBzY3JlZW4uPC9wPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi10d29cIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBGdWxsIG5hbWVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLm5hbWUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCduYW1lJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUZWFtIG1lbWJlciBuYW1lXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RmllbGRFcnJvciBlcnJvcj17ZXJyb3JzLm5hbWV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBVc2VybmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMudXNlcm5hbWUgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCd1c2VybmFtZScsIGV2ZW50LnRhcmdldC52YWx1ZS50cmltKCkpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImUuZy4gcmF2aS5jbXNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxGaWVsZEVycm9yIGVycm9yPXtlcnJvcnMudXNlcm5hbWV9IC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICBFbWFpbFxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgIHR5cGU9XCJlbWFpbFwiXG4gICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5lbWFpbCB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkKCdlbWFpbCcsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIm5hbWVAdG9rcmlpaS5jb21cIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEZpZWxkRXJyb3IgZXJyb3I9e2Vycm9ycy5lbWFpbH0gLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAge2lzTmV3ID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLXR3b1wiPlxuICAgICAgICAgICAgPFBhc3N3b3JkRmllbGRcbiAgICAgICAgICAgICAgbGFiZWw9XCJQYXNzd29yZFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucGFzc3dvcmQgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHNldEZpZWxkKCdwYXNzd29yZCcsIHZhbHVlKX1cbiAgICAgICAgICAgICAgZXJyb3I9e2Vycm9ycy5wYXNzd29yZH1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBdCBsZWFzdCA2IGNoYXJhY3RlcnNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxQYXNzd29yZEZpZWxkXG4gICAgICAgICAgICAgIGxhYmVsPVwiQ29uZmlybSBwYXNzd29yZFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuY29uZmlybVBhc3N3b3JkIHx8ICcnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiBzZXRGaWVsZCgnY29uZmlybVBhc3N3b3JkJywgdmFsdWUpfVxuICAgICAgICAgICAgICBlcnJvcj17ZXJyb3JzLmNvbmZpcm1QYXNzd29yZH1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUeXBlIHBhc3N3b3JkIGFnYWluXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9rcmktZmllbGQtaGludFwiPlVzZSBDaGFuZ2UgcGFzc3dvcmQgZnJvbSB0aGUgdGVhbSBsaXN0IHRvIHJlc2V0IGxvZ2luLjwvc3Bhbj5cbiAgICAgICAgKX1cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAge3JvbGUgPT09ICdzdGFmZicgPyAoXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgICAgPGg0PlBlcm1pc3Npb25zPC9oND5cbiAgICAgICAgICA8cD5Pbmx5IHVzZWQgZm9yIHN0YWZmLiBUb2dnbGUgd2hhdCB0aGlzIHBlcnNvbiBjYW4gb3BlbiBpbiB0aGUgQ01TLjwvcD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRva3JpLXBlcm0tbGlzdFwiPlxuICAgICAgICAgICAge1BFUk1JU1NJT05TLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17aXRlbS5rZXl9IGNsYXNzTmFtZT1cInRva3JpLXBlcm0tcm93XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nPntpdGVtLmxhYmVsfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgPHNwYW4+e2l0ZW0uaGludH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxTdGF0dXNTd2l0Y2hcbiAgICAgICAgICAgICAgICAgIGNvbXBhY3RcbiAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3Blcm1pc3Npb25PbihpdGVtLmtleSl9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KG5leHQpID0+IHNldEZpZWxkKGBwZXJtaXNzaW9ucy4ke2l0ZW0ua2V5fWAsIG5leHQpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICA8Qm94IGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAge2xvYWRpbmcgPyA8SWNvbiBpY29uPVwiTG9hZGVyXCIgc3BpbiAvPiA6IG51bGx9XG4gICAgICAgICAge2lzTmV3ID8gJ0NyZWF0ZSB0ZWFtIG1lbWJlcicgOiAnU2F2ZSB0ZWFtIG1lbWJlcid9XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgVGVhbUVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMywgSWNvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VOb3RpY2UsIHVzZVF1ZXJ5UGFyYW1zLCB1c2VSZWNvcmRzIH0gZnJvbSAnYWRtaW5qcydcbmNvbnN0IEZPTERFUlMgPSBbJ2FsbCcsICdwcm9kdWN0cycsICdjYXRlZ29yaWVzJywgJ3Jldmlld3MnLCAncGFnZXMnLCAnZ2VuZXJhbCddXG5cbmNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcLyskLywgJycpXG5cbmZ1bmN0aW9uIGZvcm1hdFNpemUoYnl0ZXMpIHtcbiAgY29uc3Qgc2l6ZSA9IE51bWJlcihieXRlcykgfHwgMFxuICBpZiAoc2l6ZSA8IDEwMjQpIHJldHVybiBgJHtzaXplfSBCYFxuICBpZiAoc2l6ZSA8IDEwMjQgKiAxMDI0KSByZXR1cm4gYCR7TWF0aC5yb3VuZChzaXplIC8gMTAyNCl9IEtCYFxuICByZXR1cm4gYCR7KHNpemUgLyAoMTAyNCAqIDEwMjQpKS50b0ZpeGVkKDEpfSBNQmBcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2hlbih2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJydcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxuICBpZiAoTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuICcnXG4gIHJldHVybiBkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tSU4nLCB7IGRheTogJ251bWVyaWMnLCBtb250aDogJ3Nob3J0JywgeWVhcjogJ251bWVyaWMnIH0pXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVVcmwocGF0aCwgYXBwVXJsKSB7XG4gIGlmICghcGF0aCkgcmV0dXJuICcnXG4gIGlmICgvXihodHRwcz86fGRhdGE6fGJsb2I6KS8udGVzdChwYXRoKSkgcmV0dXJuIHBhdGhcbiAgcmV0dXJuIGAke3dpdGhvdXRUcmFpbGluZ1NsYXNoKGFwcFVybCB8fCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKX0ke3BhdGh9YFxufVxuXG5jb25zdCBNZWRpYUxpYnJhcnkgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZXNvdXJjZSwgc2V0VGFnIH0gPSBwcm9wc1xuICBjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKVxuICBjb25zdCB7IHN0b3JlUGFyYW1zLCBmaWx0ZXJzIH0gPSB1c2VRdWVyeVBhcmFtcygpXG4gIGNvbnN0IHsgcmVjb3JkcywgbG9hZGluZywgZmV0Y2hEYXRhLCB0b3RhbCwgcGVyUGFnZSB9ID0gdXNlUmVjb3JkcyhyZXNvdXJjZS5pZClcbiAgY29uc3QgZmlsZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBbdXBsb2FkaW5nLCBzZXRVcGxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtidXN5SWQsIHNldEJ1c3lJZF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgZm9sZGVyID0gU3RyaW5nKGZpbHRlcnM/LmZvbGRlciB8fCAnYWxsJylcbiAgY29uc3QgY3VzdG9tID0gcmVzb3VyY2U/Lm9wdGlvbnM/LmN1c3RvbSB8fCB7fVxuICBjb25zdCBhcGlCYXNlVXJsID0gd2l0aG91dFRyYWlsaW5nU2xhc2goY3VzdG9tLmFwaUJhc2VVcmwgfHwgJy9hcGkvdjEnKVxuICBjb25zdCBhcHBVcmwgPSBjdXN0b20uYXBwVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW5cbiAgY29uc3QgdXBsb2FkRm9sZGVyID0gZm9sZGVyID09PSAnYWxsJyA/ICdnZW5lcmFsJyA6IGZvbGRlclxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNldFRhZykgc2V0VGFnKFN0cmluZyh0b3RhbCB8fCAwKSlcbiAgfSwgW3RvdGFsLCBzZXRUYWddKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKE51bWJlcihwZXJQYWdlKSA8IDUwKSBzdG9yZVBhcmFtcyh7IHBlclBhZ2U6ICc1MCcgfSlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGl0ZW1zID0gdXNlTWVtbyhcbiAgICAoKSA9PlxuICAgICAgKHJlY29yZHMgfHwgW10pLm1hcCgoaXRlbSkgPT4gKHtcbiAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgIG5hbWU6IGl0ZW0ucGFyYW1zPy5vcmlnaW5hbE5hbWUgfHwgaXRlbS5wYXJhbXM/LmZpbGVuYW1lIHx8ICdJbWFnZScsXG4gICAgICAgIGZvbGRlcjogaXRlbS5wYXJhbXM/LmZvbGRlciB8fCAnZ2VuZXJhbCcsXG4gICAgICAgIHBhdGg6IGl0ZW0ucGFyYW1zPy5wYXRoIHx8ICcnLFxuICAgICAgICBzaXplOiBpdGVtLnBhcmFtcz8uc2l6ZSxcbiAgICAgICAgY3JlYXRlZEF0OiBpdGVtLnBhcmFtcz8uY3JlYXRlZEF0LFxuICAgICAgICB1cmw6IHJlc29sdmVVcmwoaXRlbS5wYXJhbXM/LnBhdGgsIGFwcFVybCksXG4gICAgICB9KSksXG4gICAgW2FwcFVybCwgcmVjb3Jkc10sXG4gIClcblxuICBjb25zdCBzZXRGb2xkZXIgPSAobmV4dCkgPT4ge1xuICAgIHN0b3JlUGFyYW1zKHtcbiAgICAgIHBhZ2U6ICcxJyxcbiAgICAgIGZpbHRlcnM6IG5leHQgPT09ICdhbGwnID8ge30gOiB7IGZvbGRlcjogbmV4dCB9LFxuICAgIH0pXG4gIH1cblxuICBjb25zdCB1cGxvYWRGaWxlcyA9IGFzeW5jIChmaWxlcykgPT4ge1xuICAgIGNvbnN0IGxpc3QgPSBbLi4uZmlsZXNdLmZpbHRlcigoZmlsZSkgPT4gZmlsZS50eXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKVxuICAgIGlmICghbGlzdC5sZW5ndGgpIHJldHVyblxuICAgIHNldFVwbG9hZGluZyh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZm9sZGVyJywgdXBsb2FkRm9sZGVyKVxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2VVcmx9L21lZGlhL3VwbG9hZGAsIHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UgfHwgYENvdWxkIG5vdCB1cGxvYWQgJHtmaWxlLm5hbWV9YClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgbWVzc2FnZTogbGlzdC5sZW5ndGggPT09IDEgPyAnSW1hZ2UgdXBsb2FkZWQnIDogYCR7bGlzdC5sZW5ndGh9IGltYWdlcyB1cGxvYWRlZGAsXG4gICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgIH0pXG4gICAgICBmZXRjaERhdGEoKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdVcGxvYWQgZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRVcGxvYWRpbmcoZmFsc2UpXG4gICAgICBpZiAoZmlsZVJlZi5jdXJyZW50KSBmaWxlUmVmLmN1cnJlbnQudmFsdWUgPSAnJ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNvcHlQYXRoID0gYXN5bmMgKHBhdGgpID0+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocGF0aClcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdGaWxlIHBhdGggY29waWVkJywgdHlwZTogJ3N1Y2Nlc3MnIH0pXG4gICAgfSBjYXRjaCB7XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBwYXRoLCB0eXBlOiAnaW5mbycgfSlcbiAgICB9XG4gIH1cblxuICBjb25zdCByZW1vdmUgPSBhc3luYyAoaWQsIG5hbWUpID0+IHtcbiAgICBpZiAoIXdpbmRvdy5jb25maXJtKGBEZWxldGUg4oCcJHtuYW1lfeKAnT8gVGhpcyBjYW5ub3QgYmUgdW5kb25lLmApKSByZXR1cm5cbiAgICBzZXRCdXN5SWQoaWQpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZVVybH0vbWVkaWEvJHtpZH1gLCB7IG1ldGhvZDogJ0RFTEVURScgfSlcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEubWVzc2FnZSB8fCAnQ291bGQgbm90IGRlbGV0ZSBpbWFnZScpXG4gICAgICB9XG4gICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiBkYXRhLm1lc3NhZ2UgfHwgJ0ltYWdlIGRlbGV0ZWQnLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICAgIGZldGNoRGF0YSgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBkZWxldGUgaW1hZ2UnLCB0eXBlOiAnZXJyb3InIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3lJZCgnJylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWZvcm1cIj5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWhlcm9cIj5cbiAgICAgICAgPEgzIGNvbG9yPVwid2hpdGVcIj5NZWRpYSBsaWJyYXJ5PC9IMz5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgIFVwbG9hZCBpbWFnZXMgdXNlZCBvbiBwcm9kdWN0cywgY2F0ZWdvcmllcywgcmV2aWV3cywgYW5kIHRoZSBob21lcGFnZS4gRmlsZXMgc3RheSBvbiB0aGlzIHNlcnZlci5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1jYXJkXCI+XG4gICAgICAgIDxoND5VcGxvYWQ8L2g0PlxuICAgICAgICA8cD5cbiAgICAgICAgICBGaWxlcyBnbyBpbnRvIHRoZSA8c3Ryb25nPnt1cGxvYWRGb2xkZXJ9PC9zdHJvbmc+IGZvbGRlclxuICAgICAgICAgIHtmb2xkZXIgPT09ICdhbGwnID8gJyAoc2VsZWN0IGEgZm9sZGVyIGJlbG93IHRvIGNoYW5nZSB0aGlzKS4nIDogJy4nfVxuICAgICAgICA8L3A+XG4gICAgICAgIDxsYWJlbFxuICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLXVwbG9hZC1kcm9wXCJcbiAgICAgICAgICBvbkRyYWdPdmVyPXsoZXZlbnQpID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCl9XG4gICAgICAgICAgb25Ecm9wPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIHVwbG9hZEZpbGVzKGV2ZW50LmRhdGFUcmFuc2Zlci5maWxlcylcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHNwYW4+e3VwbG9hZGluZyA/ICdVcGxvYWRpbmfigKYnIDogJ0NsaWNrIG9yIGRyb3AgaW1hZ2VzIGhlcmUnfTwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHJlZj17ZmlsZVJlZn1cbiAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICAgIGFjY2VwdD1cImltYWdlLypcIlxuICAgICAgICAgICAgbXVsdGlwbGVcbiAgICAgICAgICAgIGRpc2FibGVkPXt1cGxvYWRpbmd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB1cGxvYWRGaWxlcyhldmVudC50YXJnZXQuZmlsZXMpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLWZpZWxkLWhpbnRcIj5KUEcsIFBORywgR0lGLCBvciBXZWJQIHVwIHRvIDVNQiBlYWNoPC9zcGFuPlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+TGlicmFyeTwvaDQ+XG4gICAgICAgIDxwPnt0b3RhbCB8fCAwfSBmaWxleyh0b3RhbCB8fCAwKSA9PT0gMSA/ICcnIDogJ3MnfXtmb2xkZXIgIT09ICdhbGwnID8gYCBpbiAke2ZvbGRlcn1gIDogJyd9LjwvcD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1mb2xkZXItY2hpcHNcIj5cbiAgICAgICAgICB7Rk9MREVSUy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAga2V5PXtpdGVtfVxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdG9rcmktZm9sZGVyLWNoaXAke2ZvbGRlciA9PT0gaXRlbSA/ICcgaXMtb24nIDogJyd9YH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Rm9sZGVyKGl0ZW0pfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7aXRlbSA9PT0gJ2FsbCcgPyAnQWxsIGZvbGRlcnMnIDogaXRlbX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7bG9hZGluZyA/IChcbiAgICAgICAgICA8VGV4dCBtdD1cInhsXCI+TG9hZGluZyBpbWFnZXPigKY8L1RleHQ+XG4gICAgICAgICkgOiBpdGVtcy5sZW5ndGggPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tZWRpYS1ncmlkXCI+XG4gICAgICAgICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICAgIDxhcnRpY2xlIGtleT17aXRlbS5pZH0gY2xhc3NOYW1lPVwidG9rcmktbWVkaWEtY2FyZFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9rcmktbWVkaWEtdGh1bWJcIj5cbiAgICAgICAgICAgICAgICAgIHtpdGVtLnVybCA/IDxpbWcgc3JjPXtpdGVtLnVybH0gYWx0PXtpdGVtLm5hbWV9IC8+IDogPHNwYW4+Tm8gcHJldmlldzwvc3Bhbj59XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHN0cm9uZyB0aXRsZT17aXRlbS5uYW1lfT57aXRlbS5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAge2l0ZW0uZm9sZGVyfSDCtyB7Zm9ybWF0U2l6ZShpdGVtLnNpemUpfVxuICAgICAgICAgICAgICAgICAge2l0ZW0uY3JlYXRlZEF0ID8gYCDCtyAke2Zvcm1hdFdoZW4oaXRlbS5jcmVhdGVkQXQpfWAgOiAnJ31cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1tZWRpYS1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uIHNpemU9XCJzbVwiIHZhcmlhbnQ9XCJ0ZXh0XCIgb25DbGljaz17KCkgPT4gY29weVBhdGgoaXRlbS5wYXRoKX0+XG4gICAgICAgICAgICAgICAgICAgIENvcHkgcGF0aFxuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeUlkID09PSBpdGVtLmlkfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiByZW1vdmUoaXRlbS5pZCwgaXRlbS5uYW1lKX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge2J1c3lJZCA9PT0gaXRlbS5pZCA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgRGVsZXRlXG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9hcnRpY2xlPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPFRleHQgbXQ9XCJ4bFwiPk5vIGltYWdlcyBpbiB0aGlzIGZvbGRlciB5ZXQuPC9UZXh0PlxuICAgICAgICApfVxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lZGlhTGlicmFyeVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgzLCBJY29uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZU5vdGljZSwgdXNlUmVjb3JkIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IGlzRmxhZ09uLCBTdGF0dXNTd2l0Y2ggfSBmcm9tICcuL2Zvcm0tY29udHJvbHMuanN4J1xuXG5jb25zdCBUYXhFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkOiBpbml0aWFsUmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHNcbiAgY29uc3QgeyByZWNvcmQsIGhhbmRsZUNoYW5nZSwgc3VibWl0OiBoYW5kbGVTdWJtaXQsIGxvYWRpbmcgfSA9IHVzZVJlY29yZChcbiAgICBpbml0aWFsUmVjb3JkLFxuICAgIHJlc291cmNlLmlkLFxuICApXG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpXG4gIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zIHx8IHt9XG5cbiAgY29uc3Qgc2V0RmllbGQgPSAoa2V5LCB2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKGtleSwgdmFsdWUpXG5cbiAgY29uc3QgaXNUYXhhYmxlQm9vbCA9IGlzRmxhZ09uKHBhcmFtcy5pc1RheGFibGUpXG5cbiAgY29uc3QgaGFuZGxlVGF4YWJsZVRvZ2dsZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHNldEZpZWxkKCdpc1RheGFibGUnLCB2YWx1ZSlcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBzZXRGaWVsZCgnZ3N0UmF0ZScsIDApXG4gICAgfSBlbHNlIGlmIChOdW1iZXIocGFyYW1zLmdzdFJhdGUgfHwgMCkgPT09IDApIHtcbiAgICAgIHNldEZpZWxkKCdnc3RSYXRlJywgNSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBvblN1Ym1pdCA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGV2ZW50Py5wcmV2ZW50RGVmYXVsdD8uKClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgaGFuZGxlU3VibWl0KClcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdUYXggY29uZmlndXJhdGlvbiB1cGRhdGVkIHN1Y2Nlc3NmdWxseS4nLCB0eXBlOiAnc3VjY2VzcycgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYWRkTm90aWNlKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHVwZGF0ZSB0YXggY29uZmlndXJhdGlvbicsIHR5cGU6ICdlcnJvcicgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggYXM9XCJmb3JtXCIgb25TdWJtaXQ9e29uU3VibWl0fSBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZm9ybVwiPlxuICAgICAgPEJveCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taGVhZFwiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxIMz57cGFyYW1zLnByb2R1Y3ROYW1lIHx8ICdFZGl0IFByb2R1Y3QgVGF4J308L0gzPlxuICAgICAgICAgIDxUZXh0IG9wYWNpdHk9ezAuN30+XG4gICAgICAgICAgICBDb25maWd1cmUgSFNOIGNvZGUgYW5kIEdTVCBwZXJjZW50YWdlIGZvciB0aGlzIHByb2R1Y3QuXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+UHJvZHVjdCBkZXRhaWxzPC9oND5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIFByb2R1Y3QgbmFtZVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1pbnB1dFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMucHJvZHVjdE5hbWUgfHwgJyd9XG4gICAgICAgICAgICAgIGRpc2FibGVkXG4gICAgICAgICAgICAgIHN0eWxlPXt7IG9wYWNpdHk6IDAuNywgY3Vyc29yOiAnbm90LWFsbG93ZWQnIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRva3JpLWNvdXBvbi1sYWJlbFwiPlxuICAgICAgICAgICAgQ2F0ZWdvcnlcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24taW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17cGFyYW1zLmNhdGVnb3J5TmFtZSB8fCAnR2VuZXJhbCd9XG4gICAgICAgICAgICAgIGRpc2FibGVkXG4gICAgICAgICAgICAgIHN0eWxlPXt7IG9wYWNpdHk6IDAuNywgY3Vyc29yOiAnbm90LWFsbG93ZWQnIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tY2FyZFwiPlxuICAgICAgICA8aDQ+VGF4YWJpbGl0eSBzdGF0dXM8L2g0PlxuICAgICAgICA8U3RhdHVzU3dpdGNoXG4gICAgICAgICAgY2hlY2tlZD17aXNUYXhhYmxlQm9vbH1cbiAgICAgICAgICB0aXRsZT1cIlRheGFibGVcIlxuICAgICAgICAgIGhpbnQ9e2lzVGF4YWJsZUJvb2wgPyAnR1NUIHdpbGwgYmUgY2hhcmdlZCBhdCBjaGVja291dCcgOiAnMCUgR1NUIChmcmVzaCBmcnVpdHMgLyBleGVtcHQpJ31cbiAgICAgICAgICBvbkxhYmVsPVwiWWVzXCJcbiAgICAgICAgICBvZmZMYWJlbD1cIk5vXCJcbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlVGF4YWJsZVRvZ2dsZX1cbiAgICAgICAgLz5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWNhcmRcIj5cbiAgICAgICAgPGg0PkdTVCAmIEhTTiBkZXRhaWxzPC9oND5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tZ3JpZFwiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0b2tyaS1jb3Vwb24tbGFiZWxcIj5cbiAgICAgICAgICAgIEhTTiBjb2RlXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3BhcmFtcy5oc25Db2RlIHx8ICcwODA4J31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2hzbkNvZGUnLCBldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImUuZy4gMDgwMiBmb3IgZHJ5IGZydWl0cywgMDgwOCBmb3IgZnJlc2ggZnJ1aXRzXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWxhYmVsXCI+XG4gICAgICAgICAgICBHU1QgJSByYXRlXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWlucHV0XCJcbiAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgIHN0ZXA9XCIwLjAxXCJcbiAgICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICAgIG1heD1cIjEwMFwiXG4gICAgICAgICAgICAgIHZhbHVlPXtwYXJhbXMuZ3N0UmF0ZSA/PyAoaXNUYXhhYmxlQm9vbCA/IDUgOiAwKX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGQoJ2dzdFJhdGUnLCBOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKSB8fCAwKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJlLmcuIDUgZm9yIGRyeSBmcnVpdHNcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPFRleHQgbXQ9XCJzbVwiIG9wYWNpdHk9ezAuN30gZm9udFNpemU9XCIxMnB4XCI+XG4gICAgICAgICAge2lzVGF4YWJsZUJvb2xcbiAgICAgICAgICAgID8gYEF0IGNoZWNrb3V0LCBpbnRyYS1zdGF0ZSBvcmRlcnMgc3BsaXQgaW50byAkeyhOdW1iZXIocGFyYW1zLmdzdFJhdGUgfHwgNSkgLyAyKS50b0ZpeGVkKDEpfSUgQ0dTVCArICR7KE51bWJlcihwYXJhbXMuZ3N0UmF0ZSB8fCA1KSAvIDIpLnRvRml4ZWQoMSl9JSBTR1NUOyBpbnRlci1zdGF0ZSBvcmRlcnMgY2hhcmdlICR7TnVtYmVyKHBhcmFtcy5nc3RSYXRlIHx8IDUpfSUgSUdTVC5gXG4gICAgICAgICAgICA6ICdQcm9kdWN0IGlzIGV4ZW1wdC9ub24tdGF4YWJsZSAoMCUgR1NUKS4nfVxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxCb3ggY2xhc3NOYW1lPVwidG9rcmktY291cG9uLWFjdGlvbnNcIj5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICB7bG9hZGluZyA/IDxJY29uIGljb249XCJMb2FkZXJcIiBzcGluIC8+IDogbnVsbH1cbiAgICAgICAgICBTYXZlIHRheCBzZXR0aW5nc1xuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRheEVkaXRcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuXG5mdW5jdGlvbiBjb3B5VGV4dCh2YWx1ZSkge1xuICBpZiAoIXZhbHVlIHx8ICFuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQpIHJldHVybiBQcm9taXNlLnJlamVjdCgpXG4gIHJldHVybiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh2YWx1ZSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUmF6b3JwYXlQYXltZW50SWQoeyByZWNvcmQgfSkge1xuICBjb25zdCBwYXltZW50SWQgPSBTdHJpbmcocmVjb3JkPy5wYXJhbXM/LnJhem9ycGF5UGF5bWVudElkIHx8ICcnKS50cmltKClcbiAgY29uc3QgcGFpZCA9IHJlY29yZD8ucGFyYW1zPy5wYXltZW50U3RhdHVzID09PSAncGFpZCdcbiAgY29uc3QgW2NvcGllZCwgc2V0Q29waWVkXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIGlmICghcGFpZCB8fCAhcGF5bWVudElkKSB7XG4gICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInRva3JpLXJ6cC1lbXB0eVwiPuKAlDwvc3Bhbj5cbiAgfVxuXG4gIGNvbnN0IGhhbmRsZUNvcHkgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBjb3B5VGV4dChwYXltZW50SWQpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxMjAwKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7fSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ0b2tyaS1yenAtY2VsbFwiIG9uQ2xpY2s9eyhldmVudCkgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9PlxuICAgICAgPGFcbiAgICAgICAgY2xhc3NOYW1lPVwidG9rcmktcnpwLWlkXCJcbiAgICAgICAgaHJlZj17YGh0dHBzOi8vZGFzaGJvYXJkLnJhem9ycGF5LmNvbS9hcHAvcGF5bWVudHMvJHtlbmNvZGVVUklDb21wb25lbnQocGF5bWVudElkKX1gfVxuICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcbiAgICAgICAgdGl0bGU9XCJPcGVuIHRoaXMgcGF5bWVudCBpbiBSYXpvcnBheVwiXG4gICAgICA+XG4gICAgICAgIHtwYXltZW50SWR9XG4gICAgICA8L2E+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ0b2tyaS1yenAtY29weVwiIG9uQ2xpY2s9e2hhbmRsZUNvcHl9PlxuICAgICAgICB7Y29waWVkID8gJ0NvcGllZCcgOiAnQ29weSd9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7XG4gIEJveCxcbiAgQnV0dG9uLFxuICBGb3JtR3JvdXAsXG4gIEgyLFxuICBJbnB1dCxcbiAgTGFiZWwsXG4gIE1lc3NhZ2VCb3gsXG4gIFRleHQsXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnXG5cbmNvbnN0IFJFTUVNQkVSRURfTE9HSU5fS0VZID0gJ3Rva3JpX2FkbWluX2xvZ2luJ1xuXG5jb25zdCBMb2dpbiA9ICgpID0+IHtcbiAgY29uc3QgeyBhY3Rpb24sIGVycm9yTWVzc2FnZSB9ID0gd2luZG93Ll9fQVBQX1NUQVRFX18gfHwge31cbiAgY29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpXG4gIGNvbnN0IGFkbWluUm9vdCA9IGFjdGlvbj8ucmVwbGFjZSgvXFwvbG9naW4kLywgJycpIHx8ICcnXG4gIGNvbnN0IGZvcmdvdFBhc3N3b3JkVXJsID0gYCR7YWRtaW5Sb290fS9mb3Jnb3QtcGFzc3dvcmRgXG4gIGNvbnN0IFtpZGVudGlmaWVyLCBzZXRJZGVudGlmaWVyXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbcmVtZW1iZXJMb2dpbiwgc2V0UmVtZW1iZXJMb2dpbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Nob3dQYXNzd29yZCwgc2V0U2hvd1Bhc3N3b3JkXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcmVtZW1iZXJlZExvZ2luID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFJFTUVNQkVSRURfTE9HSU5fS0VZKVxuICAgIGlmIChyZW1lbWJlcmVkTG9naW4pIHtcbiAgICAgIHNldElkZW50aWZpZXIocmVtZW1iZXJlZExvZ2luKVxuICAgICAgc2V0UmVtZW1iZXJMb2dpbih0cnVlKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgY29uc3QgaGFuZGxlU3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZm9ybSA9IGV2ZW50LmN1cnJlbnRUYXJnZXRcbiAgICBjb25zdCBlbWFpbElucHV0ID0gZm9ybS5lbGVtZW50cy5uYW1lZEl0ZW0oJ2VtYWlsJylcbiAgICBjb25zdCB2YWx1ZSA9XG4gICAgICAoZW1haWxJbnB1dCAmJiAndmFsdWUnIGluIGVtYWlsSW5wdXQgPyBTdHJpbmcoZW1haWxJbnB1dC52YWx1ZSkgOiBpZGVudGlmaWVyKS50cmltKClcblxuICAgIGlmIChlbWFpbElucHV0ICYmICd2YWx1ZScgaW4gZW1haWxJbnB1dCkge1xuICAgICAgZW1haWxJbnB1dC52YWx1ZSA9IHZhbHVlXG4gICAgfVxuXG4gICAgaWYgKHJlbWVtYmVyTG9naW4gJiYgdmFsdWUpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShSRU1FTUJFUkVEX0xPR0lOX0tFWSwgdmFsdWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShSRU1FTUJFUkVEX0xPR0lOX0tFWSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3hcbiAgICAgIGZsZXhcbiAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIlxuICAgICAgbWluSGVpZ2h0PVwiMTAwdmhcIlxuICAgICAgYmc9XCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMDIyYzIyLCAjMDQ3ODU3KVwiXG4gICAgICBwPVwieGxcIlxuICAgID5cbiAgICAgIDxCb3hcbiAgICAgICAgYmc9XCJ3aGl0ZVwiXG4gICAgICAgIHdpZHRoPXtbJzEwMCUnLCAnNDQwcHgnXX1cbiAgICAgICAgYm9yZGVyUmFkaXVzPVwiMThweFwiXG4gICAgICAgIGJveFNoYWRvdz1cIjAgMjRweCA3MHB4IHJnYmEoMiwgNDQsIDM0LCAwLjM1KVwiXG4gICAgICAgIHA9XCJ4M1wiXG4gICAgICA+XG4gICAgICAgIDxIMiBjb2xvcj1cIiMwMjJjMjJcIiBtYj1cInNtXCI+VG9rcmlpaSBDTVM8L0gyPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIiM2NDc0OGJcIiBtYj1cInhsXCI+XG4gICAgICAgICAgU2lnbiBpbiB3aXRoIHlvdXIgYWRtaW4gZW1haWwgb3IgdXNlcm5hbWUgdG8gbWFuYWdlIHByb2R1Y3RzLCBvcmRlcnMsIGFuZCBjb250ZW50LlxuICAgICAgICA8L1RleHQ+XG5cbiAgICAgICAge2Vycm9yTWVzc2FnZSA/IChcbiAgICAgICAgICA8TWVzc2FnZUJveFxuICAgICAgICAgICAgbWI9XCJsZ1wiXG4gICAgICAgICAgICBtZXNzYWdlPXtlcnJvck1lc3NhZ2Uuc3BsaXQoJyAnKS5sZW5ndGggPiAxID8gZXJyb3JNZXNzYWdlIDogdHJhbnNsYXRlTWVzc2FnZShlcnJvck1lc3NhZ2UpfVxuICAgICAgICAgICAgdmFyaWFudD1cImRhbmdlclwiXG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgPEJveCBhcz1cImZvcm1cIiBhY3Rpb249e2FjdGlvbn0gbWV0aG9kPVwiUE9TVFwiIG9uU3VibWl0PXtoYW5kbGVTdWJtaXR9PlxuICAgICAgICAgIDxGb3JtR3JvdXA+XG4gICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+RW1haWwgb3IgdXNlcm5hbWU8L0xhYmVsPlxuICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgIG5hbWU9XCJlbWFpbFwiXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgZW1haWwgb3IgdXNlcm5hbWVcIlxuICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJ1c2VybmFtZVwiXG4gICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17aWRlbnRpZmllcn1cbiAgICAgICAgICAgICAga2V5PXtpZGVudGlmaWVyIHx8ICdsb2dpbi1lbWFpbCd9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvRm9ybUdyb3VwPlxuXG4gICAgICAgICAgPEZvcm1Hcm91cD5cbiAgICAgICAgICAgIDxMYWJlbCByZXF1aXJlZD5QYXNzd29yZDwvTGFiZWw+XG4gICAgICAgICAgICA8Qm94IHBvc2l0aW9uPVwicmVsYXRpdmVcIiB3aWR0aD1cIjEwMCVcIj5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgdHlwZT17c2hvd1Bhc3N3b3JkID8gJ3RleHQnIDogJ3Bhc3N3b3JkJ31cbiAgICAgICAgICAgICAgICBuYW1lPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgcGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cImN1cnJlbnQtcGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmdSaWdodDogNDIgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3Nob3dQYXNzd29yZCA/ICdIaWRlIHBhc3N3b3JkJyA6ICdTaG93IHBhc3N3b3JkJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93UGFzc3dvcmQoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgIHJpZ2h0OiA4LFxuICAgICAgICAgICAgICAgICAgdG9wOiAnNTAlJyxcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoLTUwJSknLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAwLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzA0Nzg1NycsXG4gICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAyNixcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogMjYsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAwLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7c2hvd1Bhc3N3b3JkID8gKFxuICAgICAgICAgICAgICAgICAgPHN2Z1xuICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjIwXCJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PVwiMjBcIlxuICAgICAgICAgICAgICAgICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgICAgICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD1cIjJcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0zIDNsMTggMThcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTEwLjYgMTAuNkEyIDIgMCAwIDAgMTMuNCAxMy40XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk05LjkgNC4yQTEwLjcgMTAuNyAwIDAgMSAxMiA0YzUgMCA5IDQuNSAxMCA4YTEyLjggMTIuOCAwIDAgMS0yLjEgMy42XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk02LjYgNi42QzQuMyA4IDIuNyAxMC4yIDIgMTJjMSAzLjUgNSA4IDEwIDggMS41IDAgMi45LS40IDQuMS0xXCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8c3ZnXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMjBcIlxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIyMFwiXG4gICAgICAgICAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPVwiMlwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTIgMTJzNC03IDEwLTcgMTAgNyAxMCA3LTQgNy0xMCA3UzIgMTIgMiAxMnpcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjNcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8L0Zvcm1Hcm91cD5cblxuICAgICAgICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgbWI9XCJsZ1wiPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGlkPVwicmVtZW1iZXItbG9naW5cIlxuICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICBjaGVja2VkPXtyZW1lbWJlckxvZ2lufVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRSZW1lbWJlckxvZ2luKGV2ZW50LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgbWFyZ2luUmlnaHQ6IDggfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cInJlbWVtYmVyLWxvZ2luXCIgc3R5bGU9e3sgY29sb3I6ICcjNDc1NTY5JywgZm9udFNpemU6IDE0IH19PlxuICAgICAgICAgICAgICBSZW1lbWJlciBteSBlbWFpbCBvciB1c2VybmFtZSBvbiB0aGlzIGRldmljZVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgIDxCdXR0b24gdHlwZT1cInN1Ym1pdFwiIHZhcmlhbnQ9XCJjb250YWluZWRcIiB3aWR0aD1cIjEwMCVcIiBtdD1cImxnXCI+XG4gICAgICAgICAgICBTaWduIGluXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvQm94PlxuXG4gICAgICAgIDxUZXh0IG10PVwieGxcIiB0ZXh0QWxpZ249XCJjZW50ZXJcIj5cbiAgICAgICAgICA8YSBocmVmPXtmb3Jnb3RQYXNzd29yZFVybH0gc3R5bGU9e3sgY29sb3I6ICcjMDQ3ODU3JywgZm9udFdlaWdodDogNzAwIH19PlxuICAgICAgICAgICAgRm9yZ290IHBhc3N3b3JkP1xuICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9naW5cbiIsImltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIEJ1dHRvbkdyb3VwLCBNZXNzYWdlQm94IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IHVzZUZpbHRlckRyYXdlciwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJ1xuXG5mdW5jdGlvbiBhZG1pblJvb3RQYXRoKCkge1xuICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXiguKilcXC9yZXNvdXJjZXNcXC8vKVxuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC8kLywgJycpXG59XG5cbmZ1bmN0aW9uIGNhdGFsb2dDb25maWcocmVzb3VyY2VJZCkge1xuICBpZiAocmVzb3VyY2VJZCA9PT0gJ0NhdGVnb3J5Jykge1xuICAgIHJldHVybiB7IGV4cG9ydFVybDogJ2NhdGVnb3JpZXMvZXhwb3J0JywgaW1wb3J0VXJsOiAnY2F0ZWdvcmllcy9pbXBvcnQnIH1cbiAgfVxuICBpZiAocmVzb3VyY2VJZCA9PT0gJ1Byb2R1Y3QnKSB7XG4gICAgcmV0dXJuIHsgZXhwb3J0VXJsOiAncHJvZHVjdHMvZXhwb3J0JywgaW1wb3J0VXJsOiAncHJvZHVjdHMvaW1wb3J0JyB9XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ2F0YWxvZ0xpc3RIZWFkZXJBY3Rpb25zKHsgcmVzb3VyY2UsIG9uSW1wb3J0ZWQgfSkge1xuICBjb25zdCB7IHRyYW5zbGF0ZUJ1dHRvbiwgdHJhbnNsYXRlQWN0aW9uIH0gPSB1c2VUcmFuc2xhdGlvbigpXG4gIGNvbnN0IHsgdG9nZ2xlRmlsdGVyLCBmaWx0ZXJzQ291bnQgfSA9IHVzZUZpbHRlckRyYXdlcigpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbWVzc2FnZSwgc2V0TWVzc2FnZV0gPSB1c2VTdGF0ZShudWxsKVxuICBjb25zdCBmaWxlUmVmID0gdXNlUmVmKG51bGwpXG5cbiAgY29uc3QgcmVzb3VyY2VJZCA9IHJlc291cmNlLmlkXG4gIGNvbnN0IGNvbmZpZyA9IGNhdGFsb2dDb25maWcocmVzb3VyY2VJZClcbiAgY29uc3Qgcm9vdCA9IGFkbWluUm9vdFBhdGgoKVxuXG4gIGNvbnN0IGhhbmRsZUltcG9ydCA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXVxuICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9ICcnXG4gICAgaWYgKCFmaWxlIHx8ICFjb25maWcpIHJldHVyblxuXG4gICAgc2V0TG9hZGluZyh0cnVlKVxuICAgIHNldE1lc3NhZ2UobnVsbClcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3Jvb3R9L2NhdGFsb2cvJHtjb25maWcuaW1wb3J0VXJsfWAsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgfSlcblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKVxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5tZXNzYWdlIHx8ICdJbXBvcnQgZmFpbGVkLicpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVycm9yQ291bnQgPSBkYXRhLmVycm9ycz8ubGVuZ3RoIHx8IDBcbiAgICAgIHNldE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiBlcnJvckNvdW50ID8gJ2luZm8nIDogJ3N1Y2Nlc3MnLFxuICAgICAgICB0ZXh0OlxuICAgICAgICAgIGVycm9yQ291bnQgPiAwXG4gICAgICAgICAgICA/IGBJbXBvcnQgZmluaXNoZWQuICR7ZGF0YS5jcmVhdGVkfSBhZGRlZCwgJHtkYXRhLnVwZGF0ZWR9IHVwZGF0ZWQuICR7ZXJyb3JDb3VudH0gcm93KHMpIGNvdWxkIG5vdCBiZSBpbXBvcnRlZC4gRXhpc3Rpbmcgcm93cyBhcmUgbWF0Y2hlZCBieSBzbHVnLmBcbiAgICAgICAgICAgIDogYEltcG9ydCBmaW5pc2hlZC4gJHtkYXRhLmNyZWF0ZWR9IGFkZGVkLCAke2RhdGEudXBkYXRlZH0gdXBkYXRlZC4gRXhpc3Rpbmcgcm93cyBhcmUgbWF0Y2hlZCBieSBzbHVnIOKAlCBrZWVwIHNsdWcgdGhlIHNhbWUgdG8gdXBkYXRlIHByaWNlLmAsXG4gICAgICB9KVxuICAgICAgb25JbXBvcnRlZD8uKClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdkYW5nZXInLCB0ZXh0OiBlcnJvci5tZXNzYWdlIHx8ICdJbXBvcnQgZmFpbGVkLicgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBidXR0b25zID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFjb25maWcpIHJldHVybiBbXVxuXG4gICAgY29uc3QgaXRlbXMgPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnRXhwb3J0IENTVicsXG4gICAgICAgIHZhcmlhbnQ6ICd0ZXh0JyxcbiAgICAgICAgaHJlZjogYCR7cm9vdH0vY2F0YWxvZy8ke2NvbmZpZy5leHBvcnRVcmx9YCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnRXhwb3J0IEV4Y2VsJyxcbiAgICAgICAgdmFyaWFudDogJ3RleHQnLFxuICAgICAgICBocmVmOiBgJHtyb290fS9jYXRhbG9nLyR7Y29uZmlnLmV4cG9ydFVybH0/Zm9ybWF0PXhsc3hgLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IGxvYWRpbmcgPyAnSW1wb3J0aW5nLi4uJyA6ICdJbXBvcnQnLFxuICAgICAgICB2YXJpYW50OiAndGV4dCcsXG4gICAgICAgIG9uQ2xpY2s6IGxvYWRpbmcgPyB1bmRlZmluZWQgOiAoKSA9PiBmaWxlUmVmLmN1cnJlbnQ/LmNsaWNrKCksXG4gICAgICB9LFxuICAgIF1cblxuICAgIGNvbnN0IG5ld0FjdGlvbiA9IHJlc291cmNlLnJlc291cmNlQWN0aW9ucz8uZmluZCgoYWN0aW9uKSA9PiBhY3Rpb24ubmFtZSA9PT0gJ25ldycpXG4gICAgaWYgKG5ld0FjdGlvbikge1xuICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgIGljb246IG5ld0FjdGlvbi5pY29uLFxuICAgICAgICBsYWJlbDogdHJhbnNsYXRlQWN0aW9uKG5ld0FjdGlvbi5sYWJlbCwgcmVzb3VyY2VJZCksXG4gICAgICAgIHZhcmlhbnQ6IG5ld0FjdGlvbi52YXJpYW50LFxuICAgICAgICBocmVmOiBgJHtyb290fS9yZXNvdXJjZXMvJHtyZXNvdXJjZUlkfS9hY3Rpb25zL25ld2AsXG4gICAgICAgICdkYXRhLWNzcyc6IGAke3Jlc291cmNlSWR9LW5ldy1idXR0b25gLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBmaWx0ZXJLZXkgPSBmaWx0ZXJzQ291bnQgPiAwID8gJ2ZpbHRlckFjdGl2ZScgOiAnZmlsdGVyJ1xuICAgIGl0ZW1zLnB1c2goe1xuICAgICAgbGFiZWw6IHRyYW5zbGF0ZUJ1dHRvbihmaWx0ZXJLZXksIHJlc291cmNlSWQsIHsgY291bnQ6IGZpbHRlcnNDb3VudCB9KSxcbiAgICAgIG9uQ2xpY2s6IHRvZ2dsZUZpbHRlcixcbiAgICAgIGljb246ICdGaWx0ZXInLFxuICAgICAgJ2RhdGEtY3NzJzogYCR7cmVzb3VyY2VJZH0tZmlsdGVyLWJ1dHRvbmAsXG4gICAgfSlcblxuICAgIHJldHVybiBpdGVtc1xuICB9LCBbXG4gICAgY29uZmlnLFxuICAgIHJvb3QsXG4gICAgbG9hZGluZyxcbiAgICByZXNvdXJjZS5yZXNvdXJjZUFjdGlvbnMsXG4gICAgcmVzb3VyY2VJZCxcbiAgICB0cmFuc2xhdGVBY3Rpb24sXG4gICAgdHJhbnNsYXRlQnV0dG9uLFxuICAgIGZpbHRlcnNDb3VudCxcbiAgICB0b2dnbGVGaWx0ZXIsXG4gIF0pXG5cbiAgaWYgKCFjb25maWcpIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEJveFxuICAgICAgICBtdD1cInhsXCJcbiAgICAgICAgbWI9XCJkZWZhdWx0XCJcbiAgICAgICAgZGlzcGxheT1cImZsZXhcIlxuICAgICAgICBqdXN0aWZ5Q29udGVudD1cImZsZXgtZW5kXCJcbiAgICAgICAgZmxleFNocmluaz17MH1cbiAgICAgICAgcHg9e1snZGVmYXVsdCcsIDBdfVxuICAgICAgICBzdHlsZT17eyBtYXJnaW5Ub3A6ICctNTJweCcgfX1cbiAgICAgID5cbiAgICAgICAgPEJ1dHRvbkdyb3VwIGJ1dHRvbnM9e2J1dHRvbnN9IC8+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHJlZj17ZmlsZVJlZn1cbiAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgYWNjZXB0PVwiLmNzdiwueGxzeCx0ZXh0L2NzdixhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldFwiXG4gICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ25vbmUnIH19XG4gICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUltcG9ydH1cbiAgICAgICAgLz5cbiAgICAgIDwvQm94PlxuXG4gICAgICB7bWVzc2FnZSAmJiAoXG4gICAgICAgIDxCb3ggbWI9XCJkZWZhdWx0XCIgcHg9e1snZGVmYXVsdCcsIDBdfT5cbiAgICAgICAgICA8TWVzc2FnZUJveFxuICAgICAgICAgICAgdmFyaWFudD17bWVzc2FnZS50eXBlfVxuICAgICAgICAgICAgbWVzc2FnZT17bWVzc2FnZS50ZXh0fVxuICAgICAgICAgICAgb25DbG9zZUNsaWNrPXsoKSA9PiBzZXRNZXNzYWdlKG51bGwpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvQm94PlxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSdcbmltcG9ydCB7IE9yaWdpbmFsQWN0aW9uSGVhZGVyIH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCBDYXRhbG9nTGlzdEhlYWRlckFjdGlvbnMgZnJvbSAnLi9jYXRhbG9nLWxpc3QtaGVhZGVyLWFjdGlvbnMuanN4J1xuXG5jb25zdCBDQVRBTE9HX1JFU09VUkNFUyA9IG5ldyBTZXQoWydQcm9kdWN0JywgJ0NhdGVnb3J5J10pXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFjdGlvbkhlYWRlcihwcm9wcykge1xuICBjb25zdCB7IE9yaWdpbmFsQ29tcG9uZW50LCBhY3Rpb24sIHJlc291cmNlIH0gPSBwcm9wc1xuICBjb25zdCBCYXNlSGVhZGVyID0gT3JpZ2luYWxDb21wb25lbnQgfHwgT3JpZ2luYWxBY3Rpb25IZWFkZXJcbiAgY29uc3QgaXNDYXRhbG9nTGlzdCA9IGFjdGlvbj8ubmFtZSA9PT0gJ2xpc3QnICYmIENBVEFMT0dfUkVTT1VSQ0VTLmhhcyhyZXNvdXJjZT8uaWQpXG5cbiAgaWYgKCFpc0NhdGFsb2dMaXN0KSB7XG4gICAgcmV0dXJuIDxCYXNlSGVhZGVyIHsuLi5wcm9wc30gLz5cbiAgfVxuXG4gIGNvbnN0IHsgT3JpZ2luYWxDb21wb25lbnQ6IF9pZ25vcmVkLCAuLi5oZWFkZXJQcm9wcyB9ID0gcHJvcHNcblxuICByZXR1cm4gKFxuICAgIDxCb3g+XG4gICAgICA8QmFzZUhlYWRlciB7Li4uaGVhZGVyUHJvcHN9IG9taXRBY3Rpb25zIC8+XG4gICAgICA8Q2F0YWxvZ0xpc3RIZWFkZXJBY3Rpb25zXG4gICAgICAgIHJlc291cmNlPXtyZXNvdXJjZX1cbiAgICAgICAgb25JbXBvcnRlZD17cHJvcHMuYWN0aW9uUGVyZm9ybWVkfVxuICAgICAgLz5cbiAgICA8L0JveD5cbiAgKVxufVxuIiwiaW1wb3J0IFJlYWN0LCB7IG1lbW8sIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBGb3JtR3JvdXAsIEZvcm1NZXNzYWdlLCBMYWJlbCwgVGlueU1DRSB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5cbmNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgcGx1Z2luczogW1xuICAgICdjb2RlJyxcbiAgICAnbGluaycsXG4gICAgJ2xpc3RzJyxcbiAgICAnaW1hZ2UnLFxuICAgICd0YWJsZScsXG4gICAgJ2F1dG9saW5rJyxcbiAgICAncHJldmlldycsXG4gICAgJ3NlYXJjaHJlcGxhY2UnLFxuICAgICd3b3JkY291bnQnLFxuICAgICdtZWRpYScsXG4gICAgJ2NvZGVzYW1wbGUnLFxuICBdLFxuICB0b29sYmFyOlxuICAgICd1bmRvIHJlZG8gfCBibG9ja3MgfCBib2xkIGl0YWxpYyB1bmRlcmxpbmUgc3RyaWtldGhyb3VnaCB8IGFsaWdubGVmdCBhbGlnbmNlbnRlciBhbGlnbnJpZ2h0IGFsaWduanVzdGlmeSB8IGJ1bGxpc3QgbnVtbGlzdCBvdXRkZW50IGluZGVudCB8IGxpbmsgaW1hZ2UgdGFibGUgY29kZXNhbXBsZSB8IGNvZGUgfCByZW1vdmVmb3JtYXQnLFxuICBoZWlnaHQ6IDQwMCxcbn1cblxuY29uc3QgUmljaHRleHRFZGl0ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcHJvcGVydHksIHJlY29yZCwgb25DaGFuZ2UgfSA9IHByb3BzXG4gIGNvbnN0IHZhbHVlID0gcmVjb3JkLnBhcmFtcz8uW3Byb3BlcnR5LnBhdGhdID8/ICcnXG4gIGNvbnN0IGVycm9yID0gcmVjb3JkLmVycm9ycz8uW3Byb3BlcnR5LnBhdGhdXG5cbiAgY29uc3QgaGFuZGxlVXBkYXRlID0gdXNlQ2FsbGJhY2soXG4gICAgKG5ld1ZhbHVlKSA9PiB7XG4gICAgICBvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCBuZXdWYWx1ZSlcbiAgICB9LFxuICAgIFtvbkNoYW5nZSwgcHJvcGVydHkucGF0aF0sXG4gIClcblxuICBjb25zdCBvcHRpb25zID0ge1xuICAgIC4uLkRFRkFVTFRfT1BUSU9OUyxcbiAgICAuLi4ocHJvcGVydHkucHJvcHMgfHwge30pLFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Rm9ybUdyb3VwIGVycm9yPXtCb29sZWFuKGVycm9yKX0+XG4gICAgICA8TGFiZWwgcmVxdWlyZWQ9e3Byb3BlcnR5LmlzUmVxdWlyZWR9Pntwcm9wZXJ0eS5sYWJlbH08L0xhYmVsPlxuICAgICAgPFRpbnlNQ0UgdmFsdWU9e3ZhbHVlfSBvbkNoYW5nZT17aGFuZGxlVXBkYXRlfSBvcHRpb25zPXtvcHRpb25zfSAvPlxuICAgICAgPEZvcm1NZXNzYWdlPntlcnJvcj8ubWVzc2FnZX08L0Zvcm1NZXNzYWdlPlxuICAgIDwvRm9ybUdyb3VwPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IG1lbW8oUmljaHRleHRFZGl0KVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgSWNvbiB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyB1c2VMb2NhdGlvbiwgdXNlTmF2aWdhdGUgfSBmcm9tICdyZWFjdC1yb3V0ZXInXG5cbmZ1bmN0aW9uIGFkbWluUm9vdChwYXRobmFtZSkge1xuICBjb25zdCBjdXQgPSBwYXRobmFtZS5zZWFyY2goL1xcLyhyZXNvdXJjZXN8cGFnZXMpKFxcL3wkKS8pXG4gIGNvbnN0IHJvb3QgPSBjdXQgPT09IC0xID8gcGF0aG5hbWUgOiBwYXRobmFtZS5zbGljZSgwLCBjdXQpXG4gIHJldHVybiByb290LnJlcGxhY2UoL1xcLyQvLCAnJykgfHwgJy8nXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNpZGViYXJSZXNvdXJjZVNlY3Rpb24ocHJvcHMpIHtcbiAgY29uc3QgT3JpZ2luYWwgPSBwcm9wcy5PcmlnaW5hbENvbXBvbmVudFxuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKClcbiAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpXG4gIGNvbnN0IGhyZWYgPSBhZG1pblJvb3QobG9jYXRpb24ucGF0aG5hbWUpXG4gIGNvbnN0IHNlbGVjdGVkID0gbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvJC8sICcnKSA9PT0gaHJlZi5yZXBsYWNlKC9cXC8kLywgJycpIHx8IGxvY2F0aW9uLnBhdGhuYW1lID09PSBgJHtocmVmfS9gXG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPGFcbiAgICAgICAgY2xhc3NOYW1lPXtgdG9rcmktc2lkZWJhci1kYXNoYm9hcmQke3NlbGVjdGVkID8gJyBpcy1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgaHJlZj17aHJlZn1cbiAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIG5hdmlnYXRlKGhyZWYpXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxJY29uIGljb249XCJIb21lXCIgLz5cbiAgICAgICAgPHNwYW4+RGFzaGJvYXJkPC9zcGFuPlxuICAgICAgPC9hPlxuICAgICAge09yaWdpbmFsID8gPE9yaWdpbmFsIHJlc291cmNlcz17cHJvcHMucmVzb3VyY2VzfSAvPiA6IG51bGx9XG4gICAgPC8+XG4gIClcbn1cbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IExvYWRlciwgVGFibGUsIFRhYmxlQm9keSB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQge1xuICBOb1JlY29yZHMsXG4gIFJlY29yZEluTGlzdCxcbiAgUmVjb3Jkc1RhYmxlSGVhZGVyLFxuICBTZWxlY3RlZFJlY29yZHMsXG59IGZyb20gJ2FkbWluanMnXG5cbmNvbnN0IGdldFJlc291cmNlRWxlbWVudENzcyA9IChyZXNvdXJjZUlkLCBzdWZmaXgpID0+IGAke3Jlc291cmNlSWR9LSR7c3VmZml4fWBcblxuLyoqXG4gKiBBZG1pbkpTIG1hcmtzIHRoZSBoZWFkZXIgY2hlY2tib3ggY2hlY2tlZCB3aGVuIEFOWSByb3cgaXMgc2VsZWN0ZWQuXG4gKiBPdmVycmlkZSBzbzogbm9uZSA9IHVuY2hlY2tlZCwgc29tZSA9IGluZGV0ZXJtaW5hdGUsIGFsbCA9IGNoZWNrZWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlY29yZHNUYWJsZShwcm9wcykge1xuICBjb25zdCB7XG4gICAgcmVzb3VyY2UsXG4gICAgcmVjb3JkcyxcbiAgICBhY3Rpb25QZXJmb3JtZWQsXG4gICAgc29ydEJ5LFxuICAgIGRpcmVjdGlvbixcbiAgICBpc0xvYWRpbmcsXG4gICAgb25TZWxlY3QsXG4gICAgc2VsZWN0ZWRSZWNvcmRzLFxuICAgIG9uU2VsZWN0QWxsLFxuICB9ID0gcHJvcHNcblxuICBpZiAoIXJlY29yZHMubGVuZ3RoKSB7XG4gICAgaWYgKGlzTG9hZGluZykgcmV0dXJuIDxMb2FkZXIgLz5cbiAgICByZXR1cm4gPE5vUmVjb3JkcyByZXNvdXJjZT17cmVzb3VyY2V9IC8+XG4gIH1cblxuICBjb25zdCBzZWxlY3RlZENvdW50ID0gc2VsZWN0ZWRSZWNvcmRzXG4gICAgPyByZWNvcmRzLmZpbHRlcigocmVjb3JkKSA9PiBzZWxlY3RlZFJlY29yZHMuc29tZSgoc2VsZWN0ZWQpID0+IHNlbGVjdGVkLmlkID09PSByZWNvcmQuaWQpKS5sZW5ndGhcbiAgICA6IDBcbiAgY29uc3Qgc2VsZWN0ZWRBbGwgPSBzZWxlY3RlZENvdW50ID4gMCAmJiBzZWxlY3RlZENvdW50ID09PSByZWNvcmRzLmxlbmd0aFxuICBjb25zdCBpbmRldGVybWluYXRlID0gc2VsZWN0ZWRDb3VudCA+IDAgJiYgc2VsZWN0ZWRDb3VudCA8IHJlY29yZHMubGVuZ3RoXG4gIGNvbnN0IHJlY29yZHNIYXZlQnVsa0FjdGlvbiA9ICEhcmVjb3Jkcy5maW5kKChyZWNvcmQpID0+IHJlY29yZC5idWxrQWN0aW9ucy5sZW5ndGgpXG5cbiAgY29uc3QgY29udGVudFRhZyA9IGdldFJlc291cmNlRWxlbWVudENzcyhyZXNvdXJjZS5pZCwgJ3RhYmxlJylcbiAgY29uc3Qgc2VsZWN0ZWRUYWcgPSBnZXRSZXNvdXJjZUVsZW1lbnRDc3MocmVzb3VyY2UuaWQsICd0YWJsZS1zZWxlY3RlZC1yZWNvcmRzJylcbiAgY29uc3QgYm9keVRhZyA9IGdldFJlc291cmNlRWxlbWVudENzcyhyZXNvdXJjZS5pZCwgJ3RhYmxlLWJvZHknKVxuXG4gIHJldHVybiAoXG4gICAgPFRhYmxlIGRhdGEtY3NzPXtjb250ZW50VGFnfT5cbiAgICAgIDxTZWxlY3RlZFJlY29yZHNcbiAgICAgICAgcmVzb3VyY2U9e3Jlc291cmNlfVxuICAgICAgICBzZWxlY3RlZFJlY29yZHM9e3NlbGVjdGVkUmVjb3Jkc31cbiAgICAgICAgZGF0YS1jc3M9e3NlbGVjdGVkVGFnfVxuICAgICAgLz5cbiAgICAgIDxSZWNvcmRzVGFibGVIZWFkZXJcbiAgICAgICAgcHJvcGVydGllcz17cmVzb3VyY2UubGlzdFByb3BlcnRpZXN9XG4gICAgICAgIHRpdGxlUHJvcGVydHk9e3Jlc291cmNlLnRpdGxlUHJvcGVydHl9XG4gICAgICAgIGRpcmVjdGlvbj17ZGlyZWN0aW9ufVxuICAgICAgICBzb3J0Qnk9e3NvcnRCeX1cbiAgICAgICAgb25TZWxlY3RBbGw9e3JlY29yZHNIYXZlQnVsa0FjdGlvbiA/IG9uU2VsZWN0QWxsIDogdW5kZWZpbmVkfVxuICAgICAgICBzZWxlY3RlZEFsbD17c2VsZWN0ZWRBbGx9XG4gICAgICAgIGluZGV0ZXJtaW5hdGU9e2luZGV0ZXJtaW5hdGV9XG4gICAgICAvPlxuICAgICAgPFRhYmxlQm9keSBkYXRhLWNzcz17Ym9keVRhZ30+XG4gICAgICAgIHtyZWNvcmRzLm1hcCgocmVjb3JkKSA9PiAoXG4gICAgICAgICAgPFJlY29yZEluTGlzdFxuICAgICAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgICAgICByZXNvdXJjZT17cmVzb3VyY2V9XG4gICAgICAgICAgICBrZXk9e3JlY29yZC5pZH1cbiAgICAgICAgICAgIGFjdGlvblBlcmZvcm1lZD17YWN0aW9uUGVyZm9ybWVkfVxuICAgICAgICAgICAgaXNMb2FkaW5nPXtpc0xvYWRpbmd9XG4gICAgICAgICAgICBvblNlbGVjdD17b25TZWxlY3R9XG4gICAgICAgICAgICBpc1NlbGVjdGVkPXtcbiAgICAgICAgICAgICAgc2VsZWN0ZWRSZWNvcmRzICYmICEhc2VsZWN0ZWRSZWNvcmRzLmZpbmQoKHNlbGVjdGVkKSA9PiBzZWxlY3RlZC5pZCA9PT0gcmVjb3JkLmlkKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgPC9UYWJsZUJvZHk+XG4gICAgPC9UYWJsZT5cbiAgKVxufVxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBUYWJsZUNlbGwsIFRhYmxlSGVhZCwgVGFibGVSb3cgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgUHJvcGVydHlIZWFkZXIgfSBmcm9tICdhZG1pbmpzJ1xuXG5jb25zdCBnZXRSZXNvdXJjZUVsZW1lbnRDc3MgPSAocmVzb3VyY2VJZCwgc3VmZml4KSA9PiBgJHtyZXNvdXJjZUlkfS0ke3N1ZmZpeH1gXG5cbmNvbnN0IGRpc3BsYXkgPSAoaXNUaXRsZSkgPT4gW1xuICBpc1RpdGxlID8gJ3RhYmxlLWNlbGwnIDogJ25vbmUnLFxuICBpc1RpdGxlID8gJ3RhYmxlLWNlbGwnIDogJ25vbmUnLFxuICAndGFibGUtY2VsbCcsXG4gICd0YWJsZS1jZWxsJyxcbl1cblxuZnVuY3Rpb24gU2VsZWN0QWxsQ2hlY2tCb3goeyBjaGVja2VkLCBpbmRldGVybWluYXRlLCBvbkNoYW5nZSB9KSB7XG4gIGNvbnN0IGlucHV0UmVmID0gdXNlUmVmKG51bGwpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaW5wdXRSZWYuY3VycmVudCkge1xuICAgICAgaW5wdXRSZWYuY3VycmVudC5pbmRldGVybWluYXRlID0gQm9vbGVhbihpbmRldGVybWluYXRlKVxuICAgIH1cbiAgfSwgW2luZGV0ZXJtaW5hdGUsIGNoZWNrZWRdKVxuXG4gIHJldHVybiAoXG4gICAgPGxhYmVsXG4gICAgICBjbGFzc05hbWU9e2B0b2tyaS1zZWxlY3QtYWxsJHtpbmRldGVybWluYXRlID8gJyBpcy1pbmRldGVybWluYXRlJyA6ICcnfSR7Y2hlY2tlZCA/ICcgaXMtY2hlY2tlZCcgOiAnJ31gfVxuICAgICAgc3R5bGU9e3sgbWFyZ2luTGVmdDogNSB9fVxuICAgID5cbiAgICAgIDxpbnB1dFxuICAgICAgICByZWY9e2lucHV0UmVmfVxuICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICBjaGVja2VkPXtCb29sZWFuKGNoZWNrZWQpfVxuICAgICAgICBvbkNoYW5nZT17b25DaGFuZ2V9XG4gICAgICAgIGFyaWEtY2hlY2tlZD17aW5kZXRlcm1pbmF0ZSA/ICdtaXhlZCcgOiBjaGVja2VkID8gJ3RydWUnIDogJ2ZhbHNlJ31cbiAgICAgIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0b2tyaS1zZWxlY3QtYWxsLWJveFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICB7aW5kZXRlcm1pbmF0ZSA/IChcbiAgICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBjbGFzc05hbWU9XCJ0b2tyaS1zZWxlY3QtYWxsLWljb25cIj5cbiAgICAgICAgICAgIDxsaW5lIHgxPVwiNlwiIHkxPVwiMTJcIiB4Mj1cIjE4XCIgeTI9XCIxMlwiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgICkgOiBjaGVja2VkID8gKFxuICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIGNsYXNzTmFtZT1cInRva3JpLXNlbGVjdC1hbGwtaWNvblwiPlxuICAgICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz1cIjIwIDYgOSAxNyA0IDEyXCIgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L3NwYW4+XG4gICAgPC9sYWJlbD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSZWNvcmRzVGFibGVIZWFkZXIocHJvcHMpIHtcbiAgY29uc3Qge1xuICAgIHRpdGxlUHJvcGVydHksXG4gICAgcHJvcGVydGllcyxcbiAgICBzb3J0QnksXG4gICAgZGlyZWN0aW9uLFxuICAgIG9uU2VsZWN0QWxsLFxuICAgIHNlbGVjdGVkQWxsLFxuICAgIGluZGV0ZXJtaW5hdGUsXG4gIH0gPSBwcm9wc1xuXG4gIGNvbnN0IGNvbnRlbnRUYWcgPSBnZXRSZXNvdXJjZUVsZW1lbnRDc3ModGl0bGVQcm9wZXJ0eS5yZXNvdXJjZUlkLCAndGFibGUtaGVhZCcpXG4gIGNvbnN0IHJvd1RhZyA9IGAke3RpdGxlUHJvcGVydHkucmVzb3VyY2VJZH0tdGFibGUtaGVhZC1yb3dgXG4gIGNvbnN0IGNoZWNrYm94Q3NzID0gYCR7dGl0bGVQcm9wZXJ0eS5yZXNvdXJjZUlkfS1jaGVja2JveC10YWJsZS1jZWxsYFxuXG4gIHJldHVybiAoXG4gICAgPFRhYmxlSGVhZCBkYXRhLWNzcz17Y29udGVudFRhZ30+XG4gICAgICA8VGFibGVSb3cgZGF0YS1jc3M9e3Jvd1RhZ30+XG4gICAgICAgIDxUYWJsZUNlbGwgZGF0YS1jc3M9e2NoZWNrYm94Q3NzfT5cbiAgICAgICAgICB7b25TZWxlY3RBbGwgPyAoXG4gICAgICAgICAgICA8U2VsZWN0QWxsQ2hlY2tCb3hcbiAgICAgICAgICAgICAgb25DaGFuZ2U9eygpID0+IG9uU2VsZWN0QWxsKCl9XG4gICAgICAgICAgICAgIGNoZWNrZWQ9e0Jvb2xlYW4oc2VsZWN0ZWRBbGwpfVxuICAgICAgICAgICAgICBpbmRldGVybWluYXRlPXtCb29sZWFuKGluZGV0ZXJtaW5hdGUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9UYWJsZUNlbGw+XG4gICAgICAgIHtwcm9wZXJ0aWVzLm1hcCgocHJvcGVydHkpID0+IChcbiAgICAgICAgICA8UHJvcGVydHlIZWFkZXJcbiAgICAgICAgICAgIGRpc3BsYXk9e2Rpc3BsYXkocHJvcGVydHkuaXNUaXRsZSl9XG4gICAgICAgICAgICBrZXk9e3Byb3BlcnR5LnByb3BlcnR5UGF0aH1cbiAgICAgICAgICAgIHRpdGxlUHJvcGVydHk9e3RpdGxlUHJvcGVydHl9XG4gICAgICAgICAgICBwcm9wZXJ0eT17cHJvcGVydHl9XG4gICAgICAgICAgICBzb3J0Qnk9e3NvcnRCeX1cbiAgICAgICAgICAgIGRpcmVjdGlvbj17ZGlyZWN0aW9ufVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgICA8VGFibGVDZWxsIGtleT1cImFjdGlvbnNcIiBzdHlsZT17eyB3aWR0aDogODAgfX0gLz5cbiAgICAgIDwvVGFibGVSb3c+XG4gICAgPC9UYWJsZUhlYWQ+XG4gIClcbn1cbiIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9kYXNoYm9hcmQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkRhc2hib2FyZCA9IERhc2hib2FyZFxuaW1wb3J0IFByb2R1Y3RFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3Byb2R1Y3QtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUHJvZHVjdEVkaXQgPSBQcm9kdWN0RWRpdFxuaW1wb3J0IENhdGVnb3J5RWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9jYXRlZ29yeS1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5DYXRlZ29yeUVkaXQgPSBDYXRlZ29yeUVkaXRcbmltcG9ydCBDbXNMaXN0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2Ntcy1saXN0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5DbXNMaXN0ID0gQ21zTGlzdFxuaW1wb3J0IFJldmlld0VkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmV2aWV3LWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJldmlld0VkaXQgPSBSZXZpZXdFZGl0XG5pbXBvcnQgQmxvZ0VkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvYmxvZy1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5CbG9nRWRpdCA9IEJsb2dFZGl0XG5pbXBvcnQgU2V0dGluZ3NFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3NldHRpbmdzLWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNldHRpbmdzRWRpdCA9IFNldHRpbmdzRWRpdFxuaW1wb3J0IEFwcFJlbGVhc2VFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2FwcC1yZWxlYXNlLWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkFwcFJlbGVhc2VFZGl0ID0gQXBwUmVsZWFzZUVkaXRcbmltcG9ydCBDb3Vwb25FZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2NvdXBvbi1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Db3Vwb25FZGl0ID0gQ291cG9uRWRpdFxuaW1wb3J0IE9yZGVyRGV0YWlsIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWRldGFpbCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuT3JkZXJEZXRhaWwgPSBPcmRlckRldGFpbFxuaW1wb3J0IENoYW5nZVBhc3N3b3JkIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2NoYW5nZS1wYXNzd29yZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQ2hhbmdlUGFzc3dvcmQgPSBDaGFuZ2VQYXNzd29yZFxuaW1wb3J0IFBhcnRuZXJFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3BhcnRuZXItZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUGFydG5lckVkaXQgPSBQYXJ0bmVyRWRpdFxuaW1wb3J0IFBpbmNvZGVFZGl0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3BpbmNvZGUtZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUGluY29kZUVkaXQgPSBQaW5jb2RlRWRpdFxuaW1wb3J0IFN0YXR1c1RvZ2dsZSBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9zdGF0dXMtdG9nZ2xlJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TdGF0dXNUb2dnbGUgPSBTdGF0dXNUb2dnbGVcbmltcG9ydCBDdXN0b21lckVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvY3VzdG9tZXItZWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQ3VzdG9tZXJFZGl0ID0gQ3VzdG9tZXJFZGl0XG5pbXBvcnQgVGVhbUVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGVhbS1lZGl0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5UZWFtRWRpdCA9IFRlYW1FZGl0XG5pbXBvcnQgTWVkaWFMaWJyYXJ5IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL21lZGlhLWxpYnJhcnknXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk1lZGlhTGlicmFyeSA9IE1lZGlhTGlicmFyeVxuaW1wb3J0IFRheEVkaXQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvdGF4LWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlRheEVkaXQgPSBUYXhFZGl0XG5pbXBvcnQgUmF6b3JwYXlQYXltZW50SWQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmF6b3JwYXktcGF5bWVudC1pZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUmF6b3JwYXlQYXltZW50SWQgPSBSYXpvcnBheVBheW1lbnRJZFxuaW1wb3J0IE9yZGVyTGlzdEJhZGdlIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL29yZGVyLWxpc3QtYmFkZ2VzJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlckxpc3RCYWRnZSA9IE9yZGVyTGlzdEJhZGdlXG5pbXBvcnQgTG9naW4gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvbG9naW4nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkxvZ2luID0gTG9naW5cbmltcG9ydCBBY3Rpb25IZWFkZXIgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvYWN0aW9uLWhlYWRlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQWN0aW9uSGVhZGVyID0gQWN0aW9uSGVhZGVyXG5pbXBvcnQgRGVmYXVsdFJpY2h0ZXh0RWRpdFByb3BlcnR5IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JpY2h0ZXh0LWVkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkRlZmF1bHRSaWNodGV4dEVkaXRQcm9wZXJ0eSA9IERlZmF1bHRSaWNodGV4dEVkaXRQcm9wZXJ0eVxuaW1wb3J0IFNpZGViYXJSZXNvdXJjZVNlY3Rpb24gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvc2lkZWJhci1kYXNoYm9hcmQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNpZGViYXJSZXNvdXJjZVNlY3Rpb24gPSBTaWRlYmFyUmVzb3VyY2VTZWN0aW9uXG5pbXBvcnQgUmVjb3Jkc1RhYmxlIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3JlY29yZHMtdGFibGUnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJlY29yZHNUYWJsZSA9IFJlY29yZHNUYWJsZVxuaW1wb3J0IFJlY29yZHNUYWJsZUhlYWRlciBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZWNvcmRzLXRhYmxlLWhlYWRlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUmVjb3Jkc1RhYmxlSGVhZGVyID0gUmVjb3Jkc1RhYmxlSGVhZGVyIl0sIm5hbWVzIjpbInVzZUFuY2hvcmVkTWVudSIsIm9wZW4iLCJ3cmFwUmVmIiwidXNlUmVmIiwib3BlblVwIiwic2V0T3BlblVwIiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJ1bmRlZmluZWQiLCJ1cGRhdGUiLCJub2RlIiwiY3VycmVudCIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJzcGFjZUJlbG93Iiwid2luZG93IiwiaW5uZXJIZWlnaHQiLCJib3R0b20iLCJ0b3AiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIlNlYXJjaGFibGVNdWx0aVNlbGVjdCIsIm9wdGlvbnMiLCJzZWxlY3RlZCIsIm9uQ2hhbmdlIiwicGxhY2Vob2xkZXIiLCJzZWFyY2hQbGFjZWhvbGRlciIsInNldE9wZW4iLCJxdWVyeSIsInNldFF1ZXJ5Iiwib25Eb2NDbGljayIsImV2ZW50IiwiY29udGFpbnMiLCJ0YXJnZXQiLCJkb2N1bWVudCIsInNlbGVjdGVkU2V0IiwidXNlTWVtbyIsIlNldCIsInNlbGVjdGVkT3B0aW9ucyIsImZpbHRlciIsIml0ZW0iLCJoYXMiLCJ2YWx1ZSIsImZpbHRlcmVkIiwibGFiZWwiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwidHJpbSIsInRvZ2dsZSIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsInJlZiIsInR5cGUiLCJvbkNsaWNrIiwibGVuZ3RoIiwibWFwIiwia2V5Iiwicm9sZSIsInRhYkluZGV4Iiwic3RvcFByb3BhZ2F0aW9uIiwiYXV0b0ZvY3VzIiwiY2hlY2tlZCIsIkZsYWdDYXJkIiwidGl0bGUiLCJoaW50IiwiaXNGbGFnT24iLCJTdGF0dXNTd2l0Y2giLCJkaXNhYmxlZCIsImNvbXBhY3QiLCJvbkxhYmVsIiwib2ZmTGFiZWwiLCJwcmV2ZW50RGVmYXVsdCIsIlNlYXJjaGFibGVTZWxlY3QiLCJqdXN0UGlja2VkIiwiZmluZCIsImFjdGl2ZSIsIm9uTW91c2VEb3duIiwic2V0VGltZW91dCIsIkxvY2FsU2VsZWN0IiwiU3RyaW5nIiwiYXBpIiwiQXBpQ2xpZW50IiwiUkFOR0VTIiwiV0lER0VUUyIsImluciIsIk51bWJlciIsInRvTG9jYWxlU3RyaW5nIiwibWF4aW11bUZyYWN0aW9uRGlnaXRzIiwiUmFuZ2VTZWxlY3QiLCJheGlzTWF4IiwicGFkZGVkIiwibWFnbml0dWRlIiwiTWF0aCIsImZsb29yIiwibG9nMTAiLCJub3JtYWxpemVkIiwibmljZSIsIkxpbmVDaGFydCIsInNlcmllcyIsImhvdmVyIiwic2V0SG92ZXIiLCJ3aWR0aCIsImhlaWdodCIsInBhZExlZnQiLCJwYWRSaWdodCIsInBhZFRvcCIsInBhZEJvdHRvbSIsIm1heCIsInBvaW50Iiwib3JkZXJWYWx1ZSIsInBsb3RXaWR0aCIsInBsb3RIZWlnaHQiLCJiYXNlbGluZSIsInlGb3IiLCJzdGVwIiwiY29vcmRzIiwiaW5kZXgiLCJ4IiwieSIsImxpbmUiLCJqb2luIiwiYXJlYSIsImxhYmVsRXZlcnkiLCJjZWlsIiwidGlja3MiLCJyYXRpbyIsInJvdW5kIiwib25Nb3VzZUxlYXZlIiwidmlld0JveCIsInRpY2siLCJ4MSIsIngyIiwieTEiLCJ5MiIsInRleHRBbmNob3IiLCJkIiwiZmlsbCIsIm9wYWNpdHkiLCJzdHJva2UiLCJzdHJva2VXaWR0aCIsInN0cm9rZUxpbmVqb2luIiwic3Ryb2tlTGluZWNhcCIsImRhdGUiLCJjeCIsImN5IiwiciIsIm9uTW91c2VFbnRlciIsInBvaW50ZXJFdmVudHMiLCJzdHlsZSIsImxlZnQiLCJQYWdlciIsInBhZ2UiLCJwYWdlU2l6ZSIsInRvdGFsIiwicGFnZXMiLCJudW1iZXJzIiwibnVtYmVyIiwicHVzaCIsIkRhc2hib2FyZCIsInJlcXVlc3RzIiwicmFuZ2VzIiwic2V0UmFuZ2VzIiwib3JkZXJzIiwiY3VzdG9tZXJzIiwicHJvZHVjdHMiLCJkYXRhIiwic2V0RGF0YSIsInNldFBhZ2VzIiwiYnVzeSIsInNldEJ1c3kiLCJsb2FkV2lkZ2V0Iiwid2lkZ2V0IiwicmFuZ2UiLCJ0aWNrZXQiLCJnZXREYXNoYm9hcmQiLCJwYXJhbXMiLCJ0aGVuIiwicmVzcG9uc2UiLCJmaW5hbGx5IiwiZm9yRWFjaCIsImNoYW5nZVJhbmdlIiwiY2hhbmdlUGFnZSIsIkJveCIsInZhcmlhbnQiLCJIMiIsIm1iIiwiSDUiLCJUZXh0Iiwib3JkZXJDb3VudCIsInJvd3MiLCJyb3ciLCJpZCIsIm9yZGVyTm8iLCJuYW1lIiwiYW1vdW50IiwicGxhY2VkQXQiLCJwaG9uZSIsImRhdGVPZkJpcnRoIiwicmVnaXN0ZXJlZEF0Iiwibm9ybWFsaXplU2x1Z0lucHV0IiwicmVwbGFjZSIsIndpdGhvdXRUcmFpbGluZ1NsYXNoIiwicGFyc2VTbHVncyIsInJhdyIsIkFycmF5IiwiaXNBcnJheSIsIkJvb2xlYW4iLCJwYXJzZWQiLCJKU09OIiwicGFyc2UiLCJzcGxpdCIsIlByb2R1Y3RFZGl0IiwicHJvcHMiLCJyZWNvcmQiLCJpbml0aWFsUmVjb3JkIiwicmVzb3VyY2UiLCJoYW5kbGVDaGFuZ2UiLCJzdWJtaXQiLCJoYW5kbGVTdWJtaXQiLCJsb2FkaW5nIiwidXNlUmVjb3JkIiwiYWRkTm90aWNlIiwidXNlTm90aWNlIiwiZmlsZVJlZiIsInVwbG9hZGluZyIsInNldFVwbG9hZGluZyIsInNsdWdFZGl0ZWQiLCJzZXRTbHVnRWRpdGVkIiwic2x1ZyIsInByZXZpZXdVcmwiLCJzZXRQcmV2aWV3VXJsIiwiY2F0ZWdvcmllcyIsInNldENhdGVnb3JpZXMiLCJjdXN0b20iLCJhcGlCYXNlVXJsIiwicHJvZHVjdFVybEJhc2UiLCJsb2NhdGlvbiIsIm9yaWdpbiIsInNsdWdJbnB1dCIsInByZXZpZXdTbHVnIiwicHJvZHVjdFVybCIsInNlbGVjdGVkQ2F0ZWdvcnlTbHVncyIsImNhdGVnb3J5SWRzIiwiaXNBY3RpdmUiLCJpbWFnZVVybCIsImltYWdlIiwidGVzdCIsImFwcFVybCIsImRpc3BsYXllZEltYWdlVXJsIiwic3RhcnRzV2l0aCIsIlVSTCIsInJldm9rZU9iamVjdFVSTCIsImlnbm9yZSIsImZldGNoIiwianNvbiIsImNhdGNoIiwic2V0RmllbGQiLCJvblByb3BlcnR5Q2hhbmdlIiwicHJvcGVydHlQYXRoIiwicmVzdCIsInNldFNlbGVjdGVkQ2F0ZWdvcmllcyIsInNsdWdzIiwic3RyaW5naWZ5IiwidXBsb2FkSW1hZ2UiLCJmaWxlIiwiZmlsZXMiLCJmb3JtRGF0YSIsIkZvcm1EYXRhIiwiYXBwZW5kIiwibG9jYWxQcmV2aWV3VXJsIiwiY3JlYXRlT2JqZWN0VVJMIiwibWV0aG9kIiwiYm9keSIsIm9rIiwiZXJyb3IiLCJFcnJvciIsIm1lc3NhZ2UiLCJtZWRpYSIsInBhdGgiLCJub3RpY2UiLCJkZXNjcmlwdGlvblByb3BlcnR5IiwiZWRpdFByb3BlcnRpZXMiLCJwcm9wZXJ0eSIsImFzIiwib25TdWJtaXQiLCJIMyIsImNvbG9yIiwicmVxdWlyZWQiLCJtdCIsImhyZWYiLCJyZWwiLCJtaW4iLCJwcmljZVZhbHVlIiwib2xkUHJpY2VWYWx1ZSIsIndlaWdodCIsImJhZGdlIiwic3RvY2siLCJzb3J0T3JkZXIiLCJtYXJnaW5Cb3R0b20iLCJpc1RheGFibGUiLCJuZXh0IiwiZ3N0UmF0ZSIsImhzbkNvZGUiLCJzcmMiLCJhbHQiLCJhY2NlcHQiLCJpc0Jlc3RTZWxsZXIiLCJpc0ltcG9ydGVkIiwiaXNGZWF0dXJlZCIsIm1pbkhlaWdodCIsIkJhc2VQcm9wZXJ0eUNvbXBvbmVudCIsIndoZXJlIiwiQnV0dG9uIiwiSWNvbiIsImljb24iLCJzcGluIiwiQ2F0ZWdvcnlFZGl0IiwiYmFubmVyRmlsZVJlZiIsImJhbm5lclVwbG9hZGluZyIsInNldEJhbm5lclVwbG9hZGluZyIsImJhbm5lclByZXZpZXdVcmwiLCJzZXRCYW5uZXJQcmV2aWV3VXJsIiwiY2F0ZWdvcnlVcmxCYXNlIiwiY2F0ZWdvcnlVcmwiLCJiYW5uZXJJbWFnZVVybCIsImJhbm5lckltYWdlIiwiZGlzcGxheWVkQmFubmVyVXJsIiwidXBsb2FkVG8iLCJmaWVsZCIsInNldExvY2FsUHJldmlldyIsInN1Y2Nlc3NNZXNzYWdlIiwic3VidGl0bGUiLCJtYXJnaW5Ub3AiLCJkaXNwbGF5IiwiUEVSX1BBR0VfT1BUSU9OUyIsIkNtc0xpc3QiLCJzZXRUYWciLCJ0aXRsZVByb3AiLCJ0aXRsZVByb3BlcnR5Iiwic3RvcmVQYXJhbXMiLCJmaWx0ZXJzIiwicGFyc2VkUXVlcnkiLCJ1c2VRdWVyeVBhcmFtcyIsInJlY29yZHMiLCJkaXJlY3Rpb24iLCJzb3J0QnkiLCJmZXRjaERhdGEiLCJwZXJQYWdlIiwidXNlUmVjb3JkcyIsInNlbGVjdGVkUmVjb3JkcyIsImhhbmRsZVNlbGVjdCIsImhhbmRsZVNlbGVjdEFsbCIsInNldFNlbGVjdGVkUmVjb3JkcyIsInVzZVNlbGVjdGVkUmVjb3JkcyIsInEiLCJkZWJvdW5jZVJlZiIsInN0b3JlUGFyYW1zUmVmIiwidG9TdHJpbmciLCJoYW5kbGVRdWVyeUNoYW5nZSIsImNsZWFyVGltZW91dCIsInRyaW1tZWQiLCJoYW5kbGVBY3Rpb25QZXJmb3JtZWQiLCJjdXJyZW50UGFnZSIsInJvd3NQZXJQYWdlIiwidG90YWxSb3dzIiwidG90YWxQYWdlcyIsImZyb20iLCJ0byIsImdvVG9QYWdlIiwibmV4dFBhZ2UiLCJzYWZlIiwiY2hhbmdlUGVyUGFnZSIsInBhZ2VOdW1iZXJzIiwid2luZG93U2l6ZSIsInN0YXJ0IiwiZW5kIiwicG9zaXRpb24iLCJtYXhXaWR0aCIsInRyYW5zZm9ybSIsIklucHV0IiwicGFkZGluZ0xlZnQiLCJSZWNvcmRzVGFibGUiLCJhY3Rpb25QZXJmb3JtZWQiLCJvblNlbGVjdCIsIm9uU2VsZWN0QWxsIiwiaXNMb2FkaW5nIiwib3B0aW9uIiwicmVzb2x2ZUltYWdlVXJsIiwiRmllbGRFcnJvciIsIlJldmlld0VkaXQiLCJhY3Rpb24iLCJpc05ldyIsImVycm9ycyIsInJhdGluZyIsImlzQXBwcm92ZWQiLCJjb250ZW50IiwiRURJVE9SX09QVElPTlMiLCJwbHVnaW5zIiwidG9vbGJhciIsImRhdGVJbnB1dFZhbHVlIiwiRGF0ZSIsImlzTmFOIiwiZ2V0VGltZSIsInNsaWNlIiwieWVhciIsImdldEZ1bGxZZWFyIiwibW9udGgiLCJnZXRNb250aCIsInBhZFN0YXJ0IiwiZGF5IiwiZ2V0RGF0ZSIsInBhZCIsInBhcnNlRGF0ZVZhbHVlIiwidGV4dCIsIm1hdGNoIiwidG9EYXRlVmFsdWUiLCJEYXRlRmllbGQiLCJtb250aERhdGUiLCJzZXRNb250aERhdGUiLCJmaXJzdERheSIsImdldERheSIsInRvdGFsRGF5cyIsImNlbGxzIiwic2VsZWN0ZWREYXkiLCJjaG9vc2UiLCJ0b0xvY2FsZURhdGVTdHJpbmciLCJ0b2RheSIsIkJsb2dFZGl0IiwiaXNQdWJsaXNoZWQiLCJhdXRob3IiLCJjb3ZlckltYWdlIiwiY2F0ZWdvcnkiLCJwdWJsaXNoZWRBdCIsImV4Y2VycHQiLCJUaW55TUNFIiwiVEFCUyIsImZpZWxkcyIsIkltYWdlVXBsb2FkZXIiLCJvblVwbG9hZCIsIndpZGUiLCJkaXNwbGF5ZWQiLCJOT1RJRklDQVRJT05fU0VDVElPTlMiLCJpbnRybyIsIkZpZWxkVGlwIiwib25Qb2ludGVyRG93biIsInRpbWVyIiwiTm90aWZ5SW5wdXQiLCJpc1doYXRzYXBwTnVtYmVyIiwibG9ja2VkIiwic2V0TG9ja2VkIiwicmVhZE9ubHkiLCJpbnB1dE1vZGUiLCJtYXhMZW5ndGgiLCJhdXRvQ29tcGxldGUiLCJhdXRvQ29ycmVjdCIsInNwZWxsQ2hlY2siLCJvbkZvY3VzIiwiU09DSUFMX0ZJRUxEUyIsInJlYWRTb2NpYWxMaW5rcyIsImxpbmtzIiwiT2JqZWN0IiwiZnJvbUVudHJpZXMiLCJTb2NpYWxGaWVsZHMiLCJOb3RpZmljYXRpb25zRmllbGRzIiwic2VjdGlvbiIsIlNldHRpbmdzRWRpdCIsImFjdGl2ZVRhYiIsInNldEFjdGl2ZVRhYiIsIm1vYmlsZUJhbm5lckZpbGVSZWYiLCJoaWdobGlnaHRGaWxlUmVmIiwiYmFubmVyUHJldmlldyIsInNldEJhbm5lclByZXZpZXciLCJtb2JpbGVCYW5uZXJQcmV2aWV3Iiwic2V0TW9iaWxlQmFubmVyUHJldmlldyIsImhpZ2hsaWdodFByZXZpZXciLCJzZXRIaWdobGlnaHRQcmV2aWV3IiwibW9iaWxlQmFubmVyVXBsb2FkaW5nIiwic2V0TW9iaWxlQmFubmVyVXBsb2FkaW5nIiwiaGlnaGxpZ2h0VXBsb2FkaW5nIiwic2V0SGlnaGxpZ2h0VXBsb2FkaW5nIiwiaG9tZUZlYXR1cmVkQ2F0ZWdvcnlTbHVncyIsImhvbWVCYW5uZXJJbWFnZSIsIm1vYmlsZUJhbm5lckltYWdlVXJsIiwiaG9tZU1vYmlsZUJhbm5lckltYWdlIiwiaGlnaGxpZ2h0SW1hZ2VVcmwiLCJob21lSGlnaGxpZ2h0SW1hZ2UiLCJoYXNoIiwic29tZSIsInRhYiIsImhpc3RvcnkiLCJyZXBsYWNlU3RhdGUiLCJzZXRQcmV2aWV3IiwiZmxleCIsImZsZXhEaXJlY3Rpb24iLCJEcmF3ZXJDb250ZW50IiwicHJvcGVydGllcyIsInAiLCJINCIsIm1vcm5pbmdEZWxpdmVyeVRpdGxlIiwibW9ybmluZ0RlbGl2ZXJ5U3VidGl0bGUiLCJtb3JuaW5nU2hpcHBpbmdGZWUiLCJtb3JuaW5nRnJlZUFib3ZlIiwiZXhwcmVzc0RlbGl2ZXJ5VGl0bGUiLCJleHByZXNzRGVsaXZlcnlTdWJ0aXRsZSIsImV4cHJlc3NTaGlwcGluZ0ZlZSIsImV4cHJlc3NGcmVlQWJvdmUiLCJoYW5kbGluZ0ZlZSIsInNvY2lhbExpbmtzIiwiRHJhd2VyRm9vdGVyIiwiQXBwUmVsZWFzZUVkaXQiLCJwbGF0Zm9ybSIsImVuYWJsZWQiLCJsYXRlc3RCdWlsZCIsIm1pbmltdW1CdWlsZCIsImJsb2NrZWRCdWlsZHMiLCJyZW1pbmRBZnRlckhvdXJzIiwibWFpbnRlbmFuY2UiLCJtYWludGVuYW5jZVRpdGxlIiwibWFpbnRlbmFuY2VNZXNzYWdlIiwibnVtIiwidG9EYXRldGltZVZhbHVlIiwiZ2V0SG91cnMiLCJnZXRNaW51dGVzIiwiZm9ybWF0RGF0ZXRpbWVMYWJlbCIsImhvdXIiLCJtaW51dGUiLCJDaG9pY2VDYXJkIiwiQW5jaG9yZWRTZWxlY3QiLCJEYXRlVGltZVBpY2tlciIsInZhbGlkIiwiaG91cnMiLCJzZXRIb3VycyIsIm1pbnV0ZXMiLCJzZXRNaW51dGVzIiwiaSIsImFwcGx5IiwibmV4dEhvdXJzIiwibmV4dE1pbnV0ZXMiLCJDb3Vwb25FZGl0Iiwic2V0UHJvZHVjdHMiLCJzZWxlY3RlZFNsdWdzIiwidGFyZ2V0U2x1Z3MiLCJ0YXJnZXRUeXBlIiwiYXBwbHlPbiIsInVzYWdlVHlwZSIsImNvdXBvblR5cGUiLCJsb2FkQ2F0YWxvZyIsImNhdGVnb3J5RGF0YSIsImFsbFByb2R1Y3RzIiwiaGFzTW9yZSIsInByb2R1Y3REYXRhIiwic2V0U2VsZWN0ZWRTbHVncyIsInByb2R1Y3RPcHRpb25zIiwiY2F0ZWdvcnlPcHRpb25zIiwiY29kZSIsInRvVXBwZXJDYXNlIiwibWluQ2FydCIsIm1heERpc2NvdW50IiwidXNhZ2VMaW1pdCIsInVzZWRDb3VudCIsInN0YXJ0c0F0IiwiZXhwaXJlc0F0IiwiRlVMRklMTE1FTlQiLCJwZW5kaW5nIiwidG9uZSIsInBhaWQiLCJwYWNrZWQiLCJzaGlwcGVkIiwiZGVsaXZlcmVkIiwiY2FuY2VsbGVkIiwiaXNPbmxpbmVPcmRlciIsIm1vZGUiLCJwYXltZW50TW9kZSIsInJhem9ycGF5UGF5bWVudElkIiwicmF6b3JwYXlPcmRlcklkIiwicGF5bWVudEJhZGdlIiwib25saW5lIiwic3RhdHVzIiwicGF5bWVudFN0YXR1cyIsIlBpbGwiLCJnZXRGdWxmaWxsbWVudEJhZGdlIiwiZ2V0UGF5bWVudEJhZGdlIiwiRnVsZmlsbG1lbnRCYWRnZSIsIlBheW1lbnRCYWRnZSIsIk9yZGVyTGlzdEJhZGdlIiwiUEFZTUVOVF9PUFRJT05TIiwiQ29weUlkIiwiY29waWVkIiwic2V0Q29waWVkIiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwid3JpdGVUZXh0IiwiZGVsaXZlcnlDaG9pY2VMYWJlbCIsImZvcm1hdEV4cGVjdGVkRGF0ZSIsInRpbWVab25lIiwiZm9ybWF0TW9uZXkiLCJmb3JtYXREYXRlVGltZSIsImRhdGVTdHlsZSIsInRpbWVTdHlsZSIsInJlc29sdmVJbWFnZSIsIk1vcmVNZW51IiwidW5wYWlkIiwiY2FuU3luY1Jhem9ycGF5Iiwib25DYXNoIiwib25RciIsIm9uU3luY1Jhem9ycGF5Iiwib25SZXNlbmRQYXJ0bmVyIiwiRnJhZ21lbnQiLCJzbmFwc2hvdCIsImRlbGl2ZXJ5UGFydG5lcklkIiwiY29udGFjdE5hbWUiLCJjb250YWN0UGhvbmUiLCJhZGRyZXNzTGluZTEiLCJhZGRyZXNzTGluZTIiLCJhZGRyZXNzQ2l0eSIsImFkZHJlc3NTdGF0ZSIsImFkZHJlc3NQaW5jb2RlIiwiYWRkcmVzc0xhbmRtYXJrIiwiT3JkZXJEZXRhaWwiLCJzZXRSZWNvcmQiLCJzYXZpbmciLCJzZXRTYXZpbmciLCJhY3Rpb25CdXN5Iiwic2V0QWN0aW9uQnVzeSIsInBhcnRuZXJzIiwic2V0UGFydG5lcnMiLCJzZXRCYXNlbGluZSIsImVkaXRDb250YWN0Iiwic2V0RWRpdENvbnRhY3QiLCJlZGl0QWRkcmVzcyIsInNldEVkaXRBZGRyZXNzIiwicGF0aG5hbWUiLCJyZXNvdXJjZUFjdGlvbiIsInJlc291cmNlSWQiLCJhY3Rpb25OYW1lIiwiaXRlbXMiLCJpdGVtc0pzb24iLCJkaXJ0eSIsImtleXMiLCJsaXN0VXJsIiwicmVjb3JkQWN0aW9uIiwicmVjb3JkSWQiLCJoYW5kbGVTYXZlIiwicGluIiwicnVuUGF5bWVudEFjdGlvbiIsImNvbmZpcm0iLCJmdWxmaWxsbWVudCIsInBheW1lbnQiLCJzdGF0dXNMYWJlbCIsInJlc3RvcmVGaWVsZHMiLCJjbG9zZSIsImFkZHJlc3NUZXh0IiwicGF5bWVudExhYmVsIiwicGFydG5lck5hbWUiLCJkZWxpdmVyeVBhcnRuZXJOYW1lIiwiZGVsaXZlcnlQYXJ0bmVyUGhvbmUiLCJpdGVtQ291bnQiLCJyZWR1Y2UiLCJzdW0iLCJxdWFudGl0eSIsImRlbGl2ZXJ5TmFtZSIsImRlbGl2ZXJ5T3B0aW9uIiwiZXhwZWN0ZWREZWxpdmVyeSIsImV4cGVjdGVkRGVsaXZlcnlEYXRlIiwiY3JlYXRlZEF0IiwibGluZVRvdGFsIiwicGF5bWVudE1ldGhvZCIsIml0ZW1zVG90YWwiLCJmcmVlRGVsaXZlcnlBcHBsaWVkIiwiZGVsaXZlcnlDaGFyZ2UiLCJoYW5kbGluZ0NoYXJnZSIsInRheFRvdGFsIiwiaXNJbnRlclN0YXRlIiwic21hbGxDYXJ0Q2hhcmdlIiwiZGlzY291bnQiLCJjb3Vwb25Db2RlIiwiZ3JhbmRUb3RhbCIsInBheW1lbnRDb2xsZWN0ZWRBcyIsImVuY29kZVVSSUNvbXBvbmVudCIsInJhem9ycGF5UXJVcmwiLCJFeWVJY29uIiwiaGlkZGVuIiwiUGFzc3dvcmRGaWVsZCIsInZpc2libGUiLCJvblRvZ2dsZSIsIkxhYmVsIiwiaHRtbEZvciIsInBhZGRpbmdSaWdodCIsInJpZ2h0IiwiYm9yZGVyIiwiYmFja2dyb3VuZCIsImN1cnNvciIsImFsaWduSXRlbXMiLCJqdXN0aWZ5Q29udGVudCIsInBhZGRpbmciLCJDaGFuZ2VQYXNzd29yZCIsInBhc3N3b3JkIiwic2V0UGFzc3dvcmQiLCJjb25maXJtUGFzc3dvcmQiLCJzZXRDb25maXJtUGFzc3dvcmQiLCJzaG93UGFzc3dvcmQiLCJzZXRTaG93UGFzc3dvcmQiLCJzaG93Q29uZmlybSIsInNldFNob3dDb25maXJtIiwic2V0RXJyb3IiLCJiYWNrIiwic2F2ZSIsInJlZGlyZWN0VXJsIiwiZXJyIiwiaW5zZXQiLCJ6SW5kZXgiLCJiZyIsImJvcmRlclJhZGl1cyIsImJveFNoYWRvdyIsImVtYWlsIiwiZ2FwIiwiSU5ESUFfU1RBVEVTIiwiVkVISUNMRV9UWVBFUyIsIlNUQVRFX09QVElPTlMiLCJQYXJ0bmVyRWRpdCIsImhhc1Bhc3N3b3JkIiwiZmF0aGVyTmFtZSIsInBhbk51bWJlciIsImFhZGhhYXJOdW1iZXIiLCJjaXR5IiwicGluY29kZSIsInN0YXRlIiwicGVybWFuZW50QWRkcmVzcyIsImVtZXJnZW5jeU5hbWUiLCJlbWVyZ2VuY3lQaG9uZSIsInZlaGljbGVUeXBlIiwidmVoaWNsZU51bWJlciIsImFjY291bnRIb2xkZXJOYW1lIiwiYWNjb3VudE51bWJlciIsImlmc2NDb2RlIiwibm90ZXMiLCJQaW5jb2RlRWRpdCIsIm1vcm5pbmdFbmFibGVkIiwiZXhwcmVzc0VuYWJsZWQiLCJwYXJ0bmVySWQiLCJwYXJ0bmVyIiwibWFyZ2luIiwiYXJlYUxhYmVsIiwic3RhdGVDb2RlIiwiU3RhdHVzVG9nZ2xlIiwic2V0Q2hlY2tlZCIsInBlcnNpc3QiLCJzYXZlZCIsImRlc2NyaXB0aW9uIiwidG9EYXRlSW5wdXQiLCJmb3JtYXRXaGVuIiwicGFyc2VBZGRyZXNzZXMiLCJhZGRyZXNzZXMiLCJncm91cGVkIiwiZW50cmllcyIsInNvcnQiLCJhIiwiYiIsImFkZHJlc3NMaW5lcyIsImFkZHJlc3MiLCJsaW5lMSIsImxpbmUyIiwibGFuZG1hcmsiLCJDdXN0b21lckVkaXQiLCJST0xFUyIsIlBFUk1JU1NJT05TIiwic2V0VmlzaWJsZSIsIlRlYW1FZGl0IiwicGVybWlzc2lvbk9uIiwidXNlcm5hbWUiLCJGT0xERVJTIiwiZm9ybWF0U2l6ZSIsImJ5dGVzIiwic2l6ZSIsInRvRml4ZWQiLCJyZXNvbHZlVXJsIiwiTWVkaWFMaWJyYXJ5IiwiYnVzeUlkIiwic2V0QnVzeUlkIiwiZm9sZGVyIiwidXBsb2FkRm9sZGVyIiwib3JpZ2luYWxOYW1lIiwiZmlsZW5hbWUiLCJ1cmwiLCJzZXRGb2xkZXIiLCJ1cGxvYWRGaWxlcyIsImxpc3QiLCJjb3B5UGF0aCIsInJlbW92ZSIsIm9uRHJhZ092ZXIiLCJvbkRyb3AiLCJkYXRhVHJhbnNmZXIiLCJtdWx0aXBsZSIsIlRheEVkaXQiLCJpc1RheGFibGVCb29sIiwiaGFuZGxlVGF4YWJsZVRvZ2dsZSIsInByb2R1Y3ROYW1lIiwiY2F0ZWdvcnlOYW1lIiwiZm9udFNpemUiLCJjb3B5VGV4dCIsIlByb21pc2UiLCJyZWplY3QiLCJSYXpvcnBheVBheW1lbnRJZCIsInBheW1lbnRJZCIsImhhbmRsZUNvcHkiLCJSRU1FTUJFUkVEX0xPR0lOX0tFWSIsIkxvZ2luIiwiZXJyb3JNZXNzYWdlIiwiX19BUFBfU1RBVEVfXyIsInRyYW5zbGF0ZU1lc3NhZ2UiLCJ1c2VUcmFuc2xhdGlvbiIsImFkbWluUm9vdCIsImZvcmdvdFBhc3N3b3JkVXJsIiwiaWRlbnRpZmllciIsInNldElkZW50aWZpZXIiLCJyZW1lbWJlckxvZ2luIiwic2V0UmVtZW1iZXJMb2dpbiIsInJlbWVtYmVyZWRMb2dpbiIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJmb3JtIiwiY3VycmVudFRhcmdldCIsImVtYWlsSW5wdXQiLCJlbGVtZW50cyIsIm5hbWVkSXRlbSIsInNldEl0ZW0iLCJyZW1vdmVJdGVtIiwiTWVzc2FnZUJveCIsIkZvcm1Hcm91cCIsImRlZmF1bHRWYWx1ZSIsIm1hcmdpblJpZ2h0IiwidGV4dEFsaWduIiwiZm9udFdlaWdodCIsImFkbWluUm9vdFBhdGgiLCJjYXRhbG9nQ29uZmlnIiwiZXhwb3J0VXJsIiwiaW1wb3J0VXJsIiwiQ2F0YWxvZ0xpc3RIZWFkZXJBY3Rpb25zIiwib25JbXBvcnRlZCIsInRyYW5zbGF0ZUJ1dHRvbiIsInRyYW5zbGF0ZUFjdGlvbiIsInRvZ2dsZUZpbHRlciIsImZpbHRlcnNDb3VudCIsInVzZUZpbHRlckRyYXdlciIsInNldExvYWRpbmciLCJzZXRNZXNzYWdlIiwiY29uZmlnIiwicm9vdCIsImhhbmRsZUltcG9ydCIsImNyZWRlbnRpYWxzIiwiZXJyb3JDb3VudCIsImNyZWF0ZWQiLCJ1cGRhdGVkIiwiYnV0dG9ucyIsImNsaWNrIiwibmV3QWN0aW9uIiwicmVzb3VyY2VBY3Rpb25zIiwiZmlsdGVyS2V5IiwiY291bnQiLCJmbGV4U2hyaW5rIiwicHgiLCJCdXR0b25Hcm91cCIsIm9uQ2xvc2VDbGljayIsIkNBVEFMT0dfUkVTT1VSQ0VTIiwiQWN0aW9uSGVhZGVyIiwiT3JpZ2luYWxDb21wb25lbnQiLCJCYXNlSGVhZGVyIiwiT3JpZ2luYWxBY3Rpb25IZWFkZXIiLCJpc0NhdGFsb2dMaXN0IiwiX2lnbm9yZWQiLCJoZWFkZXJQcm9wcyIsIl9leHRlbmRzIiwib21pdEFjdGlvbnMiLCJERUZBVUxUX09QVElPTlMiLCJSaWNodGV4dEVkaXQiLCJoYW5kbGVVcGRhdGUiLCJ1c2VDYWxsYmFjayIsIm5ld1ZhbHVlIiwiaXNSZXF1aXJlZCIsIkZvcm1NZXNzYWdlIiwibWVtbyIsImN1dCIsInNlYXJjaCIsIlNpZGViYXJSZXNvdXJjZVNlY3Rpb24iLCJPcmlnaW5hbCIsInVzZUxvY2F0aW9uIiwibmF2aWdhdGUiLCJ1c2VOYXZpZ2F0ZSIsInJlc291cmNlcyIsImdldFJlc291cmNlRWxlbWVudENzcyIsInN1ZmZpeCIsIkxvYWRlciIsIk5vUmVjb3JkcyIsInNlbGVjdGVkQ291bnQiLCJzZWxlY3RlZEFsbCIsImluZGV0ZXJtaW5hdGUiLCJyZWNvcmRzSGF2ZUJ1bGtBY3Rpb24iLCJidWxrQWN0aW9ucyIsImNvbnRlbnRUYWciLCJzZWxlY3RlZFRhZyIsImJvZHlUYWciLCJUYWJsZSIsIlNlbGVjdGVkUmVjb3JkcyIsIlJlY29yZHNUYWJsZUhlYWRlciIsImxpc3RQcm9wZXJ0aWVzIiwiVGFibGVCb2R5IiwiUmVjb3JkSW5MaXN0IiwiaXNTZWxlY3RlZCIsImlzVGl0bGUiLCJTZWxlY3RBbGxDaGVja0JveCIsImlucHV0UmVmIiwibWFyZ2luTGVmdCIsInBvaW50cyIsInJvd1RhZyIsImNoZWNrYm94Q3NzIiwiVGFibGVIZWFkIiwiVGFibGVSb3ciLCJUYWJsZUNlbGwiLCJQcm9wZXJ0eUhlYWRlciIsIkFkbWluSlMiLCJVc2VyQ29tcG9uZW50cyIsIkRlZmF1bHRSaWNodGV4dEVkaXRQcm9wZXJ0eSJdLCJtYXBwaW5ncyI6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
