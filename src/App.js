import React, { useState } from 'react';
import {
  Container, Paper, Grid, Stack, Typography, TextField,
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel,
  Select, MenuItem, Button, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Chip,
  Divider, Box, InputLabel, FormHelperText
} from '@mui/material';
import {
  MonitorHeart, PersonSearch, RestartAlt, CheckCircle
} from '@mui/icons-material';

const CHRONIC_DISEASES = [
  { value: 'none', label: 'ไม่มีโรคประจำตัว' },
  { value: 'diabetes', label: 'เบาหวาน' },
  { value: 'hypertension', label: 'ความดันโลหิตสูง' },
  { value: 'heart', label: 'โรคหัวใจ' },
  { value: 'kidney', label: 'โรคไต' },
  { value: 'lung', label: 'โรคปอด' },
  { value: 'other', label: 'อื่น ๆ' },
];

const initialForm = {
  firstName: '', lastName: '', age: '', weight: '', height: '',
  smoking: '', chronicDisease: '',
};

const initialErrors = {
  firstName: '', lastName: '', age: '', weight: '', height: '',
  smoking: '', chronicDisease: '',
};

function getRiskLevel(bmi, smoking, chronicDisease) {
  let score = 0;
  if (bmi >= 30) score += 2;
  else if (bmi >= 25) score += 1;
  if (smoking === 'yes') score += 2;
  else if (smoking === 'quit') score += 1;
  if (chronicDisease !== 'none') score += 2;

  if (score >= 4) return 'high';
  if (score >= 2) return 'moderate';
  return 'low';
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'น้ำหนักน้อยกว่าเกณฑ์', color: 'info' };
  if (bmi < 23) return { label: 'น้ำหนักปกติ', color: 'success' };
  if (bmi < 25) return { label: 'น้ำหนักเกินเล็กน้อย', color: 'warning' };
  if (bmi < 30) return { label: 'น้ำหนักเกิน (อ้วน)', color: 'warning' };
  return { label: 'อ้วนมาก', color: 'error' };
}

