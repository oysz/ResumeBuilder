import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { ResumeData } from '@resume-builder/core'
import { DateUtils } from '@resume-builder/core'

interface ResumePreviewProps {
  data: ResumeData
}

const proficiencyMap: Record<string, string> = {
  native: '母语',
  fluent: '流利',
  advanced: '熟练',
  intermediate: '中等',
  basic: '基础',
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const visibleSections = [...data.sections]
    .filter((section) => section.visible)
    .sort((left, right) => left.order - right.order)

  return (
    <View style={styles.sheet}>
      <View style={styles.hero}>
        <Text style={styles.name}>{data.personalInfo.name || '你的名字'}</Text>
        <Text style={styles.title}>{data.metadata.title || '我的简历'}</Text>
        <Text style={styles.meta}>
          {[data.personalInfo.location, data.personalInfo.phone, data.personalInfo.email]
            .filter(Boolean)
            .join(' · ') || '补充联系方式后，这里会自动展示'}
        </Text>
        {!!data.personalInfo.summary && <Text style={styles.summary}>{data.personalInfo.summary}</Text>}
      </View>

      {visibleSections.map((section) => (
        <View key={section.type} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.type === 'education' &&
            section.data.map((item: any) => (
              <View key={item.id} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemPrimary}>{item.school || '学校名称'}</Text>
                  <Text style={styles.itemMeta}>
                    {DateUtils.formatDateRange(item.startDate || '', item.endDate || '', item.current)}
                  </Text>
                </View>
                <Text style={styles.itemSecondary}>
                  {[item.degree, item.major].filter(Boolean).join(' · ') || '学位 · 专业'}
                </Text>
                {!!item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
              </View>
            ))}

          {section.type === 'experience' &&
            section.data.map((item: any) => (
              <View key={item.id} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemPrimary}>{item.position || '岗位名称'}</Text>
                  <Text style={styles.itemMeta}>
                    {DateUtils.formatDateRange(item.startDate || '', item.endDate || '', item.current)}
                  </Text>
                </View>
                <Text style={styles.itemSecondary}>
                  {[item.company, item.location].filter(Boolean).join(' · ') || '公司 · 城市'}
                </Text>
                {!!item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
              </View>
            ))}

          {section.type === 'skills' && (
            <View style={styles.skillList}>
              {section.data.map((item: any) => (
                <View key={item.id} style={styles.skillChip}>
                  <Text style={styles.skillText}>
                    {item.name || '技能'} · Lv.{item.level ?? 3}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {section.type === 'projects' &&
            section.data.map((item: any) => (
              <View key={item.id} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemPrimary}>{item.name || '项目名称'}</Text>
                  <Text style={styles.itemMeta}>
                    {DateUtils.formatDateRange(item.startDate || '', item.endDate || '', false)}
                  </Text>
                </View>
                <Text style={styles.itemDescription}>{item.description || '项目描述'}</Text>
                {!!item.technologies?.length && (
                  <Text style={styles.itemSecondary}>{item.technologies.join(' · ')}</Text>
                )}
              </View>
            ))}

          {section.type === 'certifications' &&
            section.data.map((item: any) => (
              <View key={item.id} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemPrimary}>{item.name || '证书名称'}</Text>
                  <Text style={styles.itemMeta}>{DateUtils.formatDate(item.date || '')}</Text>
                </View>
                <Text style={styles.itemSecondary}>{item.issuer || '颁发机构'}</Text>
              </View>
            ))}

          {section.type === 'languages' &&
            section.data.map((item: any) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemPrimary}>{item.name || '语言'}</Text>
                <Text style={styles.itemMeta}>{proficiencyMap[item.proficiency] || '中等'}</Text>
              </View>
            ))}

          {!section.data.length && <Text style={styles.empty}>这个区块还没有内容。</Text>}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#fffdf8',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#eadfcd',
    gap: 20,
  },
  hero: {
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e4d8c5',
    gap: 6,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c2a39',
  },
  title: {
    fontSize: 14,
    color: '#9a6b34',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: 13,
    color: '#57616d',
  },
  summary: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#344050',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#7a4c1f',
  },
  itemBlock: {
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemPrimary: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1c2a39',
  },
  itemSecondary: {
    fontSize: 13,
    color: '#5e6772',
  },
  itemMeta: {
    fontSize: 12,
    color: '#7b8794',
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#3f4752',
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#efe4d3',
  },
  skillText: {
    fontSize: 12,
    color: '#5b4631',
  },
  empty: {
    fontSize: 13,
    color: '#7b8794',
    fontStyle: 'italic',
  },
})
