import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  ShoppingBag, 
  Sun, 
  Droplets,
  HelpCircle
} from 'lucide-react';
import { QUIZ_QUESTIONS, PRODUCTS } from '../data/products';

export default function QuizPage({
  onSelectProduct,
  onAddToCart,
  onNavigateHome,
  onNavigateShop
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSelectOption = (questionId, option) => {
    const updatedAnswers = { ...answers, [questionId]: option };
    setAnswers(updatedAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(updatedAnswers);
    }
  };

  const calculateResult = (finalAnswers) => {
    const loc = finalAnswers[1]?.type || 'indoor';
    const style = finalAnswers[3]?.style || 'echeveria';

    let matched = PRODUCTS.filter(p => {
      if (loc === 'indoor') return p.lightType === 'indoor' || p.lightType === 'indirect';
      if (loc === 'full_sun') return p.lightType === 'full_sun';
      return true;
    });

    if (style === 'haworthia') {
      const haworthias = matched.filter(p => p.category === 'haworthia');
      if (haworthias.length > 0) matched = haworthias;
    } else if (style === 'echeveria') {
      const echeverias = matched.filter(p => p.category === 'echeveria');
      if (echeverias.length > 0) matched = echeverias;
    }

    setResult(matched.slice(0, 3));
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  const currentQ = QUIZ_QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="quiz-page">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Trắc Nghiệm Chọn Sen Đá</span>
          </div>

          <div style={{ marginTop: '14px' }}>
            <span className="section-subtitle" style={{ color: 'var(--accent)' }}>Tư Vấn Tự Động 30 Giây</span>
            <h1 className="page-title" style={{ fontSize: '2.4rem', marginTop: '4px' }}>
              Tìm Chậu Sen Đá Hoàn Hảo Dành Riêng Cho Bạn
            </h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px', maxWidth: '840px' }}>
        {!result ? (
          /* Step-by-Step Questions Card */
          <div className="quiz-card">
            {/* Progress indicator */}
            <div className="quiz-progress-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '8px' }}>
                <span className="quiz-step-badge">
                  Câu hỏi {currentStep + 1} / {QUIZ_QUESTIONS.length}
                </span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{progressPercent}% hoàn thành</span>
              </div>
              <div className="quiz-progress-track">
                <div className="quiz-progress-bar" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="quiz-question-box">
              <div className="quiz-question-icon">
                <HelpCircle size={28} color="var(--primary)" />
              </div>
              <h2 className="quiz-question-title">{currentQ.question}</h2>
              <p className="quiz-question-hint">
                Chọn phương án miêu tả chính xác nhất không gian hoặc thói quen của bạn nhé!
              </p>
            </div>

            <div className="quiz-options-grid">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  className="quiz-option-card"
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                >
                  <div className="option-select-circle" />
                  <div style={{ textAlign: 'left' }}>
                    <h3 className="option-card-title">{opt.text}</h3>
                    <p className="option-card-hint">{opt.hint}</p>
                  </div>
                </button>
              ))}
            </div>

            {currentStep > 0 && (
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-start' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Quay lại câu trước</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Results View */
          <div className="quiz-result-card">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="result-badge-icon">
                <Sparkles size={36} color="#fff" />
              </div>
              <span className="section-subtitle" style={{ color: 'var(--primary)' }}>Kết Quả Phù Hợp Nhất</span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '6px', marginBottom: '10px' }}>
                Những Mầm Xanh Dành Riêng Cho Bạn!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                Dựa trên điều kiện ánh sáng và sở thích của bạn, nhà vườn Sen Xinh Garden gợi ý các giống sen đá có sức sống mãnh liệt và tương hợp phong thủy nhất:
              </p>
            </div>

            {/* Recommended Products Grid */}
            <div className="quiz-recommend-grid">
              {result.map((prod) => (
                <div key={prod.id} className="recommend-card">
                  <div className="recommend-img-wrap" onClick={() => onSelectProduct(prod)}>
                    <img src={prod.image} alt={prod.name} className="recommend-img" />
                    {prod.badge && <span className="card-badge">{prod.badge}</span>}
                  </div>

                  <div className="recommend-content">
                    <div className="card-tags" style={{ marginBottom: '6px' }}>
                      <span className="tag-pill">
                        <Sun size={11} />
                        {prod.lightType === 'indoor' ? 'Bàn làm việc' : prod.lightType === 'indirect' ? 'Nắng dịu' : 'Nhiều nắng'}
                      </span>
                      <span className="tag-pill">
                        <Droplets size={11} />
                        {prod.watering}
                      </span>
                    </div>

                    <h3 className="recommend-title" onClick={() => onSelectProduct(prod)}>
                      {prod.name}
                    </h3>
                    <p className="card-latin">{prod.scientificName}</p>
                    <p className="recommend-price">{formatPrice(prod.price)}</p>

                    <div className="recommend-actions">
                      <button
                        className="btn-primary"
                        onClick={() => onAddToCart(prod)}
                        style={{ padding: '8px 14px', fontSize: '0.85rem', flex: 1 }}
                      >
                        <ShoppingBag size={15} />
                        <span>Thêm Giỏ</span>
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => onSelectProduct(prod)}
                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                      >
                        <span>Chi Tiết</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions footer */}
            <div className="quiz-result-footer">
              <button className="btn-secondary" onClick={resetQuiz} style={{ padding: '12px 24px' }}>
                <RotateCcw size={16} />
                <span>Làm Lại Bài Test</span>
              </button>

              <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '12px 28px' }}>
                <span>Khám Phá Tất Cả Cây Tại Cửa Hàng</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
