import { useState, useEffect } from 'react'
import initSqlJs from 'sql.js'
import './App.css'

function App() {
  const [db, setDb] = useState(null)
  const [sqlReady, setSqlReady] = useState(false)

  // Query Builder State
  const [selectFields, setSelectFields] = useState(['*'])
  const [fromTable, setFromTable] = useState('customers')
  const [whereConditions, setWhereConditions] = useState([])
  const [groupByFields, setGroupByFields] = useState([])
  const [orderByFields, setOrderByFields] = useState([])
  const [orderDirection, setOrderDirection] = useState('DESC')
  const [limit, setLimit] = useState('10')

  // UI State
  const [generatedQuery, setGeneratedQuery] = useState('')
  const [queryResults, setQueryResults] = useState(null)
  const [error, setError] = useState(null)
  const [savedQueries, setSavedQueries] = useState([])
  const [queryName, setQueryName] = useState('')
  const [activeTab, setActiveTab] = useState('templates')
  const [showSaveModal, setShowSaveModal] = useState(false)

  // AI State
  const [claudeApiKey, setClaudeApiKey] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  // Marketing Query Templates
  const templates = [
    {
      name: 'Top Customers by Revenue',
      description: 'Find your highest value customers',
      category: 'Revenue',
      query: `SELECT customer_id, customer_name, SUM(order_total) as total_revenue
FROM customers
JOIN orders ON customers.customer_id = orders.customer_id
GROUP BY customer_id, customer_name
ORDER BY total_revenue DESC
LIMIT 10`
    },
    {
      name: 'Email Campaign Performance',
      description: 'Analyze open and click rates',
      category: 'Marketing',
      query: `SELECT campaign_name,
  COUNT(*) as emails_sent,
  SUM(opened) as total_opens,
  SUM(clicked) as total_clicks,
  ROUND(SUM(opened) * 100.0 / COUNT(*), 2) as open_rate,
  ROUND(SUM(clicked) * 100.0 / COUNT(*), 2) as click_rate
FROM email_campaigns
GROUP BY campaign_name
ORDER BY open_rate DESC`
    },
    {
      name: 'Lead Source ROI',
      description: 'Compare lead sources by conversion',
      category: 'Sales',
      query: `SELECT lead_source,
  COUNT(*) as total_leads,
  SUM(converted) as conversions,
  ROUND(SUM(converted) * 100.0 / COUNT(*), 2) as conversion_rate,
  AVG(revenue) as avg_revenue
FROM leads
GROUP BY lead_source
ORDER BY conversion_rate DESC`
    },
    {
      name: 'Recent Customer Activity',
      description: 'See who purchased recently',
      category: 'Activity',
      query: `SELECT customer_name, email, last_purchase_date,
  julianday('now') - julianday(last_purchase_date) as days_ago
FROM customers
WHERE last_purchase_date IS NOT NULL
ORDER BY last_purchase_date DESC
LIMIT 10`
    },
    {
      name: 'Customers at Risk (Churn)',
      description: 'Identify inactive customers',
      category: 'Retention',
      query: `SELECT customer_id, customer_name, last_purchase_date,
  julianday('now') - julianday(last_purchase_date) as days_since_purchase
FROM customers
WHERE days_since_purchase > 90
ORDER BY days_since_purchase DESC`
    },
    {
      name: 'All Customers List',
      description: 'Simple customer directory',
      category: 'Basic',
      query: `SELECT customer_id, customer_name, email, signup_date
FROM customers
ORDER BY signup_date DESC`
    }
  ]

  // Available tables info
  const tablesInfo = [
    { name: 'customers', description: 'Customer contacts and signup info' },
    { name: 'orders', description: 'Order history and revenue data' },
    { name: 'email_campaigns', description: 'Email performance metrics' },
    { name: 'leads', description: 'Lead sources and conversions' }
  ]

  // Initialize SQL.js and create sample database
  useEffect(() => {
    initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    }).then(SQL => {
      const database = new SQL.Database()

      // Create sample marketing data
      database.run(`
        CREATE TABLE customers (
          customer_id INTEGER PRIMARY KEY,
          customer_name TEXT,
          email TEXT,
          signup_date DATE,
          last_purchase_date DATE
        );

        INSERT INTO customers VALUES
          (1, 'Acme Corp', 'contact@acme.com', '2024-01-15', '2024-11-01'),
          (2, 'Tech Solutions Inc', 'info@techsol.com', '2024-02-20', '2024-10-28'),
          (3, 'Global Traders', 'sales@globaltraders.com', '2024-03-10', '2024-06-15'),
          (4, 'Startup Hub', 'hello@startuphub.com', '2024-04-05', '2024-10-30'),
          (5, 'Enterprise Co', 'contact@enterprise.com', '2024-05-12', '2024-11-02');

        CREATE TABLE orders (
          order_id INTEGER PRIMARY KEY,
          customer_id INTEGER,
          order_total REAL,
          order_date DATE
        );

        INSERT INTO orders VALUES
          (1, 1, 5000.00, '2024-11-01'),
          (2, 2, 3500.00, '2024-10-28'),
          (3, 1, 7500.00, '2024-10-15'),
          (4, 4, 2000.00, '2024-10-30'),
          (5, 5, 10000.00, '2024-11-02'),
          (6, 2, 4500.00, '2024-09-20'),
          (7, 3, 1500.00, '2024-06-15');

        CREATE TABLE email_campaigns (
          campaign_id INTEGER PRIMARY KEY,
          campaign_name TEXT,
          sent_date DATE,
          opened INTEGER,
          clicked INTEGER
        );

        INSERT INTO email_campaigns VALUES
          (1, 'Summer Sale 2024', '2024-06-01', 1, 1),
          (2, 'Summer Sale 2024', '2024-06-01', 1, 0),
          (3, 'Product Launch', '2024-07-15', 1, 1),
          (4, 'Product Launch', '2024-07-15', 0, 0),
          (5, 'Newsletter Sept', '2024-09-01', 1, 0);

        CREATE TABLE leads (
          lead_id INTEGER PRIMARY KEY,
          lead_source TEXT,
          converted INTEGER,
          revenue REAL
        );

        INSERT INTO leads VALUES
          (1, 'Google Ads', 1, 5000),
          (2, 'LinkedIn', 1, 7500),
          (3, 'Google Ads', 0, 0),
          (4, 'Referral', 1, 3000),
          (5, 'LinkedIn', 0, 0),
          (6, 'Organic Search', 1, 2500),
          (7, 'Google Ads', 1, 4000);
      `)

      setDb(database)
      setSqlReady(true)
    })

    // Load saved queries from localStorage
    const saved = localStorage.getItem('savedQueries')
    if (saved) {
      setSavedQueries(JSON.parse(saved))
    }

    // Load Claude API key from localStorage
    const savedApiKey = localStorage.getItem('claudeApiKey')
    if (savedApiKey) {
      setClaudeApiKey(savedApiKey)
    }
  }, [])

  // Generate SQL query from builder
  useEffect(() => {
    if (!fromTable) return

    let query = 'SELECT '
    query += selectFields.length > 0 && selectFields[0] ? selectFields.filter(f => f.trim()).join(', ') || '*' : '*'
    query += `\nFROM ${fromTable}`

    if (whereConditions.length > 0 && whereConditions[0].field) {
      query += '\nWHERE ' + whereConditions
        .filter(c => c.field && c.value)
        .map(c => `${c.field} ${c.operator} ${c.value.includes("'") ? c.value : `'${c.value}'`}`)
        .join(' AND ')
    }

    if (groupByFields.length > 0 && groupByFields[0]) {
      query += '\nGROUP BY ' + groupByFields.filter(f => f.trim()).join(', ')
    }

    if (orderByFields.length > 0 && orderByFields[0]) {
      query += '\nORDER BY ' + orderByFields.filter(f => f.trim()).join(', ') + ' ' + orderDirection
    }

    if (limit) {
      query += `\nLIMIT ${limit}`
    }

    setGeneratedQuery(query)
  }, [selectFields, fromTable, whereConditions, groupByFields, orderByFields, orderDirection, limit])

  // Execute query
  const executeQuery = (query = generatedQuery) => {
    if (!db || !query) return

    try {
      const results = db.exec(query)
      setQueryResults(results)
      setError(null)
    } catch (err) {
      setError(err.message)
      setQueryResults(null)
    }
  }

  // Save query
  const saveQuery = () => {
    if (!queryName || !generatedQuery) return

    const newQuery = {
      id: Date.now(),
      name: queryName,
      query: generatedQuery,
      savedAt: new Date().toISOString()
    }

    const updated = [...savedQueries, newQuery]
    setSavedQueries(updated)
    localStorage.setItem('savedQueries', JSON.stringify(updated))
    setQueryName('')
    setShowSaveModal(false)
    alert('Query saved successfully!')
  }

  // Load saved query
  const loadQuery = (query) => {
    setGeneratedQuery(query)
    setActiveTab('builder')
  }

  // Delete saved query
  const deleteQuery = (id) => {
    const updated = savedQueries.filter(q => q.id !== id)
    setSavedQueries(updated)
    localStorage.setItem('savedQueries', JSON.stringify(updated))
  }

  // Export query
  const exportQuery = () => {
    const blob = new Blob([generatedQuery], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query_${Date.now()}.sql`
    a.click()
  }

  // Add condition
  const addCondition = () => {
    setWhereConditions([...whereConditions, { field: '', operator: '=', value: '' }])
  }

  // Update condition
  const updateCondition = (index, field, value) => {
    const updated = [...whereConditions]
    updated[index][field] = value
    setWhereConditions(updated)
  }

  // Remove condition
  const removeCondition = (index) => {
    setWhereConditions(whereConditions.filter((_, i) => i !== index))
  }

  // Save Claude API key
  const saveApiKey = (key) => {
    setClaudeApiKey(key)
    localStorage.setItem('claudeApiKey', key)
  }

  // Generate query using Claude AI
  const generateQueryWithAI = async () => {
    if (!claudeApiKey) {
      setAiError('Please enter your Claude API key first')
      setShowApiKeyInput(true)
      return
    }

    if (!aiPrompt.trim()) {
      setAiError('Please describe what query you want to generate')
      return
    }

    setIsGenerating(true)
    setAiError(null)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `You are a SQL query generator for a marketing database. Generate a SQL query based on this request: "${aiPrompt}"

Available tables and their columns:
- customers: customer_id, customer_name, email, signup_date, last_purchase_date
- orders: order_id, customer_id, order_total, order_date
- email_campaigns: campaign_id, campaign_name, sent_date, opened (0 or 1), clicked (0 or 1)
- leads: lead_id, lead_source, converted (0 or 1), revenue

Important:
- Return ONLY the SQL query, no explanations or markdown formatting
- Use proper SQLite syntax
- Include appropriate JOINs if multiple tables are needed
- Add LIMIT clause if not specified (default to 10)

Generate the SQL query now:`
          }]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to generate query'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const generatedSql = data.content[0].text.trim()

      // Remove markdown code blocks if present
      let cleanSql = generatedSql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()

      setGeneratedQuery(cleanSql)
      setAiError(null)
      setAiPrompt('')
    } catch (err) {
      console.error('AI Error:', err)
      setAiError(err.message || 'Failed to generate query. Please check your API key and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!sqlReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading SQL Engine...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing your data playground</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              SQL Query Builder
            </span>
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
            Build powerful SQL queries without writing code. Choose a template or customize your own.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-8 py-4 rounded-xl font-bold text-base transition-all ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-[#2d3548] text-gray-300 hover:bg-[#364159] border border-[#3d4a61]'
            }`}
          >
            Quick Templates
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-8 py-4 rounded-xl font-bold text-base transition-all ${
              activeTab === 'builder'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-[#2d3548] text-gray-300 hover:bg-[#364159] border border-[#3d4a61]'
            }`}
          >
            Custom Query
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-8 py-4 rounded-xl font-bold text-base transition-all ${
              activeTab === 'saved'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-[#2d3548] text-gray-300 hover:bg-[#364159] border border-[#3d4a61]'
            }`}
          >
            Saved Queries {savedQueries.length > 0 && `(${savedQueries.length})`}
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-4">Choose a Template</h2>
              <p className="text-gray-300 text-lg">Common marketing queries ready to run</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template, index) => (
                <div key={index} className="bg-[#2d3548] rounded-xl p-6 border border-[#3d4a61] hover:border-indigo-500 transition-all">
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white leading-tight">{template.name}</h3>
                      <span className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold whitespace-nowrap">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{template.description}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => executeQuery(template.query)}
                      className="flex-1 px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-all"
                    >
                      Run Query
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedQuery(template.query)
                        setActiveTab('builder')
                      }}
                      className="px-5 py-3 bg-[#364159] text-gray-200 rounded-lg font-semibold hover:bg-[#3d4a61] transition-all text-sm border border-[#3d4a61]"
                      title="Edit query"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Query Builder Tab */}
        {activeTab === 'builder' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">Build Your Query</h2>
              <p className="text-gray-300 text-lg">Customize exactly what data you want to see</p>
            </div>

            {/* AI Query Generator - Simplified */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#2d3548] rounded-xl p-8 border border-[#3d4a61]">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Generate Query with AI</h3>
                  <p className="text-gray-300 text-sm">Describe what you want in plain English</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full bg-[#364159] border border-[#3d4a61] rounded-lg px-4 py-4 text-white text-base focus:outline-none focus:border-indigo-500 min-h-[120px] resize-none"
                      placeholder="Example: Show me customers who haven't purchased in 90 days"
                      disabled={isGenerating}
                    />
                  </div>

                  {aiError && (
                    <div className="bg-red-900/30 rounded-lg p-4 border border-red-600/50">
                      <p className="text-red-300 text-sm font-semibold">{aiError}</p>
                    </div>
                  )}

                  {showApiKeyInput && (
                    <div className="bg-[#364159] rounded-lg p-4 space-y-3">
                      <label className="block text-white font-semibold text-sm">Claude API Key</label>
                      <input
                        type="password"
                        value={claudeApiKey}
                        onChange={(e) => setClaudeApiKey(e.target.value)}
                        className="w-full bg-[#2d3548] border border-[#3d4a61] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                        placeholder="sk-ant-..."
                      />
                      <p className="text-gray-400 text-xs">
                        Get your key from{' '}
                        <a
                          href="https://console.anthropic.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 underline"
                        >
                          console.anthropic.com
                        </a>
                      </p>
                      <button
                        onClick={() => {
                          saveApiKey(claudeApiKey)
                          setShowApiKeyInput(false)
                        }}
                        disabled={!claudeApiKey.trim()}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        Save API Key
                      </button>
                    </div>
                  )}

                  <button
                    onClick={generateQueryWithAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-bold text-base hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      'Generate SQL Query'
                    )}
                  </button>

                  {claudeApiKey && !showApiKeyInput && (
                    <button
                      onClick={() => setShowApiKeyInput(true)}
                      className="w-full text-gray-400 hover:text-gray-300 text-sm"
                    >
                      Change API Key
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center my-8">
              <p className="text-gray-400 text-sm">or build manually below</p>
            </div>

            {/* Table Selection */}
            <div className="bg-[#2d3548] rounded-xl p-6 border border-[#3d4a61]">
              <h3 className="text-xl font-bold text-white mb-5">Choose Your Data Source</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {tablesInfo.map(table => (
                  <button
                    key={table.name}
                    onClick={() => setFromTable(table.name)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      fromTable === table.name
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-[#3d4a61] bg-[#364159] hover:border-[#4d5a71]'
                    }`}
                  >
                    <div className="text-white font-bold text-base capitalize mb-1">{table.name}</div>
                    <div className="text-gray-400 text-xs">{table.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Options */}
            <div className="bg-[#2d3548] rounded-xl p-6 border border-[#3d4a61]">
              <h3 className="text-xl font-bold text-white mb-5">Quick Options</h3>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Limit */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-sm">Number of results</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['10', '25', '50', '100'].map(val => (
                      <button
                        key={val}
                        onClick={() => setLimit(val)}
                        className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                          limit === val
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#364159] text-gray-300 hover:bg-[#3d4a61] border border-[#3d4a61]'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Direction */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-sm">Sort order</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrderDirection('DESC')}
                      className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                        orderDirection === 'DESC'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#364159] text-gray-300 hover:bg-[#3d4a61] border border-[#3d4a61]'
                      }`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => setOrderDirection('ASC')}
                      className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                        orderDirection === 'ASC'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#364159] text-gray-300 hover:bg-[#3d4a61] border border-[#3d4a61]'
                      }`}
                    >
                      Oldest First
                    </button>
                  </div>
                </div>

                {/* Fields Selection Hint */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-sm">Fields to show</label>
                  <div className="py-2 px-4 bg-[#364159] rounded-lg border border-[#3d4a61]">
                    <p className="text-gray-200 text-sm font-semibold">
                      {selectFields[0] === '*' || !selectFields[0] ? (
                        'All fields selected'
                      ) : (
                        `${selectFields.filter(f => f).length} custom fields`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <details className="bg-[#2d3548] rounded-2xl border-2 border-[#3d4a61] overflow-hidden">
              <summary className="p-8 cursor-pointer text-white font-bold text-xl hover:bg-[#364159]/50 transition-colors">
                Advanced Options (SELECT, WHERE, GROUP BY, ORDER BY)
              </summary>

              <div className="p-8 pt-0 space-y-8">
                {/* SELECT Fields */}
                <div>
                  <label className="block text-white font-bold mb-4 text-lg">SELECT - Choose Specific Fields</label>
                  <div className="space-y-3">
                    {selectFields.map((field, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={field}
                          onChange={(e) => {
                            const updated = [...selectFields]
                            updated[index] = e.target.value
                            setSelectFields(updated)
                          }}
                          className="flex-1 bg-[#364159] border-2 border-[#3d4a61] rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
                          placeholder="field_name or * for all"
                        />
                        {selectFields.length > 1 && (
                          <button
                            onClick={() => setSelectFields(selectFields.filter((_, i) => i !== index))}
                            className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setSelectFields([...selectFields, ''])}
                      className="w-full py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                    >
                      Add Field
                    </button>
                  </div>
                </div>

                {/* WHERE Conditions */}
                <div>
                  <label className="block text-white font-bold mb-4 text-lg">WHERE - Filter Results</label>
                  {whereConditions.length === 0 ? (
                    <button
                      onClick={addCondition}
                      className="w-full py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                    >
                      Add Filter
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {whereConditions.map((condition, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <input
                            type="text"
                            value={condition.field}
                            onChange={(e) => updateCondition(index, 'field', e.target.value)}
                            className="flex-1 bg-[#364159] border-2 border-[#3d4a61] rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
                            placeholder="field_name"
                          />
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                            className="bg-[#364159] border-2 border-[#3d4a61] rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
                          >
                            <option value="=">=</option>
                            <option value="!=">!=</option>
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value=">=">&gt;=</option>
                            <option value="<=">&lt;=</option>
                            <option value="LIKE">LIKE</option>
                          </select>
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) => updateCondition(index, 'value', e.target.value)}
                            className="flex-1 bg-[#364159] border-2 border-[#3d4a61] rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
                            placeholder="value"
                          />
                          <button
                            onClick={() => removeCondition(index)}
                            className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addCondition}
                        className="w-full py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                      >
                        Add Another Filter
                      </button>
                    </div>
                  )}
                </div>

                {/* GROUP BY & ORDER BY */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">GROUP BY</label>
                    <input
                      type="text"
                      value={groupByFields.join(', ')}
                      onChange={(e) => setGroupByFields(e.target.value.split(',').map(f => f.trim()).filter(f => f))}
                      className="w-full bg-[#364159] border-2 border-[#3d4a61] rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
                      placeholder="field1, field2"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">ORDER BY</label>
                    <input
                      type="text"
                      value={orderByFields.join(', ')}
                      onChange={(e) => setOrderByFields(e.target.value.split(',').map(f => f.trim()).filter(f => f))}
                      className="w-full bg-[#364159] border-2 border-[#3d4a61] rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
                      placeholder="field1, field2"
                    />
                  </div>
                </div>
              </div>
            </details>

            {/* Generated Query & Actions */}
            <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-2xl p-8 border-2 border-green-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Your Generated Query</h3>
                <div className="flex gap-3">
                  <button
                    onClick={exportQuery}
                    className="px-6 py-3 bg-[#364159] text-gray-200 rounded-lg hover:bg-[#3d4a61] transition-colors font-bold"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="px-6 py-3 bg-[#364159] text-gray-200 rounded-lg hover:bg-[#3d4a61] transition-colors font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>

              <pre className="bg-black/60 rounded-xl p-6 text-green-300 text-base overflow-x-auto font-mono mb-6 border-2 border-green-700/30">
                {generatedQuery}
              </pre>

              <button
                onClick={() => executeQuery()}
                className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-xl hover:shadow-xl hover:shadow-green-600/50 transition-all"
              >
                Run Query
              </button>
            </div>

            {/* Query Results */}
            {error && (
              <div className="bg-red-900/30 rounded-2xl p-8 border-2 border-red-600">
                <h3 className="text-2xl font-bold text-red-400 mb-3">
                  Error Running Query
                </h3>
                <p className="text-red-200 text-base font-mono">{error}</p>
              </div>
            )}

            {queryResults && queryResults.length > 0 && (
              <div className="bg-[#2d3548] rounded-2xl p-8 border-2 border-[#3d4a61]">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Query Results <span className="text-indigo-400 font-normal">({queryResults[0].values.length} rows)</span>
                </h3>
                <div className="overflow-x-auto rounded-xl border-2 border-[#3d4a61]">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="bg-[#364159]">
                        {queryResults[0].columns.map((col, i) => (
                          <th key={i} className="text-left py-4 px-6 text-indigo-400 font-bold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults[0].values.map((row, i) => (
                        <tr key={i} className="border-t border-[#3d4a61] hover:bg-[#364159]/30">
                          {row.map((cell, j) => (
                            <td key={j} className="py-4 px-6 text-gray-200">
                              {cell !== null ? cell.toString() : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Queries Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-4">Your Saved Queries</h2>
              <p className="text-gray-300 text-lg">Quick access to your frequently used queries</p>
            </div>

            {savedQueries.length === 0 ? (
              <div className="bg-[#2d3548] rounded-2xl p-20 border-2 border-[#3d4a61] text-center">
                <p className="text-gray-300 text-2xl mb-3 font-semibold">No saved queries yet</p>
                <p className="text-gray-400 text-lg">Build a query and save it to see it here</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {savedQueries.map((query) => (
                  <div key={query.id} className="bg-[#2d3548] rounded-2xl p-8 border-2 border-[#3d4a61] hover:border-indigo-500 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">{query.name}</h3>
                        <p className="text-gray-400 text-base">
                          Saved {new Date(query.savedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this query?')) deleteQuery(query.id)
                        }}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                      >
                        Delete
                      </button>
                    </div>
                    <pre className="bg-black/40 rounded-xl p-6 text-green-300 text-base overflow-x-auto font-mono mb-6">
                      {query.query}
                    </pre>
                    <div className="flex gap-4">
                      <button
                        onClick={() => loadQuery(query.query)}
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all"
                      >
                        Edit Query
                      </button>
                      <button
                        onClick={() => executeQuery(query.query)}
                        className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                      >
                        Run
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#2d3548] rounded-2xl p-10 max-w-lg w-full border-2 border-[#3d4a61] shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">Save Your Query</h3>
              <p className="text-gray-300 mb-8 text-lg">Give your query a name so you can find it later</p>
              <input
                type="text"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                className="w-full bg-[#364159] border-2 border-[#3d4a61] rounded-lg px-5 py-4 text-white text-lg focus:outline-none focus:border-indigo-500 mb-8"
                placeholder="My Customer Query"
                autoFocus
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowSaveModal(false)
                    setQueryName('')
                  }}
                  className="flex-1 px-8 py-4 bg-[#364159] text-gray-200 rounded-xl hover:bg-[#3d4a61] transition-colors font-bold text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQuery}
                  disabled={!queryName.trim()}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Query
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 text-base">
            Built by <a href="https://github.com/TheDuGuy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-purple-300 transition-colors font-bold">Edou Mota</a>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            RevOps & Marketing Automation Specialist
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