function getRiskConfig(level) {
  const configs = {
    low: {
      label: 'ความเสี่ยงต่ำ (Low Risk)',
      color: 'success',
      chipColor: 'success',
      alertSeverity: 'success',
      advice: [
        'ดูแลสุขภาพอย่างสม่ำเสมอ',
        'ออกกำลังกายอย่างน้อย 150 นาทีต่อสัปดาห์',
        'ตรวจสุขภาพประจำปี',
        'รับประทานอาหารที่มีประโยชน์และหลากหลาย',
      ],
    },
    moderate: {
      label: 'ความเสี่ยงปานกลาง (Moderate Risk)',
      color: 'warning',
      chipColor: 'warning',
      alertSeverity: 'warning',
      advice: [
        'พบแพทย์เพื่อประเมินสุขภาพเพิ่มเติม',
        'ควบคุมน้ำหนักให้อยู่ในเกณฑ์ปกติ',
        'งดสูบบุหรี่และลดแอลกอฮอล์',
        'ออกกำลังกายสม่ำเสมอและลดอาหารไขมันสูง',
      ],
    },
    high: {
      label: 'ความเสี่ยงสูง (High Risk)',
      color: 'error',
      chipColor: 'error',
      alertSeverity: 'error',
      advice: [
        'เข้าพบแพทย์โดยด่วน',
        'ติดตามค่าความดัน น้ำตาล และไขมันในเลือดอย่างสม่ำเสมอ',
        'หยุดสูบบุหรี่ทันที',
        'ควบคุมอาหารและน้ำหนักอย่างเคร่งครัดภายใต้คำแนะนำแพทย์',
      ],
    },
  };
  return configs[level];
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [result, setResult] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = { ...initialErrors };
    let valid = true;

    if (!form.firstName.trim()) { newErrors.firstName = 'กรุณากรอกชื่อ'; valid = false; }
    if (!form.lastName.trim()) { newErrors.lastName = 'กรุณากรอกนามสกุล'; valid = false; }
    const age = Number(form.age);
    if (!form.age || isNaN(age) || age < 1 || age > 120) {
      newErrors.age = 'กรุณากรอกอายุที่ถูกต้อง (1-120 ปี)'; valid = false;
    }
    const weight = Number(form.weight);
    if (!form.weight || isNaN(weight) || weight < 1 || weight > 300) {
      newErrors.weight = 'กรุณากรอกน้ำหนักที่ถูกต้อง (1-300 กก.)'; valid = false;
    }
    const height = Number(form.height);
    if (!form.height || isNaN(height) || height < 50 || height > 250) {
      newErrors.height = 'กรุณากรอกส่วนสูงที่ถูกต้อง (50-250 ซม.)'; valid = false;
    }
    if (!form.smoking) { newErrors.smoking = 'กรุณาเลือกพฤติกรรมการสูบบุหรี่'; valid = false; }
    if (!form.chronicDisease) { newErrors.chronicDisease = 'กรุณาเลือกโรคประจำตัว'; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const weight = Number(form.weight);
    const height = Number(form.height);
    const bmi = weight / Math.pow(height / 100, 2);
    const riskLevel = getRiskLevel(bmi, form.smoking, form.chronicDisease);
    const bmiCategory = getBMICategory(bmi);
    const riskConfig = getRiskConfig(riskLevel);
    const chronicLabel = CHRONIC_DISEASES.find(d => d.value === form.chronicDisease)?.label || '';

    setResult({ bmi, bmiCategory, riskLevel, riskConfig, chronicLabel });
    setDialogOpen(true);
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors(initialErrors);
    setResult(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white', borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <MonitorHeart sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                ระบบลงทะเบียนและประเมินความเสี่ยงสุขภาพเบื้องต้น
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Patient Health Risk Assessment and Registration System
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Form */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={3}>
            {/* Section 1: Personal Info */}
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                1. ข้อมูลส่วนบุคคล
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="ชื่อ" name="firstName"
                    value={form.firstName} onChange={handleChange}
                    error={!!errors.firstName} helperText={errors.firstName}
                    placeholder="กรอกชื่อ"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="นามสกุล" name="lastName"
                    value={form.lastName} onChange={handleChange}
                    error={!!errors.lastName} helperText={errors.lastName}
                    placeholder="กรอกนามสกุล"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth label="อายุ (ปี)" name="age" type="number"
                    value={form.age} onChange={handleChange}
                    error={!!errors.age} helperText={errors.age}
                    inputProps={{ min: 1, max: 120 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth label="น้ำหนัก (กก.)" name="weight" type="number"
                    value={form.weight} onChange={handleChange}
                    error={!!errors.weight} helperText={errors.weight}
                    inputProps={{ min: 1, max: 300, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth label="ส่วนสูง (ซม.)" name="height" type="number"
                    value={form.height} onChange={handleChange}
                    error={!!errors.height} helperText={errors.height}
                    inputProps={{ min: 50, max: 250, step: 0.1 }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section 2: Risk Behaviors */}
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                2. พฤติกรรมความเสี่ยง
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl error={!!errors.smoking}>
                    <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      พฤติกรรมการสูบบุหรี่
                    </FormLabel>
                    <RadioGroup name="smoking" value={form.smoking} onChange={handleChange}>
                      <FormControlLabel value="no" control={<Radio />} label="ไม่สูบบุหรี่" />
                      <FormControlLabel value="yes" control={<Radio />} label="สูบบุหรี่อยู่" />
                      <FormControlLabel value="quit" control={<Radio />} label="เคยสูบแต่เลิกแล้ว" />
                    </RadioGroup>
                    {errors.smoking && <FormHelperText>{errors.smoking}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.chronicDisease}>
                    <InputLabel>โรคประจำตัว</InputLabel>
                    <Select
                      name="chronicDisease" value={form.chronicDisease}
                      onChange={handleChange} label="โรคประจำตัว"
                    >
                      {CHRONIC_DISEASES.map(d => (
                        <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                      ))}
                    </Select>
                    {errors.chronicDisease && <FormHelperText>{errors.chronicDisease}</FormHelperText>}
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* BMI Formula Info */}
            <Alert severity="info" icon={false}>
              <Typography variant="body2" fontWeight="bold">สูตรคำนวณ BMI:</Typography>
              <Typography variant="body2">
                BMI = น้ำหนัก (กก.) ÷ [ส่วนสูง (ซม.) ÷ 100]² &nbsp;|&nbsp;
                เกณฑ์: &lt;18.5 (ผอม) | 18.5–22.9 (ปกติ) | 23–24.9 (เกินเล็กน้อย) | ≥25 (อ้วน) | ≥30 (อ้วนมาก)
              </Typography>
            </Alert>

            {/* Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined" color="secondary" startIcon={<RestartAlt />}
                onClick={handleReset} size="large"
              >
                ล้างข้อมูล
              </Button>
              <Button
                variant="contained" color="primary" startIcon={<PersonSearch />}
                onClick={handleSubmit} size="large"
                sx={{ px: 4 }}
              >
                ประเมินความเสี่ยง
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Footer */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          ระบบประเมินความเสี่ยงสุขภาพเบื้องต้น — ผลที่ได้เป็นเพียงการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยโรค
        </Typography>
      </Container>

      {/* Result Dialog */}
      {result && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircle />
              <Typography variant="h6" fontWeight="bold">ผลการประเมินความเสี่ยงสุขภาพ</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2}>
              {/* Patient Info */}
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ข้อมูลผู้ป่วย</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">ชื่อ-นามสกุล:</Typography>
                    <Typography variant="body1" fontWeight="medium">{form.firstName} {form.lastName}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">อายุ:</Typography>
                    <Typography variant="body1" fontWeight="medium">{form.age} ปี</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">โรคประจำตัว:</Typography>
                    <Typography variant="body1" fontWeight="medium">{result.chronicLabel}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">น้ำหนัก:</Typography>
                    <Typography variant="body1" fontWeight="medium">{form.weight} กก.</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">ส่วนสูง:</Typography>
                    <Typography variant="body1" fontWeight="medium">{form.height} ซม.</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">ค่า BMI:</Typography>
                    <Typography variant="body1" fontWeight="bold">{result.bmi.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* BMI Status */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1">สถานะ BMI:</Typography>
                <Chip
                  label={result.bmiCategory.label}
                  color={result.bmiCategory.color}
                  size="small" variant="filled"
                />
              </Stack>

              {/* Risk Level */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1" fontWeight="bold">ระดับความเสี่ยง:</Typography>
                <Chip
                  label={result.riskConfig.label}
                  color={result.riskConfig.chipColor}
                  variant="filled"
                  sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                />
              </Stack>

              {/* Alert & Advice */}
              <Alert severity={result.riskConfig.alertSeverity}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  คำแนะนำในการปฏิบัติ:
                </Typography>
                {result.riskConfig.advice.map((a, i) => (
                  <Typography key={i} variant="body2">• {a}</Typography>
                ))}
              </Alert>

              <DialogContentText variant="caption" color="text.secondary">
                * ผลการประเมินนี้เป็นเพียงการคัดกรองเบื้องต้นเท่านั้น ควรปรึกษาแพทย์เพื่อการวินิจฉัยที่แม่นยำ
              </DialogContentText>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleReset} variant="outlined" startIcon={<RestartAlt />}>
              ประเมินใหม่
            </Button>
            <Button onClick={() => setDialogOpen(false)} variant="contained">
              ปิด
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
